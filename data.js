// ==========================================
// 1. COUNTRY ISO CODE MAPPER FOR FLAGS
// ==========================================
// Used by getFlagHtml() in app.js to pull the right flag from FlagCDN.
// Add any missing countries here using their 2-letter ISO codes.
const teamCodes = {
    "Mexico": "mx",
    "South Africa": "za",
    "England": "gb-eng",
    "USA": "us",
    "Argentina": "ar",
    "Morocco": "ma",
    "Canada": "ca",
    "Bosnia": "ba",
    "South Korea": "kr",
    "Czech Republic": "cz",
    "Italy": "it",
    "Japan": "jp",
    "Croatia": "hr",
    "Ghana": "gh",
    "Portugal": "pt",
    "France": "fr",
    "Brazil": "br",
    "Germany": "de"
};

// ==========================================
// 2. SWEEPSTAKE PLAYERS & ASSIGNED TEAMS
// ==========================================
// Update this list with your actual friends, their assigned countries,
// and change status to "Eliminated" when they go home!
const sweepstakeData = [
    { player: "Tom Antolin", team: "TBD", status: "In Tournament" },
    { player: "Anna Dalmasso", team: "TBD", status: "In Tournament" },
    { player: "Jake Dorman", team: "TBD", status: "In Tournament" },
    { player: "Jacob Campbell", team: "TBD", status: "In Tournament" },
    { player: "Breagh Macpherson", team: "TBD", status: "In Tournament" },
    { player: "Dan Ford", team: "TBD", status: "In Tournament" },
    { player: "Dan Ferring", team: "TBD", status: "In Tournament" },
    { player: "Rayff De Souza", team: "TBD", status: "In Tournament" },
    { player: "Greg Humphrey-Evans", team: "TBD", status: "In Tournament" },
    { player: "Oliver Lunn", team: "TBD", status: "In Tournament" },
    { player: "Tyler Rolfe", team: "TBD", status: "In Tournament" },
    { player: "Adela Fernandez", team: "TBD", status: "In Tournament" },
    { player: "Guillaume Hewitt", team: "TBD", status: "In Tournament" }
];

// ==========================================
// 3. KNOCKOUT TREE BRACKET DATA
// ==========================================
// Automatically generated from API data. Shows knockout stage matches.
let bracketData = {
    quarters: [],
    semis: [],
    final: []
};

/**
 * Builds bracket data from fetched fixtures
 * Groups matches by stage: quarter-finals, semi-finals, final
 */
function generateBracketFromMatches(matches) {
    const quarters = [];
    const semis = [];
    const final = [];

    matches.forEach(m => {
        // Parse the match string (e.g., "Germany vs Argentina")
        const teams = m.match.split(" vs ");
        const team1 = teams[0] ? teams[0].trim() : "TBD";
        const team2 = teams[1] ? teams[1].trim() : "TBD";

        // Parse score - format is either "TBD" or "X - Y"
        let score1 = "TBD";
        let score2 = "TBD";
        if (m.score && m.score !== "TBD") {
            const scoreParts = m.score.split(" - ");
            if (scoreParts.length === 2) {
                score1 = scoreParts[0].trim();
                score2 = scoreParts[1].trim();
            }
        }

        const matchupObj = { team1, score1, team2, score2 };

        // Categorize by stage based on date proximity to tournament end
        // Typically: QF (Day 1), SF (Day 2), Final (Day 3)
        if (m.status === 'Finished' || m.status === 'Live' || m.score !== "TBD") {
            // If match has a result, determine stage by number of remaining matches
            if (final.length === 0 && quarters.length >= 4) {
                semis.push(matchupObj);
            } else if (final.length === 0 && semis.length >= 2) {
                final.push(matchupObj);
            } else {
                quarters.push(matchupObj);
            }
        } else {
            // Not played yet - add to stages sequentially
            if (quarters.length < 4) {
                quarters.push(matchupObj);
            } else if (semis.length < 2) {
                semis.push(matchupObj);
            } else {
                final.push(matchupObj);
            }
        }
    });

    // Ensure we always have placeholder slots for all rounds
    while (quarters.length < 4) {
        quarters.push({ team1: "TBD", score1: "TBD", team2: "TBD", score2: "TBD" });
    }
    while (semis.length < 2) {
        semis.push({ team1: "TBD", score1: "TBD", team2: "TBD", score2: "TBD" });
    }
    while (final.length < 1) {
        final.push({ team1: "TBD", score1: "TBD", team2: "TBD", score2: "TBD" });
    }

    bracketData = {
        quarters: quarters.slice(0, 4),
        semis: semis.slice(0, 2),
        final: final.slice(0, 1)
    };
}

// ==========================================
// 4. CUSTOM SQUAD ROSTERS
// ==========================================
// Displayed when someone clicks on a country name.
const squadsData = {
    "Mexico": [
        "Manager: Javier Aguirre",
        "Santiago Giménez (Forward)",
        "Edson Álvarez (Midfielder)",
        "Guillermo Ochoa (Goalkeeper)"
    ],
    "South Africa": [
        "Manager: Hugo Broos",
        "Ronwen Williams (Goalkeeper)",
        "Percy Tau (Forward)"
    ],
    "England": [
        "Manager: Thomas Tuchel",
        "Harry Kane (Forward)",
        "Jude Bellingham (Midfielder)",
        "Bukayo Saka (Forward)"
    ],
    "USA": [
        "Manager: Mauricio Pochettino",
        "Christian Pulisic (Forward)",
        "Weston McKennie (Midfielder)"
    ],
    "Argentina": [
        "Manager: Lionel Scaloni",
        "Lionel Messi (Forward)",
        "Lautaro Martínez (Forward)"
    ]
};