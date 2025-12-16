import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import PageTitle from '../components/PageTitle';
import { CheckCircle, Users, Calendar, AlertCircle, ChevronRight, Search, Award, CheckSquare, Square, ArrowUp, ArrowDown } from 'lucide-react';

const TrainingValidation = () => {
    const { trainingSessions, updateSession, allPlayers, updatePlayer, currentUserRole } = useGame();
    const [selectedSession, setSelectedSession] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // State for temporary validation status before saving
    // { [playerName]: boolean }
    const [validationState, setValidationState] = useState({});

    // Sorting State
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (Recent first) or 'asc' (Oldest first)

    // Filter sessions: We generally want to validate sessions that are in the past or marked Completed
    // But for flexibility, let's show all, sorted by date (recent first)
    const sortedSessions = useMemo(() => {
        const sorted = [...trainingSessions].sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        return sorted;
    }, [trainingSessions, sortOrder]);

    const filteredSessions = useMemo(() => {
        return sortedSessions.filter(s =>
            s.moduleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.attendees && s.attendees.some(a => a.toLowerCase().includes(searchTerm.toLowerCase())))
        );
    }, [sortedSessions, searchTerm]);

    const handleSelectSession = (session) => {
        setSelectedSession(session);
        // Initialize validation state based on who attended
        // If the session was already "validated" (custom flag we might add), load that. 
        // For now, initially unchecked unless we find they already have the training in their profile (Auto-detect)

        const initialState = {};
        if (session.attendees) {
            session.attendees.forEach(name => {
                // Check if player already has this training validated
                const player = allPlayers.find(p => p.name === name);
                const hasTraining = player?.trainings?.some(t => t.name === session.moduleTitle && t.validated);
                initialState[name] = !!hasTraining;
            });
        }
        setValidationState(initialState);
    };

    const toggleValidation = (playerName) => {
        setValidationState(prev => ({
            ...prev,
            [playerName]: !prev[playerName]
        }));
    };

    const handleVoteAll = (status) => {
        if (!selectedSession || !selectedSession.attendees) return;
        const newState = {};
        selectedSession.attendees.forEach(name => {
            newState[name] = status;
        });
        setValidationState(newState);
    };

    const saveValidations = async () => {
        if (!selectedSession) return;
        if (!confirm(`Confirmer la validation des acquis pour la session "${selectedSession.moduleTitle}" ?`)) return;

        // 1. Update Players asynchronously
        const updatePromises = selectedSession.attendees.map(async (name) => {
            const player = allPlayers.find(p => p.name === name);
            if (player) {
                const isValidated = validationState[name];
                if (isValidated) {
                    const existingTraining = player.trainings?.find(t => t.name === selectedSession.moduleTitle);
                    if (!existingTraining) {
                        const newTrainings = [
                            ...(player.trainings || []),
                            {
                                id: selectedSession.moduleId || Date.now(),
                                name: selectedSession.moduleTitle,
                                date: new Date(selectedSession.date).toLocaleDateString('fr-FR'),
                                validated: true,
                                instructor: selectedSession.instructor
                            }
                        ];
                        await updatePlayer(player.id, { trainings: newTrainings });
                    }
                }
            }
        });

        await Promise.all(updatePromises);

        // 2. Update Session Status
        await updateSession(selectedSession.id, { status: 'Validated' });

        // Update local session to reflect change immediately in UI (green badge etc)
        setSelectedSession({ ...selectedSession, status: 'Validated' });

        alert("Validations enregistrées avec succès !");
    };

    // Calculate stats for the list
    const getStats = (session) => {
        const total = session.attendees?.length || 0;
        // Count how many actually have it validated in their profile
        let validated = 0;
        if (session.attendees) {
            session.attendees.forEach(name => {
                const p = allPlayers.find(pl => pl.name === name);
                if (p?.trainings?.some(t => t.name === session.moduleTitle && t.validated)) {
                    validated++;
                }
            });
        }
        return { total, validated };
    };

    return (
        <div className="w-full">
            <PageTitle
                title="Validation des Acquis"
                subtitle="Interface instructeur pour la validation des qualifications."
                icon={CheckCircle}
            />

            <div className="flex flex-col lg:flex-row gap-6 mt-8 h-[calc(100vh-200px)]">
                {/* LISTE DES SESSIONS (Left Panel) */}
                <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="lg:w-1/3 bg-slate-900 border border-slate-700 rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-700 bg-slate-900 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Filtrer par module, instructeur ou joueur..."
                                className="w-full bg-slate-800 border-none rounded py-2 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="p-2 bg-slate-800 rounded border border-slate-700 text-slate-400 hover:text-white hover:border-blue-500 transition-colors"
                            title={sortOrder === 'asc' ? "Trier par date: Plus récent" : "Trier par date: Plus ancien"}
                        >
                            {sortOrder === 'asc' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {filteredSessions.length === 0 ? (
                            <div className="text-center text-slate-500 py-10 text-sm">Aucune session trouvée.</div>
                        ) : filteredSessions.map(session => {
                            const stats = getStats(session);
                            return (
                                <button
                                    key={session.id}
                                    onClick={() => handleSelectSession(session)}
                                    className={`w-full text-left p-4 rounded-lg border transition-all flex flex-col gap-2 ${selectedSession?.id === session.id
                                        ? 'bg-blue-900 border-blue-500 ring-1 ring-blue-500'
                                        : 'bg-slate-800 border-slate-700 hover:bg-slate-800 hover:border-slate-500'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-bold text-sm uppercase ${selectedSession?.id === session.id ? 'text-blue-400' : 'text-slate-300'}`}>
                                            {session.moduleTitle}
                                        </h3>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${session.status === 'Validated' ? 'bg-emerald-900 text-emerald-400 border border-emerald-900' :
                                            session.status === 'Completed' ? 'bg-blue-900 text-blue-400 border border-blue-900' :
                                                'bg-slate-700 text-slate-400'
                                            }`}>
                                            {session.status === 'Validated' ? 'Validée' : session.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(session.date).toLocaleDateString('fr-FR')}</span>
                                        <span className="flex items-center gap-1"><Users size={12} /> {stats.validated}/{stats.total} Validés</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* DETAILS SESSION (Right Panel) */}
                <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="lg:w-2/3 bg-slate-900 border border-slate-700 rounded-xl flex flex-col overflow-hidden relative">
                    {!selectedSession ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                            <CheckCircle size={64} className="mb-4 opacity-50" />
                            <p className="uppercase font-bold tracking-widest">Sélectionnez une session pour valider</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 border-b border-slate-700 bg-slate-900 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-black text-white font-display uppercase">{selectedSession.moduleTitle}</h2>
                                        {selectedSession.status === 'Validated' && <CheckCircle className="text-emerald-500" size={24} />}
                                    </div>
                                    <div className="flex gap-4 text-sm text-slate-400">
                                        <span className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded border border-slate-700">
                                            <Calendar size={14} className="text-blue-400" />
                                            {new Date(selectedSession.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                        <span className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded border border-slate-700">
                                            <Users size={14} className="text-amber-400" />
                                            Instructeur: <span className="text-white font-bold">{selectedSession.instructor}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <button
                                        onClick={saveValidations}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded shadow-lg shadow-emerald-900 uppercase tracking-wide flex items-center gap-2 transition-all active:scale-95"
                                    >
                                        <Award size={18} /> Enregistrer Validations
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-400 uppercase text-sm flex items-center gap-2">
                                        <Users size={16} /> Liste des Participants ({selectedSession.attendees?.length || 0})
                                    </h3>
                                    <div className="flex gap-2 text-xs">
                                        <button onClick={() => handleVoteAll(true)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-900 px-2 py-1 rounded transition-colors">Tout Cocher</button>
                                        <span className="text-slate-600">|</span>
                                        <button onClick={() => handleVoteAll(false)} className="text-slate-500 hover:text-slate-300 hover:bg-slate-800 px-2 py-1 rounded transition-colors">Tout Décocher</button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {!selectedSession.attendees || selectedSession.attendees.length === 0 ? (
                                        <div className="p-4 bg-slate-800 rounded-lg text-slate-500 italic text-center">Aucun participant inscrit à cette session.</div>
                                    ) : (
                                        selectedSession.attendees.map((attendeeName, idx) => {
                                            const isChecked = validationState[attendeeName] || false;
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => toggleValidation(attendeeName)}
                                                    className={`p-4 rounded-lg border flex items-center justify-between cursor-pointer transition-all group ${isChecked
                                                        ? 'bg-emerald-900 border-emerald-500 hover:bg-emerald-900'
                                                        : 'bg-slate-800 border-slate-700 hover:bg-slate-800'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded flex items-center justify-center font-bold text-lg transition-colors ${isChecked ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                                                            }`}>
                                                            {attendeeName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className={`font-bold text-lg ${isChecked ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{attendeeName}</div>
                                                            <div className="text-xs text-slate-500 font-mono group-hover:text-slate-400">Soldat</div>
                                                        </div>
                                                    </div>

                                                    <div className={`transform transition-all duration-200 ${isChecked ? 'scale-110' : 'scale-100 opacity-50'}`}>
                                                        {isChecked
                                                            ? <CheckSquare size={28} className="text-emerald-500" />
                                                            : <Square size={28} className="text-slate-600 group-hover:text-slate-400" />
                                                        }
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 font-mono text-center">
                                * LES VALIDATIONS METTENT À JOUR AUTOMATIQUEMENT LE PROFIL DES JOUEURS
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainingValidation;



