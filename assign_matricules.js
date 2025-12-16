import fs from 'fs';

try {
    const playersPath = 'src/data/players.json';
    const players = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

    // Find Cpt_Iceman
    const iceman = players.find(p => p.name === 'Cpt_Iceman');

    // Assign Iceman
    if (iceman) {
        iceman.matricule = 'FOF_0001';
    }

    let currentId = 2; // Start others at 2

    players.forEach(p => {
        if (p.name === 'Cpt_Iceman') return; // Already done

        const suffix = currentId.toString().padStart(4, '0');
        p.matricule = `FOF_${suffix}`;
        currentId++;
    });

    fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));
    console.log('Matricules assigned successfully.');
    console.log(`Total players: ${players.length}`);
    console.log(`Last ID assigned: FOF_${(currentId - 1).toString().padStart(4, '0')}`);

} catch (error) {
    console.error('Error:', error);
}
