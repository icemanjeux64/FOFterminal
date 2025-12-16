import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import {
    Users, Radio, MapPin, ChevronRight, CheckCircle,
    Play, Activity, ArrowRight, Home, Shield, Trash2, Plus
} from 'lucide-react';
import PageTitle from '../components/PageTitle';

const SQUAD_STATUSES = [
    { id: 'CONSTITUTION', label: 'Constitution', color: 'bg-slate-500', border: 'border-slate-500', text: 'text-slate-400' },
    { id: 'READY', label: 'Opérationnel', color: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-400' },
    { id: 'MOVING', label: 'Départ Base', color: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400' },
    { id: 'ENGAGED', label: 'Sur Objectif', color: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-400' },
    { id: 'RTB', label: 'Demande RTB', color: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-400' },
    { id: 'BASE', label: 'En Base', color: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-400' }
];

const ROLES = ['Fusilier', 'Médic', 'Grenadier', 'LAT', 'HAT', 'Machine Gunner', 'Marksman', 'Sapeur'];

export default function SquadManagement() {
    const { squads, setSquads } = useGame();
    const [selectedSquadId, setSelectedSquadId] = useState(null);
    const [mySquad, setMySquad] = useState(null);

    // Roster local state (simulated for now as it's not fully in context yet, 
    // but user asked to manage it. We might need to add roster to squad object in context)
    // Actually, Effectives count is in context. 
    // The user said "gérer l'entièreté de ma squad... le nom de mes gars".
    // So we should probably upgrade the squad object in context to hold a roster list.
    // For now I will store it locally or add it to the squad object if possible.
    // Let's assume we modify the specific squad in the context to have a `roster` array.

    // Effect to sync mySquad with context changes
    useEffect(() => {
        if (selectedSquadId) {
            const found = squads.find(s => s.id === selectedSquadId);
            setMySquad(found);
        }
    }, [squads, selectedSquadId]);

    const handleSquadSelect = (id) => {
        setSelectedSquadId(id);
    };

    const updateStatus = (newStatusId) => {
        if (!mySquad) return;
        setSquads(prev => prev.map(s =>
            s.id === mySquad.id ? { ...s, status: newStatusId } : s
        ));
    };

    const updateMember = (memberId, field, value) => {
        // We need to implement roster array in squad object first.
        // If it doesn't exist, we iterate on the squad to add it.
        setSquads(prev => prev.map(s => {
            if (s.id === mySquad.id) {
                const currentRoster = s.roster || [];
                const updatedRoster = currentRoster.map(m => m.id === memberId ? { ...m, [field]: value } : m);
                return { ...s, roster: updatedRoster, effectives: updatedRoster.length };
            }
            return s;
        }));
    };

    const addMember = () => {
        setSquads(prev => prev.map(s => {
            if (s.id === mySquad.id) {
                const currentRoster = s.roster || [];
                const newMember = { id: Date.now(), name: 'Nouveau Soldat', role: 'Fusilier' };
                const updatedRoster = [...currentRoster, newMember];

                // Calculate effectives: Roster count + 1 (for SL)
                // We assume SL is always present if we are in this interface, or we check s.sl
                const hasSL = s.sl && s.sl !== 'Non Assigné' && s.sl.trim() !== '';
                const newEffectives = updatedRoster.length + (hasSL ? 1 : 0);

                return { ...s, roster: updatedRoster, effectives: newEffectives };
            }
            return s;
        }));
    };

    const removeMember = (memberId) => {
        setSquads(prev => prev.map(s => {
            if (s.id === mySquad.id) {
                const currentRoster = s.roster || [];
                const updatedRoster = currentRoster.filter(m => m.id !== memberId);

                const hasSL = s.sl && s.sl !== 'Non Assigné' && s.sl.trim() !== '';
                const newEffectives = updatedRoster.length + (hasSL ? 1 : 0);

                return { ...s, roster: updatedRoster, effectives: newEffectives };
            }
            return s;
        }));
    };

    if (!selectedSquadId) {
        return (
            <div className="p-8">
                <PageTitle title="Espace Chef d'Escouade" subtitle="Sélectionnez votre unité pour accéder au panneau de gestion." icon={Shield} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {squads.filter(s => s.name !== 'Logistique').length === 0 ? (
                        <div className="col-span-3 text-center py-20 border border-dashed border-slate-700 rounded-2xl">
                            <p className="text-slate-500 font-tech uppercase tracking-widest">Aucune escouade active</p>
                        </div>
                    ) : (
                        squads.filter(s => s.name !== 'Logistique').map(squad => (
                            <div
                                key={squad.id}
                                onClick={() => handleSquadSelect(squad.id)}
                                style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                                className="bg-[#0f172a] border border-slate-700 hover:border-amber-500 hover:bg-slate-800 p-6 rounded-xl cursor-pointer transition-all group relative overflow-hidden shadow-lg hover:shadow-amber-900 hover:-translate-y-1"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Users size={80} />
                                </div>
                                <div className={`w-12 h-1 mb-4 rounded-full ${squad.status === 'DEPLOYED' ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>

                                <h3 className="text-2xl font-black text-white mb-2 font-tech uppercase">{squad.name}</h3>

                                <div className="text-sm text-slate-400 mb-6 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Radio size={14} className="text-blue-500" />
                                        <span className="font-mono">{squad.freq}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-emerald-500" />
                                        <span className="font-mono">{squad.effectives} Pax</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white">
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Leader</div>
                                        <div className="text-xs font-bold text-slate-300">
                                            {squad.sl || 'Non Assigné'}
                                        </div>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded-full border border-slate-800 group-hover:border-amber-500 transition-colors">
                                        <ChevronRight className="text-slate-500 group-hover:text-amber-500 transition-colors" size={16} />
                                    </div>
                                </div>
                            </div>
                        )))}
                </div>
            </div>
        );
    }

    if (!mySquad) return <div>Chargement...</div>;

    const currentStatusConfig = SQUAD_STATUSES.find(st => st.id === mySquad.status) || SQUAD_STATUSES[0];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* HEROS HEADER */}
            {/* HEROS HEADER */}
            <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-white rounded-2xl p-6  relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-slate-800/50 to-transparent pointer-events-none" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div>
                        <button onClick={() => setSelectedSquadId(null)} className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-wider mb-2 flex items-center gap-1 transition-colors">
                            <ArrowRight className="rotate-180" size={12} /> Retour liste
                        </button>
                        <h1 className="text-4xl font-black text-white font-tech uppercase tracking-tight flex items-center gap-3">
                            <span className="text-amber-500">{mySquad.name}</span>
                            <span className="text-lg font-normal text-slate-400 font-sans tracking-normal border-l border-white pl-3">
                                {mySquad.sl}
                            </span>
                        </h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-400 font-mono">
                            <span className="flex items-center gap-1.5"><Radio size={14} className="text-blue-400" /> {mySquad.freq}</span>
                            <span className="flex items-center gap-1.5"><Users size={14} className="text-emerald-400" /> {mySquad.effectives} Pax</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Statut Actuel</span>
                        <div className={`px-4 py-1.5 rounded-lg border ${currentStatusConfig.border} ${currentStatusConfig.color} bg-opacity-20 flex items-center gap-2`}>
                            <Activity size={16} className={currentStatusConfig.text} />
                            <span className={`font-bold uppercase tracking-wider ${currentStatusConfig.text}`}>{currentStatusConfig.label}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN - COMMAND & STATUS */}
                <div className="space-y-6 lg:col-span-2">
                    {/* OBJECTIVES */}
                    {/* OBJECTIVES */}
                    <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-xl p-5 ">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <MapPin size={16} /> Directives État-Major
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-950 border border-amber-500 rounded-lg p-4 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                                <span className="text-[10px] items-center gap-1 font-bold text-amber-500 uppercase tracking-wider mb-1 flex">Objectif Principal</span>
                                <div className="text-xl font-bold text-white font-tech tracking-wide pt-1">
                                    {mySquad.obj1 || 'ATTENTE ORDRES'}
                                </div>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Objectif Secondaire</span>
                                <div className="text-lg font-medium text-slate-300">
                                    {mySquad.obj2 || 'Aucun'}
                                </div>
                            </div>
                        </div>
                        {mySquad.remarks && (
                            <div className="mt-4 p-3 bg-blue-900 border border-blue-500 rounded text-sm text-blue-200 flex items-start gap-2">
                                <div className="mt-0.5 min-w-[4px] h-4 bg-blue-500 rounded-full"></div>
                                <p>"{mySquad.remarks}"</p>
                            </div>
                        )}
                    </div>

                    {/* STATUS SELECTOR */}
                    {/* STATUS SELECTOR */}
                    <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-xl p-5 ">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Activity size={16} /> Mise à jour Situation
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {SQUAD_STATUSES.map(status => (
                                <button
                                    key={status.id}
                                    onClick={() => updateStatus(status.id)}
                                    className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all group
                                        ${mySquad.status === status.id
                                            ? `${status.color} bg-opacity-20 ${status.border} shadow-lg ring-1 ring-white`
                                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                                        }
                                    `}
                                >
                                    <div className={`w-2 h-2 rounded-full ${status.color.replace('bg-', 'bg-')} ${mySquad.status === status.id ? 'animate-pulse' : ''}`} />
                                    <span className={`text-xs font-bold uppercase tracking-wider ${mySquad.status === status.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                        {status.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - ROSTER */}
                <div className="lg:col-span-1">
                    <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-xl p-5 h-full  flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Users size={16} /> Effectifs
                            </h2>
                            <button onClick={addMember} className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
                                <Plus size={16} />
                            </button>
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {/* SL (Static for now based on squad data) */}
                            <div className="bg-slate-950 border border-amber-500 rounded-lg p-3 relative pl-4">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-lg" />
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-[10px] font-bold text-amber-500 uppercase">Squad Leader</div>
                                        <div className="text-white font-bold">{mySquad.sl || 'Non Assigné'}</div>
                                    </div>
                                    <Shield size={14} className="text-amber-500" />
                                </div>
                            </div>

                            {/* Members */}
                            {(mySquad.roster || []).map((member, index) => (
                                <div key={member.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 group hover:border-slate-700 transition-colors">
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={member.name}
                                            onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                                            className="bg-transparent text-sm font-bold text-white w-full outline-none focus:border-b border-blue-500 placeholder-slate-600"
                                            placeholder="Nom du soldat"
                                        />
                                        <button onClick={() => removeMember(member.id)} className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={member.role}
                                            onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                                            className="bg-slate-900 text-[10px] text-slate-400 border border-slate-800 rounded px-1 py-0.5 outline-none focus:border-blue-500"
                                        >
                                            {ROLES.map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}

                            {(!mySquad.roster || mySquad.roster.length === 0) && (
                                <div className="text-center py-8 text-slate-600 text-xs italic border border-dashed border-slate-800 rounded-lg">
                                    Aucun soldat assigné
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



