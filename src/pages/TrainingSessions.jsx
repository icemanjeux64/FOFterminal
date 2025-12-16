import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext'; // Assuming context is available
import { Calendar, Clock, User, ChevronDown, ChevronUp, Archive, Plus, History, BookOpen } from 'lucide-react';
import PageTitle from '../components/PageTitle';

export default function TrainingSessions() {
    const { trainingModules, trainingSessions, setTrainingSessions, currentUserRole, allPlayers } = useGame();
    const [activeTab, setActiveTab] = useState('planning');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // RBAC
    const canManageSessions = currentUserRole === 'ADMIN' || currentUserRole === 'TRAINER';
    // Archives restricted to Trainers and Admins only as requested
    const canViewArchives = currentUserRole === 'TRAINER' || currentUserRole === 'ADMIN';

    // Find current user player profile for registration
    // In a real app we'd have a currentUserId, here we simulate with first player or use role.
    // Ideally we should know WHICH player is the current user.
    // For now we will assume the "inscription" feature is a general "Sign Me Up" button.

    // New Session Form State
    const [newSession, setNewSession] = useState({
        moduleId: '',
        date: '',
        time: '',
        instructor: ''
    });

    const handleCreateSession = () => {
        if (!newSession.moduleId || !newSession.date || !newSession.time) return;

        const module = trainingModules.find(m => m.id === parseInt(newSession.moduleId));
        if (!module) return;

        const session = {
            id: Date.now(),
            moduleId: module.id,
            moduleTitle: module.title,
            date: newSession.date,
            time: newSession.time,
            instructor: newSession.instructor || 'Non Assigné',
            status: 'Scheduled', // Scheduled, Completed, Cancelled
            attendees: []
        };

        setTrainingSessions(prev => [...prev, session]);
        setIsModalOpen(false);
        setNewSession({ moduleId: '', date: '', time: '', instructor: '' });
    };

    // Sorting and Filtering
    const upcomingSessions = useMemo(() => {
        const now = new Date();
        return trainingSessions
            .filter(s => {
                const sessionDate = new Date(`${s.date}T${s.time}`);
                return sessionDate >= now || s.status === 'Scheduled'; // Simple logic
            })
            .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    }, [trainingSessions]);

    const pastSessions = useMemo(() => {
        const now = new Date();
        return trainingSessions.filter(s => {
            const sessionDate = new Date(`${s.date}T${s.time}`);
            return sessionDate < now || s.status === 'Completed';
        });
    }, [trainingSessions]);

    // Grouping for Archives
    const archivedByModule = useMemo(() => {
        const grouped = {};
        pastSessions.forEach(session => {
            if (!grouped[session.moduleId]) {
                grouped[session.moduleId] = {
                    title: session.moduleTitle,
                    count: 0,
                    sessions: []
                };
            }
            grouped[session.moduleId].count++;
            grouped[session.moduleId].sessions.push(session);
        });
        return Object.values(grouped);
    }, [pastSessions]);

    // Format Date Helper
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const handleRegister = (sessionId) => {
        // Simple toggle for demo purposes using a placeholder name if no real user context
        const playerName = "Moi (Soldat)";
        setTrainingSessions(prev => prev.map(s => {
            if (s.id === sessionId) {
                const isRegistered = s.attendees && s.attendees.includes(playerName);
                const newAttendees = isRegistered
                    ? s.attendees.filter(a => a !== playerName)
                    : [...(s.attendees || []), playerName];
                return { ...s, attendees: newAttendees };
            }
            return s;
        }));
    };

    return (
        <div className="w-full space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <PageTitle
                    title="Planning des Séances"
                    subtitle="Organisation et historique des sessions d'instruction."
                    icon={Calendar}
                />

                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
                    <button
                        onClick={() => setActiveTab('planning')}
                        className={`px-4 py-2 rounded text-sm font-bold uppercase transition-all ${activeTab === 'planning' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Planning
                    </button>
                    {canViewArchives && (
                        <button
                            onClick={() => setActiveTab('archives')}
                            className={`px-4 py-2 rounded text-sm font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'archives' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <History size={16} /> Archives
                        </button>
                    )}
                </div>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'planning' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                    {canManageSessions && (
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase py-2 px-4 rounded-lg shadow-lg shadow-blue-900 transition-all active:scale-95"
                            >
                                <Plus size={20} /> Planifier une Séance
                            </button>
                        </div>
                    )}

                    {upcomingSessions.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900">
                            <Calendar size={48} className="mx-auto text-slate-700 mb-4" />
                            <p className="text-slate-500 font-tech uppercase tracking-widest">Aucune séance planifiée</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {upcomingSessions.map(session => (
                                <div key={session.id} style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-500 transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-blue-900 p-4 rounded-lg border border-blue-500 text-center min-w-[80px]">
                                            <div className="text-sm font-bold text-blue-400 uppercase">{new Date(session.date).toLocaleDateString('fr-FR', { month: 'short' })}</div>
                                            <div className="text-2xl font-black text-white">{new Date(session.date).getDate()}</div>
                                            <div className="text-xs font-mono text-slate-400 mt-1">{session.time}</div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white font-tech uppercase mb-1 group-hover:text-blue-400 transition-colors">{session.moduleTitle}</h3>
                                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                                <span className="flex items-center gap-1"><User size={14} /> Instructeur: <span className="text-slate-300">{session.instructor}</span></span>
                                                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono uppercase text-emerald-400">Scheduled</span>
                                                <span className="text-slate-500 text-xs">Inscrits: {session.attendees?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {canManageSessions ? (
                                            <>
                                                <button className="px-4 py-2 border border-slate-600 rounded text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-bold uppercase">Détails</button>
                                                <button onClick={() => {
                                                    if (confirm("Marquer comme terminée ?")) {
                                                        setTrainingSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: 'Completed' } : s));
                                                    }
                                                }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-bold uppercase shadow-lg shadow-emerald-900">Valider (Fini)</button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleRegister(session.id)}
                                                className={`px-4 py-2 rounded text-sm font-bold uppercase shadow-lg transition-colors ${session.attendees?.includes("Moi (Soldat)")
                                                    ? 'bg-red-900 text-red-400 hover:bg-red-900'
                                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900'
                                                    }`}
                                            >
                                                {session.attendees?.includes("Moi (Soldat)") ? "Se Désinscrire" : "S'inscrire"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {canViewArchives && activeTab === 'archives' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                    <h2 className="text-xl font-bold text-slate-400 uppercase font-tech tracking-wide mb-4 flex items-center gap-2">
                        <Archive size={20} /> Historique par Module
                    </h2>

                    {archivedByModule.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900">
                            <History size={48} className="mx-auto text-slate-700 mb-4" />
                            <p className="text-slate-500 font-tech uppercase tracking-widest">Aucune archive disponible</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {archivedByModule.map((group, idx) => (
                                <div key={idx} style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 hover:border-amber-500 rounded-xl p-5 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-amber-500 p-2 rounded-lg border border-amber-500">
                                                <BookOpen size={20} className="text-amber-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white uppercase text-sm leading-tight">{group.title}</h3>
                                                <span className="text-xs text-slate-500 font-mono">Total Séances: {group.count}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-4 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                        {group.sessions.map(session => (
                                            <div key={session.id} className="flex justify-between items-center text-xs p-2 bg-slate-950 rounded border border-slate-800">
                                                <span className="text-slate-300 flex items-center gap-2">
                                                    <Calendar size={12} className="text-slate-500" />
                                                    {new Date(session.date).toLocaleDateString('fr-FR')}
                                                </span>
                                                <span className="text-slate-500 font-mono flex items-center gap-1">
                                                    <User size={10} /> {session.instructor}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* CREATE SESSION MODAL */}
            {canManageSessions && isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950  p-4 animate-in fade-in duration-200">
                    <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 100 }} className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-black">
                        <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white uppercase font-tech flex items-center gap-3">
                                <Calendar className="text-blue-500" /> Planifier Séance
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">✕</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Module de Formation</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors"
                                    value={newSession.moduleId}
                                    onChange={e => setNewSession({ ...newSession, moduleId: e.target.value })}
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {trainingModules.map(m => (
                                        <option key={m.id} value={m.id}>{m.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors"
                                        value={newSession.date}
                                        onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Heure</label>
                                    <input
                                        type="time"
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors"
                                        value={newSession.time}
                                        onChange={e => setNewSession({ ...newSession, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Instructeur (Optionnel)</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Nom de l'instructeur..."
                                    value={newSession.instructor}
                                    onChange={e => setNewSession({ ...newSession, instructor: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase rounded transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateSession}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase rounded transition-colors shadow-lg shadow-blue-600"
                            >
                                Valider
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



