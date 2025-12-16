import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import PageTitle from '../components/PageTitle';
import {
    Calendar, Map, Clock, UserPlus, Check, CheckCircle2,
    AlertTriangle, ChevronRight, Info
} from 'lucide-react';

export default function MissionRegistration() {
    const { missions, setMissions, allPlayers } = useGame(); // Assuming we might identify user later
    const [selectedMission, setSelectedMission] = useState(null);
    const [formData, setFormData] = useState({ name: '', role: 'Fusilier', comment: '' });
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Filter only active or waiting missions for players
    const availableMissions = missions.filter(m => m.status === 'WAITING' || m.status === 'ACTIVE');

    const handleRegister = (e) => {
        e.preventDefault();
        if (!selectedMission) return;

        const newParticipant = {
            id: Date.now(),
            name: formData.name,
            role: formData.role,
            comment: formData.comment,
            assignedSquadId: null, // Not yet assigned
            status: 'PENDING'
        };

        const updatedMissions = missions.map(m => {
            if (m.id === selectedMission.id) {
                return {
                    ...m,
                    participants: [...(m.participants || []), newParticipant]
                };
            }
            return m;
        });

        setMissions(updatedMissions);
        setHasSubmitted(true);
        setTimeout(() => {
            setHasSubmitted(false);
            setFormData({ name: '', role: 'Fusilier', comment: '' });
            setSelectedMission(null);
        }, 3000);
    };

    return (
        <div className="w-full">
            <PageTitle title="Inscription Opérations" subtitle="Rejoignez les rangs pour les prochaines missions." />

            <div className="w-full space-y-8">

                {/* 1. Select Mission */}
                <section>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                        <Calendar className="text-blue-500" />
                        Missions Disponibles
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableMissions.length > 0 ? availableMissions.map(mission => (
                            <div
                                key={mission.id}
                                onClick={() => { setSelectedMission(mission); setHasSubmitted(false); }}
                                className={`cursor-pointer border rounded-xl p-5 transition-all relative overflow-hidden group
                                    ${selectedMission?.id === mission.id
                                        ? 'bg-blue-900 border-blue-500 ring-1 ring-blue-500'
                                        : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase py-0.5 px-2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                        {mission.date}
                                    </span>
                                    {selectedMission?.id === mission.id && (
                                        <CheckCircle2 size={18} className="text-blue-500 animate-in zoom-in" />
                                    )}
                                </div>
                                <h3 className="text-xl font-black text-white uppercase italic">{mission.title}</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{mission.opName}</p>

                                <div className="flex gap-4 text-sm text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <Map size={14} className="text-slate-500" />
                                        {mission.map}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-slate-500" />
                                        {mission.time}
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-white flex items-center justify-between">
                                    <span className="text-xs text-slate-500">
                                        <strong className="text-slate-300">{(mission.participants || []).length}</strong> inscrits
                                    </span>
                                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        S'inscrire <ChevronRight size={12} />
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full p-8 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900">
                                <Info className="mx-auto text-slate-600 mb-2" />
                                <p className="text-slate-500">Aucune mission ouverte aux inscriptions pour le moment.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 2. Registration Form */}
                {selectedMission && (
                    <section className="animate-in slide-in-from-bottom duration-500 fade-in">
                        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
                            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                                    <UserPlus className="text-green-500" />
                                    Formulaire d'inscription
                                </h2>
                                <span className="text-xs font-mono text-slate-500 uppercase">
                                    Opération: <span className="text-white font-bold">{selectedMission.opName}</span>
                                </span>
                            </div>

                            {hasSubmitted ? (
                                <div className="p-12 text-center animate-in zoom-in duration-300">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500">
                                        <CheckCircle2 size={32} className="text-green-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Inscription Confirmée !</h3>
                                    <p className="text-slate-400 max-w-sm mx-auto">Votre demande a été transmise au commandement. Veuillez surveiller les annonces pour votre affectation.</p>
                                    <button
                                        onClick={() => setSelectedMission(null)}
                                        className="mt-6 text-slate-500 hover:text-white text-sm font-bold uppercase tracking-wider"
                                    >
                                        Retour aux missions
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleRegister} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase">Nom du Soldat</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Ex: Soldat Ryan"
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors"
                                            />
                                            <p className="text-[10px] text-slate-600">Utilisez votre pseudo exact en jeu.</p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase">Pseudo Discord (si différent)</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors"
                                                placeholder="Optionnel"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase">Souhait de Rôle</label>
                                            <select
                                                value={formData.role}
                                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none appearance-none"
                                            >
                                                <option value="Fusilier">Fusilier (Standard)</option>
                                                <option value="Medic">Médical (Medic/Auxsan)</option>
                                                <option value="Auto-Machine Gunner">Appui Feu (Minimi/MG)</option>
                                                <option value="Anti-Tank">Anti-Char (AT)</option>
                                                <option value="Grenadier">Grenadier</option>
                                                <option value="Radio">Radio / Transmissions</option>
                                                <option value="Chef d'Escouade">Commandement (SL)</option>
                                                <option value="Pilote">Pilote / Équipage Véhicule</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase">Remarques / Dispo</label>
                                            <textarea
                                                value={formData.comment}
                                                onChange={e => setFormData({ ...formData, comment: e.target.value })}
                                                rows={2}
                                                placeholder="Retard prévu, préférences escouade..."
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 pt-4 border-t border-white flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-amber-500 text-xs bg-amber-500 px-3 py-2 rounded border border-amber-500">
                                            <AlertTriangle size={14} />
                                            <span>L'inscription vous engage à être présent à l'heure du rassemblement.</span>
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-blue-500 transition-all flex items-center gap-2"
                                        >
                                            <Check size={18} />
                                            Confirmer Inscription
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}



