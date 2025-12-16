const fs = require('fs');
const path = require('path');

const csvPath = 'c:/Users/guill/Desktop/site fof/Export_fofmembers_2025_13_11.csv';
const outPath = path.join(__dirname, 'players.json');

try {
    const data = fs.readFileSync(csvPath, 'utf8');
    const lines = data.split(/\r?\n/).filter(l => l.trim());

    // Headers are likely line 0
    const parseLine = (line) => {
        const result = [];
        let current = '';
        let inQuote = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ';' && !inQuote) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    };

    const knownRanks = ['Recrue', 'Soldat', 'Caporal', 'Caporal-Chef', 'Sergent', 'Sergent-Chef', 'Adjudant', 'Adjudant-Chef', 'Major', 'Aspirant', 'Sous-Lieutenant', 'Lieutenant', 'Capitaine', 'Commandant', 'Lieutenant-Colonel', 'Colonel', 'Général'];

    const players = lines.slice(1).map((line, idx) => {
        const cols = parseLine(line);
        if (cols.length < 2) return null;

        const pseudo = cols[0].trim();
        const rawRoles = cols[1].replace(/"/g, '').trim();
        const roles = rawRoles.split(';').map(r => r.trim()).filter(r => r);

        // Find Grade
        let grade = 'Recrue';
        // Priority check
        let bestRankIndex = -1;

        for (const r of roles) {
            const index = knownRanks.indexOf(r);
            if (index > -1) {
                // If we found a rank, is it higher? (Actually index hierarchy: Recrue=0, General=High)
                // Assuming roles might contain multiple, we normally take the highest? Or just the one present.
                // Usually people have 1 rank.
                if (index > bestRankIndex) {
                    bestRankIndex = index;
                    grade = r;
                }
            }
        }

        return {
            id: `player_${idx}`,
            name: pseudo,
            grade: grade,
            roles: roles,
            // ID from CSV is likely junk if sci-notation, so we skip it or save it as externalId
            joinDate: cols[3] || ''
        };
    }).filter(p => p);

    fs.writeFileSync(outPath, JSON.stringify(players, null, 2));
    console.log(`Converted ${players.length} players to ${outPath}`);

} catch (e) {
    console.error("Error:", e);
}
