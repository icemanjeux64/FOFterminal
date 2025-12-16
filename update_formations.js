
const fs = require('fs');

const formationsPath = 'c:/Users/guill/Desktop/site fof/formations.json';
let data = JSON.parse(fs.readFileSync(formationsPath, 'utf8'));

const newEntries = [
    { type: "SL Artillerie", date: "15/11/2025", players: ["lkurd26", "BebeEnzo72", "Mirai やめてください !", "Kosmo", "l Ryüjinn l"] },
    { type: "Recrue", date: "27/10/2025", players: ["lulugaming02", "Tipolix", "Villaret", "Ibmc_grogu", "KyleVI"] },
    { type: "Medic v2", date: "19/11/2025", players: ["LuminousLight", "Julien.C / BLAXX", "FANTÔME"] },
    { type: "SL Artillerie", date: "20/11/2025", players: ["jej", "Teuchinio", "CCH. Le_S", "EagleClaw", "y508850", "Pich"] },
    { type: "Recrue", date: "20/11/2025", players: ["SieteOcho", "Yanakuza", "✠ Twan ✠", "[BFSA]Alex59", "Svoboda 1918"] },
    { type: "Medic V1", date: "18/11/2025", players: ["WaR_Dady_", "Manoel Jager", "Kukaland", "RackBoy", "Grandkong", "Nyos", "hughostrider🇧🇪", "heldroxx", "ZEPEK_06", "tahitian-BOYS83🇵🇫", "Cartherion"] },
    { type: "ALAT v1", date: "21/11/2025", players: ["Ánthn"] },
    { type: "SL", date: "22/11/2025", players: ["HORUXIO", "WhiZzPeR", "luka_dth"] },
    { type: "Recrue", date: "22/11/2025", players: ["ThanhDrixxy", "Jack-Uzi", "Mr Hyde"] },
    { type: "Medic V1", date: "25/11/2025", players: ["venstyle", "Yokshii", "Seit", "Yanakuza", "NeonDino", "Tipolix"] },
    { type: "Recrue", date: "26/11/2025", players: ["Mask_", "Shapatti59"] },
    { type: "Minimi", date: "18/11/2025", players: ["Hebi", "Diabolik__lolo", "Stubb", "[CPL]Ze_metropolis", "FANTÔME", "LuminousLight", "Dino", "Captn_Strawhat", "Pitivier le vrai"] },
    { type: "Minimi", date: "27/11/2025", players: ["Hebi", "Pich", "TFSG_Ghost_51412", "xam94", "Kukaland", "Ánthn", "bobfuraxx"] },
    { type: "Medic V2", date: "27/11/2025", players: ["Hebi", "TopGun978421", "Audraaay", "tahitian-BOYS83🇵🇫", "Ladinde"] },
    { type: "Initiation Planton", date: "29/11/2025", players: ["tahitian-BOYS83🇵🇫", "Skyz-TarTinE", "yann", "GG kaya Sami", "Martin", "Rancou", "Goéland", "ZEPEK_06"] },
    { type: "AT", date: "29/11/2025", players: ["WaR_Dady_", "dylanc_78", "FANTÔME", "CCH1.Lozio", "Darkspartan9337", "Pitivier le vrai", "Julien.C / BLAXX", "Cartherion", "ArTe_NA", "Minidingue_Charly", "𝐱𝐘𝐨𝐮𝐫𝐆𝐚𝐥𝐚𝐜𝐭𝐢𝐜-𝔩", "lapuchk6766", "bobfuraxx", "LuminousLight", "Raaptor_13", "Audraaay", "Kukaland", "Fred180776", "Dino"] },
    { type: "Recrue", date: "30/11/2025", players: ["IRagnarLothbroKk", "LeMac23FR", "Ohkeizer", "Riddick", "Kiwi", "HIBOU", "II_LeSpartiate_I", "IAB"] },
    { type: "SL Artillerie", date: "01/12/2025", players: ["AT0MIC W4RRIOR", "luka_dth", "Diabolik__lolo", "HORUXIO", "TopGun978421"] },
    { type: "ALAT v1", date: "02/12/2025", players: ["AtOmIc", "Dino", "tahitian-BOYS83🇵🇫", "[CPL] Matheo Weston"] },
    { type: "Recrue", date: "02/12/2025", players: ["[FR] Jéjé", "Geocyborg14", "llFourchettell", "Hadryan", "GAZOshYt", "Red_", "Angus2255", "LewisOB", "Pierre-al_Norris"] },
    { type: "AT", date: "04/12/2025", players: ["TopGun978421", "xxfactoryxx", "AbraxX66", "Sick.side.army13", "AtOmIc", "Fez", "[CPL] Matheo Weston", "FANTÔME", "La chips enragée", "Benchow"] },
    { type: "TP", date: "05/12/2025", players: ["Mirai やめてください !", "Flo.", "jej", "l Ryüjinn l", "lkurd26", "HORUXIO"] },
    { type: "Medic V2", date: "06/12/2025", players: ["Goro", "Cartherion", "[CPL]Ze_metropolis", "LeMax19", "Fred180776", "Diabolik__lolo"] },
    { type: "TP", date: "09/12/2025", players: ["Audraaay", "ALEX2801CH", "Julien.C / BLAXX", "Devinez.z", "Stubb", "Kura", "FANTÔME", "Martin"] },
    { type: "Medic V2", date: "09/12/2025", players: ["Nyos", "hughostrider🇧🇪", "heldroxx", "Pierrive"] },
    { type: "Recrue", date: "11/12/2025", players: ["Iouskov", "🇨🇵༺𖤍Hirox_81_HXx𖤍༻🇨🇵", "Dj_Nocid_65", "Gaara92i", "CoLoR x LeGenD", "Maverick", "Antoineoklm", "𝒮𝓅ℯ𝒸𝓉𝓇ℯ𝒩ℴ𝒸𝓉𝓊𝓇𝓃ℯ"] },
    { type: "TC1", date: "11/12/2025", players: ["HORUXIO", "lkurd26", "🇫🇷⚜ touk touk ⚜🇫🇷"] },
    { type: "LG", date: "13/12/2025", players: ["lkurd26", "Teuchinio", "Julien.C / BLAXX", "00nathan00", "MD_9908", "Manoel Jager", "Audraaay"] },
    { type: "TP", date: "14/12/2025", players: ["𝐱𝐘𝐨𝐮𝐫𝐆𝐚𝐥𝐚𝐜𝐭𝐢𝐜-𝔩", "Snake", "=𝐍𝐢𝐜𝐨𝟕𝟓=", "y508850", "Cartherion", "Darkspartan9337"] },
    { type: "ALAT v1", date: "15/12/2025", players: ["AT0MIC W4RRIOR"] }
];

// Helper to normalize strings for comparison
const normalize = (str) => str.trim().toLowerCase();

newEntries.forEach(session => {
    session.players.forEach(playerName => {
        // Find player in data
        let player = data.find(p => normalize(p.nom) === normalize(playerName));

        // If player player found, check if they have formations array
        if (player) {
            if (!player.formations) player.formations = [];
        } else {
            // New player
            player = { nom: playerName, formations: [] };
            data.push(player);
        }

        // Check if formation already exists (prevent dupes if running multiple times)
        const exists = player.formations.some(f => f.type === session.type && f.date === session.date);

        if (!exists) {
            player.formations.push({ type: session.type, date: session.date });
        }
    });
});

// Sort data by name
data.sort((a, b) => a.nom.localeCompare(b.nom));

fs.writeFileSync(formationsPath, JSON.stringify(data, null, 2), 'utf8');
console.log("Formations updated successfully.");
