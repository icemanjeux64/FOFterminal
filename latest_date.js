
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('c:/Users/guill/Desktop/site fof/formations.json', 'utf8'));

let maxDate = null;
let maxDateStr = "";

function parseDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    // Month is 0-indexed in JS Date
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

data.forEach(entry => {
    if (entry.formations) {
        entry.formations.forEach(f => {
            const d = parseDate(f.date);
            if (d) {
                if (!maxDate || d > maxDate) {
                    maxDate = d;
                    maxDateStr = f.date;
                }
            }
        });
    }
});

console.log("Latest date is: " + maxDateStr);
