import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import PageTitle from '../components/PageTitle';
import {
    Map, Calendar, Clock, Lock, BookOpen, Users,
    Package, Activity, Settings, Archive, Plus,
    Trash2, Edit, Save, Cloud, Shield, ChevronLeft,
    List, MoreHorizontal, Radio, Image as ImageIcon, Upload, X, ChevronDown, ChevronUp,
    Sword, Cross, Target, Eye, Signal, Truck, Anchor
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                SUB-COMPONENTS                              */
/* -------------------------------------------------------------------------- */

const MissionStatusBadge = ({ status }) => {
    switch (status) {
        case 'WAITING': return <span className="bg-blue-500 text-blue-400 border border-blue-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">EN ATTENTE</span>;
        case 'ACTIVE': return <span className="bg-green-500 text-green-400 border border-green-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-blink">EN COURS</span>;
        case 'FINISHED': return <span className="bg-slate-500 text-slate-400 border border-slate-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">TERMINEE</span>;
        default: return null;
    }
};

/* --- LOADOUT EDITOR --- */
const PREDEFINED_ROLES = [
    "Chef d'escouade", "Chef d'Equipe", "Fusilier", "Radio", "Médecin",
    "Machine Gun", "Anti Tank", "Sapeur Démineur", "Mule",
    "Tireur de Précision", "Grenade Launcher", "Equipage Tank", "Pilote"
];

const LoadoutEditor = ({ mission, onUpdate }) => {
    const loadouts = mission.loadouts || [];

    const handleAddLoadout = (roleName = "Nouveau Rôle") => {
        const newLoadout = {
            id: Date.now(),
            role: roleName,
            gear: {
                helmet: "",
                uniformTop: "", uniformBottom: "",
                vestProtection: "", vestTactical: "",
                shoes: "", backpack: "",
                radio: "", nvg: "", gps: "", binocs: "",
                primary: "", primaryAcc: "", primaryOptic: "",
                handgun: "", ammo: "", grenades: "",
                base: "Carte + Boussole + Montre", medical: "Standard"
            }
        };
        onUpdate(mission.id, { ...mission, loadouts: [...loadouts, newLoadout] });
    };

    const handleUpdateLoadout = (id, field, value) => {
        const updated = loadouts.map(l => l.id === id ? { ...l, [field]: value } : l);
        onUpdate(mission.id, { ...mission, loadouts: updated });
    };

    const handleUpdateGear = (id, gearField, value) => {
        const updated = loadouts.map(l => {
            if (l.id === id) {
                return { ...l, gear: { ...l.gear, [gearField]: value } };
            }
            return l;
        });
        onUpdate(mission.id, { ...mission, loadouts: updated });
    };

    const handleRemoveLoadout = (id) => {
        if (confirm('Supprimer ce loadout ?')) {
            const updated = loadouts.filter(l => l.id !== id);
            onUpdate(mission.id, { ...mission, loadouts: updated });
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Controls to add new role */}
            {/* Controls to add new role */}
            <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-300 uppercase flex items-center gap-2">
                        <Package size={16} /> Définition des Rôles & Équipements
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Configurez l'équipement précis pour chaque rôle.</p>
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded px-3 py-2 outline-none focus:border-blue-500"
                        onChange={(e) => {
                            if (e.target.value) {
                                handleAddLoadout(e.target.value);
                                e.target.value = ""; // Reset
                            }
                        }}
                    >
                        <option value="">+ Ajouter un Standard...</option>
                        {PREDEFINED_ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <button onClick={() => handleAddLoadout()} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded text-xs font-bold transition-colors">
                        Autre
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {loadouts.map((loadout) => (
                    <div key={loadout.id} style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 shadow-lg">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-3 flex justify-between items-center border-b border-slate-700">
                            <div className="flex items-center gap-3 w-full">
                                <div className="p-2 bg-blue-600 rounded text-white">
                                    <Target size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={loadout.role}
                                    onChange={(e) => handleUpdateLoadout(loadout.id, 'role', e.target.value)}
                                    className="bg-transparent text-white font-black text-xl uppercase outline-none focus:border-b border-blue-500 w-full md:w-1/3"
                                    placeholder="NOM DU RÔLE"
                                    list="roles-list"
                                />
                                <datalist id="roles-list">
                                    {PREDEFINED_ROLES.map(r => <option key={r} value={r} />)}
                                </datalist>
                            </div>
                            <button onClick={() => handleRemoveLoadout(loadout.id)} className="text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-slate-800 rounded">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        {/* Detailed Gear Grid */}
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">

                            {/* SECTION 1: TENUE / UNIFORME */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-blue-400 uppercase border-b border-slate-700 pb-1 mb-2 flex items-center gap-2">
                                    <Shield size={12} /> Protection & Tenue
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="grid grid-cols-3 items-center">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase col-span-1">Casque</label>
                                        <input className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-blue-500 outline-none"
                                            value={loadout.gear.helmet} onChange={e => handleUpdateGear(loadout.id, 'helmet', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-3 items-center">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase col-span-1">Haut</label>
                                        <input className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-blue-500 outline-none"
                                            value={loadout.gear.uniformTop} onChange={e => handleUpdateGear(loadout.id, 'uniformTop', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-3 items-center">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase col-span-1">Bas</label>
                                        <input className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-blue-500 outline-none"
                                            value={loadout.gear.uniformBottom} onChange={e => handleUpdateGear(loadout.id, 'uniformBottom', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-3 items-center">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase col-span-1" title="Gilet Pare-balles">Pare-balles</label>
                                        <input className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-blue-500 outline-none"
                                            value={loadout.gear.vestProtection} onChange={e => handleUpdateGear(loadout.id, 'vestProtection', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-3 items-center">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase col-span-1" title="Gilet Tactique / Chest Rig">Gilet TACT.</label>
                                        <input className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-blue-500 outline-none"
                                            value={loadout.gear.vestTactical} onChange={e => handleUpdateGear(loadout.id, 'vestTactical', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-3 items-center">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase col-span-1">Chaussures</label>
                                        <input className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-blue-500 outline-none"
                                            value={loadout.gear.shoes} onChange={e => handleUpdateGear(loadout.id, 'shoes', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-3 items-center">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase col-span-1">Sac à dos</label>
                                        <input className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-blue-500 outline-none"
                                            value={loadout.gear.backpack} onChange={e => handleUpdateGear(loadout.id, 'backpack', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: ARMEMENT */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-red-400 uppercase border-b border-slate-700 pb-1 mb-2 flex items-center gap-2">
                                    <Sword size={12} /> Armement
                                </h4>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Arme Principale</label>
                                        <input className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-white font-bold focus:border-red-500 outline-none"
                                            value={loadout.gear.primary} onChange={e => handleUpdateGear(loadout.id, 'primary', e.target.value)} placeholder="Ex: HK416" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Optique</label>
                                            <input className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:border-red-500 outline-none"
                                                value={loadout.gear.primaryOptic} onChange={e => handleUpdateGear(loadout.id, 'primaryOptic', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Accessoires</label>
                                            <input className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:border-red-500 outline-none"
                                                value={loadout.gear.primaryAcc} onChange={e => handleUpdateGear(loadout.id, 'primaryAcc', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Arme de Poing</label>
                                        <input className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:border-red-500 outline-none"
                                            value={loadout.gear.handgun} onChange={e => handleUpdateGear(loadout.id, 'handgun', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Munitions</label>
                                        <input className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:border-red-500 outline-none"
                                            value={loadout.gear.ammo} onChange={e => handleUpdateGear(loadout.id, 'ammo', e.target.value)} placeholder="Ex: 6+1 chargeurs" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Grenades</label>
                                        <input className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:border-red-500 outline-none"
                                            value={loadout.gear.grenades} onChange={e => handleUpdateGear(loadout.id, 'grenades', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: ELECTRONIQUE & DIVERS */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-amber-400 uppercase border-b border-slate-700 pb-1 mb-2 flex items-center gap-2">
                                    <Radio size={12} /> Électronique & Divers
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="grid grid-cols-3 items-center">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase col-span-1">Radio</label>
                                        <input className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-amber-500 outline-none"
                                            value={loadout.gear.radio} onChange={e => handleUpdateGear(loadout.id, 'radio', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-3 items-center">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase col-span-1">NVG</label>
                                        <input className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-amber-500 outline-none"
                                            value={loadout.gear.nvg} onChange={e => handleUpdateGear(loadout.id, 'nvg', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-3 items-center">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase col-span-1">GPS</label>
                                        <input className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-amber-500 outline-none"
                                            value={loadout.gear.gps} onChange={e => handleUpdateGear(loadout.id, 'gps', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-3 items-center">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase col-span-1">Jumelles</label>
                                        <input className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-amber-500 outline-none"
                                            value={loadout.gear.binocs} onChange={e => handleUpdateGear(loadout.id, 'binocs', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-3 items-center mt-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase col-span-1">La Base</label>
                                        <input className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-amber-500 outline-none"
                                            value={loadout.gear.base} onChange={e => handleUpdateGear(loadout.id, 'base', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-3 items-center">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase col-span-1">Médical</label>
                                        <input className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-amber-500 outline-none"
                                            value={loadout.gear.medical} onChange={e => handleUpdateGear(loadout.id, 'medical', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            {loadouts.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-lg">
                    <Package className="mx-auto text-slate-600 mb-4" size={48} />
                    <p className="text-slate-500 text-sm">Aucun rôle défini. Commencez par ajouter un rôle (Fusilier, Medic...) ci-dessus.</p>
                </div>
            )}
        </div>
    );
};

/* --- BRIEFING EDITOR (unchanged logic, reused) --- */
const BriefingEditor = ({ mission, onUpdate }) => {
    const sections = Array.isArray(mission.briefing)
        ? mission.briefing
        : [{ id: Date.now(), title: "Information", content: mission.briefing || "", image: null }];

    const handleAddSection = () => {
        const newSection = { id: Date.now(), title: "Nouvelle Section", content: "", image: null };
        onUpdate(mission.id, { ...mission, briefing: [...sections, newSection] });
    };

    const handleUpdateSection = (id, field, value) => {
        const updated = sections.map(s => s.id === id ? { ...s, [field]: value } : s);
        onUpdate(mission.id, { ...mission, briefing: updated });
    };

    const handleRemoveSection = (id) => {
        const updated = sections.filter(s => s.id !== id);
        onUpdate(mission.id, { ...mission, briefing: updated });
    };

    const handleImageUpload = (id, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            handleUpdateSection(id, 'image', reader.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6 pb-10">
            {sections.map((section, index) => (
                <div key={section.id} style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700 group">
                        <div className="flex items-center gap-3 flex-1">
                            <span className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-1 rounded">{index + 1}</span>
                            <input
                                type="text"
                                value={section.title}
                                onChange={(e) => handleUpdateSection(section.id, 'title', e.target.value)}
                                className="bg-transparent text-white font-bold text-sm uppercase outline-none focus:border-b border-blue-500 flex-1"
                                placeholder="Titre de la section (ex: Situation, Mission...)"
                            />
                        </div>
                        <button onClick={() => handleRemoveSection(section.id)} className="text-slate-600 hover:text-red-400 transition-colors p-1">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <textarea
                            value={section.content}
                            onChange={(e) => handleUpdateSection(section.id, 'content', e.target.value)}
                            className="w-full h-full min-h-[150px] bg-slate-950 border border-slate-800 rounded p-3 text-sm text-slate-300 focus:border-blue-500 outline-none resize-none"
                            placeholder="Détails de la section..."
                        />
                        <div className="border border-slate-800 rounded bg-slate-950 relative flex flex-col items-center justify-center min-h-[150px] overflow-hidden group">
                            {section.image ? (
                                <>
                                    <img src={section.image} alt="Briefing" className="w-full h-full object-cover opacity-80" />
                                    <button onClick={() => handleUpdateSection(section.id, 'image', null)} className="absolute top-2 right-2 bg-slate-900 text-white p-1 rounded-full hover:bg-red-500 transition-colors">
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-600 p-4 relative">
                                    <ImageIcon size={24} className="mb-2" />
                                    <span className="text-xs font-bold uppercase text-center">Glisser une image<br />ou cliquer</span>
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => handleImageUpload(section.id, e.target.files[0])} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={handleAddSection} className="w-full py-4 border-2 border-dashed border-slate-800 rounded-lg text-slate-500 font-bold uppercase hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
                <Plus size={18} /> Ajouter une section
            </button>
        </div>
    );
};

/* --- SQUAD BUILDER WITH RADIO & ROLES & LOADOUT LINKING --- */
const SquadBuilder = ({ mission, onUpdate }) => {
    const squads = mission.squads || [];
    const participants = mission.participants || [];
    const loadouts = mission.loadouts || []; // Available loadouts
    const [selectedParticipant, setSelectedParticipant] = useState(null);

    // Helpers
    const updateSquad = (squadId, field, value) => {
        const updated = squads.map(s => s.id === squadId ? { ...s, [field]: value } : s);
        onUpdate(mission.id, { ...mission, squads: updated });
    };

    const addSquad = () => {
        const newSquad = {
            id: Date.now(),
            name: `Squad ${squads.length + 1}`,
            radioFrequency: `50.${squads.length + 1}`,
            // Default slots layout
            slots: [
                { id: Date.now() + 1, role: 'Chef d\'Escouade', assignedTo: null },
                { id: Date.now() + 2, role: 'Medic', assignedTo: null },
                { id: Date.now() + 3, role: 'Fusilier', assignedTo: null },
                { id: Date.now() + 4, role: 'Fusilier', assignedTo: null },
            ]
        };
        onUpdate(mission.id, { ...mission, squads: [...squads, newSquad] });
    };

    const removeSquad = (squadId) => {
        onUpdate(mission.id, { ...mission, squads: squads.filter(s => s.id !== squadId) });
    };

    const addSlot = (squadId) => {
        const updated = squads.map(s => {
            if (s.id === squadId) {
                return {
                    ...s,
                    slots: [...s.slots, { id: Date.now(), role: 'Fusilier', assignedTo: null }]
                };
            }
            return s;
        });
        onUpdate(mission.id, { ...mission, squads: updated });
    };

    const updateSlotRole = (squadId, slotId, newRole) => {
        const updated = squads.map(s => {
            if (s.id === squadId) {
                const newSlots = s.slots.map(sl => sl.id === slotId ? { ...sl, role: newRole } : sl);
                return { ...s, slots: newSlots };
            }
            return s;
        });
        onUpdate(mission.id, { ...mission, squads: updated });
    };

    const removeSlot = (squadId, slotId) => {
        const updated = squads.map(s => {
            if (s.id === squadId) {
                return { ...s, slots: s.slots.filter(sl => sl.id !== slotId) };
            }
            return s;
        });
        onUpdate(mission.id, { ...mission, squads: updated });
    };

    const assignParticipant = (squadId, slotId) => {
        if (!selectedParticipant) return;

        const cleanSquads = squads.map(s => ({
            ...s,
            slots: s.slots.map(sl => sl.assignedTo === selectedParticipant.id ? { ...sl, assignedTo: null } : sl)
        }));

        const finalSquads = cleanSquads.map(s => {
            if (s.id === squadId) {
                return {
                    ...s,
                    slots: s.slots.map(sl => sl.id === slotId ? { ...sl, assignedTo: selectedParticipant.id } : sl)
                };
            }
            return s;
        });

        onUpdate(mission.id, { ...mission, squads: finalSquads });
        setSelectedParticipant(null);
    };

    const unassignSlot = (squadId, slotId) => {
        const updated = squads.map(s => {
            if (s.id === squadId) {
                const newSlots = s.slots.map(sl => sl.id === slotId ? { ...sl, assignedTo: null } : sl);
                return { ...s, slots: newSlots };
            }
            return s;
        });
        onUpdate(mission.id, { ...mission, squads: updated });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
            {/* LEFT: POOL */}
            <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-lg p-4 flex flex-col lg:col-span-1 h-full overflow-hidden">
                <h3 className="text-sm font-bold text-slate-300 uppercase mb-4 flex justify-between shrink-0">
                    <span>Inscrits ({participants.length})</span>
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">Pool</span>
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {participants.map(p => {
                        const isAssigned = squads.some(sq => sq.slots.some(sl => sl.assignedTo === p.id));
                        if (isAssigned) return null;

                        return (
                            <div
                                key={p.id}
                                onClick={() => setSelectedParticipant(selectedParticipant?.id === p.id ? null : p)}
                                className={`p-3 rounded border cursor-pointer transition-all flex justify-between items-center text-sm
                                    ${selectedParticipant?.id === p.id
                                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                                    }
                                `}
                            >
                                <div>
                                    <div className="font-bold">{p.name}</div>
                                    <div className="text-[10px] opacity-70 uppercase flex gap-2">
                                        <span>{p.role}</span>
                                        {p.comment && <span className="text-amber-400" title={p.comment}>Infos</span>}
                                    </div>
                                </div>
                                <Plus size={14} className={`transition-transform ${selectedParticipant?.id === p.id ? 'rotate-45' : ''}`} />
                            </div>
                        );
                    })}
                    {participants.length === 0 && (
                        <div className="text-center text-slate-500 py-10 text-xs italic">Aucun inscrit en attente</div>
                    )}
                </div>
            </div>

            {/* RIGHT: SQUADS */}
            <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-lg p-4 flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-sm font-bold text-slate-300 uppercase flex items-center gap-2">
                        <Users size={16} /> Dispatch / ORBAT
                    </h3>
                    <button onClick={addSquad} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2">
                        <Plus size={14} /> Ajouter Escouade
                    </button>
                </div>

                <div className="overflow-y-auto space-y-6 pr-2 pb-10 flex-1">
                    {squads.map(squad => (
                        <div key={squad.id} style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                            {/* Squad Header */}
                            <div className="bg-slate-800 p-2 flex flex-wrap gap-4 items-center border-b border-slate-700">
                                <input
                                    className="bg-transparent text-sm font-bold text-white uppercase outline-none focus:border-b border-blue-500 w-32"
                                    value={squad.name}
                                    onChange={(e) => updateSquad(squad.id, 'name', e.target.value)}
                                    placeholder="NOM SQUAD"
                                />
                                <div className="flex items-center gap-2 text-xs bg-slate-950 px-2 py-1 rounded border border-slate-700">
                                    <Radio size={12} className="text-blue-400" />
                                    <span className="text-slate-500 uppercase font-bold">FRÉQ:</span>
                                    <input
                                        className="bg-transparent w-12 text-blue-200 outline-none font-mono"
                                        value={squad.radioFrequency}
                                        onChange={(e) => updateSquad(squad.id, 'radioFrequency', e.target.value)}
                                        placeholder="50.0"
                                    />
                                </div>
                                <div className="ml-auto flex gap-1">
                                    <button onClick={() => addSlot(squad.id)} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-green-400" title="Ajouter Slot"><Plus size={14} /></button>
                                    <button onClick={() => removeSquad(squad.id)} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400" title="Supprimer Squad"><Trash2 size={14} /></button>
                                </div>
                            </div>

                            {/* Slots */}
                            <div className="p-2 space-y-1">
                                {squad.slots.map(slot => {
                                    const assignedPlayer = participants.find(p => p.id === slot.assignedTo);
                                    // Find linked loadout to display standard gear summary
                                    const linkedLoadout = loadouts.find(l => l.role === slot.role);

                                    return (
                                        <div
                                            key={slot.id}
                                            className={`grid grid-cols-[1.5fr,2fr,20px] gap-2 items-center p-2 rounded border text-xs transition-colors
                                                ${selectedParticipant && !assignedPlayer ? 'border-blue-500 bg-blue-500 cursor-pointer hover:bg-blue-500' : 'border-slate-800 bg-slate-950'}
                                            `}
                                            onClick={() => !assignedPlayer && selectedParticipant ? assignParticipant(squad.id, slot.id) : null}
                                        >
                                            {/* Role Selector */}
                                            <div className="flex flex-col">
                                                <select
                                                    className="bg-transparent text-blue-300 font-bold uppercase outline-none focus:text-white w-full text-[10px]"
                                                    value={slot.role}
                                                    onChange={(e) => updateSlotRole(squad.id, slot.id, e.target.value)}
                                                >
                                                    {loadouts.length > 0 ? (
                                                        loadouts.map(l => <option key={l.id} value={l.role}>{l.role}</option>)
                                                    ) : (
                                                        <option value={slot.role}>{slot.role}</option>
                                                    )}
                                                </select>
                                                <span className="text-[9px] text-slate-600 truncate">
                                                    {linkedLoadout ? `${linkedLoadout.gear.primary || 'Armement?'}` : 'Aucun loadout défini'}
                                                </span>
                                            </div>

                                            {/* Assignment Display */}
                                            <div className="truncate">
                                                {assignedPlayer ? (
                                                    <span className="text-white font-bold flex items-center gap-1">
                                                        {assignedPlayer.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-700 italic flex items-center gap-1">
                                                        {selectedParticipant ? "← Cliquer pour assigner" : "Libre"}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action */}
                                            <div className="flex justify-end">
                                                {assignedPlayer ? (
                                                    <button onClick={(e) => { e.stopPropagation(); unassignSlot(squad.id, slot.id); }} className="text-slate-600 hover:text-red-500">
                                                        <X size={12} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => removeSlot(squad.id, slot.id)} className="text-slate-700 hover:text-red-500">
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {squads.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-lg">
                            <p className="text-slate-500 text-sm">Aucune escouade définie.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* --- CONFIG PANEL (Updated) --- */
const ConfigPanel = ({ mission, onUpdate, onDelete }) => {
    const [activeTab, setActiveTab] = useState('loadouts'); // Default to loadouts so user sees it first
    const [formData, setFormData] = useState({ ...mission });

    React.useEffect(() => { setFormData({ ...mission }); }, [mission]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        onUpdate(mission.id, updated);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-1 overflow-x-auto">
                <button onClick={() => setActiveTab('general')} className={`px-4 py-2 text-sm font-bold uppercase border-b-2 transition-colors whitespace-nowrap ${activeTab === 'general' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Général</button>
                <button onClick={() => setActiveTab('loadouts')} className={`px-4 py-2 text-sm font-bold uppercase border-b-2 transition-colors whitespace-nowrap ${activeTab === 'loadouts' ? 'border-amber-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Rôles & Loadouts</button>
                <button onClick={() => setActiveTab('briefing')} className={`px-4 py-2 text-sm font-bold uppercase border-b-2 transition-colors whitespace-nowrap ${activeTab === 'briefing' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Briefing</button>
                <button onClick={() => setActiveTab('squads')} className={`px-4 py-2 text-sm font-bold uppercase border-b-2 transition-colors whitespace-nowrap ${activeTab === 'squads' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Escouades & Dispatch</button>
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === 'general' && (
                    <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-lg p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Titre de la Mission</label>
                            <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-blue-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Nom de Code (OP)</label>
                            <input name="opName" value={formData.opName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-blue-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Date IRL</label>
                            <input name="date" value={formData.date} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-blue-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Heure de RDV</label>
                            <input name="time" value={formData.time} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-blue-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Carte / Map</label>
                            <input name="map" value={formData.map} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-blue-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Conditions Météo</label>
                            <input name="weather" value={formData.weather} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-blue-500 outline-none" />
                        </div>
                        {/* New fields from screenshot header */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Règles Respawn</label>
                            <input name="respawn" value={formData.respawn || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: ACRE Standard" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Modset</label>
                            <input name="modset" value={formData.modset || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-blue-500 outline-none" placeholder="Lien ou Nom" />
                        </div>

                        <div className="col-span-full space-y-2 mt-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Statut Mission</label>
                            <div className="flex gap-4">
                                {['WAITING', 'ACTIVE', 'FINISHED'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleChange({ target: { name: 'status', value: status } })}
                                        className={`px-4 py-2 rounded text-xs font-bold border transition-colors ${formData.status === status ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-600'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'loadouts' && (
                    <LoadoutEditor mission={formData} onUpdate={onUpdate} />
                )}

                {activeTab === 'briefing' && (
                    <BriefingEditor mission={formData} onUpdate={onUpdate} />
                )}

                {activeTab === 'squads' && (
                    <SquadBuilder mission={formData} onUpdate={onUpdate} />
                )}
            </div>

            <div className="flex justify-between pt-4 border-t border-white">
                <button
                    onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer cette mission DÉFINITIVEMENT ?')) onDelete(mission.id);
                    }}
                    className="text-red-500 hover:text-red-400 text-xs font-bold uppercase flex items-center gap-2 px-4 py-2 hover:bg-red-500 rounded transition-all"
                >
                    <Trash2 size={16} /> Supprimer Mission
                </button>
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/*                                MAIN COMPONENT                              */
/* -------------------------------------------------------------------------- */

export default function Missions() {
    const { missions, setMissions } = useGame();
    // Use consistent state initialization to avoid errors
    const [viewMode, setViewMode] = useState('list');
    const [selectedMissionId, setSelectedMissionId] = useState(null);
    const selectedMission = missions.find(m => m.id === selectedMissionId);

    const handleCreateMission = () => {
        const newMission = {
            id: Date.now(),
            title: "NOUVELLE OPÉRATION",
            opName: `OP-${Math.floor(Math.random() * 1000)}`,
            date: new Date().toLocaleDateString(),
            time: "21:00",
            map: "Altis",
            weather: "Clair",
            briefing: [],
            status: "WAITING",
            created: new Date().toLocaleDateString(),
            participants: [],
            // Initialize default loadouts and squads
            loadouts: [
                {
                    id: Date.now(), role: 'Fusilier',
                    gear: { primary: 'HK416', primaryOptic: 'Eotech', medical: 'Standard' }
                },
                {
                    id: Date.now() + 1, role: 'Medic',
                    gear: { primary: 'HK416', primaryOptic: 'Eotech', medical: 'Kit Medic Complet' }
                }
            ],
            squads: []
        };
        setMissions(prev => [newMission, ...prev]);
        setSelectedMissionId(newMission.id);
        setViewMode('detail');
    };

    const handleUpdateMission = (id, updates) => {
        setMissions(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const handleDeleteMission = (id) => {
        setMissions(prev => prev.filter(m => m.id !== id));
        setViewMode('list');
        setSelectedMissionId(null);
    };

    if (viewMode === 'list') {
        return (
            <div className="w-full text-slate-200">
                <PageTitle title="Gestion des Missions (GM)" subtitle="Espace réservé aux Mission Makers et Game Masters." />

                <div className="w-full">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex bg-slate-900 rounded p-1 border border-slate-700">
                            <button className="px-4 py-1.5 text-xs font-bold uppercase rounded bg-blue-600 text-white">Toutes</button>
                        </div>
                        <button onClick={handleCreateMission} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 shadow-lg transition-all">
                            <Plus size={16} /> Créer Mission
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {missions.map(mission => (
                            <div
                                key={mission.id}
                                onClick={() => { setSelectedMissionId(mission.id); setViewMode('detail'); }}
                                style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                                className="group bg-[#0f172a] rounded-xl border border-slate-800 hover:border-blue-500 cursor-pointer transition-all duration-300 overflow-hidden relative"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <MissionStatusBadge status={mission.status} />
                                        <span className="text-[10px] font-mono text-slate-500">{mission.date}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase leading-tight mb-1 group-hover:text-blue-400 transition-colors">{mission.title}</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{mission.opName}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800 pt-3">
                                        <div className="flex items-center gap-1.5"><Users size={12} /> {(mission.participants || []).length} Inscrits</div>
                                        <div className="flex items-center gap-1.5"><List size={12} /> {(mission.squads || []).length} Escouades</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'detail' && selectedMission) {
        return (
            <div className="w-full text-slate-200">
                <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-xl">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setViewMode('list')} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-white uppercase tracking-tight leading-none">{selectedMission.title}</h1>
                            <span className="text-xs font-mono text-slate-500 uppercase">Édition Mission Master</span>
                        </div>
                    </div>
                    <MissionStatusBadge status={selectedMission.status} />
                </div>
                <div className="w-full">
                    <ConfigPanel mission={selectedMission} onUpdate={handleUpdateMission} onDelete={handleDeleteMission} />
                </div>
            </div>
        );
    }
    return null;
}



