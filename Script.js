// ==UserScript==
// @name         AMQ NFL Mode
// @namespace    https://github.com/Frittutisna/NFL-Mode
// @version      3.alpha
// @description  Script to track NFL Mode on AMQ
// @author       Frittutisna
// @match        https://animemusicquiz.com/*
// @match        https://*.animemusicquiz.com/*
// @require      https://github.com/joske2865/AMQ-Scripts/raw/master/common/amqScriptInfo.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const initialState = {
        isActive        : false,
        songNumber      : 0,
        gameNumber      : 1,
        scores          : {away: 0, home: 0},
        possession      : 'away',
        teamNames       : {away: "Away", home: "Home"},
        captains        : [1, 5],
        history         : [],
        isSwapped       : false,
        knockout        : false,
        period          : 'REGULATION',
        otRound         : 0,
        scoresAtReg     : {away: 0, home: 0},
        historyAtReg    : []
    };

    let state = JSON.parse(JSON.stringify(initialState));

    const gameConfig = {
        captainMultiplier   : 2,
        awaySlots           : [1, 2, 3, 4],
        homeSlots           : [5, 6, 7, 8],
        opsRelativeIndices  : [0, 1], 
        dpsRelativeIndices  : [2, 3],
        posNames            : ["OP1", "OP2", "DP1", "DP2"]
    };

    const CODES = {
        REGULATION  : "e0g0k21111110130k000031110000000k11111111111100k051o000000f11100k012r02i0a46533a11002s011111111100140111002s01a111111111102a11111111111hg1k903-11111--",
        OVERTIME    : "e0g05211111101100000531110000000511111111111100k051o000000f11100k012r02i0a46533a11002s0111111111002s0111002s01a111111111102a11111111111hg1k903-11111--"
    };

    const systemMessage = (msg) => {
        if (typeof gameChat !== 'undefined') {
            setTimeout(() => {
                gameChat.systemMessage(msg);
            }, 100);
        }
    };

    const chatMessage = (msg) => {
        if (typeof socket !== 'undefined') {
            socket.sendCommand({
                type    : "lobby",
                command : "game chat message",
                data    : { msg, teamMessage: false }
            });
        }
    };

    const toTitleCase = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const getTeamName = (side) => state.teamNames[side];

    const getTeamNumber = (player, context) => {
        if (context === 'quiz') {
            return player.teamNumber;
        } else if (context === 'lobby') {
            try {
                if (player.lobbySlot && player.lobbySlot.$TEAM_DISPLAY_TEXT) {
                    return parseInt(player.lobbySlot.$TEAM_DISPLAY_TEXT.text().trim(), 10);
                }
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    const getPlayerNameAtTeamId = (teamId) => {
        let name = "N/A";
        
        if (typeof quiz !== 'undefined' && quiz.inQuiz) {
            const p = Object.values(quiz.players).find(player => player.teamNumber === teamId);
            if (p) name = p.name;
        } 
        else if (typeof lobby !== 'undefined' && lobby.inLobby) {
            const p = Object.values(lobby.players).find(player => getTeamNumber(player, 'lobby') === teamId);
            if (p) name = p.name;
        }

        return name;
    };

    const getCaptainListString = () => {
        const names = state.captains.map(teamId => {
            const name = getPlayerNameAtTeamId(teamId);
            return name !== "N/A" ? name : `Player ${teamId}`;
        });

        return names.join(", ");
    };

    const resetGameData = () => {
        const savedGameNum  = state.gameNumber;
        const savedTeams    = state.teamNames;
        const savedCaps     = state.captains;
        const savedSwap     = state.isSwapped;
        const savedKnockout = state.knockout;
        
        state = JSON.parse(JSON.stringify(initialState));
        
        state.gameNumber    = savedGameNum;
        state.teamNames     = savedTeams;
        state.captains      = savedCaps;
        state.isSwapped     = savedSwap;
        state.knockout      = savedKnockout;
    };

    const startGame = () => {
        state.isActive      = true;
        state.songNumber    = 0;
        state.scores        = {away: 0, home: 0};
        state.possession    = 'away'; 
        state.history       = [];
        state.period        = 'REGULATION';
        state.otRound       = 0;
        
        systemMessage(`Game ${state.gameNumber}: ${getTeamName('away')} @ ${getTeamName('home')}`);
    };

    const endGame = () => {
        resetGameData();
        state.isActive = false;
        setTimeout(() => {systemMessage("NFL Mode ended, all data reset")}, 1000);
    };

    const outcomesList = [
        {name: "TD + 2PC",      swing: 8},
        {name: "Onside Kick",   swing: 7},
        {name: "Touchdown",     swing: 7},
        {name: "Field Goal",    swing: 3},
        {name: "Rouge",         swing: 1},
        {name: "Punt",          swing: 0},
        {name: "Rouge",         swing: -1},
        {name: "Safety",        swing: -2},
        {name: "Pick Six",      swing: -6},
        {name: "House Call",    swing: -7}
    ];

    const getArticle = (word) => {return /^[AEIOU]/.test(word) ? "an" : "a";};

    const getMaxPossiblePoints = (songsLeft, startsWithBall) => {
        if (songsLeft <= 0) return 0;
        const pairs     = Math.floor(songsLeft / 2);
        const remainder = songsLeft % 2;
        let points      = pairs * 15;
        if (remainder > 0) points += startsWithBall ? 8 : 7;
        return points;
    };

    const processRound = (payload) => {
        if (!state.isActive) return;
        state.songNumber++;
        if (state.period === 'OVERTIME') state.otRound++;

        const players       = payload.players;
        const resultsMap    = {};
        players.forEach(p => { resultsMap[p.gamePlayerId] = p.correct; });

        const checkSlot = (targetTeamId) => {
            const player = Object.values(quiz.players).find(p => p.teamNumber === targetTeamId);
            if (!player || !player.name)                        return false; 
            if (resultsMap.hasOwnProperty(player.gamePlayerId)) return resultsMap[player.gamePlayerId];
            return false;
        };

        const calcTeamStats = (slots) => {
            let patternArr      = []; 
            let patternStr      = "";
            let totalScore      = 0;
            let opScore         = 0;
            let dpScore         = 0;
            let correctCount    = 0;

            slots.forEach((slotId, index) => {
                const isCorrect = checkSlot(slotId);
                const isCaptain = state.captains.includes(slotId);
                const points    = isCorrect ? (isCaptain ? gameConfig.captainMultiplier : 1) : 0;
                patternArr.push(isCorrect ? 1 : 0);
                patternStr += (isCorrect ? 1 : 0);
                if (isCorrect) {
                    correctCount++;
                    totalScore += points;
                    if      (gameConfig.opsRelativeIndices.includes(index)) opScore += points;
                    else if (gameConfig.dpsRelativeIndices.includes(index)) dpScore += points;
                }
            });
            return {patternStr, patternArr, totalScore, opScore, dpScore, correctCount};
        };

        const awaySlots = state.isSwapped ? gameConfig.homeSlots : gameConfig.awaySlots;
        const homeSlots = state.isSwapped ? gameConfig.awaySlots : gameConfig.homeSlots;
        const awayStats = calcTeamStats(awaySlots);
        const homeStats = calcTeamStats(homeSlots);

        const currentPossessionSide = state.possession; 
        const attSide               = state.possession;
        const defSide               = state.possession === 'away' ? 'home' : 'away';
        
        const attStats = attSide === 'away' ? awayStats : homeStats;
        const defStats = attSide === 'away' ? homeStats : awayStats;

        const tdiff = attStats.totalScore - defStats.totalScore;
        const diff  = attStats.opScore - defStats.dpScore;

        let result = {name: "Error", pts: 0, swap: true, team: "none"};

        if      (tdiff >= 4)                result = {name: "Onside Kick",  pts: 7, swap: false,    team: "offense"};
        else if (tdiff <= -4)               result = {name: "House Call",   pts: 7, swap: true,     team: "defense"};
        else {
            if      (diff >=    3)          result = {name: "TD + 2PC",     pts: 8, swap: true,     team: "offense"};
            else if (diff ===   2)          result = {name: "Touchdown",    pts: 7, swap: true,     team: "offense"};
            else if (diff ===   1)          result = {name: "Field Goal",   pts: 3, swap: true,     team: "offense"};
            else if (diff ===   0 || diff === -1) {
                const attHit = attStats.correctCount > 0;
                const defHit = defStats.correctCount > 0;
                if      (attHit && !defHit) result = {name: "Rouge",        pts: 1, swap: true,     team: "offense"};
                else if (defHit && !attHit) result = {name: "Rouge",        pts: 1, swap: true,     team: "defense"};
                else                        result = {name: "Punt",         pts: 0, swap: true,     team: "defense"};
            }
            else if (diff ===   -2)         result = {name: "Safety",       pts: 2, swap: true,     team: "defense" };
            else if (diff <= -3)            result = {name: "Pick Six",     pts: 6, swap: true,     team: "defense" };
        }

        if      (result.team === "offense") state.scores[attSide]   += result.pts;
        else if (result.team === "defense") state.scores[defSide]   += result.pts;
        if (result.swap)                    state.possession        = defSide;

        const scoreStr  = `${state.scores.away}-${state.scores.home}`;
        const mainMsg   = `${awayStats.patternStr} ${homeStats.patternStr} ${result.name} ${scoreStr}`;
        chatMessage(mainMsg);

        let isGameOver = false;

        if (state.period === 'REGULATION') {
            const songsRemaining        = 20 - state.songNumber;
            const isAwayLeading         = state.scores.away > state.scores.home;
            const trailerPossessing     = (isAwayLeading && state.possession === 'home') || (!isAwayLeading && state.possession === 'away');
            const maxPointsRemaining    = getMaxPossiblePoints(songsRemaining, trailerPossessing);
            const scoreDiff             = Math.abs(state.scores.away - state.scores.home);

            if (scoreDiff > maxPointsRemaining) {
                const winner = state.scores.away > state.scores.home ? getTeamName('away') : getTeamName('home');
                setTimeout(() => {
                    chatMessage(`Mercy Rule triggered, ${winner} wins`);
                    setTimeout(() => {
                        systemMessage("Game ended due to Mercy Rule");
                        state.isActive = false;
                    }, 1000); 
                }, 1000);
                isGameOver = true;
            } 
            else if (state.songNumber === 20) {
                if (scoreDiff === 0) {
                    setTimeout(() => {
                        chatMessage("Tied after Regulation, entering Overtime");
                        systemMessage(`Overtime Code: ${CODES.OVERTIME}`);
                        state.period        = 'OVERTIME';
                        state.otRound       = 0;
                        state.possession    = 'away';
                        state.scoresAtReg   = JSON.parse(JSON.stringify(state.scores));
                        state.historyAtReg  = JSON.parse(JSON.stringify(state.history));
                    }, 1000);
                } else {
                    const winner = state.scores.away > state.scores.home ? getTeamName('away') : getTeamName('home');
                    setTimeout(() => {
                        chatMessage(`Game Over. ${winner} wins!`);
                        systemMessage("Game ended.");
                        state.isActive = false;
                    }, 1000);
                    isGameOver = true;
                }
            }
            else if (state.songNumber < 19 && state.songNumber >= 10) {
                 try {
                     const nextRoundSong    = state.songNumber + 1;
                     const songsAfterNext   = 20 - nextRoundSong;
                     const leaderName       = isAwayLeading ? getTeamName('away') : getTeamName('home');
                     const trailerName      = isAwayLeading ? getTeamName('home') : getTeamName('away');
                     const gap              = scoreDiff;
                     const isAwayPoss       = state.possession === 'away';
                     const leaderIsPoss     = (isAwayLeading === isAwayPoss);
                     const scenarios        = outcomesList.map(o => {
                        let     actorName           = (o.swing > 0) ? (isAwayPoss ? getTeamName('away') : getTeamName('home')) : (isAwayPoss ? getTeamName('home') : getTeamName('away'));
                        let     leaderGapChange     = leaderIsPoss ? o.swing : -o.swing;
                        const   outcomeSwap         = o.name !== "Onside Kick";
                        const   leaderHasBallNext   = leaderIsPoss ? !outcomeSwap : outcomeSwap;
                        const   trailerHasBallNext  = !leaderHasBallNext;
                        const   maxChaseNext        = getMaxPossiblePoints(songsAfterNext, trailerHasBallNext);
                        return {name: o.name, change: leaderGapChange, actor: actorName, maxChase: maxChaseNext, leaderIsActor: (actorName === leaderName)};
                    });
                    
                    scenarios.sort((a, b) => {
                         if (a.change !== b.change) return a.change - b.change;
                         const priority = ["Touchdown", "Field Goal", "Punt", "Rouge", "Safety", "Pick Six", "House Call", "TD + 2PC", "Onside Kick"];
                         return priority.indexOf(a.name) - priority.indexOf(b.name);
                    });

                    let safeOutcome = null, killOutcome = null;
                    for (let i = scenarios.length - 1; i >= 0; i--) if (gap + scenarios[i].change <=    scenarios[i].maxChase) {safeOutcome = scenarios[i]; break;}
                    for (let i = 0; i < scenarios.length; i++)      if (gap + scenarios[i].change >     scenarios[i].maxChase) {killOutcome = scenarios[i]; break;}

                    if (killOutcome && safeOutcome) {
                         setTimeout(() => {chatMessage(`Mercy Rule trigger warning next Song!`);}, 1000);
                         let delay = 2000;
                         const artSafe = getArticle(safeOutcome.name);
                         if (safeOutcome.leaderIsActor) {
                            setTimeout(() => {chatMessage(`The ${trailerName} needs to hold the ${leaderName} to ${artSafe} ${safeOutcome.name} next Song to avoid Mercy Rule`);}, delay);
                         } else {
                            let txtSafe = `at least ${artSafe} ${safeOutcome.name}`;
                            if (safeOutcome.name === scenarios[0].name) txtSafe = `${artSafe} ${safeOutcome.name}`;
                            setTimeout(() => {chatMessage(`The ${trailerName} needs ${txtSafe} next Song to avoid Mercy Rule`);}, delay);
                         }
                         delay          +=  1000;
                         const artKill  =   getArticle(killOutcome.name);
                         if (killOutcome.change < 0) {
                            setTimeout(() => {chatMessage(`The ${leaderName} can afford ${artKill} ${killOutcome.actor} ${killOutcome.name} next Song and still trigger Mercy Rule`);}, delay);
                         } else {
                            let txtKill = `only needs ${artKill} ${killOutcome.name}`;
                            if (Math.abs(killOutcome.change) >= 7) txtKill = `needs ${artKill} ${killOutcome.name}`;
                            setTimeout(() => {chatMessage(`The ${leaderName} ${txtKill} next Song to trigger Mercy Rule`);}, delay);
                         }
                    } else {
                        for (let s = state.songNumber + 2; s <= 20; s++) {
                            const songsFromHereToS  = s - state.songNumber;
                            const futureMax         = getMaxPossiblePoints(20 - s, (songsFromHereToS % 2 !== 0 ? !trailerPossessing : trailerPossessing));
                            if (scoreDiff > futureMax) {
                                setTimeout(() => {chatMessage(`Mercy Rule trigger warning after Song ${s}`);}, 1000);
                                break;
                            }
                        }
                    }
                } catch(e) {}
            }
        }

        else if (state.period === 'OVERTIME') {
            if (state.otRound === 1) {
                if (result.name === "Onside Kick") {
                    setTimeout(() => {
                        chatMessage(`${getTeamName('away')} wins via Onside Kick!`);
                        systemMessage("Game ended in Overtime");
                        state.isActive = false;
                    }, 1000);
                    isGameOver = true;
                }
                else if (result.team === "defense" && result.pts > 0) {
                    setTimeout(() => {
                        chatMessage(`${getTeamName('home')} wins via Defensive Score!`);
                        systemMessage("Game ended in Overtime");
                        state.isActive = false;
                    }, 1000);
                    isGameOver = true;
                } 
                else {
                    setTimeout(() => {chatMessage("Whoever has more points after this wins Overtime")}, 1500);

                    try {
                        const otScoreDiff = state.scores.away - state.scores.home;
                        if (otScoreDiff !== 0) {
                            const isAwayLeading = otScoreDiff > 0;
                            const leaderName    = isAwayLeading ? getTeamName('away') : getTeamName('home');
                            const trailerName   = isAwayLeading ? getTeamName('home') : getTeamName('away');
                            const gap           = Math.abs(otScoreDiff);

                            const tieOutcomes   = outcomesList.filter   (o => o.swing   === gap && ["Touchdown", "Field Goal", "Rouge", "TD + 2PC"].includes(o.name));
                            const tieOutcome    = tieOutcomes.find      (o => o.name    === "Touchdown") || tieOutcomes[0];
                            const winOutcomes   = outcomesList.filter   (o => o.swing   >   gap && ["Touchdown", "Field Goal", "Rouge", "TD + 2PC"].includes(o.name));
                            winOutcomes.sort((a,b) => a.swing - b.swing);
                            const winOutcome = winOutcomes.find(o => o.name === "Touchdown") || winOutcomes[0];

                            setTimeout(() => {
                                if (tieOutcome) {
                                    const artTie    = getArticle(tieOutcome.name);
                                    let leaderMsg   = `The ${leaderName} can afford a ${trailerName} ${tieOutcome.name} to continue Overtime`;
                                    let trailerMsg  = `The ${trailerName} needs ${artTie} ${tieOutcome.name} to tie`;
                                    if (winOutcome) {
                                        const artWin    =   getArticle(winOutcome.name);
                                        trailerMsg      +=  `, or ${artWin} ${winOutcome.name} to win outright`;
                                        leaderMsg       +=  `; any better and they win outright`;
                                    }
                                    chatMessage(leaderMsg);
                                    setTimeout(() => chatMessage(trailerMsg), 1000);
                                }
                            }, 2500);
                        }
                    } catch(e) {}
                }
            } 
            else {
                if (state.scores.away !== state.scores.home) {
                    const winner = state.scores.away > state.scores.home ? getTeamName('away') : getTeamName('home');
                    setTimeout(() => {
                        chatMessage(`${winner} wins in Overtime!`);
                        systemMessage("Game ended in Overtime");
                        state.isActive = false;
                    }, 1000);
                    isGameOver = true;
                }
            }

            if (!isGameOver && state.otRound === 5) {
                if (state.scores.away === state.scores.home) {
                    if (state.knockout) {
                        setTimeout(() => {
                            systemMessage("Knockout Overtime ended in a tie, restarting Overtime");
                            state.scores        = JSON.parse(JSON.stringify(state.scoresAtReg));
                            state.history       = JSON.parse(JSON.stringify(state.historyAtReg));
                            state.possession    = 'away';
                            state.otRound       = 0;
                        }, 1000);
                    } else {
                        setTimeout(() => {
                            chatMessage("Game ended in a Tie");
                            state.isActive = false;
                        }, 1000);
                    }
                }
            }
        }

        if (state.isActive || isGameOver) {
             state.history.push({
                song    : state.songNumber,
                poss    : currentPossessionSide,
                awayArr : awayStats.patternArr,
                homeArr : homeStats.patternArr,
                result  : result.name,
                score   : scoreStr,
                period  : state.period,
                otRound : state.otRound
            });
        }
    };

    const downloadScoresheet = (isAuto = false) => {
        if (!state.history.length) {
            if (!isAuto) systemMessage("Error: No data to export");
            return;
        }
        
        const awayNameRaw = getTeamName('away');
        const homeNameRaw = getTeamName('home');
        
        const lastEntry         = state.history[state.history.length - 1];
        const lastSongDisplay   = lastEntry.song; 
        const lastScore         = lastEntry.score;
        const titleStr          = `Game ${state.gameNumber} (${lastSongDisplay}): ${awayNameRaw} ${lastScore} ${homeNameRaw}`;

        const awaySlots = state.isSwapped ? gameConfig.homeSlots : gameConfig.awaySlots;
        const homeSlots = state.isSwapped ? gameConfig.awaySlots : gameConfig.homeSlots;

        const getCaptainPos = (slots) => {
            const index = slots.findIndex(slot => state.captains.includes(slot));
            return index !== -1 ? gameConfig.posNames[index] : "?";
        };
        
        const awayHeaderTitle = `${awayNameRaw} (${getCaptainPos(awaySlots)})`;
        const homeHeaderTitle = `${homeNameRaw} (${getCaptainPos(homeSlots)})`;
        const subHeaders      = gameConfig.posNames; 

        const date      = new Date();
        const y         = date.getFullYear().toString().slice(-2);
        const m         = String(date.getMonth() + 1).padStart(2, '0');
        const d         = String(date.getDate()).padStart(2, '0');
        const safeAway  = awayNameRaw.replace(/[^a-z0-9]/gi, '_');
        const safeHome  = homeNameRaw.replace(/[^a-z0-9]/gi, '_');
        const fileName  = `${y}${m}${d}-${state.gameNumber}-${safeAway}-${safeHome}.html`;

        let html = `
        <html>
        <head>
            <meta charset="utf-8">
            <title>${titleStr}</title>
            <style>
                body    {font-family: sans-serif; padding: 20px;}
                table   {border-collapse: collapse; text-align: center; margin: 0 auto;}
                th, td  {border: 1px solid black; padding: 8px;}
            </style>
        </head>
        <body>
            <table>
                <thead>
                    <tr><th colspan="14" style="font-size: 1.5em; font-weight: bold;">${titleStr}</th></tr>
                    <tr>
                        <th rowspan="2">Song</th>
                        <th rowspan="2">Possession</th>
                        <th colspan="4">${awayHeaderTitle}</th>
                        <th colspan="4">${homeHeaderTitle}</th>
                        <th rowspan="2">Result</th>
                        <th colspan="2">Score</th>
                        <th rowspan="2">Winner</th>
                    </tr>
                    <tr>
                        ${subHeaders.map(h => `<th>${h}</th>`).join('')}
                        ${subHeaders.map(h => `<th>${h}</th>`).join('')}
                        <th>${awayNameRaw}</th>
                        <th>${homeNameRaw}</th>
                    </tr>
                    <tr>
                        <td colspan="14" style="font-weight: bold;">
                            Regulation (0-40): 20 Watched Equal with Mercy Rule
                        </td>
                    </tr>
                </thead>
                <tbody>
        `;
        
        let otBannerAdded = false;

        state.history.forEach(row => {
            if (row.period === 'OVERTIME' && !otBannerAdded) {
                html += `
                <tr>
                    <td colspan="14" style="font-weight: bold;">
                        Overtime (0-100): 5 Random songs. Onside Kick/Defensive Point(s) ends it on Song 1, otherwise Sudden Death from Song 2
                    </td>
                </tr>`;
                otBannerAdded = true;
            }

            const possName                  = row.poss === 'away' ? awayNameRaw : homeNameRaw;
            const [scoreAway, scoreHome]    = row.score.split('-').map(Number);
            let winnerName                  = "TBD";

            if (row.period === 'REGULATION') {
                 const songsRemaining       = 20 - row.song;
                 const diff                 = Math.abs(scoreAway - scoreHome);
                 let nextPossessionIsAway   = (row.poss === 'away');
                 const swapResults          = ["TD + 2PC", "Touchdown", "Field Goal", "Rouge", "Punt", "Safety", "Pick Six", "House Call"];
                 if (swapResults.includes(row.result)) nextPossessionIsAway = !nextPossessionIsAway;
                 const isAwayLeading        = scoreAway > scoreHome;
                 const trailerIsPossessing  = (isAwayLeading && !nextPossessionIsAway) || (!isAwayLeading && nextPossessionIsAway);
                 const maxPoints            = getMaxPossiblePoints(songsRemaining, trailerIsPossessing);
                 
                 if (diff > maxPoints || (row.song >= 20 && diff !== 0)) {
                    winnerName = scoreAway > scoreHome ? awayNameRaw : homeNameRaw;
                 }
            } else {
                if (row.otRound === 1 && (row.result === "Onside Kick" || (row.result !== "Onside Kick" && ["Safety","Pick Six","House Call","Rouge"].includes(row.result) && row.result!=="Rouge"))) {
                     if (scoreAway !== scoreHome) winnerName = scoreAway > scoreHome ? awayNameRaw : homeNameRaw;
                } else if (row.otRound >= 2 && scoreAway !== scoreHome) {
                     winnerName = scoreAway > scoreHome ? awayNameRaw : homeNameRaw;
                }
            }

            const displaySong   = row.period === 'OVERTIME' ? row.otRound : row.song;
            const awayCells     = row.awayArr.map(b => `<td>${b === 0 ? '' : b}</td>`).join('');
            const homeCells     = row.homeArr.map(b => `<td>${b === 0 ? '' : b}</td>`).join('');

            html += `
                <tr>
                    <td>${displaySong}</td>
                    <td>${possName}</td>
                    ${awayCells}
                    ${homeCells}
                    <td>${row.result}</td>
                    <td>${scoreAway}</td>
                    <td>${scoreHome}</td>
                    <td>${winnerName}</td>
                </tr>`;
        });

        html += `</tbody></table></body></html>`;
        
        const blob  = new Blob([html], {type: "text/html"});
        const a     = document.createElement('a');
        a.href      = URL.createObjectURL(blob);
        a.download  = fileName;
        a.click();
    };

    const printHelp = (topic = null) => {
        const descriptions = {
            end         : "Ends NFL Mode and resets all data",
            export      : "Downloads current game's scoresheet",
            help        : "Lists all commands",
            setcaptains : "Sets Captains",
            setgame     : "Sets Game Number",
            setknockout : "Sets Knockout to repeat Overtime",
            setteams    : "Sets Team Names",
            showcodes   : "Shows Regulation and Overtime codes",
            start       : "Starts NFL Mode",
            swap        : "Swaps Away and Home teams"
        };
        if (topic && descriptions[topic]) systemMessage(`/nfl ${topic}: ${descriptions[topic]}`);
        else systemMessage("Commands: end, export, help, setCaptains, setGame, setKnockout, setTeams, showCodes, start, swap");
    };

    const setup = () => {
        new Listener("game chat update", (payload) => {
            payload.messages.forEach(msg => {
                if (msg.sender === selfName && msg.message.startsWith("/nfl")) {
                    const parts = msg.message.split(" ");
                    const cmd   = parts[1] ? parts[1].toLowerCase() : "help";
                    const arg   = parts[2] ? parts[2].toLowerCase() : null;

                    if      (cmd === "start")           startGame();
                    else if (cmd === "end")             endGame();
                    else if (cmd === "setteams") { 
                        if (parts.length === 4 && parts[2].toLowerCase() !== parts[3].toLowerCase()) {
                            state.teamNames.away = toTitleCase(parts[2]);
                            state.teamNames.home = toTitleCase(parts[3]);
                            systemMessage(`Teams set: ${state.teamNames.away} @ ${state.teamNames.home}`);
                        } else systemMessage("Error: Usage /nfl setTeams [Away] [Home]");
                    } 
                    else if (cmd === "setcaptains") {
                        if (parts[2] && /^[1-4][5-8]$/.test(parts[2])) {
                            state.captains = parts[2].split('').map(Number);
                            systemMessage(`Captains: ${getCaptainListString()}`);
                        } else systemMessage("Error: Invalid format (e.g. 15)");
                    }
                    else if (cmd === "setgame") {
                        const num = parseInt(parts[2]);
                        if (num >= 1 && num <= 7) { state.gameNumber = num; systemMessage(`Game: ${num}`); }
                        else systemMessage("Error: 1-7 only");
                    }
                    else if (cmd === "setknockout") {
                        if (arg === "true") { state.knockout = true; systemMessage("Knockout: On"); }
                        else if (arg === "false") { state.knockout = false; systemMessage("Knockout: Off"); }
                        else systemMessage("Usage: /nfl setKnockout [true/false]");
                    }
                    else if (cmd === "showcodes") {
                        systemMessage(`Regulation: ${CODES.REGULATION}`);
                        systemMessage(`Overtime: ${CODES.OVERTIME}`);
                    }
                    else if (cmd === "swap") {
                        state.isSwapped = !state.isSwapped;
                        systemMessage(`Swapped. Team 1 is ${state.isSwapped ? "Home" : "Away"}`);
                    }
                    else if (cmd === "export")          downloadScoresheet();
                    else if (cmd === "help")            printHelp(arg);
                    else                                printHelp();
                }
            });
        }).bindListener();

        new Listener("answer results", (payload) => {
            if (state.isActive) setTimeout(() => processRound(payload), 200);
        }).bindListener();
    };

    function init() {
        if (typeof quiz !== 'undefined' && typeof Listener !== 'undefined') setup();
        else setTimeout(init, 500);
    }

    init();
})();