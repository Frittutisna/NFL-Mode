// ==UserScript==
// @name         AMQ NFL Mode
// @namespace    https://github.com/Frittutisna
// @version      3.beta.6.0
// @description  Script to track NFL Mode on AMQ
// @author       Frittutisna
// @match        https://*.animemusicquiz.com/*
// ==/UserScript==

(function() {
    'use strict';

    let playersCache = [];

    let config = {
        delay               : 500,
        gameNumber          : 1,
        hostId              : 0,
        teamNames           : {away: "Away", home: "Home"},
        captains            : [1, 5],
        isSwapped           : false,
        knockout            : false,
        isTest              : false,
        seriesLength        : 1,
        lengths             : {reg: 20, ot: 5},
        seriesStats         : {awayWins: 0, homeWins: 0, draws: 0, history: []},
        links               : {
            guide           : "https://github.com/Frittutisna/NFL-Mode/blob/main/Guide.md",
            flowchart       : "https://github.com/Frittutisna/NFL-Mode/blob/main/Flowchart/Flowchart.pdf"
        },
        selectors           : {
            playIcon        : "fa-play-circle",
            pauseIcon       : "fa-pause-circle",
            pauseBtn        : "qpPauseButton",
            returnBtn       : "qpReturnToLobbyButton",
            lobbyName       : "mhRoomNameInput",
            lobbyChange     : "mhChangeButton",
            swalConfirm     : '.swal2-confirm'
        }
    };

    const match = {
        isActive        : false,
        songNumber      : 0,
        scores          : {away: 0, home: 0},
        possession      : 'away',
        history         : [],
        period          : 'REGULATION',
        otRound         : 0,
        pendingPause    : false
    };

    const gameConfig = {
        captainMultiplier   : 2,
        awaySlots           : [1, 2, 3, 4],
        homeSlots           : [5, 6, 7, 8],
        opsRelativeIndices  : [0, 1],
        dpsRelativeIndices  : [2, 3],
        posNames            : ["T1", "T4", "T2", "T3"]
    };

    const TERMS = {
        "away"              : `The team listed first on Challonge. They have possession on Songs 1 and ${config.lengths.reg + 1}`,
        "home"              : `The team listed second on Challonge. They have possession on Song ${config.lengths.reg / 2 + 1}`,
        "possession"        : `The state of being the Attacking Team. Generally swaps after every song unless after an Onside Kick or before Song ${config.lengths.reg / 2 + 1}`,
        "attacking"         : "The team currently with Possession. Their main role is to score points",
        "defending"         : "The team currently without Possession. Their main role is to prevent the other team from scoring",
        "op"                : "Offensive Player (Slots 1, 2, 5, and 6). Their main role is to score points when their team has possession",
        "dp"                : "Defensive Player (Slots 3, 4, 7, and 8). Their main role is to prevent the other team from scoring when their team doesn't have possession",
        "captain"           : "The player with the highest Watched Elo in the team. Their correct guesses count double for (T)DIFF calculations",
        "tdiff"             : "Total Difference. Calculated by subtracting the Defending Team's total score from the Attacking Team's total score, counting everyone. Checked first before checking DIFF",
        "diff"              : "Difference. Calculated by subtracting Defending DPs' score from Attacking OPs' score. Checked only if TDIFF is inconclusive (between -3 and 3)",
        "onside kick"       : `TDIFF ≥ 4. Attacking Team gets 7 points and keeps possession. Wins the game if it happens on Song ${config.lengths.reg + 1}`,
        "house call"        : `TDIFF ≤ -4. Defending Team gets 7 points. Possession swaps. Wins the game if it happens on Song ${config.lengths.reg + 1}`,
        "td + 2pc"          : "DIFF ≥ 3. Attacking Team gets 8 points. Possession swaps",
        "touchdown"         : "DIFF = 2. Attacking Team gets 7 points. Possession swaps",
        "field goal"        : "DIFF = 1. Attacking Team gets 3 points. Possession swaps",
        "rouge"             : "DIFF = 0 or -1, and exactly 1 team got it right. That team gets 1 point. Possession swaps",
        "punt"              : "DIFF = 0 or -1, and either both or neither got it right. No points awarded. Possession swaps",
        "safety"            : "DIFF = -2. Defending Team gets 2 points. Possession swaps",
        "pick six"          : "DIFF = -3. Defending Team gets 6 points. Possession swaps",
        "mercy rule"        : "Ends the game early if the trailing team cannot mathematically catch up with the songs remaining",
        "regulation"        : `Songs 1-${config.lengths.reg}. Away gets possession on Song 1, Home gets possession on Song ${config.lengths.reg / 2 + 1}`,
        "overtime"          : `Songs ${config.lengths.reg + 1}-${config.lengths.reg + config.lengths.ot}. Played if tied after Regulation, Away gets first possession`,
        "sudden death"      : `If Song ${config.lengths.reg + 1} results in an Onside Kick or a House Call, the game ends immediately`,
        "knockout"          : "A game where a winner must be decided via Tiebreakers if tied after Overtime",
        "tiebreaker"        : "Weighted Total, Captains, T2s, T3s, Defending",
        "weighted total"    : "First tiebreaker used after Knockout Overtime; checks total team correct counting Captains twice",
    };

    const COMMAND_DESCRIPTIONS = {
        "end"               : "Stop the game tracker",
        "export"            : "Download the HTML scoresheet",
        "flowchart"         : "Show link to the NFL Mode flowchart",
        "guide"             : "Show link to the NFL Mode guide",
        "howTo"             : "Show the step-by-step setup tutorial",
        "resetEverything"   : "Hard reset: Wipe all settings, series history, and teams to default",
        "resetGame"         : "Wipe current Game progress and stop tracker",
        "resetSeries"       : "Wipe all series history and reset to Game 1",
        "setGame"           : "Set the current game number (/nfl setGame [1-7])",
        "setHost"           : "Set the script host (/nfl setHost [1-8])",
        "setKnockout"       : "Enable/disable tiebreakers (/nfl setKnockout [true/false])",
        "setSeries"         : "Set the series length (/nfl setSeries [1/2/7]",
        "setTeams"          : "Set team names (/nfl setTeams [Away] [Home])",
        "setTest"           : "Enable/disable loose lobby validation (/nfl setTest [true/false])",
        "start"             : "Start the game tracker",
        "swap"              : "Swap Away and Home teams",
        "whatIs"            : "Explain a term or rule (/nfl whatIs [Term])"
    };

    const parseBool = (val) => {
        if (typeof val === 'boolean') return val;
        const s = String(val).toLowerCase().trim();
        if (['t', '1', 'y', 'true',     'yes']  .includes(s)) return true;
        if (['f', '0', 'n', 'false',    'no']   .includes(s)) return false;
        return null;
    };

    const getArrowedName = (side) => {
        const name = config.teamNames[side];
        return side === 'away' ? `← ${name}` : `${name} →`;
    };

    const updateLobbyName = (awayClean, homeClean) => {
        if (config.isTest) {
            systemMessage("Test Mode active: Skipping lobby name update");
            return;
        }

        const awayAbbr  = awayClean.substring(0, 3).toUpperCase();
        const homeAbbr  = homeClean.substring(0, 3).toUpperCase();
        const newTitle  = `NFL Tour: ${awayAbbr} @ ${homeAbbr}`;
        const nameInput = document.getElementById(config.selectors.lobbyName);
        const changeBtn = document.getElementById(config.selectors.lobbyChange);

        if (nameInput && changeBtn) {
            nameInput.value = newTitle;
            changeBtn.click();
            systemMessage(`Lobby name updated to: ${nameInput.value}`);
        }
    };

    const messageQueue = {
        queue           : [],
        isProcessing    : false,
        add             : function(msg, isSystem = false) {
            const LIMIT = 150;
            if (msg.length <= LIMIT) this.queue.push({msg, isSystem});
            else {
                let remaining = msg;
                while (remaining.length > 0) {
                    if (remaining.length <= LIMIT) {this.queue.push({msg: remaining, isSystem}); break}
                    let splitIndex  = -1;
                    let idx         = remaining.lastIndexOf('.', LIMIT);
                    if (idx !== -1) splitIndex = idx;
                    else {
                        idx = remaining.lastIndexOf(',', LIMIT);
                        if (idx !== -1) splitIndex = idx;
                        else {
                            idx = remaining.lastIndexOf(' ', LIMIT);
                            if (idx !== -1) splitIndex = idx;
                            else splitIndex = LIMIT;
                        }
                    }

                    let cutEnd      = 0;
                    let nextStart   = 0;

                    if (splitIndex === LIMIT) {
                        cutEnd     = LIMIT;
                        nextStart  = LIMIT;
                    }
                    
                    else {
                        const char = remaining[splitIndex];

                        if (char === ' ') {
                            cutEnd      = splitIndex;
                            nextStart   = splitIndex + 1;
                        }
                        else {
                            cutEnd = splitIndex + 1;
                            nextStart = splitIndex + 1;
                            if (nextStart < remaining.length && remaining[nextStart] === ' ') nextStart++;
                        }
                    }
                    
                    this.queue.push({msg: remaining.substring(0, cutEnd), isSystem});
                    remaining = remaining.substring(nextStart);
                }
            }

            this.process();
        },

        process: function() {
            if (this.isProcessing || this.queue.length === 0) return;
            this.isProcessing   = true;
            const item          = this.queue.shift();

            if (item.isSystem) {
                if (typeof gameChat !== 'undefined') gameChat.systemMessage(item.msg);
            } else {
                if (typeof socket !== 'undefined') {
                    socket.sendCommand({
                        type    : "lobby",
                        command : "game chat message",
                        data    : {msg: item.msg, teamMessage: false}
                    });
                }
            }

            setTimeout(() => {
                this.isProcessing = false;
                this.process();
            }, config.delay);
        }
    };

    const systemMessage = (msg) => {messageQueue.add(msg, true)};
    const chatMessage   = (msg) => {messageQueue.add(msg, false)};

    const sendGameCommand = (cmd) => {
        const s = config.selectors;
        if (cmd === "return to lobby") {
            const returnBtn = document.getElementById(s.returnBtn);
            if (returnBtn) {
                returnBtn.click();
                setTimeout(() => {
                    const confirmBtn = document.querySelector(s.swalConfirm);
                    if (confirmBtn) confirmBtn.click();
                }, config.delay);
            }
        }
        else if (cmd === "pause game" || cmd === "resume game") {
            const pauseBtn = document.getElementById(s.pauseBtn);
            if (pauseBtn) {
                const icon = pauseBtn.querySelector("i");
                if (icon) {
                    const isPaused  = icon.classList.contains(s.playIcon);
                    const isPlaying = icon.classList.contains(s.pauseIcon);
                    if      (cmd === "resume game"  && isPaused)    pauseBtn.click();
                    else if (cmd === "pause game"   && isPlaying)   pauseBtn.click();
                } else                                              pauseBtn.click();
            }
        }
        else if (typeof socket !== 'undefined') socket.sendCommand({ type: "quiz", command: cmd });
    };

    const toTitleCase = (str)   => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    const getTeamDisplayName = (side)  => {
        let actualSide = side;
        if (config.isSwapped) actualSide = (side === 'away' ? 'home' : 'away');
        return getArrowedName(actualSide);
    };

    const getTeamNumber = (player) => {
        try {
            if (player.lobbySlot && player.lobbySlot.$TEAM_DISPLAY_TEXT) {
                return parseInt(player.lobbySlot.$TEAM_DISPLAY_TEXT.text().trim(), 10);
            }
        } catch (e) {return null}
        return player.teamNumber;
    };

    const getPlayerNameAtTeamId = (teamId) => {
        if (typeof quiz !== 'undefined' && quiz.inQuiz) {
            const p = Object.values(quiz.players).find(player => player.teamNumber == teamId);
            if (p) return p.name;
        }
        else if (typeof lobby !== 'undefined' && lobby.inLobby) {
            const p = Object.values(lobby.players).find(player => getTeamNumber(player) == teamId);
            if (p) return p.name;
        }
        if (playersCache.length > 0) {
            const p = playersCache.find(player => player.teamNumber == teamId);
            if (p) return p.name;
        }
        return "N/A";
    };

    const getSelfSlot = () => {
        if (playersCache.length > 0) {
            const p = playersCache.find(p => p.name === selfName);
            if (p) return p.teamNumber;
        }

        if (typeof quiz !== 'undefined' && quiz.inQuiz) {
             const p = Object.values(quiz.players).find(p => p.name === selfName);
             if (p) return p.teamNumber;
        }

        if (typeof lobby !== 'undefined' && lobby.inLobby) {
             const p = Object.values(lobby.players).find(p => p.name === selfName);
             if (p) return getTeamNumber(p);
        }
        return 0;
    };

    const resetMatchData = () => {
        match.isActive      = false;
        match.songNumber    = 0;
        match.scores        = {away: 0, home: 0};
        match.possession    = 'away';
        match.history       = [];
        match.period        = 'REGULATION';
        match.otRound       = 0;
        match.pendingPause  = false;
    };

    const resetEverything = () => {
        match.isActive      = false;
        resetMatchData();
        config.gameNumber   = 1;
        config.hostId       = 0;
        config.teamNames    = {away: "Away", home: "Home"};
        config.captains     = [1, 5];
        config.isSwapped    = false;
        config.knockout     = false;
        config.isTest       = false;
        config.seriesLength = 1;
        config.seriesStats  = {awayWins: 0, homeWins: 0, draws: 0, history: []};
        systemMessage("Full reset complete: settings, teams, and series history wiped");
    };

    const endGame = (winnerSide) => {
        let seriesWinner    = null;
        let seriesFinished  = false;

        if (config.seriesLength > 1) {
            const finalScoreStr = config.isSwapped ?
                                  `${match.scores.home}-${match.scores.away}` :
                                  `${match.scores.away}-${match.scores.home}`;

            config.seriesStats.history.push(finalScoreStr);

            let actualWinnerSide = winnerSide;
            if (config.isSwapped) {
                 if (winnerSide === 'away')      actualWinnerSide = 'home';
                 else if (winnerSide === 'home') actualWinnerSide = 'away';
            }

            if      (actualWinnerSide === 'away') config.seriesStats.awayWins++;
            else if (actualWinnerSide === 'home') config.seriesStats.homeWins++;
            else                                  config.seriesStats.draws++;

            const awayPoints    = config.seriesStats.awayWins + (config.seriesStats.draws * 0.5);
            const homePoints    = config.seriesStats.homeWins + (config.seriesStats.draws * 0.5);
            const winThreshold  = config.seriesLength / 2;

            const aName = config.teamNames.away;
            const hName = config.teamNames.home;

            if (awayPoints > winThreshold)  seriesWinner    = aName;
            if (homePoints > winThreshold)  seriesWinner    = hName;

            if (seriesWinner || config.seriesStats.history.length >= config.seriesLength) {
                seriesFinished = true;
            }

            let seriesMsg = "";
            let wins, losses, draws, historyStr;
            const sStats = config.seriesStats;

            if (homePoints > awayPoints) {
                wins    = sStats.homeWins;
                losses  = sStats.awayWins;
                draws   = sStats.draws;

                const flippedHistory = sStats.history.map(sc => {
                    const [a, h] = sc.split('-');
                    return `${h}-${a}`;
                });
                historyStr = `(${flippedHistory.join(", ")})`;
            } else {
                wins        = sStats.awayWins;
                losses      = sStats.homeWins;
                draws       = sStats.draws;
                historyStr  = `(${sStats.history.join(", ")})`;
            }

            const recordStr = `${wins}-${losses}-${draws}`;

            if (seriesWinner) {
                const verb  = (losses === 0 && draws === 0) ? "swept" : "won";
                seriesMsg   = `The ${seriesWinner} ${verb} the series ${recordStr} ${historyStr}`;
            } else {
                if (awayPoints === homePoints) {
                    seriesMsg = `Series tied at ${recordStr} ${historyStr}`;
                } else {
                    const leader = awayPoints > homePoints ? aName : hName;
                    seriesMsg = `The ${leader} leads the series ${recordStr} ${historyStr}`;
                }
            }

            chatMessage(seriesMsg);
        } else seriesFinished = true;

        if (!config.isTest) downloadScoresheet();

        match.isActive      = false;
        match.period        = 'REGULATION';
        match.pendingPause  = false;

        if (!seriesFinished) {
            config.gameNumber++;
            config.isSwapped = !config.isSwapped;

            if (config.seriesLength === 7 && config.gameNumber === 7) {
                const sStats    = config.seriesStats;
                const aPts      = sStats.awayWins + (sStats.draws * 0.5);
                const hPts      = sStats.homeWins + (sStats.draws * 0.5);

                if (aPts === hPts) {
                    config.knockout = true;
                    chatMessage("Game 7 decider detected, Knockout Mode forced to True");
                }
            }
            chatMessage(`Ready for Game ${config.gameNumber}, auto-swapped teams for the return leg`);
        } else chatMessage("Series finished");

        setTimeout(() => {
            if (match.songNumber < config.lengths.reg + config.lengths.ot) sendGameCommand("return to lobby");
            else chatMessage("Game finished naturally, waiting for auto-return to lobby")
        }, config.delay);
    };

    const validateLobby = () => {
        if (config.hostId === 0) return {valid: false, msg: "Error: Host not set, use /nfl setHost [1-8]"};
        if (typeof lobby === 'undefined' || !lobby.inLobby) return {valid: false, msg: "Error: Not in Lobby"};
        const players = Object.values(lobby.players);
        const notReady = players.filter(p => !p.ready);
        if (notReady.length > 0) return {valid: false, msg: "Error: All players must be Ready"};
        if (!config.isTest) {
            const occupiedSlots = players.map(p => getTeamNumber(p));
            const validSlots    = [1, 2, 3, 4, 5, 6, 7, 8];
            const allInSlots    = occupiedSlots.every(slot => validSlots.includes(slot));
            if (players.length !== 8 || !allInSlots) return {valid: false, msg: "Error: Additional lobby checks not met. If you know what you're doing, type /nfl setTest True"};
        }
        return {valid: true};
    };

    const startGame = () => {
        const check = validateLobby();
        if (!check.valid) {systemMessage(check.msg); return}
        resetMatchData();
        match.isActive = true;
        chatMessage(`Game ${config.gameNumber}: ${getTeamDisplayName('away')} @ ${getTeamDisplayName('home')} is about to start, get ready`);
        chatMessage(`Guide: ${config.links.guide}`);
        chatMessage(`Flowchart: ${config.links.flowchart}`);
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

    const WIN_PROBS = [
        {name: "Punt",              prob: 0.31, pts: 0,     keep: false},
        {name: "Field Goal",        prob: 0.19, pts: 3,     keep: false},
        {name: "Touchdown",         prob: 0.17, pts: 7,     keep: false},
        {name: "Offensive Rouge",   prob: 0.07, pts: 1,     keep: false},
        {name: "Defensive Rouge",   prob: 0.07, pts: -1,    keep: false},
        {name: "Safety",            prob: 0.07, pts: -2,    keep: false},
        {name: "House Call",        prob: 0.04, pts: -7,    keep: false},
        {name: "Onside Kick",       prob: 0.03, pts: 7,     keep: true},
        {name: "TD + 2PC",          prob: 0.03, pts: 8,     keep: false},
        {name: "Pick Six",          prob: 0.02, pts: -6,    keep: false}
    ];

    const memoProb = new Map();

    const calculateWinProbability = (margin, nextSongNum, isAwayPoss) => {
        const key = `${margin}_${nextSongNum}_${isAwayPoss}`;
        if (memoProb.has(key)) return memoProb.get(key);

        if (nextSongNum > config.lengths.reg) {
            if (margin > 0) return 1.0;
            if (margin < 0) return 0.0;
            return 0.5;
        }

        const songsLeft = config.lengths.reg - nextSongNum + 1;
        if (margin > (songsLeft * 8 + 7))       return 1.0;
        if (margin < (songsLeft * 8 + 7) * -1)  return 0.0;

        let totalProb = 0;

        for (const outcome of WIN_PROBS) {
            let nextMargin = margin;
            if (isAwayPoss) nextMargin += outcome.pts;
            else            nextMargin -= outcome.pts;

            let                                                     nextPoss = isAwayPoss;
            if (!outcome.keep)                                      nextPoss = !nextPoss;
            if (nextSongNum + 1 === (config.lengths.reg / 2) + 1)   nextPoss = false;

            totalProb += outcome.prob * calculateWinProbability(nextMargin, nextSongNum + 1, nextPoss);
        }

        memoProb.set(key, totalProb);
        return totalProb;
    };

    const getArticle = (word) => {
        if (!word) return "";
        return /^[aeiou]/i.test(word.trim()) ? "an" : "a";
    };

    const getMaxPossiblePoints = (songsLeft, startsWithBall) => {
        if (songsLeft <= 0) return 0;
        const pairs     = Math.floor(songsLeft / 2);
        const remainder = songsLeft % 2;
        let points      = pairs * 15;
        if (remainder > 0) points += startsWithBall ? 8 : 7;
        return points;
    };

    const resolveKnockoutTie = (awaySlots, homeSlots) => {
        const getStat = (side, targetIndices) => {
            let total   = 0;
            const slots = side === 'away' ? awaySlots : homeSlots;

            match.history.filter(r => r.period === 'OVERTIME').forEach(row => {
                const arr = side === 'away' ? row.awayArr : row.homeArr;

                targetIndices.forEach(idx => {
                    const isCorrect = arr[idx] === 1;

                    if (isCorrect) {
                        const slotId    = slots[idx];
                        const isCaptain = config.captains.includes(slotId);

                        total += (isCaptain ? 2 : 1);
                    }
                });
            });
            return total;
        };

        const awayTotal     = getStat('away', [0, 1, 2, 3]);
        const homeTotal     = getStat('home', [0, 1, 2, 3]);
        if (awayTotal !== homeTotal) {
            chatMessage(`Tiebreaker: ${getTeamDisplayName(awayTotal > homeTotal ? 'away' : 'home')} wins on Weighted Total Tiebreaker (${awayTotal}-${homeTotal})`);
            return awayTotal    > homeTotal     ? 'away' : 'home';
        }

        const awayCapStat   = getStat('away', [0]);
        const homeCapStat   = getStat('home', [0]);
        if (awayCapStat !== homeCapStat) {
            chatMessage(`Tiebreaker: ${getTeamDisplayName(awayCapStat > homeCapStat ? 'away' : 'home')} wins on Captain Tiebreaker (${awayCapStat}-${homeCapStat})`);
            return awayCapStat  > homeCapStat   ? 'away' : 'home';
        }

        const awayT2Stat    = getStat('away', [2]);
        const homeT2Stat    = getStat('home', [2]);
        if (awayT2Stat !== homeT2Stat) {
            chatMessage(`Tiebreaker: ${getTeamDisplayName(awayT2Stat > homeT2Stat ? 'away' : 'home')} wins on T2 Tiebreaker (${awayT2Stat}-${homeT2Stat})`);
            return awayT2Stat   > homeT2Stat    ? 'away' : 'home';
        }

        const awayT3Stat    = getStat('away', [3]);
        const homeT3Stat    = getStat('home', [3]);
        if (awayT3Stat !== homeT3Stat) {
            chatMessage(`Tiebreaker: ${getTeamDisplayName(awayT3Stat > homeT3Stat ? 'away' : 'home')} wins on T3s Tiebreaker (${awayT3Stat}-${homeT3Stat})`);
            return awayT3Stat   > homeT3Stat    ? 'away' : 'home';
        }

        const lastEntry     = match.history[match.history.length - 1];
        const winnerSide    = lastEntry.poss === 'away' ? 'home' : 'away'; 
        chatMessage(`Tiebreaker: ${getTeamDisplayName(winnerSide)} wins on Defending Tiebreaker`);
        return winnerSide;
    };

    const displayWinProbability = () => {
        if (match.period !== 'REGULATION') return;
        memoProb.clear();
        
        const margin        = match.scores.away - match.scores.home;
        const nextSong      = match.songNumber + 1;
        const isAwayPoss    = match.possession === 'away';
        let awayWinProb     = calculateWinProbability(margin, nextSong, isAwayPoss);

        if (awayWinProb > 0.99) awayWinProb = 0.99;
        if (awayWinProb < 0.01) awayWinProb = 0.01;

        const fudge = Math.random() * 0.01;

        if (awayWinProb > 0.5) {
            awayWinProb -= fudge;
            if (awayWinProb <= 0.5) awayWinProb = 0.5001;
        }
        
        else if (awayWinProb < 0.5) {
            awayWinProb += fudge;
            if (awayWinProb >= 0.5) awayWinProb = 0.4999;
        }

        let favoredTeam, probPercent;

        if (awayWinProb >= 0.5) {
            favoredTeam = getTeamDisplayName('away');
            probPercent = (awayWinProb * 100).toFixed(2);
        }
        
        else {
            favoredTeam = getTeamDisplayName('home');
            probPercent = ((1.0 - awayWinProb) * 100).toFixed(2);
        }

        chatMessage(`Win Probability: ${favoredTeam} ${probPercent}%`);
    };

    const processRound = (payload) => {
        if (!match.isActive) return;
        const wasPendingPause   = match.pendingPause;
        match.pendingPause      = false;
        const currentPeriod     = match.period;
        match.songNumber++;
        if (match.period === 'OVERTIME') match.otRound++;

        const players       = payload.players;
        const resultsMap    = {};
        players.forEach(p => { resultsMap[p.gamePlayerId] = p.correct; });

        const checkSlot = (targetTeamId) => {
            const player = Object.values(quiz.players).find(p => p.teamNumber === targetTeamId);
            if (!player || !player.name)                        return false;
            if (resultsMap.hasOwnProperty(player.gamePlayerId)) return resultsMap[player.gamePlayerId];
            return false;
        };

        const computeStats = (arr, slots) => {
            let totalScore = 0, opScore = 0, dpScore = 0, correctCount = 0;
            arr.forEach((isCorrect, index) => {
                const slotId    =   slots[index];
                const isCaptain =   config.captains.includes(slotId);
                const points    =   isCorrect ? (isCaptain ? gameConfig.captainMultiplier : 1) : 0;
                if (isCorrect) correctCount++;
                totalScore      +=  points;
                if      (gameConfig.opsRelativeIndices.includes(index)) opScore += points;
                else if (gameConfig.dpsRelativeIndices.includes(index)) dpScore += points;
            });
            return {totalScore, opScore, dpScore, correctCount};
        };

        const calculateOutcome = (awayS, homeS) => {
            const attSide   = match.possession;
            const attStats  = attSide === 'away' ? awayS : homeS;
            const defStats  = attSide === 'away' ? homeS : awayS;

            const tdiff = attStats.totalScore   - defStats.totalScore;
            const diff  = attStats.opScore      - defStats.dpScore;

            if      (tdiff >= 4)                return {name: "Onside Kick",  pts: 7, swap: false,    team: "offense"};
            else if (tdiff <= -4)               return {name: "House Call",   pts: 7, swap: true,     team: "defense"};
            else {
                if      (diff >=    3)          return {name: "TD + 2PC",     pts: 8, swap: true,     team: "offense"};
                else if (diff ===   2)          return {name: "Touchdown",    pts: 7, swap: true,     team: "offense"};
                else if (diff ===   1)          return {name: "Field Goal",   pts: 3, swap: true,     team: "offense"};
                else if (diff ===   0 || diff === -1) {
                    const attHit = attStats.correctCount > 0;
                    const defHit = defStats.correctCount > 0;
                    if      (attHit && !defHit) return {name: "Rouge",        pts: 1, swap: true,     team: "offense"};
                    else if (defHit && !attHit) return {name: "Rouge",        pts: 1, swap: true,     team: "defense"};
                    else                        return {name: "Punt",         pts: 0, swap: true,     team: "defense"};
                }
                else if (diff ===   -2)         return {name: "Safety",       pts: 2, swap: true,     team: "defense" };
                else if (diff <=    -3)         return {name: "Pick Six",     pts: 6, swap: true,     team: "defense" };
            }
            return {name: "Error", pts: 0, swap: true, team: "none"};
        };

        const awaySlots = config.isSwapped ? gameConfig.homeSlots : gameConfig.awaySlots;
        const homeSlots = config.isSwapped ? gameConfig.awaySlots : gameConfig.homeSlots;

        const awayArr = awaySlots.map(slotId => checkSlot(slotId) ? 1 : 0);
        const homeArr = homeSlots.map(slotId => checkSlot(slotId) ? 1 : 0);

        const awayStats = computeStats(awayArr, awaySlots);
        const homeStats = computeStats(homeArr, homeSlots);
        const result    = calculateOutcome(awayStats, homeStats);

        const currentPossessionSide = match.possession;

        if      (result.team === "offense") match.scores[match.possession]                  += result.pts;
        else if (result.team === "defense") match.scores[match.possession === 'away' ? 'home' : 'away'] += result.pts;
        
        if (result.swap)                                                                    match.possession = match.possession === 'away' ? 'home' : 'away';
        if (match.period === 'REGULATION' && match.songNumber === (config.lengths.reg / 2)) match.possession = 'home';

        const generateMaskedPattern = (actualArr, isAway) => {
            let maskedStr = "";
            const mySlots = isAway ? awaySlots : homeSlots;
            
            actualArr.forEach((val, idx) => {
                const slotId = mySlots[idx];

                if (config.isTest) {
                    const p = Object.values(quiz.players).find(p => p.teamNumber == slotId);
                    if (!p) {maskedStr += "X"; return; }
                }

                const flippedVal    = val === 1 ? 0 : 1;
                const testAwayArr   = isAway ? [...actualArr] : [...awayArr];
                const testHomeArr   = isAway ? [...homeArr] : [...actualArr];
                
                if (isAway) testAwayArr[idx] = flippedVal;
                else        testHomeArr[idx] = flippedVal;

                const testAwayStats = computeStats(testAwayArr, awaySlots);
                const testHomeStats = computeStats(testHomeArr, homeSlots);
                
                const storedPoss = match.possession;
                match.possession = currentPossessionSide;
                const testResult = calculateOutcome(testAwayStats, testHomeStats);
                match.possession = storedPoss;

                if (testResult.name === result.name && testResult.team === result.team) maskedStr += "X";
                else {
                    const isCaptain =   config.captains.includes(slotId);
                    maskedStr       +=  (val === 1 ? (isCaptain ? "2" : "1") : "0");
                }
            });

            return maskedStr;
        };

        let displayAwayPattern  = generateMaskedPattern(awayArr, true);
        let displayHomePattern  = generateMaskedPattern(homeArr, false);
        let displayScoreStr     = `${match.scores.away}-${match.scores.home}`;

        if (config.isSwapped) {
            displayScoreStr     = config.isSwapped ? `${match.scores.home}-${match.scores.away}` : `${match.scores.away}-${match.scores.home}`;
            const temp          = displayAwayPattern;
            displayAwayPattern  = displayHomePattern;
            displayHomePattern  = temp;
        }

        const mainMsg   = `${displayAwayPattern} ${displayHomePattern} ${result.name} ${displayScoreStr}`;
        chatMessage(mainMsg);

        match.history.push({
            song    : match.songNumber,
            poss    : currentPossessionSide,
            awayArr : awayArr,
            homeArr : homeArr,
            result  : result.name,
            score   : `${match.scores.away}-${match.scores.home}`,
            period  : currentPeriod,
            otRound : match.otRound
        });

        let isGameOver = false;
        let winnerSide = null;

        if (match.period === 'REGULATION') {
            const songsRemaining        = config.lengths.reg - match.songNumber;
            const isAwayLeading         = match.scores.away > match.scores.home;
            const trailerPossessing     = (isAwayLeading && match.possession === 'home') || (!isAwayLeading && match.possession === 'away');
            const maxPointsRemaining    = getMaxPossiblePoints(songsRemaining, trailerPossessing);
            const scoreDiff             = Math.abs(match.scores.away - match.scores.home);

            if (scoreDiff > maxPointsRemaining && match.songNumber < config.lengths.reg && !isGameOver) {
                const winner    = match.scores.away > match.scores.home ? getTeamDisplayName('away')    : getTeamDisplayName('home');
                winnerSide      = match.scores.away > match.scores.home ? 'away'                        : 'home';
                chatMessage(`Mercy Rule triggered, ${winner} wins`);
                chatMessage("Game ended due to Mercy Rule");
                endGame(winnerSide);
                isGameOver = true;
            }

            else if (match.songNumber === config.lengths.reg) {
                if (scoreDiff === 0) {
                    chatMessage(`Tied after Regulation, continuing to Overtime (Songs ${config.lengths.reg + 1}-${config.lengths.reg + config.lengths.ot})`);
                    match.period        = 'OVERTIME';
                    match.otRound       = 0;
                    match.possession    = 'away';
                }
                
                else {
                    const winner        = match.scores.away > match.scores.home ? getTeamDisplayName('away')    : getTeamDisplayName('home');
                    winnerSide          = match.scores.away > match.scores.home ? 'away'                        : 'home';
                    const winnerScore   = match.scores.away > match.scores.home ? match.scores.away             : match.scores.home;
                    const loserScore    = match.scores.away > match.scores.home ? match.scores.home             : match.scores.away;
                    
                    chatMessage(`The ${winner} won Game ${config.gameNumber} ${winnerScore}-${loserScore}`);
                    endGame(winnerSide);
                    
                    isGameOver = true;
                }
            }

            else if (match.songNumber >= (config.lengths.reg / 2) && match.songNumber <= (config.lengths.reg - 2) && !isGameOver) {
                 try {
                    const nextRoundSong     = match.songNumber + 1;
                    const songsAfterNext    = config.lengths.reg - nextRoundSong;
                    const leaderName        = isAwayLeading ? getTeamDisplayName('away') : getTeamDisplayName('home');
                    const trailerName       = isAwayLeading ? getTeamDisplayName('home') : getTeamDisplayName('away');
                    const gap               = scoreDiff;
                    const isAwayPoss        = match.possession === 'away';
                    const leaderIsPoss      = (isAwayLeading === isAwayPoss);

                    const scenarios = outcomesList.map(o => {
                        let     actorName           = (o.swing > 0) ? (isAwayPoss ? getTeamDisplayName('away') : getTeamDisplayName('home')) : (isAwayPoss ? getTeamDisplayName('home') : getTeamDisplayName('away'));
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
                        chatMessage(`Mercy Rule trigger warning next Song!`);
                        match.pendingPause = true;

                        const artSafe = getArticle(safeOutcome.name);

                        if (safeOutcome.leaderIsActor) {
                            chatMessage(`The ${trailerName} needs to hold the ${leaderName} to ${artSafe} ${safeOutcome.name} next Song to avoid Mercy Rule`);
                        }
                        
                        else {
                            let txtSafe = `at least ${artSafe} ${safeOutcome.name}`;
                            if (safeOutcome.name === scenarios[0].name) txtSafe = `${artSafe} ${safeOutcome.name}`;
                            chatMessage(`The ${trailerName} needs ${txtSafe} next Song to avoid Mercy Rule`);
                        }

                        const artKill = getArticle(killOutcome.name);

                        if (killOutcome.change < 0) {
                            chatMessage(`The ${leaderName} can afford the ${killOutcome.actor} getting ${artKill} ${killOutcome.name} next Song and still trigger Mercy Rule`);
                        }
                        
                        else {
                            let txtKill = `only needs ${artKill} ${killOutcome.name}`;
                            if (Math.abs(killOutcome.change) >= 7) txtKill = `needs ${artKill} ${killOutcome.name}`;
                            chatMessage(`The ${leaderName} ${txtKill} next Song to trigger Mercy Rule`);
                        }
                    }
                    
                    else match.pendingPause = false;
                } catch(e) {}
            }
            
            else if (match.songNumber === config.lengths.reg - 1) {
                chatMessage(`Next up is Song ${config.lengths.reg}, the last in Regulation`);
                chatMessage("Pausing to allow players to prepare for a potential game-ending vote");
                match.pendingPause = true;
            }
        }

        else if (match.period === 'OVERTIME') {
            if (match.otRound === 1) {
                const suddenDeathOffense = ["Onside Kick"];
                const suddenDeathDefense = ["House Call"];

                if (suddenDeathOffense      .includes(result.name) && result.team === "offense") {
                    chatMessage(`${getTeamDisplayName('away')} wins via ${result.name}!`);
                    chatMessage("Game ended in Sudden Death Overtime");
                    endGame('away');
                    isGameOver = true;
                }

                else if (suddenDeathDefense .includes(result.name) && result.team === "defense") {
                    chatMessage(`${getTeamDisplayName('home')} wins via ${result.name}!`);
                    chatMessage("Game ended in Sudden Death Overtime");
                    endGame('home');
                    isGameOver = true;
                }

                else chatMessage(`Whoever scores next wins. If still tied after Song ${config.lengths.reg + config.lengths.ot}, the game ends in a Tie or through Tiebreakers`);
            }

            if (!isGameOver && match.otRound >= config.lengths.ot) {
                if (match.scores.away !== match.scores.home) {
                    const winner    = match.scores.away > match.scores.home ? getTeamDisplayName('away')    : getTeamDisplayName('home');
                    winnerSide      = match.scores.away > match.scores.home ? 'away'                        : 'home';

                    chatMessage(`${winner} wins in Overtime!`);
                    chatMessage("Game ended in Overtime");
                    endGame(winnerSide);
                    isGameOver = true;
                }
                
                else {
                    if (config.knockout) {
                        winnerSide      = resolveKnockoutTie(awaySlots, homeSlots);
                        const winner    = getTeamDisplayName(winnerSide);
                        chatMessage(`${winner} wins via Tiebreaker!`);
                        chatMessage("Game ended via Knockout Tiebreaker");
                        endGame(winnerSide);
                        isGameOver      = true;
                    }
                    
                    else {
                        chatMessage("Game ended in a Tie");
                        endGame('draw');
                        isGameOver      = true;
                    }
                }
            }

            if (!isGameOver && match.otRound === 2) {
                try {
                    const otScoreDiff = match.scores.away - match.scores.home;
                    if (otScoreDiff !== 0) {
                        const isAwayLeading = otScoreDiff > 0;
                        const trailerName   = isAwayLeading ? getTeamDisplayName('home') : getTeamDisplayName('away');
                        const gap           = Math.abs(otScoreDiff);
                        const tieOutcomes   = outcomesList.filter(o => o.swing === gap && ["Touchdown", "Field Goal", "Rouge", "TD + 2PC"].includes(o.name));
                        const tieOutcome    = tieOutcomes.find(o => o.name === "Touchdown") || tieOutcomes[0];
                        const winOutcomes   = outcomesList.filter(o => o.swing > gap && ["Touchdown", "Field Goal", "Rouge", "TD + 2PC"].includes(o.name));
                        winOutcomes.sort((a,b) => a.swing - b.swing);
                        const winOutcome = winOutcomes.find(o => o.name === "Touchdown") || winOutcomes[0];
                        if (tieOutcome) {
                            const artTie    = getArticle(tieOutcome.name);
                            let trailerMsg  = `The ${trailerName} needs ${artTie} ${tieOutcome.name} to tie`;
                            if (winOutcome) {
                                const artWin    =   getArticle(winOutcome.name);
                                trailerMsg      +=  `, or ${artWin} ${winOutcome.name} to win outright`;
                            }
                            chatMessage(trailerMsg);
                        }
                    }
                } catch(e) {}
            }
        }

        if (!isGameOver) {
            chatMessage(`Next Possession: ${getTeamDisplayName(match.possession)}`);
            displayWinProbability();
            if (wasPendingPause) sendGameCommand("resume game");
        }
    };

    const downloadScoresheet = () => {
        if (!match.history.length) {
            systemMessage("Error: No data to export");
            return;
        }

        const sStats        = config.seriesStats;
        const aPts          = sStats.awayWins + (sStats.draws * 0.5);
        const hPts          = sStats.homeWins + (sStats.draws * 0.5);
        const winThreshold  = config.seriesLength / 2;

        let isSeriesOver = (aPts > winThreshold || hPts > winThreshold || sStats.history.length >= config.seriesLength);

        let effGameNum = config.gameNumber;
        let effSwapped = config.isSwapped;

        if (!match.isActive) {
            if (!isSeriesOver) {
                effGameNum = config.gameNumber - 1;
                if (config.seriesLength > 1) effSwapped = !config.isSwapped;
            }
        }

        if (effGameNum < 1) effGameNum = 1;

        const getEffCleanName = (side) => {
            if (effSwapped) return side === 'away' ? config.teamNames.home : config.teamNames.away;
            return config.teamNames[side];
        };

        const awayNameClean = getEffCleanName('away');
        const homeNameClean = getEffCleanName('home');

        const lastEntry         = match.history[match.history.length - 1];
        const lastSongDisplay   = lastEntry.song;
        const lastScore         = lastEntry.score;
        const titleStr          = `Game ${effGameNum} (${lastSongDisplay}): ${awayNameClean} ${lastScore} ${homeNameClean}`;

        const awaySlots = effSwapped ? gameConfig.homeSlots : gameConfig.awaySlots;
        const homeSlots = effSwapped ? gameConfig.awaySlots : gameConfig.homeSlots;

        const awayHeaderTitle = `${awayNameClean}`;
        const homeHeaderTitle = `${homeNameClean}`;
        const subHeaders      = gameConfig.posNames;

        const date      = new Date();
        const y         = date.getFullYear().toString().slice(-2);
        const m         = String(date.getMonth() + 1).padStart(2, '0');
        const d         = String(date.getDate()).padStart(2, '0');
        const safeAway  = awayNameClean.replace(/[^a-z0-9]/gi, '_');
        const safeHome  = homeNameClean.replace(/[^a-z0-9]/gi, '_');
        const fileName  = `${y}${m}${d}-${effGameNum}-${safeAway}-${safeHome}.html`;

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
                        <th>${awayNameClean}</th>
                        <th>${homeNameClean}</th>
                    </tr>
                    <tr><td colspan="14" style="font-weight: bold;">Regulation: Watched with Random Rig Distribution and Mercy Rule</td></tr>
                </thead>
                <tbody>
        `;

        let otBannerAdded = false;

        match.history.forEach(row => {
            if (row.period === 'OVERTIME' && !otBannerAdded) {
                html += `<tr><td colspan="14" style="font-weight: bold;">Overtime: Random with Sudden Death</td></tr>`;
                otBannerAdded = true;
            }

            const possName                  = row.poss === 'away' ? awayNameClean : homeNameClean;
            const [scoreAway, scoreHome]    = row.score.split('-').map(Number);
            let winnerName                  = "TBD";

            if (row.period === 'REGULATION') {
                 const songsRemaining       = config.lengths.reg - row.song;
                 const diff                 = Math.abs(scoreAway - scoreHome);
                 let nextPossessionIsAway   = (row.poss === 'away');
                 const swapResults          = ["TD + 2PC", "Touchdown", "Field Goal", "Rouge", "Punt", "Safety", "Pick Six", "House Call"];
                 if (swapResults.includes(row.result)) nextPossessionIsAway = !nextPossessionIsAway;
                 const isAwayLeading        = scoreAway > scoreHome;
                 const trailerIsPossessing  = (isAwayLeading && !nextPossessionIsAway) || (!isAwayLeading && nextPossessionIsAway);
                 const maxPoints            = getMaxPossiblePoints(songsRemaining, trailerIsPossessing);
                 if (diff > maxPoints || (row.song >= config.lengths.reg && diff !== 0)) winnerName = scoreAway > scoreHome ? awayNameClean : homeNameClean;
            }

            else {
                const suddenDeathOffense = ["Onside Kick"];
                const suddenDeathDefense = ["House Call"];

                if (row.otRound === 1 && (suddenDeathOffense.includes(row.result) || suddenDeathDefense.includes(row.result))) {
                    if (scoreAway !== scoreHome) winnerName = scoreAway > scoreHome ? awayNameClean : homeNameClean;
                }

                else if (row.otRound >= config.lengths.ot && scoreAway !== scoreHome) winnerName = scoreAway > scoreHome ? awayNameClean : homeNameClean;
            }

            const displaySong = row.period === 'OVERTIME' ? row.otRound : row.song;

            const generateCells = (patternArr, slots) => {
                return patternArr.map((isCorrect, index) => {
                    if (isCorrect === 0) return `<td></td>`;
                    const slotId    = slots[index];
                    const isCaptain = config.captains.includes(slotId);
                    return `<td>${isCaptain ? 2 : 1}</td>`;
                }).join('');
            };

            const awayCells = generateCells(row.awayArr, awaySlots);
            const homeCells = generateCells(row.homeArr, homeSlots);

            html += `<tr>
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
        if (topic) {
            const actualKey = Object.keys(COMMAND_DESCRIPTIONS).find(key => key.toLowerCase() === topic);
            if (actualKey)  chatMessage(`/nfl ${actualKey}: ${COMMAND_DESCRIPTIONS[actualKey]}`);
            else            chatMessage("Unknown command, type /nfl help for a list");
        }
        
        else {
            const cmds = Object.keys(COMMAND_DESCRIPTIONS).join(", ");
            chatMessage("Commands: " + cmds);
            chatMessage("Type /nfl help [command] for more details or /nfl howTo for setup steps");
        }
    };

    const printHowTo = () => {
        systemMessage("1. Use /nfl setHost [1-8] to set the lobby host");
        systemMessage("2. Use /nfl setTeams to set the Away and Home team names");
        systemMessage("3. Use /nfl setSeries to set the series length");
        systemMessage("4. Use /nfl setGame to set the game number");
        systemMessage("5. Use /nfl setKnockout to enable/disable Overtime tiebreakers for Knockout Games");
        systemMessage("6. Use /nfl start when you're ready to start a new Game");
    };

    const setup = () => {
        if (typeof lobby !== 'undefined' && lobby.inLobby) playersCache = Object.values(lobby.players);
        new Listener("Host Game",                   (payload) => {playersCache = payload.players})                                                                                      .bindListener();
        new Listener("Join Game",                   (payload) => {playersCache = payload.quizState.players})                                                                            .bindListener();
        new Listener("Game Starting",               (payload) => {playersCache = payload.players})                                                                                      .bindListener();
        new Listener("New Player",                  (payload) => {playersCache.push(payload)})                                                                                          .bindListener();
        new Listener("Player Left",                 (payload) => {playersCache = playersCache.filter(p => p.gamePlayerId !== payload.gamePlayerId)})                                    .bindListener();
        new Listener("Player Changed Team",         (payload) => {const p = playersCache.find(p => p.gamePlayerId === payload.gamePlayerId); if (p) p.teamNumber = payload.newTeam;})   .bindListener();
        new Listener("Spectator Change To Player",  (payload) => {playersCache.push(payload)})                                                                                          .bindListener();

        new Listener("Rejoin Ability", (payload) => {
             if (match.isActive && !payload.isAble) {
                 sendGameCommand("pause game");
                 chatMessage(`Player disconnected, game paused automatically`);
             }
        }).bindListener();

        new Listener("Player Rejoined", (payload) => {
            if (match.isActive) chatMessage(`${payload.name} has rejoined, resume when ready`)
        }).bindListener();

        new Listener("game chat update", (payload) => {
            payload.messages.forEach(msg => {
                if (msg.message.startsWith("/nfl")) {
                    const parts             = msg.message.split(" ");
                    const cmd               = parts[1] ? parts[1].toLowerCase() : "help";
                    const arg               = parts.slice(2).join(" ").toLowerCase();
                    const cmdKey            = Object.keys(COMMAND_DESCRIPTIONS).find(k => k.toLowerCase() === cmd);
                    const isHost            = (msg.sender === selfName);
                    const publicCommands    = ["export", "flowchart", "guide", "help", "whatis"];

                    if (publicCommands.includes(cmd)) {
                        setTimeout(() => {
                            const mySlot = getSelfSlot();
                            if (config.hostId !== 0 && config.hostId === mySlot) {
                                if (cmd === "whatis") {
                                    if (!arg || arg === "help") chatMessage("Available terms: " + Object.keys(TERMS).sort().join(", "));
                                    else {
                                        if (TERMS[arg])         chatMessage(`${arg}: ${TERMS[arg]}`);
                                        else                    chatMessage(`Unknown term '${arg}'. Type /nfl whatIs help for a list`);
                                    }
                                }

                                else if (cmd === "help")        printHelp(cmdKey ? null : arg);
                                else if (cmd === "flowchart")   chatMessage(`Flowchart: ${config.links.flowchart}`);
                                else if (cmd === "guide")       chatMessage(`Guide: ${config.links.guide}`);
                                else if (cmd === "export")      downloadScoresheet();
                            }
                        }, config.delay);
                        return;
                    }

                    if (isHost) {
                        setTimeout(() => {
                            if (cmd === "start") startGame();
                            else if (cmd === "end") {match.isActive = false; systemMessage("Manually stopped")}
                            else if (cmd === "setteams") {
                                if (parts.length === 4 && parts[2].toLowerCase() !== parts[3].toLowerCase()) {
                                    config.teamNames.away   = toTitleCase(parts[2]);
                                    config.teamNames.home   = toTitleCase(parts[3]);
                                    const awayArr           = getArrowedName('away');
                                    const homeArr           = getArrowedName('home');
                                    systemMessage(`Teams set: ${awayArr} @ ${homeArr}`);
                                    updateLobbyName(config.teamNames.away, config.teamNames.home);
                                } else systemMessage("Error: Use /nfl setTeams [Away] [Home]");
                            }
                            else if (cmd === "setgame") {
                                const num = parseInt(parts[2]);
                                if (num >= 1 && num <= 7) {config.gameNumber = num; systemMessage(`Game Number: ${num}`)}
                                else systemMessage("Error: Use /nfl setGame [1-7]");
                            }
                            else if (cmd === "sethost") {
                                const num = parseInt(parts[2]);
                                if (num >= 1 && num <= 8) {
                                    config.hostId   = num;
                                    const hostName  = getPlayerNameAtTeamId(num);
                                    systemMessage(`Host: ${hostName}`);
                                } else systemMessage("Error: Use /nfl setHost [1-8]");
                            }
                            else if (cmd === "setseries") {
                                const num = parseInt(parts[2]);
                                if (num === 1 || num === 2 || num === 7) {config.seriesLength = num; systemMessage(`Series Length: ${num}`)}
                                else systemMessage("Error: Use /nfl setSeries [1/2/7]");
                            }
                            else if (cmd === "setknockout") {
                                const b = parseBool(parts[2]);
                                if (b !== null) {config.knockout = b; systemMessage(`Knockout Mode: ${b}`)}
                                else systemMessage("Error: Use /nfl setKnockout [true/false]");
                            }
                            else if (cmd === "settest") {
                                const b = parseBool(parts[2]);
                                if (b !== null) {config.isTest = b; systemMessage(`Test Mode: ${b}`)}
                                else systemMessage("Error: Use /nfl setTest [true/false]");
                            }
                            else if (cmd === "swap") {
                                config.isSwapped = !config.isSwapped;
                                systemMessage(`Swapped: ${getTeamDisplayName('away')} is now the Away team`);
                            }
                            else if (cmd === "resetgame") {
                                if (match.isActive || match.history.length > 0) {
                                    match.isActive = false;
                                    resetMatchData();
                                    systemMessage(`Game ${config.gameNumber} reset, tracker stopped and data wiped`);
                                } else systemMessage("Error: No active game or data to reset");
                            }
                            else if (cmd === "reseteverything") resetEverything();
                            else if (cmd === "resetseries") {
                                if (config.seriesStats.history.length === 0 && !match.isActive && match.history.length === 0) systemMessage("Error: No series data to reset");
                                else {
                                    match.isActive      = false;
                                    resetMatchData();
                                    config.gameNumber   = 1;
                                    config.isSwapped    = false;
                                    config.seriesStats  = {awayWins: 0, homeWins: 0, draws: 0, history: []};
                                    systemMessage("Series reset, all history wiped");
                                }
                            }
                            else if (cmd === "howto")   printHowTo();
                        }, config.delay);
                    }
                }
            });
        }).bindListener();

        new Listener("answer results", (payload) => {
            if (match.isActive) setTimeout(() => processRound(payload), config.delay);
        }).bindListener();

        new Listener("play next song", () => {
            if (match.isActive && match.pendingPause) sendGameCommand("pause game");
        }).bindListener();
    };

    function init() {
        if (typeof quiz !== 'undefined' && typeof Listener !== 'undefined') setup();
        else setTimeout(init, config.delay);
    }

    init();
})();