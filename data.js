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
    { player: "Alice", team: "Mexico", status: "In Tournament" },
    { player: "Bob", team: "South Africa", status: "In Tournament" },
    { player: "Charlie", team: "England", status: "In Tournament" },
    { player: "Dave", team: "USA", status: "In Tournament" },
    { player: "Emma", team: "Argentina", status: "In Tournament" }
];

// ==========================================
// 3. KNOCKOUT TREE BRACKET DATA
// ==========================================
// When the group stage ends, manually update "TBD" to the qualified 
// country names (matching the names in teamCodes) to auto-render flags.
const bracketData = {
    quarters: [
        { team1: "Germany", score1: "TBD", team2: "Argentina", score2: "TBD" },
        { team1: "Mexico", score1: "TBD", team2: "England", score2: "TBD" },
        { team1: "USA", score1: "TBD", team2: "France", score2: "TBD" },
        { team1: "Brazil", score1: "TBD", team2: "Portugal", score2: "TBD" }
    ],
    semis: [
        { team1: "TBD", score1: "TBD", team2: "TBD", score2: "TBD" },
        { team1: "TBD", score1: "TBD", team2: "TBD", score2: "TBD" }
    ],
    final: [
        { team1: "TBD", score1: "TBD", team2: "TBD", score2: "TBD" }
    ]
};

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