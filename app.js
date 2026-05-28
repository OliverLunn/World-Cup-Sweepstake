// =========================================================================
// 1. GLOBAL VARIABLES & ACCESSIBILITY PLACEHOLDERS
// =========================================================================
// These prevent the application from crashing if the fetch routine fails
let fixturesData = [];
let groupsData = {};

// =========================================================================
// 2. HELPER FUNCTIONS
// =========================================================================

/**
 * Generates an HTML image tag for a country flag using FlagCDN.
 * Mapped to the ISO codes specified inside data.js
 */
function getFlagHtml(teamName) {
    const code = teamCodes[teamName];
    if (!code) return ''; // Returns blank if team name is "TBD" or unmapped
    return `<img src="https://flagcdn.com/24x18/${code}.png" class="flag-icon" alt="${teamName} flag">`;
}

// =========================================================================
// 3. NAVIGATION & VIEW CONTROLLER LOGIC
// =========================================================================

/**
 * Switches between standard view tabs (Sweepstake, Fixtures, Groups)
 */
function openTab(tabId) {
    // Hide all view panels
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active-content'));
    
    // Remove active styling from all navbar buttons
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    // Display targeted panel view
    document.getElementById(tabId).classList.add('active-content');
    
    // Find matching navbar tab button and highlight it
    const targetButton = Array.from(document.querySelectorAll('.tab-btn'))
        .find(btn => btn.getAttribute('onclick').includes(`'${tabId}'`));
    if (targetButton) {
        targetButton.classList.add('active');
    }
}

/**
 * Deep-link custom profile rendering engine for selected countries
 */
function showTeamDetail(teamName) {
    if (teamName === "TBD" || !teamName) return; // Ignore clicks on placeholder elements

    // Hide standard content tabs completely
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active-content'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    // Reveal hidden team section
    document.getElementById('team-detail').classList.add('active-content');
    
    // Populate header title with flag and country name
    document.getElementById('team-title').innerHTML = `${getFlagHtml(teamName)} ${teamName}`;
    
    // 1. Gather & Parse fixtures filtered explicitly for this team
    const teamFixtures = fixturesData.filter(f => f.match.includes(teamName));
    const fixturesDiv = document.getElementById('team-fixtures-list');
    
    if (teamFixtures.length > 0) {
        fixturesDiv.innerHTML = teamFixtures.map(f => {
            const teams = f.match.split(" vs ");
            return `
                <div class="fixture-card">
                    <div class="fixture-date">${f.date}</div>
                    <div class="fixture-teams">
                        <span class="team-link" onclick="showTeamDetail('${teams[0]}')">${getFlagHtml(teams[0])} ${teams[0]}</span> 
                        vs 
                        <span class="team-link" onclick="showTeamDetail('${teams[1]}')">${getFlagHtml(teams[1])} ${teams[1]}</span>
                    </div>
                    <div class="fixture-score">${f.score}</div>
                </div>
            `;
        }).join('');
    } else {
        fixturesDiv.innerHTML = "<p>No matches discovered for this team layout records.</p>";
    }
    
    // 2. Fetch and render manual squad array records from data.js
    const squadUl = document.getElementById('team-squad-list');
    const assignedSquad = squadsData[teamName];
    
    if (assignedSquad && assignedSquad.length > 0) {
        squadUl.innerHTML = assignedSquad.map(player => `<li>${player}</li>`).join('');
    } else {
        squadUl.innerHTML = "<li>Squad specifications pending manual entry configurations...</li>";
    }
}

/**
 * Direct exit link from detail view back to main dashboard
 */
function closeTeamDetail() {
    openTab('sweepstake');
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
    
    // Helper function to turn a matchup data block into structural layout HTML
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
 * Global application content rendering engine orchestration loop
 */
function renderApp() {
    // 1. Generate Sweepstake Standings Dashboard
    const sweepstakeDiv = document.getElementById('sweepstake-list');
    if (sweepstakeDiv) {
        sweepstakeDiv.innerHTML = sweepstakeData.map(p => `
            <p>
                <strong>${p.player}</strong>: 
                <span class="team-link" onclick="showTeamDetail('${p.team}')">${getFlagHtml(p.team)} ${p.team}</span> 
                &nbsp;—&nbsp; <em>(${p.status})</em>
            </p>
        `).join('');
    }

    // 2. Generate Universal Fixtures Master Schedule Tab
    const fixturesDiv = document.getElementById('fixtures-list');
    if (fixturesDiv) {
        // Sort fixtures by date
        const sortedFixtures = [...fixturesData].sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });

        fixturesDiv.innerHTML = sortedFixtures.map(f => {
            const teams = f.match.split(" vs ");
            
            // Determine status badge styling
            let statusBadge = '';
            let statusClass = '';
            if (f.status === 'Finished') {
                statusBadge = '✓ Complete';
                statusClass = 'status-complete';
            } else if (f.status === 'Live' || f.status === 'IN_PLAY') {
                statusBadge = '● In Play';
                statusClass = 'status-live';
            } else {
                statusBadge = '○ Scheduled';
                statusClass = 'status-scheduled';
            }
            
            return `
                <div class="fixture-card">
                    <div class="fixture-header">
                        <div class="fixture-date">${f.date}</div>
                        <span class="fixture-status ${statusClass}">${statusBadge}</span>
                    </div>
                    <div class="fixture-teams">
                        <span class="team-link" onclick="showTeamDetail('${teams[0]}')">${getFlagHtml(teams[0])} ${teams[0]}</span> 
                        <span>vs</span> 
                        <span class="team-link" onclick="showTeamDetail('${teams[1]}')">${getFlagHtml(teams[1])} ${teams[1]}</span>
                    </div>
                    <div class="fixture-score">${f.score}</div>
                </div>
            `;
        }).join('');
    }

    // 3. Generate Traditional Group Tables Tab
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

    // 4. Generate the Knockout Bracket Tree Visuals
    renderBracket();
}

// =========================================================================
// 5. ASYNC CORE INITIALIZER SYSTEM
// =========================================================================

/**
 * Fires when browser parses scripts completely. Fetches remote data payloads
 * securely before executing DOM building logic loops.
 */
async function initApp() {
    try {
        // Attempt to fetch the automated data file generated by your GitHub Action robot
        const response = await fetch('./live-data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP network response failed with status: ${response.status}`);
        }
        
        const liveData = await response.json();

        // Assign global references over our top-level placeholders
        fixturesData = liveData.fixturesData || [];
        groupsData = liveData.groupsData || {};

        // Generate the bracket tree from the knockout stage matches
        const knockoutMatches = fixturesData.filter(m => 
            m.match.includes('Quarter') || 
            m.match.includes('Semi') || 
            m.match.includes('Final')
        );
        
        if (knockoutMatches.length > 0) {
            generateBracketFromMatches(knockoutMatches);
        } else {
            // If no knockout matches found, try to extract from the full fixtures
            // by looking for matches that typically occur after group stage
            generateBracketFromMatches(fixturesData.slice(-8)); // Last 8 matches are typically knockouts
        }

        console.log(`Data live synchronized. Source timestamp: ${liveData.lastUpdated}`);
    } catch (err) {
        console.error("⚠️ Failed loading automated tournament feeds:", err);
        console.warn("TIP: Ensure you test using a local development server extension (like Live Server) and not via file:/// browser pathways.");
    } finally {
        // The finally block ALWAYS executes, guaranteeing that the user interface 
        // will build and render your navigation tabs, even if data file loading crashes.
        renderApp();
    }
}

// Bind initialization tasks to browser resources loaded state triggers
window.onload = initApp;