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
        gameNumber  : 0, 
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

    const CODES = {
        REGULATION  : "e0g0k21111100120g000431110000000k11111111111100k051o000000f11100k012r02i0a46533a11002s011111111100140111002s01a111111111102a11111111111hg1k903-11111--",
        OVERTIME    : "e0g05211111001100000531110000000511111111111100k051o000000f11100k012r02i0a46533a11002s0111111111002s0111002s01a111111111102a11111111111hg1k903-11111--"
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
            return name !== "N/A" ? name : `(Team ${teamId})`;
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
            if (!isAuto) systemMessage("No data to export");
            return;
        }
        
        const awayName = getTeamName('away');
        const homeName = getTeamName('home');
        
        const lastEntry = state.history[state.history.length - 1];
        const lastSong  = lastEntry ? lastEntry.song : 0;
        const lastScore = lastEntry ? lastEntry.score : "0-0";
        const titleStr  = `Game ${state.gameNumber} (${lastSong}): ${awayName} ${lastScore} ${homeName}`;

        const awayColor = "#0047AB";
        const homeColor = "#D2691E";

        const getHeaders = (slots) => {
            return gameConfig.posNames.map((name, i) => {
                const slotId = slots[i];
                return state.captains.includes(slotId) ? `${name} (C)` : name;
            });
        };

        const awaySlots = state.isSwapped ? gameConfig.homeSlots : gameConfig.awaySlots;
        const homeSlots = state.isSwapped ? gameConfig.awaySlots : gameConfig.homeSlots;

        const awayHeaders = getHeaders(awaySlots);
        const homeHeaders = getHeaders(homeSlots);

        const totalCols = 14;

        let html = `
        <html><head><style>
            body    {font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px;}
            h2      {text-align: center; margin-bottom: 20px;}
            table   {border-collapse: collapse; width: 100%; margin: 0 auto; font-size: 14px; table-layout: fixed;}
            th, td  {border: 1px solid #000; padding: 6px; text-align: center; background-color: #ffffff; white-space: nowrap; overflow: hidden;}
            
            .header-top {background-color: #ffffff; font-weight: bold;}
            .header-sub {background-color: #ffffff; font-weight: bold; font-size: 0.9em;}
            
            .text-away      {color: ${awayColor}; font-weight: bold;}
            .text-home      {color: ${homeColor}; font-weight: bold;}
            .text-neutral   {color: #000;}
            
            .banner-row td { 
                text-align          : center; 
                font-weight         : bold; 
                background-color    : #ffffff; 
                border-bottom       : 1px solid #000; /* Matched border weight */
                padding: 8px;
            }

            .w-sm   {width: 45px;}
            .w-md   {width: 60px;}
            .w-lg   {width: 110px;}
            .w-auto {width: auto;}
        </style></head><body>
        <h2>${titleStr}</h2>
        <table>
            <tr class="header-top">
                <th rowspan="2" class="w-auto">Song</th>
                <th rowspan="2" class="w-lg">Possession</th>
                <th colspan="4" class="text-away">${awayName}</th>
                <th colspan="4" class="text-home">${homeName}</th>
                <th rowspan="2" class="w-auto">Result</th>
                <th colspan="2">Score</th>
                <th rowspan="2" class="w-lg">Winner</th>
            </tr>
            <tr class="header-sub">
                ${awayHeaders.map(h => `<th class="text-away w-sm">${h}</th>`).join('')}
                ${homeHeaders.map(h => `<th class="text-home w-sm">${h}</th>`).join('')}
                <th class="text-away w-md">${awayName}</th>
                <th class="text-home w-md">${homeName}</th>
            </tr>
            <tr class="banner-row">
                <td colspan="${totalCols}">
                    Regulation (0-40): 16 Watched Equal, 4 Random songs. Mercy Rule triggered if Score Deficit > Remaining Songs × 8
                </td>
            </tr>
        `;
        
        state.history.forEach(row => {
            const possClass = row.poss === 'away' ? 'text-away' : 'text-home';
            const possName  = row.poss === 'away' ? awayName    : homeName;

            const [scoreAway, scoreHome] = row.score.split('-').map(Number);

            let winnerName  = "TBD";
            let winnerClass = "text-neutral";
            
            const songsRemaining        = 20 - row.song;
            const maxPointsRemaining    = songsRemaining * 8;
            const diff                  = Math.abs(scoreAway - scoreHome);

            if (diff > maxPointsRemaining || (row.song >= 20 && diff !== 0)) {
                if (scoreAway > scoreHome) {
                    winnerName  = awayName;
                    winnerClass = "text-away";
                } else if (scoreHome > scoreAway) {
                    winnerName  = homeName;
                    winnerClass = "text-home";
                }
            }

            const awayCells = row.awayArr.map(b => `<td class="text-away">${b}</td>`).join('');
            const homeCells = row.homeArr.map(b => `<td class="text-home">${b}</td>`).join('');

            html += `<tr>
                <td>${row.song}</td>
                <td class="${possClass}">${possName}</td>
                ${awayCells}
                ${homeCells}
                <td>${row.result}</td>
                <td class="text-away">${scoreAway}</td>
                <td class="text-home">${scoreHome}</td>
                <td class="${winnerClass}">${winnerName}</td>
            </tr>`;
        });
        html += "</table></body></html>";
        
        const blob  = new Blob([html], {type: "text/html"});
        const a     = document.createElement('a');
        a.href      = URL.createObjectURL(blob);
        a.download  = `NFL_Game${state.gameNumber}_${Date.now()}.html`;
        a.click();
    };

    const setup = () => {
        new Listener("game chat update", (payload) => {
            payload.messages.forEach(msg => {
                if (msg.sender === selfName && msg.message.startsWith("/nfl")) {
                    const parts = msg.message.split(" ");
                    const cmd   = parts[1] ? parts[1].toLowerCase() : "help";

                    if      (cmd === "start") startGame();
                    else if (cmd === "setteamnames") {
                        if (parts.length === 4) {
                            state.teamNames.away = parts[2];
                            state.teamNames.home = parts.slice(3).join(" "); 
                            systemMessage(`Teams set: ${state.teamNames.away} @ ${state.teamNames.home}`);
                        } else systemMessage("Usage: /nfl setTeamNames [Away] [Home]");
                    } 
                    else if (cmd === "setcaptains") {
                        const pat = parts[2] || "15";
                        state.captains = pat.split('').map(Number).filter(n=>!isNaN(n));
                        systemMessage(`Captains: ${getCaptainListString()}`);
                    }
                    else if (cmd === "setgame") {
                        const num = parseInt(parts[2]);
                        if (!isNaN(num)) {
                            state.gameNumber = num;
                            systemMessage(`Game Number: ${state.gameNumber}`);
                        } else systemMessage("Usage: /nfl setGame <number>");
                    }
                    else if (cmd === "swap") {
                        state.isSwapped = !state.isSwapped;
                        systemMessage(`Swapped sides. Team 1 is now ${state.isSwapped ? "Home" : "Away"}.`);
                    }
                    else if (cmd === "export")              downloadScoresheet();
                    else if (cmd === "printregulationcode") systemMessage(`Regulation: ${CODES.REGULATION}`);
                    else if (cmd === "printovertimecode")   systemMessage(`Overtime: ${CODES.OVERTIME}`);
                    else systemMessage("Commands: setTeamNames <Away> <Home>, setCaptains <15>, swap, start, export, setGame <0-7>");
                }
            });
        }).bindListener();

        new Listener("answer results", (payload) => {
            if (state.isActive) setTimeout(() => processRound(payload), 200);
        }).bindListener();

        new Listener("quiz closed", () => {
            if (state.isActive) {
                downloadScoresheet(true); 
                resetGameData();
                systemMessage("Game saved and tracker reset.");
            }
        }).bindListener();

        console.log("NFL Mode loaded");
    };

    function init() {
        if (typeof quiz !== 'undefined' && typeof Listener !== 'undefined') setup();
        else setTimeout(init, 500);
    }

    init();
})();