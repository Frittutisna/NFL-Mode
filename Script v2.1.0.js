// ==UserScript==
// @name         NFL Mode for AMQ
// @namespace    https://github.com/Frittutisna/NFL-Mode
// @version      2.1.0
// @description  Script to help track NFL Mode on AMQ
// @author       Frittutisna
// @match        https://animemusicquiz.com/*
// @match        https://*.animemusicquiz.com/*
// @require      https://github.com/joske2865/AMQ-Scripts/raw/master/common/amqScriptInfo.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const initialState = {
        isActive    : false,
        songNumber  : 0,
        gameNumber  : 1,
        scores      : {away: 0, home: 0},
        possession  : 'away', 
        teamNames   : {away: "Away", home: "Home"},
        captains    : [1, 5],
        history     : [], 
        isSwapped   : false
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
        
        state = JSON.parse(JSON.stringify(initialState));
        
        state.gameNumber    = savedGameNum;
        state.teamNames     = savedTeams;
        state.captains      = savedCaps;
        state.isSwapped     = savedSwap;
    };

    const startGame = () => {
        state.isActive      = true;
        state.songNumber    = 0;
        state.scores        = {away: 0, home: 0};
        state.possession    = 'away'; 
        state.history       = [];
        
        systemMessage(`Game ${state.gameNumber}: ${getTeamName('away')} @ ${getTeamName('home')}`);
    };

    const endGame = () => {
        resetGameData();
        state.isActive = false;
        systemMessage("NFL Mode ended, all data reset");
    };

    const processRound = (payload) => {
        if (!state.isActive) return;

        state.songNumber++;
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

                const bit = isCorrect ? 1 : 0;
                patternArr.push(bit);
                patternStr += bit;
                
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
        const outputMsg = `${awayStats.patternStr} ${homeStats.patternStr} ${result.name} ${scoreStr}`;
        
        chatMessage(outputMsg);

        state.history.push({
            song    : state.songNumber,
            poss    : currentPossessionSide,
            awayArr : awayStats.patternArr,
            homeArr : homeStats.patternArr,
            result  : result.name,
            score   : scoreStr
        });
    };

    const downloadScoresheet = (isAuto = false) => {
        if (!state.history.length) {
            if (!isAuto) systemMessage("Error: No data to export");
            return;
        }
        
        const awayNameRaw = getTeamName('away');
        const homeNameRaw = getTeamName('home');
        
        const lastEntry = state.history[state.history.length - 1];
        const lastSong  = lastEntry ? lastEntry.song : 0;
        const lastScore = lastEntry ? lastEntry.score : "0-0";
        const titleStr  = `Game ${state.gameNumber} (${lastSong}): ${awayNameRaw} ${lastScore} ${homeNameRaw}`;

        const awaySlots = state.isSwapped ? gameConfig.homeSlots : gameConfig.awaySlots;
        const homeSlots = state.isSwapped ? gameConfig.awaySlots : gameConfig.homeSlots;

        const getCaptainPos = (slots) => {
            const index = slots.findIndex(slot => state.captains.includes(slot));
            return index !== -1 ? gameConfig.posNames[index] : "?";
        };
        const awayHeaderTitle = `${awayNameRaw} (${getCaptainPos(awaySlots)})`;
        const homeHeaderTitle = `${homeNameRaw} (${getCaptainPos(homeSlots)})`;
        const subHeaders      = gameConfig.posNames; 

        let html = `
        <html>
        <head>
            <meta charset="utf-8">
            <title>${titleStr}</title>
        </head>
        <body>
            <table border="1" style="border-collapse: collapse; text-align: center; font-family: sans-serif;">
                <thead>
                    <tr>
                        <th colspan="14" style="font-size: 1.5em; padding: 10px; font-weight: bold;">
                            ${titleStr}
                        </th>
                    </tr>
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
                        <td colspan="14" style="text-align: left; padding: 5px; font-weight: bold;">
                            Regulation (0-40): 16 Watched Equal, 4 Random songs. Mercy Rule triggered if Score Deficit > Remaining Songs × 8
                        </td>
                    </tr>
                </thead>
                <tbody>
        `;
        
        state.history.forEach(row => {
            const possName                  = row.poss === 'away' ? awayNameRaw : homeNameRaw;
            const [scoreAway, scoreHome]    = row.score.split('-').map(Number);

            let winnerName = "TBD";
            
            if (!isNaN(scoreAway) && !isNaN(scoreHome)) {
                const songsRemaining     = 20 - row.song;
                const maxPointsRemaining = songsRemaining * 8;
                const diff               = Math.abs(scoreAway - scoreHome);

                if (diff > maxPointsRemaining || (row.song >= 20 && diff !== 0)) {
                    if (scoreAway > scoreHome)      winnerName = awayNameRaw;
                    else if (scoreHome > scoreAway) winnerName = homeNameRaw;
                }
            }

            const awayCells = row.awayArr.map(b => `<td>${b === 0 ? '' : b}</td>`).join('');
            const homeCells = row.homeArr.map(b => `<td>${b === 0 ? '' : b}</td>`).join('');

            html += `
                <tr>
                    <td>${row.song}</td>
                    <td>${possName}</td>
                    ${awayCells}
                    ${homeCells}
                    <td>${row.result}</td>
                    <td>${scoreAway}</td>
                    <td>${scoreHome}</td>
                    <td>${winnerName}</td>
                </tr>`;
        });

        html += `
                </tbody>
            </table>
        </body>
        </html>`;
        
        const blob  = new Blob([html], {type: "text/html"});
        const a     = document.createElement('a');
        a.href      = URL.createObjectURL(blob);
        a.download  = `NFL_Game${state.gameNumber}_Simple.html`;
        a.click();
    };

    const printHelp = (topic = null) => {
        const descriptions = {
            end         : "Ends NFL Mode and resets all data",
            export      : "Downloads current game's scoresheet",
            help        : "Lists all commands or explains a specific command",
            setcaptains : "Sets Captains for each team using XY (X = 1-4, Y = 5-8), defaults to 15",
            setgame     : "Sets Game Number (1-7), defaults to 1",
            setteams    : "Sets Away and Home team names, defaults to Away and Home",
            start       : "Initializes NFL Mode, resets scores to 0-0, and sets possession to Away",
            swap        : "Swaps sides (Home <> Away) and adjusts slots accordingly"
        };

        if (topic && descriptions[topic]) {
            systemMessage(`/nfl ${topic}: ${descriptions[topic]}`);
        } else {
            systemMessage("Commands: end, export, help [command], setCaptains [15], setGame [1], setTeams [Away] [Home], start, swap");
        }
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
                        if (parts.length === 4) {
                            const t1 = parts[2];
                            const t2 = parts[3];

                            if (t1.toLowerCase() === t2.toLowerCase()) systemMessage("Error: Team names must be different");
                            else {
                                state.teamNames.away = toTitleCase(t1);
                                state.teamNames.home = toTitleCase(t2);
                                systemMessage(`Teams set: ${state.teamNames.away} @ ${state.teamNames.home}`);
                            }
                        } else systemMessage("Error: Provide exactly two different team names");
                    } 
                    else if (cmd === "setcaptains") {
                        const pat = parts[2];
                        if (pat && /^[1-4][5-8]$/.test(pat)) {
                            state.captains = pat.split('').map(Number);
                            systemMessage(`Captains: ${getCaptainListString()}`);
                        } else {
                            systemMessage("Error: Invalid format, use [1-4][5-8] (e.g., 15)");
                        }
                    }
                    else if (cmd === "setgame") {
                        const num = parseInt(parts[2]);
                        if (!isNaN(num) && num >= 1 && num <= 7) {
                            state.gameNumber = num;
                            systemMessage(`Game Number: ${state.gameNumber}`);
                        } else {
                            systemMessage("Error: Game number must be between 1 and 7");
                        }
                    }
                    else if (cmd === "swap") {
                        state.isSwapped = !state.isSwapped;
                        systemMessage(`Swapped sides. Team 1 is now ${state.isSwapped ? "Home" : "Away"}.`);
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