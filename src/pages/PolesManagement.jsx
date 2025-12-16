import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import PageTitle from '../components/PageTitle';
import {
    Users,
    UserCheck,
    Crown,
    Target,
    Calendar,
    CheckSquare,
    Square,
    Trash2,
    Plus,
    Save,
    MessageSquare,
    Briefcase
} from 'lucide-react';

export default function PolesManagement() {
    const { allPlayers, polesData, setPolesData } = useGame();

    // --- Helpers ---

    const getMembers = (poleKey) => {
        const poleRoles = polesData[poleKey].roles.map(r => r.toLowerCase());
        return allPlayers.filter(p =>
            p.roles && p.roles.some(role => poleRoles.some(pr => role.toLowerCase().includes(pr)))
        );
    };

    const updatePole = (key, updates) => {
        setPolesData(prev => ({
            ...prev,
            [key]: { ...prev[key], ...updates }
        }));
    };

    const handleAddObjective = (key, text, deadline) => {
        if (!text.trim()) return;
        const newObj = {
            id: Date.now(),
            text,
            deadline,
            done: false
        };
        updatePole(key, { objectives: [...polesData[key].objectives, newObj] });
    };

    const handleToggleObjective = (key, objId) => {
        const updatedObjs = polesData[key].objectives.map(o =>
            o.id === objId ? { ...o, done: !o.done } : o
        );
        updatePole(key, { objectives: updatedObjs });
    };

    const handleDeleteObjective = (key, objId) => {
        const updatedObjs = polesData[key].objectives.filter(o => o.id !== objId);
        updatePole(key, { objectives: updatedObjs });
    };

    // --- Sub-components ---

    const ObjectiveItem = ({ obj, onToggle, onDelete }) => (
        <div className={`group flex items-start gap-3 p-2 rounded border transition-all ${obj.done ? 'bg-emerald-900 border-emerald-500' : 'bg-slate-900 border-slate-700'}`}>
            <button
                onClick={onToggle}
                className={`mt-0.5 ${obj.done ? 'text-emerald-500' : 'text-slate-500 hover:text-white'}`}
            >
                {obj.done ? <CheckSquare size={16} /> : <Square size={16} />}
            </button>
            <div className="flex-1 min-w-0">
                <p className={`text-sm ${obj.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{obj.text}</p>
                {obj.deadline && (
                    <div className="flex items-center gap-1.5 mt-1">
                        <Calendar size={12} className={obj.done ? 'text-slate-600' : 'text-amber-500'} />
                        <span className={`text-xs font-mono font-bold ${obj.done ? 'text-slate-600' : 'text-amber-500'}`}>
                            Deadline: {new Date(obj.deadline).toLocaleDateString('fr-FR')}
                        </span>
                    </div>
                )}
            </div>
            <button onClick={onDelete} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={14} />
            </button>
        </div>
    );

    const PoleCard = ({ poleKey }) => {
        const pole = polesData[poleKey];
        const members = getMembers(poleKey);

        const [newObjText, setNewObjText] = useState('');
        const [newObjDate, setNewObjDate] = useState('');
        const [isEditingNotes, setIsEditingNotes] = useState(false);
        const [notesTemp, setNotesTemp] = useState(pole.notes);

        const saveNotes = () => {
            updatePole(poleKey, { notes: notesTemp });
            setIsEditingNotes(false);
        };

        return (
            <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
                {/* Header */}
                <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Briefcase size={20} className="text-blue-500" />
                            {pole.label}
                        </h3>
                        <div className="text-xs text-slate-400 mt-1">
                            {members.length} membre{members.length > 1 ? 's' : ''} affecté{members.length > 1 ? 's' : ''}
                        </div>
                    </div>
                    {/* Referent Selector */}
                    <div className="flex flex-col items-end">
                        <label className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-1 mb-1">
                            <Crown size={12} /> Référent
                        </label>
                        <select
                            value={pole.referentId || ''}
                            onChange={(e) => updatePole(poleKey, { referentId: e.target.value })}
                            className="bg-slate-950 border border-slate-700 text-xs text-white rounded px-2 py-1 outline-none focus:border-amber-500 max-w-[150px]"
                        >
                            <option value="">-- Aucun --</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.grade} {m.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">

                    {/* Members List (Compact) */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Users size={12} /> Effectifs
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {members.length > 0 ? members.map(m => (
                                <span key={m.id} className={`text-xs px-2 py-1 rounded border ${m.id === pole.referentId ? 'bg-amber-500 border-amber-500 text-amber-200 font-bold' : 'bg-slate-700 border-slate-600 text-slate-300'}`}>
                                    {m.name}
                                </span>
                            )) : (
                                <span className="text-xs text-slate-500 italic">Aucun membre assigné.</span>
                            )}
                        </div>
                    </div>

                    {/* Objectives */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <Target size={12} /> Objectifs
                            </h4>
                            <span className="text-[10px] font-mono text-slate-500">
                                {pole.objectives.filter(o => o.done).length}/{pole.objectives.length}
                            </span>
                        </div>

                        <div className="space-y-2 mb-3">
                            {pole.objectives.map(obj => (
                                <ObjectiveItem
                                    key={obj.id}
                                    obj={obj}
                                    onToggle={() => handleToggleObjective(poleKey, obj.id)}
                                    onDelete={() => handleDeleteObjective(poleKey, obj.id)}
                                />
                            ))}
                            {pole.objectives.length === 0 && (
                                <div className="text-xs text-slate-600 italic text-center py-2 border border-dashed border-slate-800 rounded">
                                    Aucun objectif défini
                                </div>
                            )}
                        </div>

                        {/* Add Objective Form */}
                        <div className="flex gap-2 items-start">
                            <div className="flex-1 space-y-1">
                                <input
                                    type="text"
                                    placeholder="Nouvel objectif..."
                                    value={newObjText}
                                    onChange={(e) => setNewObjText(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:border-blue-500 outline-none placeholder:text-slate-600"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddObjective(poleKey, newObjText, newObjDate);
                                            setNewObjText('');
                                            setNewObjDate('');
                                        }
                                    }}
                                />
                                <input
                                    type="date"
                                    value={newObjDate}
                                    onChange={(e) => setNewObjDate(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-400 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    handleAddObjective(poleKey, newObjText, newObjDate);
                                    setNewObjText('');
                                    setNewObjDate('');
                                }}
                                disabled={!newObjText.trim()}
                                className="bg-blue-600 hover:bg-blue-600 text-blue-400 hover:text-white p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <MessageSquare size={12} /> Notes & Suivi
                            </h4>
                            {isEditingNotes ? (
                                <button onClick={saveNotes} className="text-emerald-500 hover:text-emerald-400 text-xs font-bold flex items-center gap-1">
                                    <Save size={12} /> Sauvegarder
                                </button>
                            ) : (
                                <button onClick={() => setIsEditingNotes(true)} className="text-blue-500 hover:text-blue-400 text-xs font-bold">
                                    Modifier
                                </button>
                            )}
                        </div>
                        {isEditingNotes ? (
                            <textarea
                                value={notesTemp}
                                onChange={(e) => setNotesTemp(e.target.value)}
                                className="w-full h-24 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-blue-500 outline-none resize-none"
                                placeholder="Notes interne au pôle..."
                            />
                        ) : (
                            <div className="w-full min-h-[6rem] bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-400 whitespace-pre-wrap">
                                {pole.notes || "Aucune note."}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        );
    };

    return (
        <div className="w-full">
            <PageTitle
                title="Pôles Organisationnels"
                subtitle="Gestion des départements, référents et suivi des objectifs."
            />

            <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Object.keys(polesData).map(key => (
                        <PoleCard key={key} poleKey={key} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Add simple style for custom scrollbar within components if needed
// or rely on global styles.



