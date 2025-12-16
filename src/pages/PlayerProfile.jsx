import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { User, Shield, Calendar, Award, Clock, ArrowLeft, Briefcase, Edit2, Save, X, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const RANK_ORDER = ['Recrue', '1ere Classe', 'Caporal', 'Caporal-Chef', 'Sergent', 'Sergent-Chef', 'Adjudant', 'Adjudant-Chef', 'Major', 'Aspirant', 'Sous-Lieutenant', 'Lieutenant', 'Capitaine', 'Commandant', 'Lieutenant-Colonel', 'Colonel', 'Général'];


// Reusable Content Component
export const PlayerProfileContent = ({ player, isEditing, setIsEditing, editForm, setEditForm, saveChanges, handleAddRole, handleRemoveRole, serviceHistory, trainingHistory, playerSanctions, showNavigation = true, startEditing, onAddTraining, trainingModules }) => {
    // Local state for new training form
    const [newTraining, setNewTraining] = useState({ moduleId: '', date: new Date().toISOString().split('T')[0] });
    // Pagination for Service History
    const [servicePage, setServicePage] = useState(1);
    const ITEMS_PER_PAGE = 5;
    const totalServicePages = Math.ceil(serviceHistory.length / ITEMS_PER_PAGE);

    const paginatedServiceHistory = serviceHistory.slice((servicePage - 1) * ITEMS_PER_PAGE, servicePage * ITEMS_PER_PAGE);

    const handleSubmitTraining = () => {
        if (newTraining.moduleId && newTraining.date) {
            onAddTraining(newTraining);
            setNewTraining({ moduleId: '', date: new Date().toISOString().split('T')[0] });
        }
    };
    // Only show navigation/edit buttons if allowed

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* NAVIGATION & EDIT CONTROLS */}
            {showNavigation && (
                <div className="flex justify-between items-center">
                    {/* Back Button - only if navigation enabled contextually or purely hidden if embedded */}
                    <span className="text-slate-500 text-xs font-mono uppercase tracking-widest hidden md:block">
                        Matricule # <span className="text-blue-500 font-bold">{player.matricule || '-----'}</span>
                    </span>

                    {!isEditing ? (
                        startEditing && (
                            <button onClick={startEditing} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase text-xs transition-colors ml-auto">
                                <Edit2 size={14} /> Modifier le dossier
                            </button>
                        )
                    ) : (
                        <div className="flex gap-2 ml-auto">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold uppercase text-xs transition-colors">
                                Annuler
                            </button>
                            <button onClick={saveChanges} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold uppercase text-xs transition-colors">
                                <Save size={14} /> Enregistrer
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* HEADER CARD */}
            <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-2xl overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-900/40 to-slate-900/0 border-b border-white"></div>

                <div className="relative p-8 flex flex-col md:flex-row gap-8 items-start md:items-end">
                    <div className="w-40 h-40 bg-slate-950 rounded-xl border-4 border-slate-800 shadow-xl flex items-center justify-center text-slate-700 relative z-10 shrink-0 overflow-hidden group">
                        <User size={64} />
                        {player.matricule && (
                            <div className="absolute bottom-0 w-full bg-slate-900 text-center py-1 text-[10px] text-slate-400 font-mono border-t border-slate-800">
                                {player.matricule}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-2 mb-2 relative z-10 w-full">
                        {!isEditing ? (() => {
                            // Effective Grade Logic (Same as Joueurs.jsx)
                            const getEffectiveGrade = (p) => {
                                const norm = (s) => s.toLowerCase().replace(/-/g, ' ').trim();
                                const priorities = [...RANK_ORDER].reverse();

                                if (p.roles && p.roles.length > 0) {
                                    for (let rank of priorities) {
                                        if (rank === 'Major') {
                                            const found = p.roles.find(r => {
                                                const n = norm(r);
                                                return n.includes('major') && !n.includes('etat major');
                                            });
                                            if (found) return rank;
                                            continue;
                                        }

                                        const found = p.roles.find(r => norm(r).includes(norm(rank)));
                                        if (found) return rank;
                                    }
                                }
                                return p.grade || 'Recrue';
                            };
                            const effectiveGrade = getEffectiveGrade(player);

                            return (
                                <>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded text-sm font-black uppercase tracking-wider border ${effectiveGrade === 'Recrue' ? 'bg-slate-800 border-slate-700 text-slate-400' :
                                            effectiveGrade.includes('Caporal') ? 'bg-emerald-900 border-emerald-800 text-emerald-500' :
                                                effectiveGrade.includes('Sergent') ? 'bg-amber-900 border-amber-800 text-amber-500' :
                                                    (effectiveGrade.includes('Adjudant') || effectiveGrade.includes('Major')) ? 'bg-purple-900 border-purple-800 text-purple-500' :
                                                        (effectiveGrade.includes('Capitaine') || effectiveGrade.includes('Lieutenant') || effectiveGrade.includes('Aspirant')) ? 'bg-yellow-900 border-yellow-800 text-yellow-500' :
                                                            (effectiveGrade.includes('Colonel') || effectiveGrade.includes('Général') || effectiveGrade.includes('Commandant')) ? 'bg-red-900 border-red-800 text-red-500' :
                                                                'bg-blue-900 border-blue-800 text-blue-500'
                                            }`}>
                                            {effectiveGrade}
                                        </span>
                                        <span className="text-slate-500 font-mono text-xs uppercase flex items-center gap-1">
                                            <Clock size={12} /> Service: {player.joinDate}
                                        </span>
                                        {player.matricule && (
                                            <span className="text-slate-600 font-mono text-xs uppercase flex items-center gap-1 border-l border-slate-800 pl-3 ml-1">
                                                ID: {player.matricule}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-5xl font-black text-white font-tech uppercase tracking-tight">{player.name}</h1>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {player.roles && player.roles.map((role, idx) => (
                                            <span key={idx} className="text-xs bg-slate-950 px-2 py-1 rounded text-slate-400 border border-slate-800 uppercase font-bold tracking-wide">
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            );
                        })() : (
                            <div className="space-y-4 max-w-xl">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Grade</label>
                                        <select
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold"
                                            value={editForm.grade}
                                            onChange={e => setEditForm({ ...editForm, grade: e.target.value })}
                                        >
                                            {RANK_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date Arrivée</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                                            value={editForm.joinDate}
                                            onChange={e => setEditForm({ ...editForm, joinDate: e.target.value })}
                                            placeholder="JJ/MM/AAAA"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nom</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-black text-xl uppercase"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Rôles</label>

                                    {/* Simple Role Editor for reuse */}
                                    <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-950 rounded border border-slate-800 min-h-[40px]">
                                        {editForm.roles && editForm.roles.map((role, idx) => (
                                            <span key={idx} className="flex items-center gap-1 text-xs bg-blue-900 px-2 py-1 rounded text-blue-300 border border-blue-800 uppercase font-bold">
                                                {role}
                                                <button onClick={() => handleRemoveRole(role)} className="hover:text-white"><X size={12} /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Requires external state management for newRole if not strictly internal */}
                                        <button onClick={handleAddRole} className="p-1 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs uppercase font-bold w-full">+ Ajouter Rôle (Via profil complet)</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 relative z-10 opacity-50">
                        <Shield size={120} className="text-slate-800 absolute bottom-[-40px] right-[-20px] mix-blend-overlay" />
                    </div>
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: STATS & GENERAL */}
                <div className="space-y-6">
                    <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-bold text-white uppercase font-tech flex items-center gap-2">
                            <Briefcase size={20} className="text-amber-500" /> État de Service
                        </h3>
                        {/* Stats ... */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                                <div className="text-3xl font-black text-white">{serviceHistory.filter(s => s.squadName === 'Logistique').length}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Services Logi</div>
                            </div>
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                                <div className="text-3xl font-black text-white">{serviceHistory.filter(s => s.squadName !== 'Logistique').length}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Commandement SL</div>
                            </div>
                        </div>
                    </div>

                    {/* QUALIFICATIONS REMOVED AS REQUESTED (Duplicate of Suivi Instruction) */}

                    {/* SANCTIONS BLOCK */}
                    <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-bold text-white uppercase font-tech flex items-center gap-2">
                            <Shield size={20} className="text-red-500" /> Casier Disciplinaire
                        </h3>
                        {playerSanctions && playerSanctions.length > 0 ? (
                            playerSanctions.map((s, idx) => (
                                <div key={idx} className="bg-red-500 border border-red-500 p-3 rounded-lg">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-red-400 uppercase">Échelle {s.scale}</span>
                                        <span className="text-[10px] text-red-300 font-mono">{s.date}</span>
                                    </div>
                                    <p className="text-sm text-white font-medium">{s.reason}</p>
                                    {s.duration && <div className="mt-2 text-[10px] bg-red-950 inline-block px-1.5 py-0.5 rounded text-red-300 border border-red-900">Durée: {s.duration}</div>}
                                </div>
                            ))
                        ) : (
                            <div className="bg-slate-950 p-4 rounded flex items-center gap-3 opacity-50 border border-slate-800 border-dashed justify-center">
                                <span className="text-sm text-slate-500 italic flex items-center gap-2">
                                    <Shield size={14} /> Casier Vierge
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* CENTER/RIGHT COLUMN: HISTORY TABS */}
                <div className="lg:col-span-2 space-y-6">

                    {/* SERVICE HISTORY LIST */}
                    <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white uppercase font-tech mb-6 flex items-center gap-2">
                            <Clock size={20} className="text-emerald-500" /> Historique Opérationnel
                        </h3>

                        {serviceHistory.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
                                <p className="text-slate-500 font-mono text-sm">Aucun service enregistré.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full justify-between">
                                <div className="space-y-3 mb-4">
                                    {paginatedServiceHistory.map(service => (
                                        <div key={service.id} className="bg-slate-950 p-4 rounded border border-slate-800 flex justify-between items-center group hover:border-slate-600 transition-colors animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded ${service.squadName === 'Logistique' ? 'bg-amber-900 text-amber-500' : 'bg-blue-900 text-blue-500'}`}>
                                                    {service.squadName === 'Logistique' ? <Briefcase size={16} /> : <Shield size={16} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-200 uppercase text-sm">{service.squadName === 'Logistique' ? 'Supervision Logistique' : `Squad Leader ${service.squadName}`}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{service.timeStart} - {service.timeEnd || 'En cours...'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalServicePages > 1 && (
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                                        <button
                                            onClick={() => setServicePage(p => Math.max(1, p - 1))}
                                            disabled={servicePage === 1}
                                            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 transition-colors"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <span className="text-xs font-mono text-slate-500">Page {servicePage} / {totalServicePages}</span>
                                        <button
                                            onClick={() => setServicePage(p => Math.min(totalServicePages, p + 1))}
                                            disabled={servicePage === totalServicePages}
                                            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 transition-colors"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* TRAINING HISTORY LIST */}
                    <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white uppercase font-tech mb-6 flex items-center gap-2">
                            <Award size={20} className="text-purple-500" /> Suivi Instruction
                        </h3>

                        {isEditing && (
                            <div className="bg-slate-900 p-4 rounded border border-blue-500 mb-4 animate-in fade-in">
                                <h4 className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-2"><Plus size={12} /> Ajouter Qualification</h4>
                                <div className="flex gap-2 flex-col sm:flex-row">
                                    <select
                                        className="bg-slate-950 border border-slate-700 rounded text-xs text-white p-2 flex-1 outline-none focus:border-blue-500"
                                        value={newTraining.moduleId}
                                        onChange={e => setNewTraining({ ...newTraining, moduleId: e.target.value })}
                                    >
                                        <option value="">Sélectionner formation...</option>
                                        {trainingModules?.map(m => (
                                            <option key={m.id} value={m.id}>{m.title}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="date"
                                        className="bg-slate-950 border border-slate-700 rounded text-xs text-white p-2 outline-none focus:border-blue-500"
                                        value={newTraining.date}
                                        onChange={e => setNewTraining({ ...newTraining, date: e.target.value })}
                                    />
                                    <button
                                        onClick={handleSubmitTraining}
                                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded flex items-center justify-center transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {trainingHistory.length === 0 ? (
                            <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg">
                                <p className="text-slate-500 font-mono text-sm">Aucune formation enregistrée.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 ">
                                {trainingHistory.map(session => (
                                    <div key={session.id} className="bg-slate-950 p-4 rounded border border-slate-800 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded bg-purple-900 text-purple-500">
                                                <Award size={16} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-200 uppercase text-sm">{session.moduleTitle}</div>
                                                <div className="text-xs text-slate-500 font-mono">{new Date(session.date).toLocaleDateString()} • {session.instructor === (player.name) ? 'Instructeur' : 'Élève'}</div>
                                            </div>
                                        </div>
                                        {session.status === 'Completed' && <span className="text-xs font-bold text-emerald-500 uppercase">Validé</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div >
        </div >
    );
};

export default function PlayerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { allPlayers, updatePlayer, archives, trainingSessions, addSession, sanctions, trainingModules } = useGame();
    const [isEditing, setIsEditing] = useState(false);

    // Data Resolution
    const playerIndex = allPlayers ? allPlayers.findIndex(p => p.id === id || p.name === id) : -1;
    const player = playerIndex !== -1 ? allPlayers[playerIndex] : null;

    // Filter Sanctions
    const playerSanctions = useMemo(() => {
        if (!player || !sanctions) return [];
        return sanctions.filter(s => s.playerId === player.id || s.playerName === player.name).sort((a, b) => b.timestamp - a.timestamp);
    }, [player, sanctions]);
    // Editing State
    const [editForm, setEditForm] = useState(null);
    const [newRole, setNewRole] = useState('');

    // Initialize edit form when entering edit mode
    const startEditing = () => {
        setEditForm({ ...player });
        setIsEditing(true);
    };

    const saveChanges = async () => {
        await updatePlayer(id, editForm);
        setIsEditing(false);
    };

    // Training Logic
    const handleAddTraining = async (data) => {
        const module = trainingModules.find(m => m.id === data.moduleId);
        if (!module) return;

        // 1. Create Session
        const newSession = {
            id: Date.now(),
            moduleId: module.id,
            moduleTitle: module.title,
            date: data.date,
            time: "00:00",
            instructor: "Manuel (Profil)",
            status: "Validated",
            attendees: [player.name]
        };
        await addSession(newSession);

        // 2. Update Player
        const newRecord = {
            id: module.id,
            name: module.title,
            date: new Date(data.date).toLocaleDateString('fr-FR'),
            validated: true,
            instructor: "Manuel (Profil)"
        };

        const updatedTrainings = [...(player.trainings || []), newRecord];
        await updatePlayer(player.id, { trainings: updatedTrainings });

        // Update local edit form
        setEditForm(prev => ({ ...prev, trainings: [...(prev.trainings || []), newRecord] }));
        alert(`Formation "${module.title}" ajoutée !`);
    };

    const handleAddRole = () => {
        if (newRole && !editForm.roles.includes(newRole)) {
            setEditForm(prev => ({ ...prev, roles: [...prev.roles, newRole] }));
            setNewRole('');
        }
    };

    const handleRemoveRole = (roleToRemove) => {
        setEditForm(prev => ({ ...prev, roles: prev.roles.filter(r => r !== roleToRemove) }));
    };

    // Service History (Filter from Archives where player was SL)
    const serviceHistory = useMemo(() => {
        if (!player || !archives) return [];
        return archives.filter(a => a.sl === player.name).sort((a, b) => b.id - a.id);
    }, [archives, player]);

    // Training History
    const trainingHistory = useMemo(() => {
        if (!player || !trainingSessions) return [];
        return trainingSessions.filter(s => s.instructor === player.name || (s.attendees && s.attendees.includes(player.name)));
    }, [trainingSessions, player]);

    if (!player) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-slate-500 gap-4">
                <User size={64} className="opacity-20" />
                <div className="text-xl uppercase font-bold">Dossier introuvable</div>
                <button onClick={() => navigate('/app/players')} className="text-blue-500 hover:text-blue-400 font-bold flex items-center gap-2">
                    <ArrowLeft size={16} /> Retour au registre
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => navigate('/app/players')}
                    className="group flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors uppercase font-bold text-sm tracking-widest pl-2"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Retour Registre
                </button>
            </div>

            <PlayerProfileContent
                player={player}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                editForm={editForm}
                setEditForm={setEditForm}
                saveChanges={saveChanges}
                handleAddRole={handleAddRole} // Note: This simplified passing might need newRole logic lifted up if we edit in dashboard
                handleRemoveRole={handleRemoveRole}
                serviceHistory={serviceHistory}
                trainingHistory={trainingHistory}
                playerSanctions={playerSanctions}
                showNavigation={true} // Full profile always shows nav controls
                startEditing={startEditing}
                onAddTraining={handleAddTraining}
                trainingModules={trainingModules}
            />
        </div>
    );
}



