import React, { useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Shield, Award, Users, ChevronRight, BarChart3, Edit2, Trash2, X, Save, Plus } from 'lucide-react';
import PageTitle from '../components/PageTitle';

export default function GradesManagement() {
    const { allPlayers, setAllPlayers, ranks, setRanks } = useGame();
    const [selectedRank, setSelectedRank] = useState(null);

    // Sort ranks by level descending for display
    const sortedRanks = useMemo(() => {
        if (!ranks) return [];
        return [...ranks].sort((a, b) => b.level - a.level);
    }, [ranks]);

    const stats = useMemo(() => {
        if (!allPlayers || !ranks) return [];

        const counts = {};
        allPlayers.forEach(p => {
            const g = p.grade || 'Sans Grade';
            counts[g] = (counts[g] || 0) + 1;
        });

        const total = allPlayers.length;

        // Map hierarchy to stats
        return sortedRanks.map(rank => {
            const count = counts[rank.name] || 0;
            return {
                ...rank,
                count,
                percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0
            };
        });
    }, [allPlayers, sortedRanks]);

    const unknownGrades = useMemo(() => {
        if (!allPlayers || !ranks) return [];
        const known = ranks.map(r => r.name);
        const others = {};
        allPlayers.forEach(p => {
            if (!known.includes(p.grade)) {
                others[p.grade] = (others[p.grade] || 0) + 1;
            }
        });
        return Object.entries(others).map(([name, count]) => ({ name, count }));
    }, [allPlayers, ranks]);

    // --- ACTIONS ---
    const handleRankUpdate = (oldName, newName, newLevel) => {
        if (!newName.trim()) return;

        // Update Rank Definition
        setRanks(prev => prev.map(r => r.name === oldName ? { ...r, name: newName, level: parseFloat(newLevel) } : r));

        // Update All Players having this grade if name changed
        if (oldName !== newName) {
            setAllPlayers(prev => prev.map(p => p.grade === oldName ? { ...p, grade: newName } : p));
        }
        setSelectedRank(null);
    };

    const handleRankDelete = (rankName) => {
        if (!window.confirm(`Supprimer le grade "${rankName}" ? Cela ne supprime pas les joueurs, mais retire le grade de la hiérarchie.`)) return;
        setRanks(prev => prev.filter(r => r.name !== rankName));
        setSelectedRank(null);
    };

    const RankModal = () => {
        if (!selectedRank) return null;

        const [editName, setEditName] = useState(selectedRank.name);
        const [editLevel, setEditLevel] = useState(selectedRank.level);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black  animate-in fade-in duration-200">
                <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 100 }} className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Edit2 size={20} className="text-blue-500" />
                            Modifier le Grade
                        </h3>
                        <button onClick={() => setSelectedRank(null)} className="text-slate-500 hover:text-white"><X size={24} /></button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Nom du Grade</label>
                            <input
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-bold outline-none focus:border-blue-500"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Niveau (Hiérarchie)</label>
                            <input
                                type="number" step="0.5"
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-bold outline-none focus:border-blue-500"
                                value={editLevel}
                                onChange={e => setEditLevel(e.target.value)}
                            />
                            <p className="text-xs text-slate-600">Plus le chiffre est haut, plus le grade est élevé.</p>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-800">
                        <button
                            onClick={() => handleRankUpdate(selectedRank.name, editName, editLevel)}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded font-bold flex justify-center items-center gap-2"
                        >
                            <Save size={16} /> Enregistrer
                        </button>
                        <button
                            onClick={() => handleRankDelete(selectedRank.name)}
                            className="bg-red-900 hover:bg-red-900 text-red-500 p-2 rounded font-bold flex items-center justify-center"
                            title="Supprimer"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            <PageTitle title="Gestion des Grades" subtitle="Répartition hiérarchique des effectifs." icon={Award} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((rank, index) => (
                    <div
                        key={rank.name}
                        onClick={() => setSelectedRank(rank)}
                        style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                        className={`bg-[#0f172a] border ${rank.count > 0 ? 'border-slate-700' : 'border-slate-800 opacity-50'} rounded-xl p-6 relative overflow-hidden group hover:border-blue-500 transition-all cursor-pointer hover:shadow-lg hover:shadow-blue-900`}
                    >
                        {/* Background Decoration */}
                        <div className="absolute -right-4 -bottom-4 text-slate-800 opacity-20 group-hover:opacity-40 transition-opacity">
                            <Shield size={100} />
                        </div>

                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 size={16} className="text-blue-400" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Rang {sortedRanks.length - index} (Lvl {rank.level})</div>
                                    <h3 className="text-xl font-black text-white font-tech uppercase">{rank.name}</h3>
                                </div>
                                <div className="bg-slate-950 px-3 py-1 rounded text-2xl font-bold text-blue-400 font-mono">
                                    {rank.count}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-400 font-bold">
                                    <span>Effectif</span>
                                    <span>{rank.percentage}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                                        style={{ width: `${rank.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {unknownGrades.length > 0 && (
                <div className="bg-red-900 border border-red-900 rounded-xl p-6">
                    <h3 className="text-red-500 font-bold uppercase mb-4 flex items-center gap-2">
                        <Users size={20} /> Grades Non Reconnus
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {unknownGrades.map(u => (
                            <div key={u.name} className="bg-slate-950 p-3 rounded flex justify-between items-center text-slate-300">
                                <span>{u.name}</span>
                                <span className="font-mono font-bold">{u.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <RankModal />
        </div>
    );
}



