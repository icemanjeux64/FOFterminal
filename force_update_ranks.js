import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const playersPath = path.join(__dirname, 'src/data/players.json');
const players = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

// Mismatches from user request
const expectedRanks = {
    "1ere Classe": [
        "RookieSoviet", "=QLF=Vinceou", "French_Forces01", "Darkkaotik",
        "Samo", "Miner", "Mickaeldu7190", "Yokshii", "Energiy_hibot",
        "Asteronom", "Hughostrider", "GhostAce", "ManchettexX", "Goleand",
        "Renard_Blanc", "Kahha3rer", "AgentSnoop"
    ],
    "Caporal": [
        "La chips enragee", "Julien.C/Blaxx", "Fantôme", "LulinousLight",
        "Ze_Metropolis", "Anthn", "MinidingueCharly", "Matheo Weston"
    ],
    "Caporal-Chef": [
        "TahitianBOY", "Dino_Senpai", "ZlaTaNqiF", "TopGun", "Diabolik_lolo"
    ],
    "Caporal-Chef de 1re Classe": [
        "Lozio", "Nico75"
    ],
    "Sergent": [
        "Kaya sami", "Flo."
    ],
    "Adjudant": [
        "TinkyWinky"
    ],
    "Adjudant-Chef": [
        "Ryujinn"
    ]
};

// Normalize: Remove spaces, special chars, lower case
const normalize = (n) => n.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

const playerMap = new Map();
players.forEach((p, idx) => {
    playerMap.set(normalize(p.name), idx);
});

let updated = 0;
let failed = [];

Object.entries(expectedRanks).forEach(([grade, names]) => {
    names.forEach(name => {
        let key = normalize(name);
        let idx = playerMap.get(key);

        // Standard Match
        if (idx !== undefined) {
            players[idx].grade = grade;
            updated++;
        } else {
            // Enhanced Matching for difficult cases
            // 1. Try finding if key is substring of map keys
            let found = false;
            for (let [pKey, pIdx] of playerMap.entries()) {
                // If name provided "TinkyWinky" (key: tinkywinky) matches DB "Tinky Winky" (key: tinkywinky) -> Handled above.
                // If DB has "Ghost Ace" (ghostace) vs "GhostAce" (ghostace) -> Handled.

                // Fallback: Inclusion
                // "Ryujinn".includes("Ryujin")?
                // "Flo." (flo) vs "Flo" (flo) -> Handled.

                // Check if pKey contains key OR key contains pKey (min len 3 to avoid false positives)
                if (key.length > 3 && pKey.includes(key)) {
                    players[pIdx].grade = grade;
                    updated++;
                    found = true;
                    break;
                }
            }
            if (!found) failed.push(name);
        }
    });
});

fs.writeFileSync(playersPath, JSON.stringify(players, null, 2), 'utf8');

console.log(`Force Update Complete.`);
console.log(`Updated: ${updated}`);
console.log(`Failed to Match: ${failed.join(', ')}`);
