import React, { useState, useEffect } from 'react';
import {
    Users,
    Radio,
    MapPin,
    Clock,
    MoreHorizontal,
    CheckCircle2,
    AlertTriangle,
    Archive,
    UserPlus,
    LogOut,
    X,
    UserCheck,
    ShieldAlert,
    Save,
    Trash2,
    List,
    FolderClock,
    History
} from 'lucide-react';
import { useGame } from '../context/GameContext';

// --- Constants & Data ---

// SQUAD_COLORS removed. Now using squadRegistry from context.

const STATUS_STEPS = ['CONSTITUTION', 'READY', 'MOVING', 'ENGAGED', 'RTB', 'BASE'];

const STATUS_CONFIG = {
    CONSTITUTION: { label: 'CONSTITUTION', style: 'bg-slate-500 text-slate-400 border-slate-500', icon: Archive },
    READY: { label: 'OPÉRATIONNEL', style: 'bg-emerald-500 text-emerald-400 border-emerald-500', icon: ShieldAlert },
    MOVING: { label: 'DÉPART BASE', style: 'bg-blue-600 text-blue-400 border-blue-500', icon: ShieldAlert },
    ENGAGED: { label: 'SUR OBJECTIF', style: 'bg-orange-500 text-orange-400 border-orange-500', icon: AlertTriangle },
    RTB: { label: 'RTB (Retour)', style: 'bg-amber-500 text-amber-400 border-amber-500', icon: Archive },
    BASE: { label: 'EN BASE', style: 'bg-indigo-500 text-indigo-400 border-indigo-500', icon: Archive }
};

// INITIAL_SQUADS moved to GameContext and emptied.

const INITIAL_STAFF_SLOTS = [
    { id: 'em1', role: 'EM TITULAIRE', name: null, time: null, isTaken: false },
    { id: 'em2', role: 'ADJOINT EM', name: null, time: null, isTaken: false },
    { id: 'stg1', role: 'STAGIAIRE', name: null, time: null, isTaken: false },
];

const OBJECTIVES_LIST = [
    // Command & Special
    "GROUPE OFF", "CHEF DE SECTION", "ATTENTE MISSION",

    // Geographical / Locations
    "ALABAMA", "ALASKA", "AMBER", "APOLLO", "ARIZONA", "ARKANSAS", "ATLAS", "AUGUSTA", "AUSTIN",
    "BALTIMORE", "BOSTON", "BROOKLYN",
    "CALIFORNIA", "CARGO SHIP GEN", "CHICAGO", "COLORADO", "CONCORDE", "CONNECTICUT",
    "DALLAS", "DAYTON", "DEFENSE DE BASE", "DELAWARE", "DEMINAGE", "DENVER",
    "East SHIP GEN",
    "FLORIDA", "FRESNO",
    "GEORGIA",
    "HAWAI", "Hideout GEN", "HOUSTON",
    "IDAHO", "ILLINOIS", "INDIANA", "IOWA",
    "JUNKYARD",
    "KANSAS", "KENTUCKY",
    "LAS VEGAS", "LIBERTY", "LIGHTHOUSE GEN", "LOGISTIQUE", "LOS ANGELES", "LOUISIANA",
    "MAINE", "MAKIINPALLYS SILO", "MARYLAND", "MASSACHUSETTS", "MIAMI", "MICHIGAN", "MINNESOTA", "MISSISSIPI", "MISSOURI", "MONROE", "MONTANA", "MORTIER", "MOTORISÉE",
    "NASHVILLE", "NEBRASKA", "NEVADA", "NEW HAMPSHIRE", "NEW JERSEY", "NEW MEXICO", "NEW ORLEANS", "NEW YORK", "NORTH CAROLINA", "NORTH DAKOTA", "NORTHERN RELAY", "NW CARGO SHIP GEN",
    "OHIO", "OKLAHOMA", "OMAHA", "OREGON",
    "PENNSYLVANIA", "PHILADELPHIA", "PHOENIX", "PORTLAND", "PRINCETON", "PROVIDENCE",
    "RECONNAISSANCE", "REDHAWK", "RELAI DE L'EST", "RELAI ST PHILIPPE", "RHODE ISLAND", "RICHEMOND",
    "SAN ANTONIO", "SAN DIEGO", "SAN JOSE", "SEATTLE", "SECURITE EM", "SHIPWRECK GEN", "SOUTH CAROLINA", "SOUTH DAKOTA", "SOUTH FISHING SHIP", "SOUTHERN SILO", "SPIRIT", "SUPPLY",
    "TAMPA", "TENNESSEE", "TEXAS", "TITAN", "TOUR D'ENTRE-DEUX", "TOUR DE REGINA", "TOUR DES PINS", "TOUR ESTRAPADE", "TUCSON", "TULSA",
    "UTAH",
    "VERMONT", "VESPER", "VIRGINIA",
    "WASHINGTON", "WEST VIRGINIA", "WISCONSIN", "WYOMING"
];

// --- Sub-Components ---

const ServiceModal = ({ slot, onClose, onConfirm }) => {
    const { allPlayers } = useGame();
    const [name, setName] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black  animate-in fade-in duration-200">
            <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 60 }} className="bg-[#0f172a] border border-slate-700 w-full max-w-sm rounded-xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <UserPlus className="text-blue-400" />
                    Prise de Service
                </h3>
                <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Poste : <span className="text-white font-semibold">{slot.role}</span></p>
                    <label className="text-xs uppercase text-gray-500 font-bold">Nom de l'opérateur</label>
                    <input
                        type="text"
                        list="players-list-staff"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Major Shepard"
                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                        autoFocus
                    />
                    <datalist id="players-list-staff">
                        {allPlayers && allPlayers.map(p => <option key={p.id} value={`${p.grade} ${p.name}`} />)}
                    </datalist>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Annuler</button>
                    <button
                        onClick={() => onConfirm(name)}
                        disabled={!name.trim()}
                        className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.CONSTITUTION;
    return (
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 border ${config.style}`}>
            {config.label}
        </div>
    );
};

const CardField = ({ icon: Icon, label, value }) => (
    <div className="border-t border-white pt-2">
        <div className="flex items-center gap-2 mb-1">
            <Icon size={14} className="text-slate-400" />
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{label}</span>
        </div>
        <div className="text-sm font-medium text-white pl-6">
            {value || '-'}
        </div>
    </div>
);

const EditModal = ({ squad, onClose, onSave, onDelete, squadRegistry }) => {
    // Determine initial pax count (Total - SL)
    const initialPax = Math.max(0, squad.effectives - (squad.sl ? 1 : 0));

    // We keep formData for the final object, but use local state for the input
    const [formData, setFormData] = useState({ ...squad });
    const [paxCount, setPaxCount] = useState(initialPax);

    // Update total effectives whenever SL or Pax changes
    useEffect(() => {
        const hasSl = !!formData.sl && formData.sl.trim() !== '';
        const total = parseInt(paxCount || 0) + (hasSl ? 1 : 0);
        setFormData(prev => ({ ...prev, effectives: total }));
    }, [paxCount, formData.sl]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black " onClick={onClose} />

            {/* Modal Content */}
            <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 101 }} className="relative z-[101] bg-[#0f172a] border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className={`px-5 py-4 border-b border-white flex justify-between items-center bg-slate-800 relative overflow-hidden`}>
                    {/* Header Color Accent */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${squad.color ? squad.color.split(' ')[0] : 'bg-slate-600'}`} />

                    <h2 className="text-xl font-bold text-white flex items-center gap-3 pl-2">
                        <Radio size={22} className="text-slate-400" />
                        <span className="tracking-wide uppercase">{formData.name}</span>
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#0f172a]">

                    {/* Status Section */}
                    <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">État de l'unité</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
                            {STATUS_STEPS.map(statusKey => {
                                const config = STATUS_CONFIG[statusKey];
                                const isActive = formData.status === statusKey;
                                const Icon = config.icon;
                                return (
                                    <label
                                        key={statusKey}
                                        className={`flex flex-col items-center justify-center py-2 rounded-md cursor-pointer transition-all border 
                                        ${isActive ? config.style.replace('text-', 'border-').replace('bg-', 'bg-') + ' shadow-lg' : 'text-slate-500 border-transparent hover:bg-slate-800'}`}
                                    >
                                        <input type="radio" name="status" className="hidden"
                                            checked={isActive}
                                            onChange={() => setFormData({ ...formData, status: statusKey })}
                                        />
                                        <Icon size={16} className="mb-1" />
                                        <span className="text-[10px] font-bold">{config.label.split('(')[0]}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[11px] text-slate-400 uppercase font-bold tracking-wider ml-1">Squad Lead (+Radio)</label>
                            <div className="relative">
                                <UserCheck size={16} className="absolute left-3 top-3 text-slate-500" />
                                <input
                                    type="text"
                                    name="sl"
                                    value={formData.sl}
                                    onChange={handleChange}
                                    placeholder="Nom du SL"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] text-slate-400 uppercase font-bold tracking-wider ml-1">Soldats (Hors SL)</label>
                            <div className="relative">
                                <Users size={16} className="absolute left-3 top-3 text-slate-500" />
                                <input
                                    type="number"
                                    value={paxCount}
                                    onChange={(e) => setPaxCount(e.target.value)}
                                    min="0"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                />
                                <div className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
                                    Total: {formData.effectives}
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[11px] text-slate-400 uppercase font-bold tracking-wider ml-1">Objectif Principal</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-3 text-slate-500" />
                                <select
                                    name="obj1"
                                    value={formData.obj1}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                                >
                                    <option value="">-- Sélectionner un objectif --</option>
                                    {OBJECTIVES_LIST.map(obj => (
                                        <option key={obj} value={obj}>{obj}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[11px] text-slate-400 uppercase font-bold tracking-wider ml-1">Remarques / Situation</label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                rows={3}
                                placeholder="RAS, En mouvement vers..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none placeholder:text-slate-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white flex justify-between gap-4 bg-slate-800">
                    <button
                        onClick={() => onDelete(squad.id)}
                        className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider"
                    >
                        <Trash2 size={16} />
                        Dissoudre
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white font-medium transition-colors">
                            Annuler
                        </button>
                        <button
                            onClick={() => onSave(formData)}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded shadow-lg shadow-blue-900 transition-all"
                        >
                            Valider
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NewSquadModal = ({ currentSquads, onClose, onConfirm, squadRegistry }) => {
    // Get all defined squads from registry
    // Filter out squads that are already deployed
    const availableSquads = squadRegistry.filter(def =>
        !currentSquads.some(s => s.name === def.name)
    );



    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black " onClick={onClose} />

            {/* Modal Content */}
            <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 101 }} className="relative z-[101] bg-[#0f172a] border border-slate-700 w-full max-w-sm rounded-xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="text-blue-400" />
                    Nouvelle Unité
                </h3>

                <div className="mb-6">
                    <p className="text-sm text-slate-400 mb-3">Sélectionnez l'indicatif de l'unité à déployer :</p>

                    {availableSquads.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                            {availableSquads.map(def => (
                                <button
                                    key={def.id}
                                    onClick={() => onConfirm(def.name)}
                                    className={`p-2 rounded text-sm font-bold text-left transition-all flex items-center gap-2 border border-transparent hover:border-white
                                         ${def.color ? def.color.replace('border-', 'border-l-4 border-') : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}
                                     `}
                                >
                                    <span className="truncate">{def.name}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-amber-500 bg-amber-500 rounded-lg border border-amber-500">
                            <AlertTriangle className="mx-auto mb-2" />
                            <p className="text-sm font-bold">Toutes les unités sont déployées !</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white font-medium transition-colors">
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};

const ArchivesTab = ({ archives, squadRegistry }) => {
    // Sort archives by deployment time (most recent first)
    const sortedArchives = [...archives].sort((a, b) => b.id - a.id);

    // Calculate stats per SL
    const getSlStats = () => {
        const stats = {};
        archives.forEach(entry => {
            if (entry.sl) {
                stats[entry.sl] = (stats[entry.sl] || 0) + 1;
            }
        });
        return Object.entries(stats).sort((a, b) => b[1] - a[1]);
    };

    const slStats = getSlStats();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <History size={20} className="text-blue-400" />
                    HISTORIQUE DES DÉPLOIEMENTS
                </h3>
                <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-800 rounded-lg overflow-hidden shadow-xl">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Unité</th>
                                <th className="px-4 py-3">Squad Lead</th>
                                <th className="px-4 py-3">Déploiement</th>
                                <th className="px-4 py-3">Dissolution</th>
                                <th className="px-4 py-3 text-right">Durée</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {sortedArchives.length > 0 ? (
                                sortedArchives.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-slate-800 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {(() => {
                                                    const def = squadRegistry ? squadRegistry.find(s => s.name === entry.squadName) : null;
                                                    const colorClass = def ? def.color.split(' ')[0] : 'bg-slate-600';
                                                    return <div className={`w-2 h-2 rounded-full ${colorClass}`} />;
                                                })()}
                                                <span className="font-bold text-white">{entry.squadName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-300">{entry.sl || '-'}</td>
                                        <td className="px-4 py-3 text-slate-400">{entry.timeStart}</td>
                                        <td className="px-4 py-3 text-slate-400">{entry.timeEnd || <span className="text-emerald-500 font-bold text-[10px] uppercase px-2 py-0.5 bg-emerald-500 rounded">En cours</span>}</td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-500">
                                            {/* Duration could be calculated here optionally, currently simpler */}
                                            {entry.timeEnd ? 'Terminé' : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500 italic">
                                        Aucune donnée d'archive disponible.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FolderClock size={20} className="text-amber-400" />
                    CLASSEMENT SL
                </h3>
                <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-800 rounded-lg p-4 shadow-xl">
                    <div className="space-y-3">
                        {slStats.length > 0 ? (
                            slStats.map(([name, count], index) => (
                                <div key={name} className="flex justify-between items-center border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-slate-400 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-slate-200">{name}</span>
                                    </div>
                                    <div className="text-sm font-bold text-blue-400">{count} msn</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-slate-500 text-sm italic py-4">
                                Aucun historique SL.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

export default function StaffTracking() {
    const {
        squads, setSquads,
        staff, setStaff,
        archives, setArchives,
        squadRegistry, // Imported
        addServiceEntry // Import this
    } = useGame();

    const [selectedSquad, setSelectedSquad] = useState(null);
    const [slotToTake, setSlotToTake] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [viewMode, setViewMode] = useState('live'); // 'live' or 'archives'

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- Staff Logic ---
    const handleTakeSlot = (name) => {
        if (!slotToTake) return;
        setStaff(prev => prev.map(s => s.id === slotToTake.id ? {
            ...s,
            name,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            isTaken: true
        } : s));
        setSlotToTake(null);
    };

    const handleReleaseSlot = (id) => {
        if (!confirm("Fin de service pour ce poste ?")) return;

        const staffMember = staff.find(s => s.id === id);
        if (!staffMember) return;

        // Calculate Duration
        const now = new Date();
        const endTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        let duration = '-';
        if (staffMember.time) {
            const [startH, startM] = staffMember.time.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);

            let diffM = (endH * 60 + endM) - (startH * 60 + startM);
            if (diffM < 0) diffM += 24 * 60; // Handle midnight crossing

            const hours = Math.floor(diffM / 60);
            const mins = diffM % 60;
            duration = `${hours}h ${mins.toString().padStart(2, '0')}`;
        }

        // Add Log Entry
        addServiceEntry({
            id: Date.now(),
            role: staffMember.role,
            name: staffMember.name,
            startTime: staffMember.time,
            endTime: endTime,
            date: now.toLocaleDateString('fr-FR'),
            duration: duration
        });

        // Reset Slot
        setStaff(prev => prev.map(s => s.id === id ? { ...s, name: null, time: null, isTaken: false } : s));
    };

    // --- Squad Logic ---
    const handleUpdateSquad = (updated) => {
        setSquads(squads.map(s => s.id === updated.id ? updated : s));

        // Update archive entry if SL changes
        if (archives.some(a => a.squadId === updated.id)) {
            setArchives(prev => prev.map(a => a.squadId === updated.id ? { ...a, sl: updated.sl } : a));
        }

        setSelectedSquad(null);
    };

    const handleNextStatus = (squad) => {
        const currentIndex = STATUS_STEPS.indexOf(squad.status);
        const nextIndex = (currentIndex + 1) % STATUS_STEPS.length;
        handleUpdateSquad({ ...squad, status: STATUS_STEPS[nextIndex] });
    };

    const handleCreateSquad = (name) => {
        const newId = Date.now();
        const timeStart = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        // Lookup definition in registry
        const def = squadRegistry.find(s => s.name === name);
        const defaultColor = def ? def.color : "bg-slate-700 border-slate-800 text-white";
        const defaultFreq = def ? `${def.freq} MHz` : '30.0 MHz';

        const newSquad = {
            id: newId,
            name: name,
            freq: defaultFreq,
            color: defaultColor, // Store color in squad instance
            type: def ? def.type : 'infantry',
            sl: '',
            effectives: 0,
            obj1: '',
            obj2: '',
            status: 'CONSTITUTION',
            rtb: false,
            timeStart: timeStart,
            remarks: ''
        };

        setSquads([...squads, newSquad]);

        // Add to archives
        setArchives(prev => [{
            id: Date.now(),
            squadId: newId,
            squadName: name,
            sl: '',
            timeStart: timeStart,
            timeEnd: null
        }, ...prev]);

        setIsCreating(false);
    };

    const handleDeleteSquad = (id) => {
        setSquads(squads.filter(s => s.id !== id));

        // Update archive to close entry
        setArchives(prev => prev.map(a => a.squadId === id ? {
            ...a,
            timeEnd: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        } : a));

        setSelectedSquad(null);
    };

    const stats = {
        total: squads.reduce((acc, s) => acc + parseInt(s.effectives || 0), 0),
        deployed: squads.filter(s => ['MOVING', 'ENGAGED'].includes(s.status)).reduce((acc, s) => acc + parseInt(s.effectives || 0), 0),
        rtb: squads.filter(s => s.status === 'RTB').reduce((acc, s) => acc + parseInt(s.effectives || 0), 0),
        base: squads.filter(s => ['BASE', 'READY', 'CONSTITUTION'].includes(s.status)).reduce((acc, s) => acc + parseInt(s.effectives || 0), 0)
    };

    return (
        <div className="w-full text-slate-200 font-sans selection:bg-blue-500">

            {/* Header */}
            <header className="sticky top-0 z-30 bg-slate-900  border-b border-white shadow-xl">
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-900 to-red-600 rounded flex items-center justify-center font-black text-white shadow-lg shadow-red-900">
                                FOF
                            </div>
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-white leading-tight">COMMANDEMENT<br /><span className="text-red-500">OPÉRATIONNEL</span></h1>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-white mx-2"></div>
                        <div className="flex gap-4 text-xs font-medium">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total</span>
                                <span className="text-white text-lg leading-none">{stats.total}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-blue-500 uppercase tracking-wider">Terrain</span>
                                <span className="text-blue-400 text-lg leading-none">{stats.deployed}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-amber-500 uppercase tracking-wider">RTB</span>
                                <span className="text-amber-400 text-lg leading-none">{stats.rtb}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Base</span>
                                <span className="text-slate-400 text-lg leading-none">{stats.base}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-4xl font-mono font-bold text-white tracking-widest opacity-80">
                        {currentTime}
                    </div>
                </div>
            </header>

            {/* Service & Staff Section */}
            <section className="px-6 py-4 bg-slate-900 border-b border-white">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 mb-3">
                            <UserCheck size={18} className="text-blue-400" />
                            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">État-Major & Service</h2>
                        </div>
                        {/* View Toggles */}
                        <div className="flex bg-slate-900 rounded p-1 border border-slate-700">
                            <button
                                onClick={() => setViewMode('live')}
                                className={`px-4 py-1.5 text-xs font-bold uppercase rounded transition-all flex items-center gap-2 ${viewMode === 'live' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                <List size={14} />
                                Suivi Live
                            </button>
                            <button
                                onClick={() => setViewMode('archives')}
                                className={`px-4 py-1.5 text-xs font-bold uppercase rounded transition-all flex items-center gap-2 ${viewMode === 'archives' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                <History size={14} />
                                Archives
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        {staff.map((slot) => (
                            <div
                                key={slot.id}
                                className={`relative group border rounded-lg p-3 transition-all ${slot.isTaken ? 'bg-slate-800 border-blue-500' : 'bg-slate-900 border-white border-dashed hover:border-white'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{slot.role}</div>
                                        {slot.isTaken ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                                                <span className="text-white font-bold text-sm">{slot.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-600 text-sm italic">Poste vacant</span>
                                        )}
                                    </div>
                                    {slot.isTaken ? (
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-xs font-mono text-slate-400 bg-black px-1.5 py-0.5 rounded">{slot.time}</span>
                                            <button
                                                onClick={() => handleReleaseSlot(slot.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-900 rounded-md transition-all"
                                                title="Fin de service"
                                            >
                                                <LogOut size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setSlotToTake(slot)}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-bold uppercase rounded border border-blue-600 transition-all"
                                        >
                                            Prise de poste
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <main className="p-6 max-w-screen-2xl mx-auto">
                {viewMode === 'live' ? (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-base font-bold text-white flex items-center gap-2 uppercase">
                                <List size={18} className="text-blue-400" />
                                UNITÉS DÉPLOYÉES
                            </h2>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500"
                            >
                                <Users size={16} /> Nouvelle Unité
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {squads.map((squad) => (
                                <div
                                    key={squad.id}
                                    style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                                    className="flex flex-col bg-[#0f172a] rounded-lg overflow-hidden border border-white hover:border-white transition-all"
                                >
                                    {/* Card Header */}
                                    <div className={`px-3 py-2 flex justify-between items-center ${squad.color || 'bg-slate-700 border-slate-800 text-white'}`}>
                                        <h3 className="font-black text-base tracking-wide">
                                            {squad.name}
                                        </h3>
                                        <div className="font-mono text-xs font-bold bg-black px-2 py-0.5 rounded">
                                            {squad.freq}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-3 space-y-2 flex-1">
                                        <div className="flex justify-between items-center pb-2 border-b border-white">
                                            <div
                                                onClick={() => handleNextStatus(squad)}
                                                className="cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                                                title="Changer statut (Cycle: Déployé -> RTB -> Base -> Ops)"
                                            >
                                                <StatusBadge status={squad.status} />
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Users size={12} />
                                                <span className="font-mono font-bold text-white text-sm">{squad.effectives}</span>
                                            </div>
                                        </div>

                                        <CardField icon={MapPin} label="Objectif" value={squad.obj1} />
                                        <CardField icon={UserCheck} label="Leader" value={squad.sl} />
                                        <CardField icon={Clock} label="Début" value={squad.timeStart} />
                                        <CardField icon={Radio} label="Inter-Esc" value="32.5 MHz" />

                                        {squad.remarks && (
                                            <div className="text-xs text-slate-400 italic border-t border-white pt-2 mt-2">
                                                "{squad.remarks}"
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Actions */}
                                    <button
                                        onClick={() => setSelectedSquad(squad)}
                                        className="m-3 mt-0 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
                                    >
                                        Gérer / Modifier
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <ArchivesTab archives={archives} squadRegistry={squadRegistry} />
                )}
            </main>

            {/* Modals - Always rendered but conditionally shown */}
            {slotToTake && (
                <ServiceModal
                    slot={slotToTake}
                    onClose={() => setSlotToTake(null)}
                    onConfirm={handleTakeSlot}
                />
            )}

            {selectedSquad && (
                <EditModal
                    squad={selectedSquad}
                    squadRegistry={squadRegistry}
                    onClose={() => setSelectedSquad(null)}
                    onSave={handleUpdateSquad}
                    onDelete={handleDeleteSquad}
                />
            )}

            {isCreating && (
                <NewSquadModal
                    currentSquads={squads}
                    squadRegistry={squadRegistry}
                    onClose={() => setIsCreating(false)}
                    onConfirm={handleCreateSquad}
                />
            )}

        </div>
    );
}



