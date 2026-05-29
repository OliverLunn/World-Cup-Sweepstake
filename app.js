// =========================================================================
// 1. GLOBAL VARIABLES & ACCESSIBILITY PLACEHOLDERS
// =========================================================================
let fixturesData = [];
let groupsData = {};
let scorersData = [];
let globalSquadsData = null;      
let currentDashboardTab = 'sweepstake'; 

// =========================================================================
// 2. RENDERING ENGINES (HTML GENERATORS)
// =========================================================================

function getFlagHtml(teamName) {
    const code = teamCodes[teamName];
    if (!code) return ''; 
    return `<img src="https://flagcdn.com/24x18/${code}.png" class="flag-icon" alt="${teamName} flag">`;
}

function getMatchGroup(team1, team2) {
    for (const [groupName, teams] of Object.entries(groupsData)) {
        const teamNames = teams.map(t => t.team);
        if (teamNames.includes(team1) && teamNames.includes(team2)) {
            return groupName;
        }
    }
    return 'Knockout Stage';
}

function renderBracket() {
    const bracketContainer = document.getElementById('bracket-container');
    if (!bracketContainer) return;
    
    const createMatchupHtml = (m) => `
        <div class="bracket-matchup">
            <div class="bracket-team-row">
                <span class="team-link" onclick="showTeamDetail('${m.team1}')">${getFlagHtml(m.team1)} ${m.team1}</span>
                <span class="bracket-score-box">${m.score1}</span>
            </div>
            <div class="bracket-team-row">
                <span class="team-link" onclick="showTeamDetail('${m.team2}')">${getFlagHtml(m.team2)} ${m.team2}</span>
                <span class="bracket-score-box">${m.score2}</span>
            </div>
        </div>
    `;

    bracketContainer.innerHTML = `
        <div class="bracket-round">
            <h4>Quarter-Finals</h4>
            ${bracketData.quarters.map(createMatchupHtml).join('')}
        </div>
        <div class="bracket-round">
            <h4>Semi-Finals</h4>
            ${bracketData.semis.map(createMatchupHtml).join('')}
        </div>
        <div class="bracket-round">
            <h4>World Cup Final</h4>
            ${bracketData.final.map(createMatchupHtml).join('')}
        </div>
    `;
}

function renderSquadCards() {
    const container = document.getElementById('squad-cards-container');
    if (!container) return;

    let activeTeams = [];
    if (globalSquadsData) {
        activeTeams = Object.keys(globalSquadsData);
    } else if (groupsData && Object.keys(groupsData).length > 0) {
        Object.values(groupsData).forEach(group => {
            group.forEach(row => activeTeams.push(row.team));
        });
    } else {
        activeTeams = Object.keys(teamCodes);
    }

    activeTeams = [...new Set(activeTeams)].filter(t => t !== "TBD" && t !== "USA").sort();
    if (!activeTeams.includes("United States") && teamCodes["United States"]) activeTeams.push("United States");
    activeTeams.sort();

    container.innerHTML = activeTeams.map(nation => `
        <div class="squad-card" onclick="showTeamDetail('${nation.replace(/'/g, "\\'")}')">
            ${getFlagHtml(nation)}
            <h3>${nation}</h3>
            <span class="view-roster-link">View Squad Roster →</span>
        </div>
    `).join('');
}

function renderApp() {
    const sweepstakeDiv = document.getElementById('sweepstake-list');
    if (sweepstakeDiv) {
        sweepstakeDiv.innerHTML = sweepstakeData.map(p => `
            <div class="sweepstake-card">
                <div class="player-name">${p.player}</div>
                <div class="player-teams">
                    ${(p.teams || []).map(team => `
                        <div class="team-item" onclick="this.textContent.trim() !== 'TBD' && showTeamDetail('${team}')">
                            ${getFlagHtml(team)}
                            <span>${team}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="player-status">${p.status}</div>
            </div>
        `).join('');
    }

    const fixturesDiv = document.getElementById('fixtures-list');
    if (fixturesDiv) {
        const sortedFixtures = [...fixturesData].sort((a, b) => new Date(a.utcDate || a.date) - new Date(b.utcDate || b.date));
        const groupedByDate = {};
        sortedFixtures.forEach(f => {
            if (!groupedByDate[f.date]) groupedByDate[f.date] = [];
            groupedByDate[f.date].push(f);
        });

        fixturesDiv.innerHTML = Object.keys(groupedByDate).map(dateKey => `
            <div class="fixture-date-group">
                <div class="fixture-date-header"><h3>${dateKey}</h3></div>
                <div class="fixture-matches">
                    ${groupedByDate[dateKey].map(f => {
                        const teams = f.match.split(" vs ");
                        const team1 = teams[0].trim();
                        const team2 = teams[1].trim();
                        const matchGroup = getMatchGroup(team1, team2);
                        
                        let statusBadge = f.status === 'Finished' ? '✓ Complete' : (f.status === 'Live' || f.status === 'IN_PLAY' ? '● Live' : '○ Scheduled');
                        let statusClass = f.status === 'Finished' ? 'status-complete' : (f.status === 'Live' || f.status === 'IN_PLAY' ? 'status-live' : 'status-scheduled');
                        
                        return `
                            <div class="fixture-card">
                                <div class="fixture-header"><span class="fixture-status ${statusClass}">${statusBadge}</span></div>
                                <div class="fixture-teams">
                                    <span class="team-link" onclick="showTeamDetail('${team1}')">${getFlagHtml(team1)} ${team1}</span> 
                                    <span>vs</span> 
                                    <span class="team-link" onclick="showTeamDetail('${team2}')">${getFlagHtml(team2)} ${team2}</span>
                                </div>
                                <div class="fixture-group">${matchGroup}</div>
                                <div class="fixture-score">${f.score}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');
    }

    const groupsDiv = document.getElementById('groups-list');
    if (groupsDiv) {
        groupsDiv.innerHTML = Object.keys(groupsData).map(groupKey => `
            <div class="group-table">
                <h3>${groupKey}</h3>
                <div>
                    ${groupsData[groupKey].map(t => `
                        <div class="group-row">
                            <span class="team-link" onclick="showTeamDetail('${t.team}')">${getFlagHtml(t.team)} ${t.team}</span>
                            <span><strong>Pts: ${t.pts}</strong> (GD: ${t.gd})</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    renderBracket();

    const scorersDiv = document.getElementById('scorers-leaderboard');
    if (scorersDiv) {
        if (scorersData && scorersData.length > 0) {
            scorersDiv.innerHTML = `
                <h3>🏆 Top Goalscorers</h3>
                <div class="scorers-grid">
                    ${scorersData.map((scorer, index) => `
                        <div class="scorer-card">
                            <div class="scorer-rank">#${index + 1}</div>
                            ${scorer.photo ? `<img src="${scorer.photo}" alt="${scorer.name}" class="scorer-photo">` : '<div class="scorer-photo-placeholder">No Photo</div>'}
                            <div class="scorer-name">${scorer.name}</div>
                            <div class="scorer-team">${scorer.team}</div>
                            <div class="scorer-goals">${scorer.goals} Goals</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            scorersDiv.innerHTML = '<p>Top scorers data coming soon...</p>';
        }
    }

    renderSquadCards();
}

// =========================================================================
// 3. NAVIGATION VIEW CONTROLLERS
// =========================================================================

function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active-content'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    const targetElement = document.getElementById(tabId);
    if (targetElement) {
        targetElement.classList.add('active-content');
    }
    if (tabId !== 'team-detail') {
        currentDashboardTab = tabId;
    }
    
    const targetButton = Array.from(document.querySelectorAll('.tab-btn'))
        .find(btn => btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${tabId}'`));
    if (targetButton) {
        targetButton.classList.add('active');
    }
}

function showTeamDetail(teamName) {
    if (teamName === "TBD" || !teamName) return; 

    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active-content'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('team-detail').classList.add('active-content');
    document.getElementById('team-title').innerHTML = `${getFlagHtml(teamName)} ${teamName}`;
    
    const teamFixtures = fixturesData.filter(f => f.match.includes(teamName));
    const fixturesDiv = document.getElementById('team-fixtures-list');
    
    if (teamFixtures.length > 0) {
        fixturesDiv.innerHTML = teamFixtures.map(f => {
            const teams = f.match.split(" vs ");
            return `
                <div class="fixture-card">
                    <div class="fixture-date">${f.date}</div>
                    <div class="fixture-teams">
                        <span class="team-link" onclick="showTeamDetail('${teams[0].trim()}')">${getFlagHtml(teams[0].trim())} ${teams[0].trim()}</span> 
                        vs 
                        <span class="team-link" onclick="showTeamDetail('${teams[1].trim()}')">${getFlagHtml(teams[1].trim())} ${teams[1].trim()}</span>
                    </div>
                    <div class="fixture-score">${f.score}</div>
                </div>
            `;
        }).join('');
    } else {
        fixturesDiv.innerHTML = "<p>No matches discovered for this team layout records.</p>";
    }
    
    const squadUl = document.getElementById('team-squad-list');
    if (globalSquadsData && globalSquadsData[teamName]) {
        const players = globalSquadsData[teamName];
        const positions = { 'Goalkeepers': [], 'Defenders': [], 'Midfielders': [], 'Forwards': [] };

        players.forEach(p => {
            const posRaw = (p.position || "").toLowerCase();
            let listKey = 'Forwards';
            if (posRaw.includes('gk') || posRaw.includes('goalkeeper')) listKey = 'Goalkeepers';
            else if (posRaw.includes('df') || posRaw.includes('defender')) listKey = 'Defenders';
            else if (posRaw.includes('mf') || posRaw.includes('midfielder')) listKey = 'Midfielders';
            positions[listKey].push(p);
        });

        squadUl.innerHTML = `
            <div class="position-group-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; width: 100%;">
                ${Object.keys(positions).map(posName => {
                    if (positions[posName].length === 0) return '';
                    return `
                        <div class="position-block" style="background: #f8fafc; border-radius: 8px; padding: 12px; border: 1px solid #e2e8f0;">
                            <h4 style="color: #004b87; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em;">${posName}</h4>
                            <ul style="list-style: none; padding: 0; margin: 0;">
                                ${positions[posName].map(p => {
                                    const clubInfo = p.club ? `<span style="color: #a0aec0; font-size: 0.75rem; display: block; font-style: italic;">${p.club}</span>` : '';
                                    return `
                                        <li style="padding: 5px 0; font-size: 0.9rem; border-bottom: 1px solid #edf2f7;">
                                            <strong>${p.player}</strong>
                                            ${clubInfo}
                                        </li>
                                    `;
                                }).join('')}
                            </ul>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } else {
        const assignedSquad = typeof squadsData !== 'undefined' ? squadsData[teamName] : null;
        if (assignedSquad && assignedSquad.length > 0) {
            squadUl.innerHTML = `<ul style="padding-left: 20px;">${assignedSquad.map(player => `<li>${player}</li>`).join('')}</ul>`;
        } else {
            squadUl.innerHTML = "<p>Squad specification list pending data load configurations...</p>";
        }
    }
}

function closeTeamDetail() {
    openTab(currentDashboardTab);
}

// =========================================================================
// 4. PIPELINE INITIALIZATION ENGINE (INTEGRATED REPO JSON DETECTOR)
// =========================================================================

async function initApp() {
    // Pipeline 1: Check repository for a committed draw-results.json file
    try {
        const drawResponse = await fetch('./draw-results.json');
        if (drawResponse.ok) {
            const savedDraw = await drawResponse.json();
            
            // If the array contains live records, inject them over the default placeholders
            if (Array.isArray(savedDraw) && savedDraw.length > 0) {
                console.log("🎯 Permanent repo draw results loaded successfully!");
                
                savedDraw.forEach((savedPlayer) => {
                    const match = sweepstakeData.find(p => p.player.trim().toLowerCase() === savedPlayer.player.trim().toLowerCase());
                    if (match) {
                        match.teams = savedPlayer.teams;
                    }
                });

                // Clear input interfaces since the draw is permanently complete
                const passwordInput = document.getElementById('draw-password');
                const startBtn = document.getElementById('start-draw-btn');
                const completeMsg = document.getElementById('draw-complete-message');
                
                if (passwordInput && startBtn) {
                    passwordInput.style.display = 'none';
                    startBtn.style.display = 'none';
                }
                if (completeMsg) {
                    completeMsg.style.display = 'block';
                }
            }
        }
    } catch (e) {
        console.log("No committed draw data discovered in repository. Standby mode active.");
    }

    // Pipeline 2: Fetch Live Matches, Table Data & Brackets
    try {
        const response = await fetch('./live-data.json');
        if (!response.ok) throw new Error(`HTTP response status: ${response.status}`);
        const liveData = await response.json();

        fixturesData = liveData.fixturesData || [];
        groupsData = liveData.groupsData || {};
        scorersData = liveData.scorersData || [];

        const knockoutMatches = fixturesData.filter(m => 
            m.match.includes('Quarter') || m.match.includes('Semi') || m.match.includes('Final')
        );
        if (typeof generateBracketFromMatches === 'function') {
            generateBracketFromMatches(knockoutMatches.length > 0 ? knockoutMatches : fixturesData.slice(-8));
        }
    } catch (err) {
        console.error("⚠️ Failed loading dynamic fixture feeds:", err);
    }

    // Pipeline 3: Fetch Squad Rosters
    try {
        const squadsResponse = await fetch('./squads.json');
        if (squadsResponse.ok) {
            globalSquadsData = await squadsResponse.json();
        }
    } catch (squadsErr) {
        console.error("⚠️ Failed loading rosters:", squadsErr);
    }

    renderApp();
}

// =========================================================================
// 5. DETACHED POPUP DRAW ENGINE & SYNCHRONIZATION
// =========================================================================

let drawState = {
    drawInProgress: false,
    drawPassword: "wc2026" 
};

async function startDraw() {
    const startBtn = document.getElementById('start-draw-btn');
    const passwordInput = document.getElementById('draw-password');
    
    if (!startBtn || drawState.drawInProgress) return;

    if (!passwordInput || passwordInput.value !== drawState.drawPassword) {
        alert('❌ Incorrect password. Please enter the correct password to start the draw.');
        if (passwordInput) {
            passwordInput.focus();
            passwordInput.value = '';
        }
        return;
    }

    const width = 720;
    const height = 680;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    const popup = window.open(
        '', 
        'SweepstakeDrawPopup', 
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no`
    );

    if (!popup) {
        alert('⚠️ Popup block detected! Please allow popups for this dashboard site to run the live draw window.');
        return;
    }

    popup.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>🔴 Live Sweepstake Assignment Draw</title>
            <style>
                body { font-family: sans-serif; background-color: #f1f5f9; color: #1e293b; padding: 25px; margin: 0; text-align: center; }
                .draw-box { max-width: 620px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 3px solid #004b87; }
                h1 { color: #004b87; margin-bottom: 5px; }
                .live-panel { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #2563eb; border-radius: 10px; padding: 25px; margin: 20px 0; color: #1e3a8a; font-size: 1.15rem; }
                .terminal-log { background: #1e293b; color: #cbd5e1; font-family: monospace; padding: 15px; border-radius: 6px; max-height: 220px; overflow-y: auto; text-align: left; font-size: 0.85rem; }
                .log-row { margin-bottom: 6px; border-left: 3px solid #3b82f6; padding-left: 8px; }
                .log-row.done { border-left-color: #10b981; color: #10b981; font-weight: bold; }
                .action-btn { margin-top: 20px; padding: 12px 28px; font-weight: bold; background: #10b981; color: white; border: none; border-radius: 20px; cursor: pointer; display: none; }
            </style>
        </head>
        <body>
            <div class="draw-box">
                <h1>Live Sweepstake Allocation Draw</h1>
                <p>Distributing 1 Seeded Team (Pot 1) and 1 Unseeded Team (Pot 2) to each participant...</p>
                <div class="live-panel">
                    <div id="display-player">Preparing seed pots...</div>
                    <div id="display-action" style="font-size: 0.9rem; margin-top: 10px; opacity: 0.85;">Isolating teams...</div>
                </div>
                <h3 style="text-align: left;">📋 Real-time Draw Feed</h3>
                <div id="terminal-feed" class="terminal-log"></div>
                <button id="close-frame-btn" class="action-btn" onclick="window.close()">💾 Save JSON & Close</button>
            </div>
        </body>
        </html>
    `);

    const isolatedEngineScript = `
        (async function() {
            const currentPlayers = ${JSON.stringify(sweepstakeData)};
            
            const logBox = document.getElementById('terminal-feed');
            const playerBox = document.getElementById('display-player');
            const actionBox = document.getElementById('display-action');
            
            function postLog(msg, isCompletedMarker = false) {
                const el = document.createElement('div');
                el.className = 'log-row' + (isCompletedMarker ? ' done' : '');
                el.textContent = msg;
                logBox.appendChild(el);
                logBox.scrollTop = logBox.scrollHeight;
            }

            function shuffle(sourceArr) {
                const arr = [...sourceArr];
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                return arr;
            }

            const pot1Teams = ["Argentina", "France", "England", "Brazil", "Germany", "Spain", "Belgium", "Netherlands", "Portugal", "Italy", "Uruguay", "Mexico", "USA", "United States", "Canada", "Colombia", "Croatia", "Morocco"];
            const pot2Teams = ["South Korea", "Czechia", "Czech Republic", "Paraguay", "Japan", "Saudi Arabia", "Uzbekistan", "Senegal", "Algeria", "Austria", "Jordan", "Congo DR", "South Africa", "Bosnia-Herzegovina", "Iran", "Egypt", "Ghana", "Nigeria"];

            let pot1 = shuffle(pot1Teams);
            let pot2 = shuffle(pot2Teams);

            postLog("📡 Connected to main workspace dataset.");
            postLog("🎲 Pot 1 and Pot 2 structures randomized independently.");
            await new Promise(r => setTimeout(r, 1000));

            for (let i = 0; i < currentPlayers.length; i++) {
                let p = currentPlayers[i];
                playerBox.innerHTML = "Drawing assignments for: <strong>" + p.player + "</strong>";
                
                let t1 = pot1.shift();
                p.teams[0] = t1;
                actionBox.textContent = "Spinning Pot 1...";
                postLog("🎟️ " + p.player + " assigned " + t1 + " from Pot 1");
                await new Promise(r => setTimeout(r, 600));

                let t2 = pot2.shift();
                p.teams[1] = t2;
                actionBox.textContent = "Spinning Pot 2...";
                postLog("🎟️ " + p.player + " assigned " + t2 + " from Pot 2");
                await new Promise(r => setTimeout(r, 600));
            }

            playerBox.innerHTML = "<strong>🎉 Randomization Draw Complete!</strong>";
            actionBox.textContent = "All teams assigned seamlessly.";
            postLog("💾 Compiling download payload...", true);
            
            window.opener.updateMainFromPopup(currentPlayers);
            document.getElementById('close-frame-btn').style.display = 'inline-block';
        })();
    `;

    const tagNode = popup.document.createElement('script');
    tagNode.text = isolatedEngineScript;
    popup.document.body.appendChild(tagNode);
}

function updateMainFromPopup(completedDrawData) {
    // Update local variable instances
    completedDrawData.forEach((result, idx) => {
        if (sweepstakeData[idx]) {
            sweepstakeData[idx].teams = result.teams;
        }
    });

    // Trigger immediate browser compilation file download
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(completedDrawData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "draw-results.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    // Toggle main site controls
    const passwordInput = document.getElementById('draw-password');
    const startBtn = document.getElementById('start-draw-btn');
    const completeMsg = document.getElementById('draw-complete-message');

    if (passwordInput && startBtn) {
        passwordInput.style.display = 'none';
        startBtn.style.display = 'none';
    }
    if (completeMsg) {
        completeMsg.style.display = 'block';
    }

    renderApp();
}

/**
 * Fallback handler allowing manual result extraction if needed
 */
function downloadDrawResults() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sweepstakeData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "draw-results.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
}

// =========================================================================
// 6. PAGE INITIALIZATION LISTENERS
// =========================================================================
window.onload = function() {
    initApp();
};