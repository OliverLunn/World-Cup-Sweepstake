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

window.onload = initApp;