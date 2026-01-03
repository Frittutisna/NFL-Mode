const ADDR_PLAYERS      = "A2:B33";
const ADDR_OUTPUT       = "G2:I33";
const ADDR_REQS         = "K2:L17";
const ADDR_BL           = "N2:O17";
const SPREAD_THRESHOLD  = 1;

function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Balancer')
      .addItem('Balance Teams',     'balanceTeams')
      .addSeparator()
      .addItem('Reset Everything',  'resetEverything')
      .addSeparator()
      .addItem('Reset Players',     'resetPlayers')
      .addItem('Reset Teams',       'resetTeams')
      .addItem('Reset Requests',    'resetRequests')
      .addItem('Reset Blacklists',  'resetBlacklists')
      .addToUi();
}

function balanceTeams() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ws = ss.getActiveSheet();

    const rawPlayers    = ws.getRange(ADDR_PLAYERS) .getValues();
    const rawReqs       = ws.getRange(ADDR_REQS)    .getValues();
    const rawBL         = ws.getRange(ADDR_BL)      .getValues();
    
    let allPlayers = [];
    for (let i = 0; i < rawPlayers.length; i++) {
        if (rawPlayers[i][0] !== "" && typeof rawPlayers[i][1] === 'number') {
            allPlayers.push({name: rawPlayers[i][0], elo: rawPlayers[i][1], originalIdx: i});
        }
    }

    const count         = allPlayers.length;
    const numSelected   = Math.floor(count / 8) * 8;
  
    if (numSelected === 0) {
        SpreadsheetApp.getUi().alert("Error: Minimum of 8 players not met");
        return;
    }
  
    allPlayers = allPlayers.slice(0, numSelected);
    allPlayers.sort((a, b) => b.elo - a.elo);
  
    let reqs = [];
    for (let r of rawReqs) {if (r[0] !== "" && r[1] !== "") reqs.push({p1: r[0], p2: r[1]});}
    const reqCount = reqs.length;

    let bl = [];
    for (let b of rawBL) {if (b[0] !== "" && b[1] !== "") bl.push({p1: b[0], p2: b[1]});}
    const blCount = bl.length;

    const teamSize = 4;
    const numTeams = numSelected / teamSize;

    let finalAssignments    = new Array(numSelected)    .fill(0)
    let finalTeams          = new Array(numTeams)       .fill(0);

    const totalSteps    = reqCount + blCount;
    let activeReqs      = 0;
    let activeBLs       = 0;

    for (let step = 0; step <= totalSteps; step++) {
        if (step <= reqCount) {
            activeReqs  = reqCount - step;
            activeBLs   = blCount;
        } else {
            activeReqs  = 0;
            activeBLs   = blCount - (step - reqCount);
        }

        let possible    = true;
        let assignments = new Array(numSelected).fill(0);
        let teams       = new Array(numTeams).fill(0);
        let teamCounts  = new Array(numTeams).fill(0);

        for (let p = 0; p < numTeams; p++) {
            assignments[p]  = p + 1;
            teams[p]        = allPlayers[p].elo;
            teamCounts[p]   = 1;
        }

        if (activeReqs > 0) {
            for (let p = 0; p < numTeams; p++) {
                let capName = allPlayers[p].name;
                
                for (let r = 0; r < activeReqs; r++) {
                    let partnerName = "";
                    if (reqs[r].p1 === capName) partnerName = reqs[r].p2;
                    if (reqs[r].p2 === capName) partnerName = reqs[r].p1;
                    
                    if (partnerName !== "") {
                        let pIdx = -1;
                        for (let k = 0; k < numSelected; k++) {
                            if (allPlayers[k].name === partnerName) {
                                pIdx = k;
                                break;
                            }
                        }
                        
                        if (pIdx > -1) {
                            if (assignments[pIdx] === 0) {
                                if (teamCounts[p] < teamSize) {
                                    let isCompatible = true;
                                    
                                    if (activeBLs > 0) {
                                        for (let mem = 0; mem < numSelected; mem++) {
                                            if (assignments[mem] === (p + 1)) {
                                                for (let k = 0; k < activeBLs; k++) {
                                                    let mName = allPlayers[mem]     .name;
                                                    let pName = allPlayers[pIdx]    .name;
                                                    if ((bl[k].p1 === mName && bl[k].p2 === pName) || 
                                                        (bl[k].p2 === mName && bl[k].p1 === pName)) {
                                                            isCompatible = false; break;
                                                        }
                                                }
                                            }
                                            if (!isCompatible) break;
                                        }
                                    }
                                    
                                    if (isCompatible) {
                                        assignments[pIdx]   =   p + 1;
                                        teams[p]            +=  allPlayers[pIdx].elo;
                                        teamCounts[p]++;
                                    } else possible = false;
                                } else possible = false;
                            } else if (assignments[pIdx] !== (p + 1)) possible = false;
                        }
                    }
                    
                    if (!possible) break;
                }
                
                if (!possible) break;
            }
        }

        if (possible) {
            for (let p = numTeams; p < numSelected; p++) {
                if (assignments[p] === 0) {
                    let targetTeam  = -1;
                    let minElo      = 100;
                    
                    let partnersNeeded  = 0;
                    let forcedTeam      = -1;
                    let conflict        = false;
                    let myName          = allPlayers[p].name;
                    
                    if (activeReqs > 0) {
                        for (let r = 0; r < activeReqs; r++) {
                            let pName = "";
                            if (reqs[r].p1 === myName) pName = reqs[r].p2;
                            if (reqs[r].p2 === myName) pName = reqs[r].p1;
                            
                            if (pName !== "") {
                                let pIdxL = -1;

                                for (let k = 0; k < numSelected; k++) {
                                    if (allPlayers[k].name === pName) {
                                        pIdxL = k;
                                        break;
                                    }
                                }
                                
                                if (pIdxL > -1) {
                                    if (assignments[pIdxL] > 0) {
                                        if      (forcedTeam === -1)                 forcedTeam  = assignments[pIdxL]; 
                                        else if (forcedTeam !== assignments[pIdxL]) conflict    = true;
                                    } else partnersNeeded++;
                                }
                            }
                        }
                    }
                    
                    if (conflict) {
                        possible = false; 
                        break;
                    }
                    
                    let startT  = (forcedTeam > -1) ? forcedTeam - 1 : 0;
                    let endT    = (forcedTeam > -1) ? forcedTeam - 1 : numTeams - 1;
                    
                    for (let t = startT; t <= endT; t++) {
                        if (teamCounts[t] + partnersNeeded < teamSize) {
                            let isCompatible = true;
                            
                            if (activeBLs > 0) {
                                for (let mem = 0; mem < numSelected; mem++) {
                                    if (assignments[mem] === (t + 1)) {
                                        for (let k = 0; k < activeBLs; k++) {
                                            let mName = allPlayers[mem].name;
                                            if ((bl[k].p1 === mName && bl[k].p2 === myName) || 
                                                (bl[k].p2 === mName && bl[k].p1 === myName)) {
                                                    isCompatible = false; 
                                                    break;
                                            }
                                        }
                                    }

                                    if (!isCompatible) break;
                                }
                            }
                            
                            if (isCompatible) {
                                if      (forcedTeam > -1)       targetTeam = t; 
                                else if (teams[t]   < minElo)   {
                                    minElo      = teams[t];
                                    targetTeam  = t;
                                }
                            } else if (forcedTeam > -1) possible = false;
                        } else if (forcedTeam > -1) possible = false;
                    }
                    
                    if (targetTeam !== -1) {
                        assignments[p]      =   targetTeam + 1;
                        teams[targetTeam]   +=  allPlayers[p].elo;
                        teamCounts[targetTeam]++;
                        
                        if (activeReqs > 0) {
                            let currName = allPlayers[p].name;
                            for (let r = 0; r < activeReqs; r++) {
                                let pPart = "";
                                if (reqs[r].p1 === currName) pPart = reqs[r].p2;
                                if (reqs[r].p2 === currName) pPart = reqs[r].p1;
                                
                                if (pPart !== "") {
                                    let ppIdx = -1;

                                    for (let k = 0; k < numSelected; k++) {
                                        if (allPlayers[k].name === pPart) {
                                            ppIdx = k; 
                                            break; 
                                        }
                                    }
                                    
                                    if (ppIdx > -1) {
                                        if (assignments[ppIdx] === 0) {
                                            if (teamCounts[targetTeam] < teamSize) {
                                                let isCompatiblePart = true;

                                                if (activeBLs > 0) {
                                                    for (let mem = 0; mem < numSelected; mem++) {
                                                        if (assignments[mem] === (targetTeam + 1)) {
                                                            for (let k = 0; k < activeBLs; k++) {
                                                                let mName       = allPlayers[mem]   .name;
                                                                let partName    = allPlayers[ppIdx] .name;
                                                                if ((bl[k].p1 === mName && bl[k].p2 === partName) || 
                                                                    (bl[k].p2 === mName && bl[k].p1 === partName)) {
                                                                        isCompatiblePart = false; 
                                                                        break;
                                                                }
                                                            }
                                                        }

                                                        if (!isCompatiblePart) break;
                                                    }
                                                }
                                                
                                                if (isCompatiblePart) {
                                                    assignments[ppIdx] = targetTeam + 1;
                                                    teams[targetTeam] += allPlayers[ppIdx].elo;
                                                    teamCounts[targetTeam]++;
                                                } else possible = false;
                                            } else possible = false;
                                        }
                                    }
                                }

                                if (!possible) break;
                            }
                        }
                    } else possible = false;
                }

                if (!possible) break;
            }
        }

        if (possible) {
            let maxT = 0, minT = 100;

            for (let t = 0; t < numTeams; t++) {
                if (teams[t] > maxT) maxT = teams[t];
                if (teams[t] < minT) minT = teams[t];
            }

            let spread          = maxT - minT;
            finalAssignments    = [...assignments];
            finalTeams          = [...teams];
            
            if (spread <= SPREAD_THRESHOLD) break;
        }
    }
  
    ws.getRange(ADDR_OUTPUT).clearContent();
    let outputData = [];
    
    let totalRows = numTeams * teamSize;
    for (let i = 0; i < totalRows; i++) outputData.push(["", "", ""]);
    
    let teamFillCounts = new Array(numTeams).fill(0);
    
    for (let p = 0; p < numSelected; p++) {
        let tID = finalAssignments[p];

        if (tID > 0) {
            let tIndex  = tID - 1;
            let slot    = teamFillCounts[tIndex];
            let rowIdx  = (tIndex * teamSize) + slot;
             
            outputData[rowIdx][0] = allPlayers[p].name;
            outputData[rowIdx][1] = allPlayers[p].elo;
            if (slot === 0) outputData[rowIdx][2] = finalTeams[tIndex];
            else            outputData[rowIdx][2] = "";
            
            teamFillCounts[tIndex]++;
        }
    }
    
    ws.getRange(2, 7, totalRows, 3).setValues(outputData);

    let verifiedReqs = 0;
    if (reqCount > 0) {
        for (let r of reqs) {
            let p1Idx = -1, p2Idx = -1;

            for (let k = 0; k < numSelected; k++) {
                if (allPlayers[k].name === r.p1) p1Idx = k;
                if (allPlayers[k].name === r.p2) p2Idx = k;
            }

            if(p1Idx > -1 && p2Idx > -1) if (finalAssignments[p1Idx] === finalAssignments[p2Idx]) verifiedReqs++;
        }
    }
    
    let verifiedBLs = 0;
    if (blCount > 0) {
        for (let b of bl) {
            let b1Idx = -1, b2Idx = -1;

            for (let k = 0; k < numSelected; k++) {
                if (allPlayers[k].name === b.p1) b1Idx = k;
                if (allPlayers[k].name === b.p2) b2Idx = k;
            }

            if(b1Idx > -1 && b2Idx > -1) if (finalAssignments[b1Idx] !== finalAssignments[b2Idx]) verifiedBLs++;
        }
    }
    
    let msg = `Success: ${numSelected} players distributed into ${numTeams} teams`;
    msg += `\nRequests met: ${verifiedReqs}/${activeReqs > 0 ? verifiedReqs : reqCount}`;
    msg += `\nBlacklists met: ${verifiedBLs}/${blCount}`;
    
    SpreadsheetApp.getUi().alert(msg);
}

function resetEverything() {
    const ws = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    ws.getRange(ADDR_PLAYERS)   .clearContent();
    ws.getRange(ADDR_OUTPUT)    .clearContent();
    ws.getRange(ADDR_REQS)      .clearContent();
    ws.getRange(ADDR_BL)        .clearContent();
}

function resetPlayers() {
    const ws = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    ws.getRange(ADDR_PLAYERS).clearContent();
}

function resetTeams() {
    const ws = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    ws.getRange(ADDR_OUTPUT).clearContent();
}

function resetRequests() {
    const ws = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    ws.getRange(ADDR_REQS).clearContent();
}

function resetBlacklists() {
    const ws = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    ws.getRange(ADDR_BL).clearContent();
}