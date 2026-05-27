// ==========================================
// NEW: COUNTRY ISO CODE MAPPER FOR FLAGS
// ==========================================
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
// SWEEPSTAKE PLAYERS
// ==========================================
const sweepstakeData = [
    { player: "Alice", team: "Mexico", status: "In Tournament" },
    { player: "Bob", team: "South Africa", status: "In Tournament" },
    { player: "Charlie", team: "England", status: "In Tournament" },
    { player: "Dave", team: "USA", status: "In Tournament" },
    { player: "Emma", team: "Argentina", status: "In Tournament" }
];

// ==========================================
// MATCH FIXTURES LIST
// ==========================================
const fixturesData = [
    { date: "June 11", match: "Mexico vs South Africa", score: "0 - 0", status: "Scheduled" },
    { date: "June 12", match: "USA vs Morocco", score: "TBD", status: "Scheduled" },
    { date: "June 13", match: "Canada vs Bosnia", score: "TBD", status: "Scheduled" },
    { date: "June 15", match: "Argentina vs South Korea", score: "TBD", status: "Scheduled" },
    { date: "June 17", match: "England vs Croatia", score: "TBD", status: "Scheduled" }
];

// ==========================================
// GROUP STAGE TABLES
// ==========================================
const groupsData = {
    "Group A": [
        { team: "Mexico", pld: 1, gd: 0, pts: 1 },
        { team: "South Africa", pld: 1, gd: 0, pts: 1 },
        { team: "South Korea", pld: 0, gd: 0, pts: 0 },
        { team: "Czech Republic", pld: 0, gd: 0, pts: 0 }
    ],
    "Group B": [
        { team: "USA", pld: 0, gd: 0, pts: 0 },
        { team: "Morocco", pld: 0, gd: 0, pts: 0 },
        { team: "Italy", pld: 0, gd: 0, pts: 0 },
        { team: "Japan", pld: 0, gd: 0, pts: 0 }
    ],
    "Group L": [
        { team: "England", pld: 0, gd: 0, pts: 0 },
        { team: "Croatia", pld: 0, gd: 0, pts: 0 },
        { team: "Ghana", pld: 0, gd: 0, pts: 0 },
        { team: "Argentina", pld: 0, gd: 0, pts: 0 }
    ]
};

// ==========================================
// NEW: DYNAMIC KNOCKOUT TREE CODES
// Change "TBD" to any team name listed in teamCodes above to auto-render flags.
// ==========================================
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
// SQUAD ROSTERS
// ==========================================
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