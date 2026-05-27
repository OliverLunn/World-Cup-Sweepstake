// Tab Switching Logic
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active-content'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active-content');
    event.currentTarget.classList.add('active');
}

// Render data onto the DOM
function renderApp() {
    // 1. Render Sweepstake Tab
    const sweepstakeDiv = document.getElementById('sweepstake-list');
    sweepstakeDiv.innerHTML = sweepstakeData.map(p => `
        <p><strong>${p.player}</strong>: ${p.team} (${p.status})</p>
    `).join('');

    // 2. Render Fixtures Tab
    const fixturesDiv = document.getElementById('fixtures-list');
    fixturesDiv.innerHTML = fixturesData.map(f => `
        <div class="fixture-card">
            <span>${f.date}</span> | <strong>${f.match}</strong> — <span>${f.score}</span> (${f.status})
        </div>
    `).join('');

    // 3. Render Groups Tab
    const groupsDiv = document.getElementById('groups-list');
    groupsDiv.innerHTML = Object.keys(groupsData).map(groupName => `
        <h3>${groupName}</h3>
        <ul>
            ${groupsData[groupName].map(t => `<li>${t.team} - Pts: ${t.pts} (GD: ${t.gd})</li>`).join('')}
        </ul>
    `).join('');
}

// Run render on load
window.onload = renderApp;