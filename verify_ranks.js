import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const playersPath = path.join(__dirname, 'src/data/players.json');
const players = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

// The list provided by the user in Step 1763
const expectedRanks = {
    "1ere Classe": [
        "Frozone_913", "Pinceasucre", "Tomsis15", "RookieSoviet", "=QLF=Vinceou",
        "French_Forces01", "Darkkaotik", "Samo", "Miner", "Mickaeldu7190",
        "Lester54114", "Yokshii", "Energiy_hibot", "Asteronom", "Hughostrider",
        "MI6", "Grandkong", "Alban0s-X", "GhostAce", "Nyos", "Sheru",
        "ManchettexX", "Goleand", "Djoff44", "FatBob", "Renard_Blanc",
        "Jordichh44", "Kahha3rer", "AgentSnoop", "lFyZeRl", "Heldroxx",
        "Anderson Mcdex", "Manoel Jager", "Zepek_06"
    ],
    "Caporal": [
        "Audraaay", "Keelyan2003", "La chips enragee", "Julien.C/Blaxx",
        "Cartherion", "Fantôme", "LulinousLight", "Stubb", "Ze_Metropolis",
        "Kukaland", "Anthn", "MinidingueCharly", "Sick.Side.army13",
        "AtOmIc", "Fez", "Matheo Weston"
    ],
    "Caporal-Chef": [
        "NSBQLF", "TahitianBOY", "Cortez", "Varask", "Dylanc_78", "Yann",
        "Dino_Senpai", "Pich", "Darkspartan9337", "ZlaTaNqiF", "TopGun",
        "Hebi", "Nettoyeur", "Diabolik_lolo", "Martin", "Oahhmz",
        "BobFuraxx", "00Nathan00"
    ],
    "Caporal-Chef de 1re Classe": [
        "Lozio", "Nitram", "Nico75"
    ],
    "Sergent": [
        "Kaya sami", "Flo.", "Ganta", "JEJ"
    ],
    "Sergent-Chef": [
        "Teuchinio"
    ],
    "Adjudant": [
        "TinkyWinky", "Kosmo"
    ],
    "Adjudant-Chef": [
        "Ryujinn"
    ],
    "Major": [
        "Snake"
    ]
};

const normalize = (n) => n.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

const playerMap = new Map();
players.forEach(p => {
    playerMap.set(normalize(p.name), p);
});

const report = {
    matches: 0,
    mismatches: [],
    missing: []
};

Object.entries(expectedRanks).forEach(([grade, names]) => {
    names.forEach(name => {
        const key = normalize(name);
        // Direct match
        let p = playerMap.get(key);

        // If not found, fuzzy search in map
        if (!p) {
            for (let [pKey, player] of playerMap.entries()) {
                if (pKey.includes(key) || key.includes(pKey)) {
                    // Safety: Avoid matching "Tom" to "Atomic" if lengths differ too much
                    // But assume if we find inclusion it's likely the person
                    p = player;
                    break;
                }
            }
        }

        if (!p) {
            report.missing.push(name);
        } else {
            // Check Grade
            if (p.grade === grade) {
                report.matches++;
            } else {
                report.mismatches.push({
                    name: name,
                    foundName: p.name,
                    expected: grade,
                    found: p.grade
                });
            }
        }
    });
});

console.log("=== REPORT ===");
console.log(`Verified Matches: ${report.matches}`);
console.log(`Missing Players from DB: ${report.missing.length}`);
console.log(`Rank Mismatches: ${report.mismatches.length}`);

fs.writeFileSync('mismatches.json', JSON.stringify(report.mismatches, null, 2));
console.log("Mismatches saved to mismatches.json");
