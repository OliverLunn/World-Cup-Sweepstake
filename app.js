// =========================================================================
// 1. GLOBAL VARIABLES & ACCESSIBILITY PLACEHOLDERS
// =========================================================================
let fixturesData = [];
let groupsData = {};
let scorersData = [];
let globalSquadsData = null;      // Holds the comprehensive squads.json data array
let currentDashboardTab = 'sweepstake'; // Tracks user history for fluid back-navigation

// =========================================================================
// 2. HELPER FUNCTIONS
// =========================================================================

/**
 * Generates an HTML image tag for a country flag using FlagCDN.
 */
function getFlagHtml(teamName) {
    const code = teamCodes[teamName];
    if (!code) return ''; 
    return `<img src="https://flagcdn.com/24x18/${code}.png" class="flag-icon" alt="${teamName} flag">`;
}

/**
 * Finds which group a match belongs to by looking up team positions in groupsData
 */
function getMatchGroup(team1, team2) {
    for (const [groupName, teams] of Object.entries(groupsData)) {
        const teamNames = teams.map(t => t.team);
        if (teamNames.includes(team1) && teamNames.includes(team2)) {
            return groupName;
        }
    }
    return 'Knockout Stage';
}

// =========================================================================
// 3. NAVIGATION & VIEW CONTROLLER LOGIC
// =========================================================================

/**
 * Switches between standard view tabs (Sweepstake, Fixtures, Groups, Squads)
 */
function openTab(tabId) {
    // Hide all view panels
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active-content'));
    
    // Remove active styling from all navbar buttons
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    // Display targeted panel view
    const targetElement = document.getElementById(tabId);
    if (targetElement) {
        targetElement.classList.add('active-content');
    }
    
    // Save history point if navigating standard categories
    if (tabId !== 'team-detail') {
        currentDashboardTab = tabId;
    }
    
    // Find matching navbar tab button and highlight it
    const targetButton = Array.from(document.querySelectorAll('.tab-btn'))
        .find(btn => btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${tabId}'`));
    if (targetButton) {
        targetButton.classList.add('active');
    }
}

/**
 * Deep-link custom profile rendering engine for selected countries
 */
function showTeamDetail(teamName) {
    if (teamName === "TBD" || !teamName) return; 

    // Hide active layout headers during single profile lookup focus
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active-content'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('team-detail').classList.add('active-content');
    document.getElementById('team-title').innerHTML = `${getFlagHtml(teamName)} ${teamName}`;
    
    // 1. Render Team Schedule
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
    
    // 2. Render Team Squad list 
    const squadUl = document.getElementById('team-squad-list');
    
    if (globalSquadsData && globalSquadsData[teamName]) {
        const players = globalSquadsData[teamName];
        const positions = { 'Goalkeepers': [], 'Defenders': [], 'Midfielders': [], 'Forwards': [] };

        // Categorize players into simple positional arrays
        players.forEach(p => {
            const posRaw = (p.position || "").toLowerCase();
            let listKey = 'Forwards'; // Default fallback position
            
            if (posRaw.includes('gk') || posRaw.includes('goalkeeper')) listKey = 'Goalkeepers';
            else if (posRaw.includes('df') || posRaw.includes('defender')) listKey = 'Defenders';
            else if (posRaw.includes('mf') || posRaw.includes('midfielder')) listKey = 'Midfielders';

            positions[listKey].push(p);
        });

        // Convert grouped position lists to cleanly styled HTML blocks
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
        // Fallback option to basic array map from data.js
        const assignedSquad = typeof squadsData !== 'undefined' ? squadsData[teamName] : null;
        if (assignedSquad && assignedSquad.length > 0) {
            squadUl.innerHTML = `<ul style="padding-left: 20px;">${assignedSquad.map(player => `<li>${player}</li>`).join('')}</ul>`;
        } else {
            squadUl.innerHTML = "<p>Squad specification list pending data load configurations...</p>";
        }
    }
}

/**
 * Returns user back to whichever dashboard tab they were interacting with previously
 */
function closeTeamDetail() {
    openTab(currentDashboardTab);
}

// =========================================================================
// 4. RENDERING ENGINES (HTML GENERATORS)
// =========================================================================

/**
 * Generates the dynamic visual tree structure on the home page
 */
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

/**
 * Generates the grid layout cards inside the squads panel browser container
 */
function renderSquadCards() {
    const container = document.getElementById('squad-cards-container');
    if (!container) return;

    // Use keys from loaded squads.json file, or gather from group listings automatically
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

    // Filter unique clean entries and sort alphabetically
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

/**
 * Core interface rendering engine loop
 */
function renderApp() {
    // 1. Generate Sweepstake Standings
    const sweepstakeDiv = document.getElementById('sweepstake-list');
    if (sweepstakeDiv) {
        sweepstakeDiv.innerHTML = sweepstakeData.map(p => `
            <div class="sweepstake-card">
                <div class="player-name">${p.player}</div>
                <div class="player-teams">
                    ${(p.teams || []).map(team => `
                        <div class="team-item" onclick="team !== 'TBD' && showTeamDetail('${team}')">
                            ${getFlagHtml(team)}
                            <span>${team}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="player-status">${p.status}</div>
            </div>
        `).join('');
    }

    // 2. Generate Universal Fixtures
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

    // 3. Generate Traditional Group Tables
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

    // 4. Render Knockout Tree
    renderBracket();

    // 5. Generate Leaderboard
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

    // 6. Run Squad Grid Browser layout generator
    renderSquadCards();
}

// =========================================================================
// 5. ASYNC INITIALIZER SYSTEM
// =========================================================================

/**
 * Performs parallel resource loads before calling interface draw processes
 */
async function initApp() {
    // Step A: Load Live Matches & Bracket Data
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
        generateBracketFromMatches(knockoutMatches.length > 0 ? knockoutMatches : fixturesData.slice(-8));
    } catch (err) {
        console.error("⚠️ Failed loading automated tournament feeds:", err);
    }

    // Step B: Load Rich Roster JSON in parallel
    try {
        const squadsResponse = await fetch('./squads.json');
        if (squadsResponse.ok) {
            globalSquadsData = await squadsResponse.json();
            console.log("Squads JSON payload synchronized.");
        }
    } catch (squadsErr) {
        console.error("⚠️ Failed loading squads data file source:", squadsErr);
    }

    // Step C: Trigger UI Render
    renderApp();
}

// =========================================================================
// 6. SWEEPSTAKE DRAW SYSTEM
// =========================================================================

let drawState = {
    isDrawing: false,
    currentPlayerIndex: 0,
    currentPot: 1, // 1 or 2
    pot1: [],
    pot2: [],
    drawInProgress: false,
    drawPassword: "wc2026" // Set your draw password here
};

/**
 * Divides all tournament teams into two ranked pots
 * Ensures each player gets at least one team from each pot
 */
function dividePots() {
    const allTeams = getAllAvailableTeams();
    const numberOfPlayers = sweepstakeData.length;
    
    // Validate we have enough teams
    if (allTeams.length < numberOfPlayers * 2) {
        alert(`Not enough teams! Need at least ${numberOfPlayers * 2} teams for ${numberOfPlayers} players. Found ${allTeams.length}.`);
        drawState.isDrawing = false;
        drawState.drawInProgress = false;
        return false;
    }
    
    // Define seeded/top-ranked teams (Pot 1 candidates)
    const pot1Candidates = [
        "Argentina", "France", "England", "Brazil", "Germany", "Spain", 
        "Belgium", "Netherlands", "Portugal", "Italy", "Uruguay", "Mexico",
        "Denmark", "Croatia", "Senegal", "Wales", "Japan", "South Korea"
    ];
    
    // Separate teams into seeded and non-seeded
    const seededTeams = allTeams.filter(team => pot1Candidates.includes(team));
    const nonSeededTeams = allTeams.filter(team => !pot1Candidates.includes(team));
    
    // Build pot arrays
    const pot1Array = [];
    const pot2Array = [];
    
    // Distribute seeded teams first to pot1
    for (let i = 0; i < numberOfPlayers && i < seededTeams.length; i++) {
        pot1Array.push(seededTeams[i]);
    }
    
    // If pot1 needs more teams, take from non-seeded
    for (let i = pot1Array.length; i < numberOfPlayers && i < seededTeams.length + nonSeededTeams.length; i++) {
        const nonSeededIndex = i - seededTeams.length;
        if (nonSeededIndex < nonSeededTeams.length) {
            pot1Array.push(nonSeededTeams[nonSeededIndex]);
        }
    }
    
    // Build pot2 with remaining teams
    let nonSeededStartIndex = Math.max(0, numberOfPlayers - seededTeams.length);
    for (let i = nonSeededStartIndex; i < nonSeededTeams.length && pot2Array.length < numberOfPlayers; i++) {
        pot2Array.push(nonSeededTeams[i]);
    }
    
    // If pot2 still needs teams, use seeded teams that weren't used
    for (let i = pot1Array.length; i < seededTeams.length && pot2Array.length < numberOfPlayers; i++) {
        pot2Array.push(seededTeams[i]);
    }
    
    // Final validation
    if (pot1Array.length < numberOfPlayers || pot2Array.length < numberOfPlayers) {
        alert(`Unable to divide teams fairly. Pot1: ${pot1Array.length}, Pot2: ${pot2Array.length}, Players: ${numberOfPlayers}`);
        drawState.isDrawing = false;
        drawState.drawInProgress = false;
        return false;
    }
    
    // Remove any null or undefined values
    const cleanPot1 = pot1Array.filter(team => team && team !== null && team !== undefined).slice(0, numberOfPlayers);
    const cleanPot2 = pot2Array.filter(team => team && team !== null && team !== undefined).slice(0, numberOfPlayers);
    
    // Final check
    if (cleanPot1.length < numberOfPlayers || cleanPot2.length < numberOfPlayers) {
        alert(`Not enough valid teams. Pot1: ${cleanPot1.length}, Pot2: ${cleanPot2.length}, Players: ${numberOfPlayers}`);
        drawState.isDrawing = false;
        drawState.drawInProgress = false;
        return false;
    }
    
    // Shuffle both pots independently
    drawState.pot1 = shuffleArray(cleanPot1);
    drawState.pot2 = shuffleArray(cleanPot2);
    
    return true;
}

/**
 * Gets all unique teams from the tournament fixtures
 */
function getAllAvailableTeams() {
    const teams = new Set();
    fixturesData.forEach(fixture => {
        const matchTeams = fixture.match.split(" vs ");
        const team1 = matchTeams[0] ? matchTeams[0].trim() : null;
        const team2 = matchTeams[1] ? matchTeams[1].trim() : null;
        if (team1 && team1 !== "TBD") teams.add(team1);
        if (team2 && team2 !== "TBD") teams.add(team2);
    });
    
    // Also add teams from groups if available
    if (groupsData && Object.keys(groupsData).length > 0) {
        Object.values(groupsData).forEach(group => {
            group.forEach(row => {
                if (row.team && row.team !== "TBD") {
                    teams.add(row.team);
                }
            });
        });
    }
    
    return Array.from(teams).filter(team => team && team !== "TBD" && team !== null).sort();
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Performs one team draw for current player and pot
 */
async function drawOneTeam() {
    if (!drawState.isDrawing || drawState.currentPlayerIndex >= sweepstakeData.length) {
        return;
    }

    const player = sweepstakeData[drawState.currentPlayerIndex];
    const pot = drawState.currentPot === 1 ? drawState.pot1 : drawState.pot2;
    
    if (pot.length === 0) {
        console.error("Pot is empty!");
        finishDraw();
        return;
    }

    // Draw a team from the current pot, filtering out any null/undefined values
    let drawnTeam = null;
    while (pot.length > 0 && !drawnTeam) {
        const candidate = pot.shift();
        if (candidate && candidate !== null && candidate !== undefined) {
            drawnTeam = candidate;
        }
    }

    if (!drawnTeam) {
        console.error("No valid team to draw from pot!");
        finishDraw();
        return;
    }
    
    // Assign to correct slot
    if (drawState.currentPot === 1) {
        player.teams[0] = drawnTeam;
    } else {
        player.teams[1] = drawnTeam;
    }

    // Update UI
    updateDrawStatus();
    renderApp();

    // Animate the card
    const cards = document.querySelectorAll('.sweepstake-card');
    const currentCard = cards[drawState.currentPlayerIndex];
    if (currentCard) {
        currentCard.classList.add('drawing-team');
        await new Promise(resolve => setTimeout(resolve, 1500));
        currentCard.classList.remove('drawing-team');
    }

    // Move to next player or next pot
    if (drawState.currentPot === 1) {
        // Just drew from pot 1, now draw from pot 2
        drawState.currentPot = 2;
        updateDrawStatus();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await drawOneTeam();
    } else {
        // Just drew from pot 2, move to next player
        drawState.currentPlayerIndex++;
        drawState.currentPot = 1;
        
        if (drawState.currentPlayerIndex < sweepstakeData.length) {
            updateDrawStatus();
            await new Promise(resolve => setTimeout(resolve, 1500));
            await drawOneTeam();
        } else {
            // Draw complete
            finishDraw();
        }
    }
}

/**
 * Updates the draw status display
 */
function updateDrawStatus() {
    const statusDiv = document.getElementById('draw-status');
    if (!statusDiv) return;

    if (drawState.currentPlayerIndex < sweepstakeData.length) {
        const player = sweepstakeData[drawState.currentPlayerIndex];
        document.querySelector('#current-player strong').textContent = player.player;
        document.querySelector('#current-pot strong').textContent = 
            drawState.currentPot === 1 ? 'Pot 1 (Top-Ranked Teams)' : 'Pot 2 (Other Teams)';
        document.getElementById('pot1-count').textContent = drawState.pot1.length;
        document.getElementById('pot2-count').textContent = drawState.pot2.length;
    }
}

/**
 * Completes the draw and cleans up
 */
function finishDraw() {
    drawState.isDrawing = false;
    drawState.drawInProgress = false;

    // Hide status
    const statusDiv = document.getElementById('draw-status');
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }

    const startBtn = document.getElementById('start-draw-btn');
    
    if (startBtn) {
        startBtn.style.display = 'none';
        startBtn.disabled = true;
    }

    // Save results to localStorage
    try {
        localStorage.setItem('sweepstakeDrawResults', JSON.stringify(sweepstakeData));
        console.log("Draw results saved to localStorage");
    } catch (err) {
        console.error("Failed to save draw results:", err);
    }

    // Try to save to file
    saveDrawResultsToFile();

    renderApp();

    // Show completion message
    const completeMsg = document.getElementById('draw-complete-message');
    if (completeMsg) {
        completeMsg.style.display = 'block';
    }
}

/**
 * Formats draw results as text content
 */
function formatDrawResultsAsText() {
    const timestamp = new Date().toLocaleString();
    let content = "WORLD CUP 2026 SWEEPSTAKE DRAW RESULTS\n";
    content += "====================================\n\n";
    content += `Draw Date & Time: ${timestamp}\n\n`;
    
    content += "TEAM ASSIGNMENTS:\n";
    content += "-----------------\n\n";
    
    sweepstakeData.forEach((player, index) => {
        content += `${index + 1}. ${player.player}\n`;
        content += `   - Pot 1 Team: ${player.teams[0]}\n`;
        content += `   - Pot 2 Team: ${player.teams[1]}\n\n`;
    });
    
    return content;
}

/**
 * Saves draw results to a JSON file in the repo
 */
async function saveDrawResultsToFile() {
    try {
        const drawResults = {
            timestamp: new Date().toISOString(),
            results: sweepstakeData.map(player => ({
                player: player.player,
                teams: player.teams,
                status: player.status
            }))
        };

        // Try to save via a backend endpoint (optional)
        // If you set up a backend, it would handle saving the file
        const response = await fetch('save-draw-results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(drawResults)
        });

        if (response.ok) {
            console.log("Draw results saved to server");
            return true;
        }
    } catch (err) {
        // If no backend endpoint, continue gracefully
        console.log("No backend endpoint available, results saved to localStorage only");
    }
    return false;
}

/**
 * Downloads draw results as a text file
 */
function downloadDrawResults() {
    const content = formatDrawResultsAsText();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'draw_results_' + new Date().toISOString().split('T')[0] + '.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

/**
 * Loads draw results from localStorage
 */
function loadDrawResults() {
    try {
        const saved = localStorage.getItem('sweepstakeDrawResults');
        if (saved) {
            const loadedData = JSON.parse(saved);
            sweepstakeData.forEach((player, index) => {
                if (loadedData[index]) {
                    player.teams = loadedData[index].teams;
                }
            });
            console.log("Draw results loaded from localStorage");
            return true;
        }
    } catch (err) {
        console.error("Failed to load draw results:", err);
    }
    return false;
}

/**
 * Initiates the sweepstake draw
 */
async function startDraw() {
    const startBtn = document.getElementById('start-draw-btn');
    const statusDiv = document.getElementById('draw-status');
    const passwordInput = document.getElementById('draw-password');
    
    if (!startBtn || drawState.drawInProgress) return;

    // Check password
    if (!passwordInput || passwordInput.value !== drawState.drawPassword) {
        alert('❌ Incorrect password. Please enter the correct password to start the draw.');
        if (passwordInput) {
            passwordInput.focus();
            passwordInput.value = '';
        }
        return;
    }

    // Clear any previous draw results
    try {
        localStorage.removeItem('sweepstakeDrawResults');
        console.log("Previous draw results cleared");
    } catch (err) {
        console.error("Failed to clear previous results:", err);
    }

    // Initialize draw state
    drawState.isDrawing = true;
    drawState.drawInProgress = true;
    drawState.currentPlayerIndex = 0;
    drawState.currentPot = 1;

    // Reset teams to empty
    sweepstakeData.forEach(player => {
        player.teams = ["TBD", "TBD"];
    });

    // Divide teams into pots
    const potsSuccessful = dividePots();
    if (!potsSuccessful) {
        drawState.isDrawing = false;
        drawState.drawInProgress = false;
        startBtn.disabled = false;
        startBtn.textContent = '🎲 Start The Draw';
        return;
    }

    // Hide password input and show status
    if (passwordInput) {
        passwordInput.disabled = true;
        passwordInput.style.display = 'none';
    }
    startBtn.disabled = true;
    startBtn.textContent = '🎲 Drawing...';
    if (statusDiv) {
        statusDiv.style.display = 'block';
    }

    // Hide completion message if visible
    const completeMsg = document.getElementById('draw-complete-message');
    if (completeMsg) {
        completeMsg.style.display = 'none';
    }

    // Update status
    updateDrawStatus();
    renderApp();

    // Wait a moment then start drawing
    await new Promise(resolve => setTimeout(resolve, 500));
    await drawOneTeam();
}

window.onload = function() {
    initApp();
    // Try to load previously saved draw results
    const hasDrawn = loadDrawResults();
    if (hasDrawn) {
        // Check if all players have teams (draw is complete)
        const drawComplete = sweepstakeData.every(p => p.teams && p.teams[0] !== "TBD" && p.teams[1] !== "TBD");
        if (drawComplete) {
            // Update UI to hide password input if draw exists
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
};