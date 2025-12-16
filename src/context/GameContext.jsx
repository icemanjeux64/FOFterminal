import React, { createContext, useContext, useState, useEffect } from 'react';
import playersData from '../data/players.json';
import formationsData from '../data/formations.json';

const GameContext = createContext();

// --------------------------------------------------------------------------
// CLÉS DE STOCKAGE LOCAL (LOCAL STORAGE)
// Ces clés définissent où sont sauvegardées les données dans le navigateur.
// --------------------------------------------------------------------------

// Storage Keys
const STORAGE_KEYS = {
    PLAYERS: 'fof_players',
    SESSIONS: 'fof_sessions_v2', // Changed key to ensure clean break from potentially mixed data
    MISSIONS: 'fof_missions',
    POLES: 'fof_poles',
    AUTH: 'fof_auth',
    OVERRIDES: 'fof_roles',
    SQUADS_LIVE: 'fof_squads_live',
    SQUAD_REGISTRY: 'fof_squad_registry',
    SERVICE_HISTORY: 'fof_service_history',
    ARCHIVES: 'fof_archives',
    SANCTIONS: 'fof_sanctions'
};

// --------------------------------------------------------------------------
// PROVIDER PRINCIPAL
// C'est le cœur de l'application qui gère toutes les données (État Global).
// --------------------------------------------------------------------------
export const GameProvider = ({ children }) => {
    // --- DÉFINITION DES ÉTATS (STATES) ---
    // Chaque 'useState' correspond à une base de données locale.
    const [allPlayers, setAllPlayersData] = useState([]);
    const [trainingSessions, setTrainingSessionsData] = useState([]);
    const [missions, setMissionsData] = useState([]);
    const [polesData, setPolesData] = useState({});
    const [credentials, setCredentials] = useState({});
    const [roleOverrides, setRoleOverrides] = useState({});
    const [squads, setSquadsData] = useState([]);
    const [sanctions, setSanctionsData] = useState([]);
    const [staff, setStaff] = useState([
        { id: 'em1', role: 'EM TITULAIRE', name: null, time: null, isTaken: false },
        { id: 'em2', role: 'ADJOINT EM', name: null, time: null, isTaken: false },
        { id: 'stg1', role: 'STAGIAIRE', name: null, time: null, isTaken: false },
    ]);
    const [squadRegistry, setSquadRegistry] = useState([]);
    const [archives, setArchives] = useState([]);
    const [serviceHistory, setServiceHistory] = useState([]);

    // --- DEFAULTS ---
    const DEFAULT_POLES = {
        "Etat Major": { color: "amber", roles: ["Commandant", "Capitaine", "Lieutenant", "Major"], objectives: [], notes: "" },
        "Instruction": { color: "purple", roles: ["Instructeur", "Moniteur"], objectives: [], notes: "" },
        "Opérations": { color: "blue", roles: ["Chef de Section", "Squad Leader"], objectives: [], notes: "" },
        "Logistique": { color: "emerald", roles: ["Chef Logistique"], objectives: [], notes: "" }
    };

    const DEFAULT_SQUAD_REGISTRY = [
        { id: 'def_alpha', name: 'Alpha', color: "bg-emerald-700 border-emerald-800 text-white", freq: "32.0", type: 'infantry' },
        { id: 'def_bravo', name: 'Bravo', color: "bg-blue-700 border-blue-800 text-white", freq: "33.0", type: 'infantry' },
        { id: 'def_charlie', name: 'Charlie', color: "bg-purple-800 border-purple-900 text-white", freq: "34.0", type: 'infantry' },
        { id: 'def_delta', name: 'Delta', color: "bg-yellow-500 border-yellow-600 text-white", freq: "35.0", type: 'infantry' },
        { id: 'def_echo', name: 'Echo', color: "bg-cyan-500 border-cyan-600 text-white", freq: "36.0", type: 'infantry' },
        { id: 'def_foxtrot', name: 'Foxtrot', color: "bg-orange-600 border-orange-700 text-white", freq: "37.0", type: 'infantry' },
        { id: 'def_golf', name: 'Golf', color: "bg-pink-600 border-pink-700 text-white", freq: "38.0", type: 'infantry' },
        { id: 'def_hotel', name: 'Hotel', color: "bg-slate-700 border-slate-800 text-white", freq: "39.0", type: 'infantry' },
        { id: 'def_india', name: 'India', color: "bg-red-800 border-red-900 text-white", freq: "40.0", type: 'infantry' },
        { id: 'def_juliette', name: 'Juliette', color: "bg-stone-600 border-stone-700 text-white", freq: "41.0", type: 'infantry' },
        { id: 'def_kilo', name: 'Kilo', color: "bg-green-400 border-green-500 text-white", freq: "42.0", type: 'infantry' },
        { id: 'def_lima', name: 'Lima', color: "bg-purple-400 border-purple-500 text-white", freq: "43.0", type: 'infantry' },
        { id: 'def_mike', name: 'Mike', color: "bg-sky-400 border-sky-500 text-white", freq: "44.0", type: 'infantry' },
        // Support
        { id: 'def_logi', name: 'Logistique', color: "bg-black border-slate-700 text-white", freq: "45.0", type: 'support' },
        { id: 'def_planton', name: 'Planton', color: "bg-amber-800 border-amber-900 text-white", freq: "52.0", type: 'special' },
        // Op Support
        { id: 'def_blinde', name: 'Blindé', color: "bg-slate-700 border-slate-800 text-white", freq: "65.0", type: 'armor' },
        { id: 'def_faucon', name: 'Faucon', color: "bg-slate-700 border-slate-800 text-white", freq: "47.0", type: 'air' },
        { id: 'def_tigre', name: 'Tigre', color: "bg-slate-700 border-slate-800 text-white", freq: "47.5", type: 'air' },
        { id: 'def_mortier', name: 'Mortier', color: "bg-rose-900 border-rose-950 text-white", freq: "49.0", type: 'support' }
    ];

    // --------------------------------------------------------------------------
    // INITIALISATION & CHARGEMENT DES DONNÉES
    // Au démarrage, on tente de lire le LocalStorage.
    // Si vide, on utilise les fichiers JSON (data/...) ou les valeurs par défaut.
    // --------------------------------------------------------------------------
    useEffect(() => {
        const loadFromStorage = (key, setter, defaultVal = null) => {
            try {
                const stored = localStorage.getItem(key);
                if (stored) {
                    setter(JSON.parse(stored));
                    return true;
                }
            } catch (e) {
                console.error(`Failed to load ${key}`, e);
            }
            if (defaultVal) {
                setter(defaultVal);
                // We don't save immediately, the useEffects downstream will handle it
            }
            return false;
        };

        // 1. Players
        if (!loadFromStorage(STORAGE_KEYS.PLAYERS, setAllPlayersData)) {
            // Seed from JSON
            console.log("Seeding Players from JSON...");
            // Sanitize players data
            const sanitized = playersData.map(p => {
                let s = { ...p };
                let roleAsGrade = p.roles.find(r => r && r.match(/Caporal-Chef.*1.*Classe/i));
                if (roleAsGrade) {
                    s.grade = "Caporal-Chef de 1re Classe";
                    s.roles = p.roles.filter(r => r !== roleAsGrade);
                }
                return s;
            });
            setAllPlayersData(sanitized);
        }

        // 2. Sessions (Seed from history)
        if (!loadFromStorage(STORAGE_KEYS.SESSIONS, setTrainingSessionsData)) {
            console.log("Seeding Sessions from Formations JSON...");
            const sessionsMap = {};
            formationsData.forEach(playerRecord => {
                if (playerRecord.formations) {
                    playerRecord.formations.forEach(f => {
                        const key = `${f.date}_${f.type}`;
                        if (!sessionsMap[key]) {
                            const parts = f.date.split('/');
                            let dateIso = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : f.date;
                            sessionsMap[key] = {
                                id: `legacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                moduleId: "999",
                                moduleTitle: f.type,
                                date: dateIso,
                                time: "21:00",
                                instructor: "Archives",
                                status: "Validated",
                                attendees: []
                            };
                        }
                        if (!sessionsMap[key].attendees.includes(playerRecord.nom)) {
                            sessionsMap[key].attendees.push(playerRecord.nom);
                        }
                    });
                }
            });
            const sessionsList = Object.values(sessionsMap).sort((a, b) => new Date(b.date) - new Date(a.date));
            setTrainingSessionsData(sessionsList);
        }

        // 3. Other Data
        loadFromStorage(STORAGE_KEYS.MISSIONS, setMissionsData, []);
        loadFromStorage(STORAGE_KEYS.POLES, setPolesData, DEFAULT_POLES);
        loadFromStorage(STORAGE_KEYS.AUTH, setCredentials, {});
        loadFromStorage(STORAGE_KEYS.OVERRIDES, setRoleOverrides, {});
        loadFromStorage(STORAGE_KEYS.SQUADS_LIVE, setSquadsData, []);
        loadFromStorage(STORAGE_KEYS.SQUAD_REGISTRY, setSquadRegistry, DEFAULT_SQUAD_REGISTRY);
        loadFromStorage(STORAGE_KEYS.SERVICE_HISTORY, setServiceHistory, []);
        loadFromStorage(STORAGE_KEYS.ARCHIVES, setArchives, []);
        loadFromStorage(STORAGE_KEYS.SANCTIONS, setSanctionsData, []);

    }, []);

    // --------------------------------------------------------------------------
    // PERSISTANCE AUTOMATIQUE
    // Dès qu'une donnée change (allPlayers, missions, etc.),
    // elle est automatiquement sauvegardée dans le navigateur.
    // --------------------------------------------------------------------------
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(allPlayers)); }, [allPlayers]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(trainingSessions)); }, [trainingSessions]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions)); }, [missions]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.POLES, JSON.stringify(polesData)); }, [polesData]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(credentials)); }, [credentials]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(roleOverrides)); }, [roleOverrides]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.SQUADS_LIVE, JSON.stringify(squads)); }, [squads]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.SQUAD_REGISTRY, JSON.stringify(squadRegistry)); }, [squadRegistry]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.SERVICE_HISTORY, JSON.stringify(serviceHistory)); }, [serviceHistory]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(archives)); }, [archives]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.SANCTIONS, JSON.stringify(sanctions)); }, [sanctions]);

    // --------------------------------------------------------------------------
    // ACTIONS & FONCTIONS DU JEU
    // Methodes pour modifier les données depuis les autres pages.
    // --------------------------------------------------------------------------

    const updatePlayer = (id, data) => {
        setAllPlayersData(prev => prev.map(p => String(p.id) === String(id) ? { ...p, ...data } : p));
    };

    const addSession = (session) => {
        const newSession = { ...session, id: session.id || Date.now() };
        setTrainingSessionsData(prev => [newSession, ...prev]);
    };

    const updateSession = (id, data) => {
        setTrainingSessionsData(prev => prev.map(s => String(s.id) === String(id) ? { ...s, ...data } : s));
    };

    const updateMission = (id, data) => {
        setMissionsData(prev => prev.map(m => String(m.id) === String(id) ? { ...m, ...data } : m));
    };

    const createCredentials = (matricule, password) => {
        setCredentials(prev => ({ ...prev, [matricule]: password }));
    };

    const updatePoles = (data) => {
        setPolesData(data);
    };

    const updateSquadRegistry = (newRegistry) => {
        setSquadRegistry(newRegistry);
    };

    const resetSquadRegistry = () => {
        if (confirm("Réinitialiser le registre des unités aux valeurs par défaut ?")) {
            setSquadRegistry(DEFAULT_SQUAD_REGISTRY);
        }
    };

    const addServiceEntry = (entry) => {
        setServiceHistory(prev => [entry, ...prev]);
    };

    // --- LOGISTICS (Ephemeral) ---
    const [logs, setLogs] = useState([]);
    const [fleet, setFleet] = useState([]);
    const [supplyLocations, setSupplyLocations] = useState([{ id: 'base_main', name: 'Base Principale', amount: 6000 }]);
    const [service, setService] = useState({ active: false, officer: '', grade: '', start: null, end: null });
    const [roster, setRoster] = useState([]);
    const [chat, setChat] = useState([]);
    const addLogisticsLog = (type, message, details = '') => {
        const newLog = { id: Date.now(), time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), type, message, details };
        setLogs(prev => [newLog, ...prev].slice(0, 100));
    };

    // --------------------------------------------------------------------------
    // LOGIQUE D'AUTHENTIFICATION
    // Gestion de la connexion, du rôle (Admin/Soldat) et de la session.
    // --------------------------------------------------------------------------
    const [authenticatedUser, setAuthenticatedUser] = useState(() => {
        try {
            const saved = localStorage.getItem('fof_auth_user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) { return null; }
    });

    const [currentUserRole, setCurrentUserRole] = useState(() => {
        try {
            const saved = localStorage.getItem('fof_auth_user');
            if (saved) {
                const user = JSON.parse(saved);
                return user.roles && user.roles.includes('Admin') ? 'ADMIN' : 'SOLDIER';
            }
        } catch (e) { }
        return 'SOLDIER';
    });

    const getCredentials = (matricule) => credentials[matricule];

    const login = (player, password) => {
        const performLogin = () => {
            setAuthenticatedUser(player);
            const role = player.roles && player.roles.includes('Admin') ? 'ADMIN' : 'SOLDIER';
            setCurrentUserRole(role);
            localStorage.setItem('fof_auth_user', JSON.stringify(player));
        };

        if (password) {
            if (credentials[player.matricule] === password) {
                performLogin();
                return true;
            }
            return false;
        }
        performLogin();
        return true;
    };
    const logout = () => {
        setAuthenticatedUser(null);
        localStorage.removeItem('fof_auth_user');
    };

    // --------------------------------------------------------------------------
    // DONNÉES STATIQUES
    // Liste des modules de formation disponibles (Fixe).
    // --------------------------------------------------------------------------
    const [trainingModules] = useState([
        { id: 'fmt_recrue', title: "Formation Recrue", minRank: "Recrue", slots: 10, duration: "2h00", description: "Formation initiale pour les nouvelles recrues." },
        { id: 'fmt_medic_v1', title: "Formation Medic V1 (Infirmier)", minRank: "Soldat", slots: 6, duration: "1h30", description: "Soins de base et stabilisation." },
        { id: 'fmt_tc1', title: "Formation TC1 (Tireur/Conducteur)", minRank: "Soldat", slots: 4, duration: "1h30", description: "Conduite et usage de l'armement embarqué léger." },
        { id: 'fmt_logi', title: "Formation Logistique", minRank: "Soldat", slots: 4, duration: "1h00", description: "Transport, ravitaillement et construction." },
        { id: 'fmt_medic_v2', title: "Formation Medic V2 (Médecin)", minRank: "1ere Classe", slots: 4, duration: "2h00", description: "Procédures médicales avancées." },
        { id: 'fmt_at', title: "Formation AT (Anti-Tank)", minRank: "1ere Classe", slots: 4, duration: "1h30", description: "Usage des lanceurs lourds et tactiques antichar." },
        { id: 'fmt_minimi', title: "Formation Minimi", minRank: "1ere Classe", slots: 4, duration: "1h00", description: "Maîtrise de la mitrailleuse légère." },
        { id: 'fmt_lg', title: "Formation LG (Lance-Grenade)", minRank: "1ere Classe", slots: 4, duration: "1h00", description: "Usage efficace du lance-grenade." },
        { id: 'fmt_alat_v1', title: "Formation Pilote (Alat V1)", minRank: "1ere Classe", slots: 2, duration: "2h00", description: "Pilotage hélicoptère transport." },
        { id: 'fmt_sl', title: "Formation SL (Squad Leader)", minRank: "Caporal", slots: 4, duration: "2h30", description: "Commandement, communication et gestion d'escouade." },
        { id: 'fmt_alat_v2', title: "Formation Pilote (Alat V2)", minRank: "Caporal", slots: 2, duration: "2h00", description: "Pilotage hélicoptère attaque/CAS." },
        { id: 'fmt_mortier', title: "Formation Mortier", minRank: "Caporal", slots: 3, duration: "1h30", description: "Calcul de tir et servant mortier." },
        { id: 'fmt_reco', title: "Formation Reco", minRank: "Caporal", slots: 4, duration: "2h00", description: "Reconnaissance et infiltration." },
        { id: 'fmt_tp', title: "Formation TP (Tireur Précision)", minRank: "Soldat", slots: 2, duration: "1h30", description: "Tir longue distance et observation." },
        { id: 'fmt_cqb', title: "Formation CQB", minRank: "Soldat", slots: 6, duration: "1h30", description: "Combat rapproché et nettoyage de bâtiments." },
        { id: 'fmt_tc2', title: "Formation TC2", minRank: "Soldat", slots: 4, duration: "1h30", description: "Blindés lourds et tactiques mécanisées." },
    ]);

    const value = {
        allPlayers, updatePlayer,
        trainingSessions, updateSession, addSession,
        missions, updateMission,
        polesData, updatePoles,
        credentials, createCredentials, getCredentials,
        squads, setSquads: setSquadsData,
        squadRegistry, updateSquadRegistry, resetSquadRegistry,
        staff, setStaff,
        archives, setArchives,
        serviceHistory, addServiceEntry,
        sanctions,
        authenticatedUser, login, logout, currentUserRole,
        trainingModules,

        // Logistics
        fleet, setFleet,
        logs, setLogs, addLogisticsLog,
        supplyLocations, setSupplyLocations,
        service, setService,
        roster, setRoster,
        chat, setChat,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within a GameProvider');
    return context;
};
