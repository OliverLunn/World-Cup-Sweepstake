// Global Helper: Creates dynamic img tags for country codes mapped inside data.js
function getFlagHtml(teamName) {
    const code = teamCodes[teamName];
    if (!code) return ''; // Returns blank if team name is "TBD" or missing
    return `<img src="https://flagcdn.com/24x18/${code}.png" class="flag-icon" alt="${teamName} flag">`;
}

// Standard View Controller Switching
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active-content'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active-content');
    
    const targetButton = Array.from(document.querySelectorAll('.tab-btn'))
        .find(btn => btn.getAttribute('onclick').includes(`'${tabId}'`));
    if (targetButton) targetButton.classList.add('active');
}

// Deep-link country profile rendering engine
function showTeamDetail(teamName) {
    if (teamName === "TBD") return; // Ignore clicks on placeholder bracket elements

    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active-content'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('team-detail').classList.add('active-content');
    document.getElementById('team-title').innerHTML = `${getFlagHtml(teamName)} ${teamName}`;
    
    // 1. Gather & Parse localized Team Matches
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
        fixturesDiv.innerHTML = "<p>No custom matches discovered for this team layout records.</p>";
    }
    
    // 2. Map Array data rosters onto page structure
    const squadUl = document.getElementById('team-squad-list');
    const assignedSquad = squadsData[teamName];
    
    if (assignedSquad && assignedSquad.length > 0) {
        squadUl.innerHTML = assignedSquad.map(player => `<li>${player}</li>`).join('');
    } else {
        squadUl.innerHTML = "<li>Squad specifications pending manual entry configurations...</li>";
    }
}

function closeTeamDetail() {
    openTab('sweepstake');
}

// NEW: Generates the HTML layout for the tree structure on the home page
function renderBracket() {
    const bracketContainer = document.getElementById('bracket-container');
    
    // Helper function to turn a matchup object into HTML
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

// Core App Global Data Aggregator Framework
function renderApp() {
    // 1. Render Sweepstake list with flags
    const sweepstakeDiv = document.getElementById('sweepstake-list');
    sweepstakeDiv.innerHTML = sweepstakeData.map(p => `
        <p>
            <strong>${p.player}</strong>: 
            <span class="team-link" onclick="showTeamDetail('${p.team}')">${getFlagHtml(p.team)} ${p.team}</span> 
            &nbsp;—&nbsp; <em>(${p.status})</em>
        </p>
    `).join('');

    // 2. Render Fixtures Schedule with flags
    const fixturesDiv = document.getElementById('fixtures-list');
    fixturesDiv.innerHTML = fixturesData.map(f => {
        const teams = f.match.split(" vs ");
        return `
            <div class="fixture-card">
                <div class="fixture-date">${f.date}</div>
                <div class="fixture-teams">
                    <span class="team-link" onclick="showTeamDetail('${teams[0]}')">${getFlagHtml(teams[0])} ${teams[0]}</span> 
                    <span>vs</span> 
                    <span class="team-link" onclick="showTeamDetail('${teams[1]}')">${getFlagHtml(teams[1])} ${teams[1]}</span>
                </div>
                <div class="fixture-score">${f.score}</div>
            </div>
        `;
    }).join('');

    // 3. Render Group Stage Containers with flags
    const groupsDiv = document.getElementById('groups-list');
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

    // 4. Render the Knockout Tree
    renderBracket();
}

window.onload = renderApp;