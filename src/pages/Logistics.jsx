import React, { useState, useMemo, useEffect } from 'react';
import {
    Shield, Save, RotateCcw, Box, Flame, History, Warehouse, Car, Plus,
    AlertTriangle, HeartPulse, Wrench, MapPin, Info, Clock, UserCheck,
    Users, LogOut, ChevronDown, ChevronUp, Trash2, Edit2, Lock,
    RefreshCw, Fuel, CheckCircle, Star, Radio, Send, X
} from 'lucide-react';
import './Logistics.css';
import { useGame } from '../context/GameContext';

// --- CONSTANTES ---
const RANK_OPTIONS = ["Recrue", "2CL", "1CL", "CPL", "CCH", "SGT", "SCH", "ADJ", "ADC", "ASP", "SLT", "LTN", "CNE"];

const RANK_SHORT = {
    "Recrue": "REC", "2CL": "2CL", "1CL": "1CL", "CPL": "CPL", "CCH": "CCH",
    "SGT": "SGT", "SCH": "SCH", "ADJ": "ADJ", "ADC": "ADC", "ASP": "ASP",
    "SLT": "SLT", "LTN": "LTN", "CNE": "CNE"
};

const groupsConfig = {
    'em': { label: 'Commandement', color: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500' },
    'logi': { label: 'Logistique', color: 'bg-fuchsia-500', text: 'text-fuchsia-400', border: 'border-fuchsia-500' },
    'transport': { label: 'Transport', color: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' },
    'blinde': { label: 'Blindés', color: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500' },
    'infanterie': { label: 'Combat', color: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500' },
    'sanitaire': { label: 'Sanitaire', color: 'bg-green-400', text: 'text-green-400', border: 'border-green-400' },
    'char': { label: 'Chars', color: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-600' },
    'alat': { label: 'ALAT', color: 'bg-sky-500', text: 'text-sky-400', border: 'border-sky-500' },
};

const garageCatalog = [
    { id: 'cat_em1', type: 'Jeep EM', group: 'em', cost: 110, seats: ['Conducteur', 'Passager'] },
    { id: 'cat_em2', type: 'QG Mobile', group: 'em', cost: 420, seats: ['Conducteur', 'Passager 1', 'Passager 2'] },

    // LOGI
    { id: 'cat_log1', type: 'Camion Réparation', group: 'logi', cost: 175, seats: ['Conducteur', 'Passager 1', 'Passager 2'] },
    { id: 'cat_log2', type: 'Camion Citerne', group: 'logi', cost: 160, seats: ['Conducteur', 'Passager 1', 'Passager 2'] },
    { id: 'cat_log3', type: 'Camion Arsenal', group: 'logi', cost: 380, seats: ['Conducteur', 'Passager 1', 'Passager 2'] },
    { id: 'cat_log4', type: 'Camion Construction', group: 'logi', cost: 260, seats: ['Conducteur', 'Passager 1', 'Passager 2'] },

    // TRANSPORT
    { id: 'cat_tra1', type: 'Camion', group: 'transport', cost: 200, seats: ['Conducteur', 'Passager 1', 'Passager 2'] },
    { id: 'cat_tra2', type: 'VAB', group: 'transport', cost: 1200, seats: ['Conducteur', 'Passager'] },
    { id: 'cat_tra3', type: 'Stryker (non armé)', group: 'transport', cost: 1000, seats: ['Conducteur', 'Passager'] },
    { id: 'cat_inf1', type: 'Stryker M1126 - M2HB', group: 'transport', cost: 2000, seats: ['Conducteur', 'Tireur'] },

    // BLINDE
    { id: 'cat_bl1', type: 'JLTV M1280 (non-armée)', group: 'blinde', cost: 650, seats: ['Conducteur', 'Passager'] },
    { id: 'cat_bl2', type: 'JLTV M1281 - M2HB (12,7)', group: 'blinde', cost: 1000, seats: ['Conducteur', 'Tireur'] },
    { id: 'cat_bl3', type: 'JLTV M1281 - M134 (7,62)', group: 'blinde', cost: 2000, seats: ['Conducteur', 'Tireur'] },
    { id: 'cat_bl4', type: 'JLTV M1278 - M2HB (télé)', group: 'blinde', cost: 1500, seats: ['Conducteur', 'Tireur'] },
    { id: 'cat_bl5', type: 'JLTV AN-MSY-2 v2 (7,62 télé)', group: 'blinde', cost: 2760, seats: ['Conducteur', 'Tireur'] },
    { id: 'cat_bl6', type: 'JLTV M1278 - M230LF (30mm)', group: 'blinde', cost: 2750, seats: ['Conducteur', 'Tireur'] },
    { id: 'cat_bl7', type: 'JLTV M1278 + Javelin', group: 'blinde', cost: 3700, seats: ['Conducteur', 'Tireur'] },
    { id: 'cat_bl8', type: 'JLTV AN-MSY-2 v1 (Stinger)', group: 'blinde', cost: 3700, seats: ['Conducteur', 'Tireur'] },

    // INFANTERIE
    { id: 'cat_inf2', type: 'Stryker M1296 (30mm)', group: 'infanterie', cost: 3000, seats: ['Conducteur', 'Tireur', 'Commandant'] },
    { id: 'cat_inf3', type: 'Stryker M1128 (105mm)', group: 'infanterie', cost: 5000, seats: ['Conducteur', 'Tireur'] },

    // SANITAIRE
    { id: 'cat_san1', type: 'Stryker EVASAN', group: 'sanitaire', cost: 975, seats: ['Conducteur', 'Médecin'] },
    { id: 'cat_san2', type: 'VAB EVASAN', group: 'sanitaire', cost: 975, seats: ['Conducteur', 'Médecin'] },

    // CHAR
    { id: 'cat_char1', type: 'Leclerc', group: 'char', cost: 8000, seats: ['Conducteur', 'Tireur', 'Commandant'] },
    { id: 'cat_char2', type: 'Leclerc XLR', group: 'char', cost: 8500, seats: ['Conducteur', 'Tireur', 'Commandant'] },

    // ALAT
    { id: 'cat_air1', type: 'NH90 "Faucon" MEDEVAC', group: 'alat', cost: 3000, seats: ['Pilote', 'Co-Pilote', 'Médecin 1', 'Médecin 2'] },
    { id: 'cat_air2', type: 'NH90 "Faucon" Transport', group: 'alat', cost: 3000, seats: ['Pilote', 'Co-Pilote'] },
    { id: 'cat_air3', type: 'Gazelle SA342L (non-armée)', group: 'alat', cost: 2500, seats: ['Pilote', 'Co-Pilote'] },
    { id: 'cat_air4', type: 'Gazelle SA342L Strike (M82)', group: 'alat', cost: 3000, seats: ['Pilote', 'Co-Pilote'] },
    { id: 'cat_air5', type: 'Gazelle SA342L Canon (20mm)', group: 'alat', cost: 3500, seats: ['Pilote', 'Co-Pilote'] },
    { id: 'cat_air6', type: 'Gazelle SA342L HAP (Roq 68)', group: 'alat', cost: 3500, seats: ['Pilote', 'Co-Pilote'] },
    { id: 'cat_air7', type: 'EC665 Tigre', group: 'alat', cost: 7000, seats: ['Pilote', 'Co-Pilote'] },
];

export default function Logistics() {
    // CONTEXT
    const {
        fleet, setFleet,
        logs, setLogs, addLogisticsLog,
        chat, setChat,
        service, setService,
        supplyLocations, setSupplyLocations,
        roster, setRoster,
        squads, setSquads, // IMPORT SQUADS FROM CONTEXT
        archives, setArchives,
        allPlayers
    } = useGame();

    // Local UI State
    const [activeTab, setActiveTab] = useState('fleet');
    const [showDashboard, setShowDashboard] = useState(true);

    // Simulating connected user
    const [user] = useState({ uid: 'local_admin', name: 'Admin' });

    // Responsive check
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Expanded states
    const [expandedVehicles, setExpandedVehicles] = useState([]);
    const toggleVehicleExpansion = (id) => {
        if (isDesktop) return;
        setExpandedVehicles(prev => prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]);
    };

    // Modals
    const [destroyModal, setDestroyModal] = useState({ isOpen: false, vehicleId: null });
    const [destroyReason, setDestroyReason] = useState('');
    const [destroyReporter, setDestroyReporter] = useState('');
    const [serviceModal, setServiceModal] = useState({ isOpen: false, officer: '', grade: '' });
    const [supplyModal, setSupplyModal] = useState({ isOpen: false });
    const [missionModal, setMissionModal] = useState({ isOpen: false, vehicleId: null, details: '' });
    const [returnModal, setReturnModal] = useState({ isOpen: false, vehicleId: null, report: '', fuel: 100, integrity: 100, needsMaintenance: false });
    const [maintenanceModal, setMaintenanceModal] = useState({ isOpen: false, vehicleId: null });

    // Chat
    const [chatOpen, setChatOpen] = useState(false);
    const [chatIdentity, setChatIdentity] = useState('');
    const [newPerson, setNewPerson] = useState({ name: '', grade: 'Recrue' });
    const [newSupply, setNewSupply] = useState({ name: '', amount: 0 });
    const [newMessage, setNewMessage] = useState('');
    const [showRules, setShowRules] = useState(false);

    // Objective Acknowledge State
    const [lastAckObj, setLastAckObj] = useState('');

    // Find Logi Squad
    const logiSquad = squads.find(s => s.name === 'Logistique');
    const hasNewOrder = logiSquad && logiSquad.obj1 && logiSquad.obj1 !== lastAckObj;

    // Permissions
    const isSL = useMemo(() => {
        if (!service.active) return true;
        return service.ownerUid === user?.uid;
    }, [service, user]);

    // Actions
    const addLog = addLogisticsLog;

    const deleteLog = (logId) => {
        if (window.confirm("Supprimer ?")) setLogs(prev => prev.filter(l => l.id !== logId));
    };

    const sendChatMessage = () => {
        if (!newMessage.trim()) return;
        let senderName = "Inconnu";
        if (isSL) {
            senderName = "Commandement (SL)";
        } else if (chatIdentity) {
            senderName = chatIdentity;
        } else {
            alert("Veuillez sélectionner votre identité dans la liste avant de parler.");
            return;
        }

        const msgData = {
            id: Date.now(),
            text: newMessage,
            sender: senderName,
            timestamp: Date.now()
        };
        setChat(prev => [...prev, msgData]);
        setNewMessage('');
    };

    const deployVehicle = (vehicleModel) => {
        if (!isSL) return;
        const newId = Date.now();
        const prefix = vehicleModel.type.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
        const num = fleet.length + 1;
        const matricule = `${prefix}-${num.toString().padStart(3, '0')}`;
        const newVehicle = {
            uniqueId: newId,
            ...vehicleModel,
            callsign: matricule,
            status: 'Opérationnel',
            statusSince: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            crew: {},
            seats: vehicleModel.seats || ['Conducteur', 'Passager'],
            fuel: 100,
            integrity: 100,
            missionDetails: '',
            returnReport: ''
        };
        setFleet(prev => [...prev, newVehicle]);
        addLog('deploy', `DÉPLOIEMENT: ${newVehicle.type}`, `Matricule: ${matricule}`);
    };

    const updateSeat = (vehicleId, seatName, personName) => {
        setFleet(prev => prev.map(v => {
            if (v.uniqueId === vehicleId) {
                const newCrew = { ...v.crew, [seatName]: personName };
                if (personName === "") delete newCrew[seatName];
                // Log effect
                if (personName) {
                    addLog('info', `AFFECTATION: ${v.callsign}`, `${personName} -> ${seatName}`);
                }
                return { ...v, crew: newCrew };
            }
            return v;
        }));
    };

    const getSafeSeats = (vehicle) => {
        if (vehicle.seats) return vehicle.seats;
        const model = garageCatalog.find(c => c.type === vehicle.type);
        return model ? model.seats : ['Conducteur', 'Passager'];
    };

    const getVehicleBoss = (vehicle) => {
        if (!vehicle.crew) return "N/A";
        if (vehicle.group === 'alat') return vehicle.crew['Pilote'] || "N/A";
        return vehicle.crew['Commandant'] ||
            vehicle.crew['Chef de Bord'] ||
            vehicle.crew['Passager 1'] ||
            vehicle.crew['Passager'] ||
            vehicle.crew['Tireur'] ||
            vehicle.crew['Médecin'] ||
            vehicle.crew['Conducteur'] || "N/A";
    };

    const isSeatBoss = (vehicle, seatName) => {
        if (vehicle.group === 'alat') return seatName === 'Pilote';
        const priority = ['Commandant', 'Chef de Bord', 'Passager 1', 'Passager', 'Tireur', 'Médecin', 'Conducteur'];
        const seats = getSafeSeats(vehicle);
        const bossSeat = priority.find(s => seats.includes(s));
        return seatName === bossSeat;
    };

    const handleStatusChangeAttempt = (vehicleId, targetStatus) => {
        const vehicle = fleet.find(v => v.uniqueId === vehicleId);
        if (!vehicle) return;

        if (targetStatus === 'En Mission') {
            setMissionModal({ isOpen: true, vehicleId, details: '' });
            return;
        }
        if (vehicle.status === 'En Mission' && targetStatus === 'Opérationnel') {
            setReturnModal({ isOpen: true, vehicleId, report: '', fuel: vehicle.fuel, integrity: vehicle.integrity });
            return;
        }
        if (vehicle.status === 'Maintenance' && targetStatus === 'Opérationnel') {
            setMaintenanceModal({ isOpen: true, vehicleId, fuel: vehicle.fuel, integrity: vehicle.integrity });
            return;
        }
        if (targetStatus === 'Garage') {
            if (!isSL) { alert("Seul le SL peut rentrer un véhicule au garage."); return; }
            setFleet(prev => prev.filter(item => item.uniqueId !== vehicleId));
            addLog('info', `RETOUR PARC: ${vehicle.callsign}`, `Retour opérationnel.`);
            return;
        }
        if (targetStatus === 'Détruit') {
            setDestroyModal({ isOpen: true, vehicleId });
            return;
        }

        // Default update
        setFleet(prev => prev.map(v => v.uniqueId === vehicleId ? { ...v, status: targetStatus } : v));
    };

    const confirmMissionStart = () => {
        const { vehicleId, details } = missionModal;
        const vehicle = fleet.find(v => v.uniqueId === vehicleId);
        const boss = getVehicleBoss(vehicle);
        setFleet(prev => prev.map(v => v.uniqueId === vehicleId ? { ...v, status: 'En Mission', missionDetails: details } : v));
        addLog('mission', `DÉPART MISSION: ${vehicle.callsign}`, `Obj: ${details} | Resp: ${boss}`);
        setMissionModal({ isOpen: false, vehicleId: null, details: '' });
    };

    const confirmMissionReturn = () => {
        const { vehicleId, report, fuel, integrity, needsMaintenance } = returnModal;
        const vehicle = fleet.find(v => v.uniqueId === vehicleId);

        let newStatus = 'Opérationnel';
        // User overrides logic with checkbox, OR auto-detect if critical
        if (needsMaintenance || parseInt(integrity) < 100 || parseInt(fuel) < 20) {
            newStatus = 'Maintenance';
        }

        setFleet(prev => prev.map(v => v.uniqueId === vehicleId ? {
            ...v, status: newStatus, returnReport: report, fuel: parseInt(fuel), integrity: parseInt(integrity)
        } : v));

        addLog('info', `RETOUR MISSION: ${vehicle.callsign}`, `Rapport: ${report} | État: ${integrity}% | Essence: ${fuel}%`);
        if (newStatus === 'Maintenance') addLog('alert', `MAINTENANCE: ${vehicle.callsign}`, needsMaintenance ? "Demandée par équipage" : "Dégâts/Panne détectés.");
        setReturnModal({ isOpen: false, vehicleId: null, report: '', fuel: 100, integrity: 100, needsMaintenance: false });
    };

    const confirmMaintenanceFix = () => {
        const { vehicleId } = maintenanceModal;
        const vehicle = fleet.find(v => v.uniqueId === vehicleId);
        setFleet(prev => prev.map(v => v.uniqueId === vehicleId ? { ...v, status: 'Opérationnel', fuel: 100, integrity: 100 } : v));
        addLog('info', `SORTIE ATELIER: ${vehicle.callsign}`, `Réparations et ravitaillement effectués.`);
        setMaintenanceModal({ isOpen: false, vehicleId: null });
    };

    const confirmDestruction = () => {
        if (!destroyReporter) { alert("Veuillez sélectionner le personnel déclarant."); return; }
        const v = fleet.find(item => item.uniqueId === destroyModal.vehicleId);
        if (!v) return;
        setFleet(prev => prev.filter(item => item.uniqueId !== destroyModal.vehicleId));
        addLog('destroy', `PERTE TOTALE: ${v.callsign}`, `Déclarant: ${destroyReporter} | Cause: ${destroyReason}`);
        setDestroyModal({ isOpen: false, vehicleId: null });
        setDestroyReason('');
        setDestroyReporter('');
    };

    // --- EM SYNCHRONIZATION HELPERS ---
    const syncLogisticsSquad = (slName = null, rosterCount = null) => {
        setSquads(prev => {
            const existingIndex = prev.findIndex(s => s.name === 'Logistique');
            const currentRosterCount = rosterCount !== null ? rosterCount : roster.length;
            const currentSL = slName !== null ? slName : (service.active ? service.officer : '');

            // Calculate total effectives (SL + Roster)
            const totalEffectives = (currentSL ? 1 : 0) + currentRosterCount;

            if (existingIndex > -1) {
                // Update existing squad
                const newSquads = [...prev];
                newSquads[existingIndex] = {
                    ...newSquads[existingIndex],
                    sl: currentSL || 'Non Assigné', // Keep track even if no SL
                    effectives: totalEffectives,
                    status: currentSL ? 'DEPLOYED' : newSquads[existingIndex].status
                };
                return newSquads;
            } else {
                // Create new squad if it doesn't exist and we have activity
                if (currentSL || currentRosterCount > 0) {
                    return [...prev, {
                        id: Date.now(),
                        name: 'Logistique',
                        freq: '45.0 MHz',
                        type: 'support',
                        sl: currentSL || 'Non Assigné',
                        effectives: totalEffectives,
                        obj1: 'SOUTIEN GÉNÉRAL',
                        obj2: '',
                        status: 'DEPLOYED',
                        timeStart: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                        remarks: 'Unité Logistique'
                    }];
                }
                return prev;
            }
        });
    };

    const addPersonnel = () => {
        if (!newPerson.name) return;
        setRoster(prev => {
            const newRoster = [...prev, { id: Date.now(), ...newPerson }];
            // Sync with EM (using new length)
            syncLogisticsSquad(null, newRoster.length);
            return newRoster;
        });
        addLog('info', `ARRIVÉE EFFECTIF`, `${newPerson.grade} ${newPerson.name} - Prise de service`);
        setNewPerson({ name: '', grade: 'Recrue' });
    };

    const removePersonnel = (id) => {
        const person = roster.find(p => p.id === id);
        setRoster(prev => {
            const newRoster = prev.filter(p => p.id !== id);
            // Sync with EM
            syncLogisticsSquad(null, newRoster.length);
            return newRoster;
        });
        if (person) addLog('info', `FIN DE SERVICE`, `${person.grade} ${person.name}`);
    };

    const addSupplyLocation = () => {
        if (isSL && newSupply.name && newSupply.amount) {
            setSupplyLocations(prev => [...prev, { id: Date.now(), name: newSupply.name, amount: parseInt(newSupply.amount) }]);
            setNewSupply({ name: '', amount: 0 });
        }
    };

    const removeSupplyLocation = (id) => {
        if (isSL) setSupplyLocations(prev => prev.filter(l => l.id !== id));
    };

    const handleServiceStart = () => {
        if (!serviceModal.officer) return;
        const startTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        setService({ ...service, active: true, officer: serviceModal.officer, grade: serviceModal.grade, start: startTime, end: null, ownerUid: user.uid });
        addLog('info', `SUPERVISION (SL)`, `Prise de commandement: ${serviceModal.grade} ${serviceModal.officer}`);

        // Sync with EM
        syncLogisticsSquad(serviceModal.officer, null);

        // Add to Archives (History)
        setArchives(prev => [{
            id: Date.now(),
            squadId: 'logistics_unit', // Static ID for simplicty or track real one
            squadName: 'Logistique',
            sl: serviceModal.officer,
            timeStart: startTime,
            timeEnd: null
        }, ...prev]);

        setServiceModal({ isOpen: false, officer: '', grade: '' });
    };

    const handleServiceEnd = () => {
        if (!isSL) return;
        const endTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        setService({ ...service, active: false, officer: '', grade: '', start: null, end: endTime, ownerUid: null });
        addLog('info', `FIN SUPERVISION`, `Fin de service SL. (Fin: ${endTime})`);

        // Sync with EM (remove SL)
        syncLogisticsSquad('', null);

        // Close Archive Entry
        setArchives(prev => prev.map(a =>
            a.squadName === 'Logistique' && a.timeEnd === null
                ? { ...a, timeEnd: endTime }
                : a
        ));
    };

    const handleForceRecovery = () => {
        if (!window.confirm("Force Recovery ?")) return;
        setService(prev => ({ ...prev, ownerUid: user.uid }));
        addLog('alert', `REPRISE DE MAIN`, `Changement de propriétaire de session forcé.`);
    };

    const getFleetByGroup = (groupKey) => fleet.filter(v => {
        const catalogItem = garageCatalog.find(c => c.id === v.id);
        const actualGroup = catalogItem ? catalogItem.group : v.group;
        return actualGroup === groupKey;
    });

    const getGarageByGroup = (groupKey) => garageCatalog.filter(v => v.group === groupKey);
    const totalSupply = supplyLocations.reduce((acc, loc) => acc + (parseInt(loc.amount) || 0), 0);
    const activePersonnelCount = roster.length;

    const stats = useMemo(() => ({
        deployed: fleet.length,
        mission: fleet.filter(v => v.status === 'En Mission').length,
        operational: fleet.filter(v => v.status === 'Opérationnel').length,
        maintenance: fleet.filter(v => v.status === 'Maintenance').length,
        destroyed: logs.filter(l => l.type === 'destroy').length
    }), [fleet, logs]);

    return (
        <div className="logistics-container flex flex-col w-full font-sans relative text-slate-200">
            {/* ... header ... */}
            <header className="glass-panel z-30 flex flex-col shrink-0 border-b border-white relative">
                {/* ... top bar ... */}
                <div className="flex items-center justify-between px-4 py-3 relative z-10">
                    {/* ... existing header content ... */}
                    <div className="flex items-center gap-3">
                        <div className="hidden w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded border border-slate-700 items-center justify-center relative flex">
                            <Shield size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white font-tech uppercase leading-none tracking-wide">Logistique <span className="text-blue-500">FOF</span></h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowRules(!showRules)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded border border-slate-700 transition-all hover:bg-slate-700 flex items-center gap-2" title="Règlement">
                            <Info size={18} /> <span className="hidden md:inline text-xs font-bold uppercase">Règlement</span>
                        </button>
                        <button onClick={() => setShowDashboard(!showDashboard)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded border border-slate-700 transition-all hover:bg-slate-700">
                            {showDashboard ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    </div>
                </div>

                {/* ... Rules and Dashboard ... */}
                {showRules && (
                    <div className="bg-slate-900 border-y border-amber-500 p-4 animate-in text-slate-300 text-xs  z-20">
                        <h3 className="text-amber-500 font-bold uppercase mb-2 flex items-center gap-2"><AlertTriangle size={14} /> Rappel Procédures</h3>
                        <ul className="list-disc list-inside space-y-1.5 font-mono leading-relaxed">
                            <li><strong>1.</strong> Le SL Logi dirige l'équipe logistique sur fréquence 45/47 et coordonne ses actions avec l'Etat Major sur fréquence 46.</li>
                            <li><strong>2.</strong> Détermine les priorités des missions logistiques et assigne les effectifs en conséquence.</li>
                        </ul>
                    </div>
                )}

                {showDashboard && (
                    <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border-y border-white grid grid-cols-1 md:grid-cols-4 gap-4 p-4 animate-in  relative z-10">
                        {/* SL WIDGET */}
                        <div className="md:col-span-1 space-y-2 flex flex-col justify-center">
                            <div className="bg-slate-950 border border-blue-900 rounded p-4 h-full flex flex-col justify-center relative overflow-hidden group">
                                <span className="text-[10px] uppercase text-slate-500 font-bold mb-1">Commandement Logistique</span>
                                <div className="font-tech text-2xl font-bold text-white truncate">
                                    {service.active ? service.officer : 'AUCUN SL'}
                                </div>
                                <div className="text-sm font-mono text-blue-400">
                                    {service.active ? service.grade : '--'}
                                </div>
                                {!service.active ? (
                                    <button onClick={() => setServiceModal({ isOpen: true, officer: '', grade: '' })} className="mt-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 rounded font-bold uppercase text-xs flex items-center justify-center gap-2">
                                        Prise de Service
                                    </button>
                                ) : (
                                    isSL && <button onClick={handleServiceEnd} className="mt-2 text-red-400 hover:text-red-300 text-xs uppercase font-bold border border-red-500 rounded px-2 py-1">Fin Service</button>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2 flex flex-col justify-center">
                            <div className="grid grid-cols-2 gap-2 h-full">
                                <div className="bg-slate-950 border border-slate-800 rounded p-3 flex flex-col items-center justify-center">
                                    <span className="text-[10px] uppercase text-slate-400 font-bold mb-1 flex items-center gap-1"><Users size={10} /> Effectifs</span>
                                    <span className="text-4xl font-mono font-bold text-white tracking-tighter">{activePersonnelCount}</span>
                                </div>
                                <div
                                    onClick={() => { if (isSL) setSupplyModal({ isOpen: true }) }}
                                    className={`bg-slate-950 border border-slate-800 rounded p-3 flex flex-col items-center justify-center ${isSL ? 'hover:bg-slate-900 cursor-pointer' : ''}`}
                                >
                                    <span className="text-[10px] uppercase text-slate-400 font-bold mb-1 flex items-center gap-1">
                                        <Box size={10} /> Supply Total
                                    </span>
                                    <span className="text-4xl font-mono font-bold text-amber-400 tracking-tighter">
                                        {totalSupply}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-1 flex flex-col gap-2 justify-center">
                            <div className="grid grid-cols-2 gap-1 h-full">
                                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col items-center justify-center">
                                    <span className="text-[9px] uppercase text-slate-500">Mission</span>
                                    <span className="text-xl font-bold text-blue-400">{stats.mission}</span>
                                </div>
                                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col items-center justify-center">
                                    <span className="text-[9px] uppercase text-slate-500">Parc</span>
                                    <span className="text-xl font-bold text-emerald-400">{stats.operational}</span>
                                </div>
                                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col items-center justify-center">
                                    <span className="text-[9px] uppercase text-slate-500">Atelier</span>
                                    <span className="text-xl font-bold text-amber-500">{stats.maintenance}</span>
                                </div>
                                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col items-center justify-center">
                                    <span className="text-[9px] uppercase text-slate-500">Pertes</span>
                                    <span className="text-xl font-bold text-red-500">{stats.destroyed}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-2 bg-slate-900  flex justify-center relative z-20">
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 w-full max-w-lg overflow-x-auto">
                        <button onClick={() => setActiveTab('ops')} className={`flex-1 py-1.5 px-2 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all font-tech whitespace-nowrap ${activeTab === 'ops' ? 'bg-amber-600 text-white shadow-glow' : 'text-slate-500 hover:text-slate-300'} ${hasNewOrder && activeTab !== 'ops' ? 'animate-pulse text-amber-500 border border-amber-500' : ''}`}>
                            {hasNewOrder ? '⚠️ NOUVEL ORDRE' : 'OPS / EM'}
                        </button>
                        {['fleet', 'garage', 'logs', 'roster'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-1.5 px-2 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all font-tech whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white shadow-glow' : 'text-slate-500 hover:text-slate-300'}`}>
                                {tab === 'fleet' ? 'Unités' : tab === 'garage' ? 'Catalogue' : tab === 'roster' ? 'Effectif' : 'Journal'}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <div className="w-full">
                {activeTab === 'ops' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold uppercase tracking-widest font-tech text-amber-400 mb-3 flex items-center gap-2">
                            <MapPin size={20} /> Objectifs Prioritaires (EM)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {squads.filter(s => s.status === 'DEPLOYED' || s.status === 'RTB').map(squad => {
                                const isLogistics = squad.name === 'Logistique';
                                const pendingAck = isLogistics && hasNewOrder;

                                return (
                                    <div key={squad.id} style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className={`bg-[#0f172a] border rounded-lg p-4 relative overflow-hidden group transition-all ${pendingAck ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-slate-700 hover:border-amber-500'}`}>
                                        <div className={`absolute top-0 left-0 w-1 h-full ${squad.status === 'DEPLOYED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                        <div className="flex justify-between items-start mb-2 pl-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-black text-white text-lg">{squad.name}</h3>
                                                    {pendingAck && <span className="animate-pulse bg-red-600 text-white text-[9px] font-bold px-1 rounded">ORDRE</span>}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono">{squad.sl || 'Sans SL'}</div>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${squad.status === 'DEPLOYED' ? 'text-emerald-400 border-emerald-500' : 'text-amber-400 border-amber-500'}`}>{squad.status}</span>
                                        </div>
                                        <div className="pl-2 space-y-2 mt-3">
                                            <div className="flex items-center gap-2 text-sm text-amber-300 font-bold">
                                                <MapPin size={16} /> {squad.obj1 || 'Aucun Objectif'}
                                            </div>
                                            {squad.remarks && (
                                                <div className="text-xs text-slate-400 italic bg-slate-950 p-2 rounded border border-white">
                                                    "{squad.remarks}"
                                                </div>
                                            )}
                                            <div className="flex justify-between items-end pt-2">
                                                <div className="flex gap-2">
                                                    <div className="text-xs text-slate-500 flex items-center gap-1"><Users size={12} /> {squad.effectives}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1"><Radio size={12} /> {squad.freq}</div>
                                                </div>
                                                {isLogistics && pendingAck && (
                                                    <button onClick={() => setLastAckObj(squad.obj1)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded animate-pulse shadow-glow">
                                                        CONFIRMER (REÇU)
                                                    </button>
                                                )}
                                                {isLogistics && !pendingAck && logiSquad?.obj1 && (
                                                    <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1"><CheckCircle size={10} /> REÇU</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
                }
                {
                    activeTab === 'fleet' && (
                        <div className="space-y-6 pb-20">
                            {fleet.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600">
                                    <Car size={32} className="opacity-50 mb-4" />
                                    <p className="font-tech text-lg uppercase tracking-widest">Aucune unité active</p>
                                </div>
                            ) : (
                                Object.keys(groupsConfig).map(groupKey => {
                                    const items = getFleetByGroup(groupKey);
                                    const config = groupsConfig[groupKey];
                                    if (!items.length) return null;
                                    return (
                                        <div key={groupKey} className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1 h-6 rounded-full ${config.color} shadow-glow`}></div>
                                                <h2 className={`text-lg font-bold uppercase tracking-widest font-tech ${config.text} opacity-90`}>{config.label}</h2>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {items.map(item => (
                                                    <div key={item.uniqueId} style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-white rounded-lg overflow-hidden relative ">
                                                        <div className={`absolute top-0 left-0 w-1 h-full ${item.status === 'En Mission' ? 'bg-blue-500' : item.status === 'Maintenance' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                                        <div className="p-4 pl-6" onClick={() => toggleVehicleExpansion(item.uniqueId)}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="font-mono text-xs font-bold text-slate-400">{item.callsign}</div>
                                                                <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${item.status === 'Opérationnel' ? 'text-emerald-400 border-emerald-500' : item.status === 'En Mission' ? 'text-blue-400 border-blue-500' : 'text-amber-400 border-amber-500'}`}>{item.status}</div>
                                                            </div>
                                                            <div className="font-tech text-lg font-bold text-white leading-tight mb-2">{item.type}</div>
                                                            <div className="flex gap-1 mb-2">
                                                                <div className="h-1 flex-1 bg-slate-700 rounded overflow-hidden"><div style={{ width: `${item.integrity}%` }} className={`h-full ${item.integrity < 50 ? 'bg-red-500' : 'bg-emerald-500'}`}></div></div>
                                                                <div className="h-1 flex-1 bg-slate-700 rounded overflow-hidden"><div style={{ width: `${item.fuel}%` }} className="h-full bg-yellow-400"></div></div>
                                                            </div>
                                                        </div>

                                                        {(expandedVehicles.includes(item.uniqueId) || isDesktop) && (
                                                            <div className="p-4 pl-6 pt-0 border-t border-white bg-slate-950">
                                                                {/* SEATS */}
                                                                <div className="mb-4 space-y-2 mt-2">
                                                                    {getSafeSeats(item).map((seatName, idx) => {
                                                                        const isBoss = isSeatBoss(item, seatName);
                                                                        return (
                                                                            <div key={idx}>
                                                                                <label className={`text-[9px] uppercase font-bold flex justify-between ${isBoss ? 'text-amber-400' : 'text-slate-500'}`}>
                                                                                    <span>{seatName}</span> {isBoss && <Star size={8} />}
                                                                                </label>
                                                                                <select
                                                                                    className="w-full bg-slate-900 border border-slate-700 text-[10px] text-white rounded p-1"
                                                                                    value={item.crew?.[seatName] || ''}
                                                                                    onChange={(e) => updateSeat(item.uniqueId, seatName, e.target.value)}
                                                                                >
                                                                                    <option value="">Libre</option>
                                                                                    {roster.map(p => <option key={p.id} value={`${p.grade} ${p.name}`}>{p.grade} {p.name}</option>)}
                                                                                </select>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>

                                                                <div className="space-y-2">
                                                                    {item.status === 'En Mission' ? (
                                                                        <button onClick={() => handleStatusChangeAttempt(item.uniqueId, 'Opérationnel')} className="w-full bg-emerald-600 text-emerald-400 border border-emerald-500 py-1 rounded text-xs font-bold uppercase">Retour Mission</button>
                                                                    ) : (
                                                                        <button onClick={() => handleStatusChangeAttempt(item.uniqueId, 'En Mission')} className="w-full bg-blue-600 text-blue-400 border border-blue-500 py-1 rounded text-xs font-bold uppercase">Partir Mission</button>
                                                                    )}
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <button onClick={() => handleStatusChangeAttempt(item.uniqueId, item.status === 'Maintenance' ? 'Opérationnel' : 'Maintenance')} className="bg-slate-800 text-amber-500 border border-slate-700 py-1 rounded text-[10px] uppercase font-bold">Maint.</button>
                                                                        <button onClick={() => handleStatusChangeAttempt(item.uniqueId, 'Garage')} className="bg-slate-800 text-slate-400 border border-slate-700 py-1 rounded text-[10px] uppercase font-bold">Garage</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )
                }

                {/* GARAGE VIEW */}
                {
                    activeTab === 'garage' && (
                        <div className="space-y-6">
                            {Object.keys(groupsConfig).map(groupKey => {
                                const items = getGarageByGroup(groupKey);
                                const config = groupsConfig[groupKey];
                                if (!items.length) return null;
                                return (
                                    <div key={groupKey}>
                                        <h2 className={`text-lg font-bold uppercase tracking-widest font-tech ${config.text} mb-3`}>{config.label}</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                            {items.map(item => (
                                                <div key={item.id} style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-800 rounded p-3 flex flex-col gap-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-bold text-slate-200 text-sm">{item.type}</span>
                                                        <span className="text-xs text-slate-500">{item.cost} pts</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">{item.seats.length} places</div>
                                                    <button onClick={() => deployVehicle(item)} disabled={!isSL} className={`w-full py-2 rounded text-[10px] uppercase font-bold ${isSL ? 'bg-blue-600 text-blue-400 border border-blue-500 hover:bg-blue-600 hover:text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>
                                                        Déployer
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )
                }

                {/* ROSTER VIEW */}
                {
                    activeTab === 'roster' && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-blue-500 rounded p-4 flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-[10px] text-slate-500 font-bold mb-1">NOM</label>
                                    <input
                                        type="text"
                                        list="players-list-logi"
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                                        value={newPerson.name}
                                        onChange={e => {
                                            const val = e.target.value;
                                            const player = allPlayers ? allPlayers.find(p => p.name === val) : null;
                                            const grade = player ? player.grade : newPerson.grade;
                                            setNewPerson({ ...newPerson, name: val, grade: grade });
                                        }}
                                    />
                                    <datalist id="players-list-logi">
                                        {allPlayers && allPlayers.map(p => <option key={p.id} value={p.name}>{p.grade}</option>)}
                                    </datalist>
                                </div>
                                <div className="w-32">
                                    <label className="block text-[10px] text-slate-500 font-bold mb-1">GRADE</label>
                                    <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" value={newPerson.grade} onChange={e => setNewPerson({ ...newPerson, grade: e.target.value })}>
                                        {RANK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <button onClick={addPersonnel} className="px-6 py-2 bg-blue-600 text-white rounded font-bold uppercase text-xs">Ajouter</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {roster.map(p => (
                                    <div key={p.id} style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-800 rounded p-3 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">{RANK_SHORT[p.grade]}</div>
                                            <div className="font-bold text-white text-sm">{p.name}</div>
                                        </div>
                                        <button onClick={() => removePersonnel(p.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* LOGS VIEW */}
                {
                    activeTab === 'logs' && (
                        <div className="max-w-3xl mx-auto space-y-3">
                            {logs.map(log => (
                                <div key={log.id} style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-800 p-3 rounded flex items-start gap-4">
                                    <span className="font-mono text-xs text-slate-500">{log.time}</span>
                                    <div className={`w-1 h-8 rounded-full ${log.type === 'destroy' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-300">{log.message}</div>
                                        <div className="text-xs text-slate-500">{log.details}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                }
            </div >

            {/* CHAT FAB */}
            < button onClick={() => setChatOpen(true)} className="fixed bottom-10 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-glow" >
                <Radio size={24} />
            </button >

            {/* CHAT MODAL */}
            {
                chatOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950  p-4">
                        <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 100 }} className="bg-[#0f172a] border border-blue-500 rounded-xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl">
                            <div className="p-4 border-b border-white flex justify-between items-center">
                                <h3 className="font-tech text-xl text-white">CANAL RADIO</h3>
                                <button onClick={() => setChatOpen(false)}><X size={20} className="text-slate-400" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {chat.map(msg => (
                                    <div key={msg.id} className={`p-2 rounded max-w-[85%] ${msg.sender.includes('SL') ? 'bg-blue-900 border border-blue-500 ml-auto' : 'bg-slate-800 border border-slate-700'}`}>
                                        <div className="text-[10px] font-bold text-blue-400 mb-1 flex justify-between">
                                            <span>{msg.sender}</span>
                                            <span className="text-slate-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-200">{msg.text}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 bg-slate-950 border-t border-white flex flex-col gap-2">
                                <select className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-300" value={chatIdentity} onChange={e => setChatIdentity(e.target.value)}>
                                    <option value="">-- Identité --</option>
                                    {roster.map(p => <option key={p.id} value={`${p.grade} ${p.name}`}>{p.grade} {p.name}</option>)}
                                </select>
                                <div className="flex gap-2">
                                    <input type="text" className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-white" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Message..." onKeyDown={e => e.key === 'Enter' && sendChatMessage()} />
                                    <button onClick={sendChatMessage} className="bg-blue-600 text-white p-2 rounded"><Send size={18} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* MODALS RENDERED HERE IF OPEN NEEDED - Keeping it concise for now */}
            {
                missionModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950  p-4">
                        <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 100 }} className="bg-[#0f172a] border border-blue-500 rounded-xl w-full max-w-md p-6 space-y-4">
                            <h3 className="text-lg font-bold text-white">Départ Mission</h3>
                            <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white h-24" placeholder="Objectifs..." value={missionModal.details} onChange={e => setMissionModal({ ...missionModal, details: e.target.value })} autoFocus />
                            <div className="flex gap-2">
                                <button onClick={() => setMissionModal({ isOpen: false, vehicleId: null, details: '' })} className="flex-1 py-2 bg-slate-800 text-white rounded">Annuler</button>
                                <button onClick={confirmMissionStart} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold">Confirmer</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                destroyModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950  p-4">
                        <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 100 }} className="bg-[#0f172a] border border-red-500 rounded-xl w-full max-w-md p-6 space-y-4">
                            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2"><AlertTriangle /> Destruction</h3>
                            <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" value={destroyReporter} onChange={e => setDestroyReporter(e.target.value)}>
                                <option value="">-- Déclarant --</option>
                                {roster.map(p => <option key={p.id} value={`${p.grade} ${p.name}`}>{p.grade} {p.name}</option>)}
                            </select>
                            <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white h-24" placeholder="Raison..." value={destroyReason} onChange={e => setDestroyReason(e.target.value)} />
                            <div className="flex gap-2">
                                <button onClick={() => setDestroyModal({ isOpen: false, vehicleId: null })} className="flex-1 py-2 bg-slate-800 text-white rounded">Annuler</button>
                                <button onClick={confirmDestruction} className="flex-1 py-2 bg-red-600 text-white rounded font-bold">DETRUIRE</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                serviceModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950  p-4">
                        <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 100 }} className="bg-[#0f172a] border border-blue-500 rounded-xl w-full max-w-sm p-6 space-y-4">
                            <h3 className="text-lg font-bold text-white">Prise de Service</h3>
                            <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" placeholder="Nom" value={serviceModal.officer} onChange={e => setServiceModal({ ...serviceModal, officer: e.target.value })} />
                            <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" value={serviceModal.grade} onChange={e => setServiceModal({ ...serviceModal, grade: e.target.value })}>
                                <option value="">Grade</option>
                                {RANK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <div className="flex gap-2">
                                <button onClick={() => setServiceModal({ isOpen: false, officer: '', grade: '' })} className="flex-1 py-2 bg-slate-800 text-white rounded">Annuler</button>
                                <button onClick={handleServiceStart} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold">Valider</button>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                returnModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950  p-4">
                        <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 100 }} className="bg-[#0f172a] border border-blue-500 rounded-xl w-full max-w-md p-6 space-y-4">
                            <h3 className="text-lg font-bold text-white">Retour Mission</h3>
                            <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white h-24" placeholder="Rapport de mission..." value={returnModal.report} onChange={e => setReturnModal({ ...returnModal, report: e.target.value })} autoFocus />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">INTÉGRITÉ ({returnModal.integrity}%)</label>
                                    <input type="range" min="0" max="100" className="w-full" value={returnModal.integrity} onChange={e => setReturnModal({ ...returnModal, integrity: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">CARBURANT ({returnModal.fuel}%)</label>
                                    <input type="range" min="0" max="100" className="w-full" value={returnModal.fuel} onChange={e => setReturnModal({ ...returnModal, fuel: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-slate-950 rounded border border-slate-800">
                                <input
                                    type="checkbox"
                                    id="needsMain"
                                    checked={returnModal.needsMaintenance}
                                    onChange={e => setReturnModal({ ...returnModal, needsMaintenance: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-900"
                                />
                                <label htmlFor="needsMain" className="text-sm font-bold text-amber-400 select-none cursor-pointer">MAINTENANCE REQUISE</label>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => setReturnModal({ isOpen: false, vehicleId: null, report: '', fuel: 100, integrity: 100, needsMaintenance: false })} className="flex-1 py-2 bg-slate-800 text-white rounded">Annuler</button>
                                <button onClick={confirmMissionReturn} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold">Confirmer Retour</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                maintenanceModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950  p-4">
                        <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 100 }} className="bg-[#0f172a] border border-amber-500 rounded-xl w-full max-w-sm p-6 space-y-4">
                            <h3 className="text-lg font-bold text-amber-500">Atelier Maintenance</h3>
                            <p className="text-sm text-slate-400">Pour remettre le véhicule en service, les réparations et le ravitaillement complets seront effectués automatiquement.</p>

                            <div className="flex gap-2">
                                <button onClick={() => setMaintenanceModal({ isOpen: false, vehicleId: null })} className="flex-1 py-2 bg-slate-800 text-white rounded">Annuler</button>
                                <button onClick={confirmMaintenanceFix} className="flex-1 py-2 bg-emerald-600 text-white rounded font-bold">RÉPARER & RAVITAILLER</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}



