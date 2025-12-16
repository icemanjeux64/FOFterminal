import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Shield, Radio, Signal, Edit2, Save, X, History, Plus, Archive, ChevronRight, Activity, Trash2, RefreshCw } from 'lucide-react';
import PageTitle from '../components/PageTitle';

export default function SquadsList() {
    const { squadRegistry, updateSquadRegistry, resetSquadRegistry, archives } = useGame();
    const [selectedSquad, setSelectedSquad] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // --- COMPUTED DATA ---

    // Decorate Registry with History Stats
    const squadsWithStats = useMemo(() => {
        if (!squadRegistry) return [];

        return squadRegistry.map(def => {
            // Find archives where squadName matches the definition name
            const history = archives ? archives.filter(a => a.squadName === def.name) : [];
            const missionCount = history.length;

            // Extract unique SLs
            const slMap = {};
            history.forEach(entry => {
                if (entry.sl && entry.sl.trim() !== '') {
                    slMap[entry.sl] = (slMap[entry.sl] || 0) + 1;
                }
            });
            const slList = Object.entries(slMap)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);

            return {
                ...def,
                missionCount,
                history,
                slList
            };
        });
    }, [squadRegistry, archives]);

    // Filtered
    const filteredSquads = useMemo(() => {
        return squadsWithStats.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [squadsWithStats, searchTerm]);


    // --- EDIT MODAL ---
    const EditModal = ({ squad, onClose }) => {
        const [form, setForm] = useState({ ...squad });

        const handleChange = (field, value) => {
            setForm(prev => ({ ...prev, [field]: value }));
        };

        const handleSave = () => {
            const updatedRegistry = squadRegistry.map(s =>
                s.id === squad.id ? { ...s, name: form.name, color: form.color, freq: form.freq } : s
            );
            updateSquadRegistry(updatedRegistry);
            onClose();
        };

        // Simplified color picker options based on standard SQUAD_COLORS logic key
        const colorOptions = [
            { bg: "bg-emerald-700", border: "border-emerald-800", text: "text-white" },
            { bg: "bg-blue-700", border: "border-blue-800", text: "text-white" },
            { bg: "bg-purple-800", border: "border-purple-900", text: "text-white" },
            { bg: "bg-yellow-500", border: "border-yellow-600", text: "text-white" },
            { bg: "bg-orange-600", border: "border-orange-700", text: "text-white" },
            { bg: "bg-red-800", border: "border-red-900", text: "text-white" },
            { bg: "bg-pink-600", border: "border-pink-700", text: "text-white" },
            { bg: "bg-slate-700", border: "border-slate-800", text: "text-white" },
            { bg: "bg-stone-600", border: "border-stone-700", text: "text-white" },
            { bg: "bg-sky-400", border: "border-sky-500", text: "text-white" },
            { bg: "bg-black", border: "border-gray-700", text: "text-white" },
            { bg: "bg-rose-900", border: "border-rose-950", text: "text-white" },
        ];

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 60 }} className="bg-[#0f172a] border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-hidden">

                    {/* LEFT: EDIT FORM */}
                    <div className="md:w-1/2 p-6 border-r border-slate-800 flex flex-col gap-6 overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white uppercase font-tech flex items-center gap-2">
                                <Edit2 size={20} className="text-blue-500" /> Configuration
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nom de l'unité</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold uppercase focus:border-blue-500 outline-none"
                                />
                                <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                                    <Activity size={10} /> Attention: Modifier le nom peut affecter la liaison avec l'historique existant.
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Fréquence Radio (Défaut)</label>
                                <div className="relative">
                                    <Radio size={16} className="absolute left-3 top-2.5 text-slate-500" />
                                    <input
                                        type="text"
                                        value={form.freq}
                                        onChange={e => handleChange('freq', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-9 text-white font-mono focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Identité Visuelle (Couleur)</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {colorOptions.map((opt, idx) => {
                                        const colorStr = `${opt.bg} ${opt.border} ${opt.text}`;
                                        const isSelected = form.color.includes(opt.bg);
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleChange('color', colorStr)}
                                                className={`h-10 rounded border-2 transition-all ${opt.bg} ${opt.border} ${isSelected ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                                            >
                                                {isSelected && <div className="flex justify-center h-full items-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <button onClick={onClose} className="flex-1 py-3 rounded bg-slate-800 text-slate-400 font-bold hover:bg-slate-700 transition-colors uppercase text-sm">Annuler</button>
                            <button onClick={handleSave} className="flex-1 py-3 rounded bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors uppercase text-sm flex items-center justify-center gap-2">
                                <Save size={16} /> Enregistrer
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: HISTORY STATS */}
                    <div className="md:w-1/2 bg-slate-900/50 p-6 flex flex-col overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white uppercase font-tech flex items-center gap-2">
                                <History size={20} className="text-amber-500" /> Historique Opérationnel
                            </h2>
                            <div className="text-xs font-mono text-slate-500 border border-slate-700 px-2 py-1 rounded">
                                ID: {squad.id}
                            </div>
                        </div>

                        {/* KPIS */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                                <span className="text-xs text-slate-500 uppercase font-bold">Total Missions</span>
                                <div className="text-3xl font-black text-white">{squad.missionCount}</div>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                                <span className="text-xs text-slate-500 uppercase font-bold">SLs Uniques</span>
                                <div className="text-3xl font-black text-white">{squad.slList.length}</div>
                            </div>
                        </div>

                        {/* SL LIST */}
                        <h3 className="text-sm font-bold text-white uppercase mb-3 flex items-center gap-2">
                            <Shield size={14} className="text-slate-400" /> Commandement Historique
                        </h3>
                        <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex-1 min-h-[200px]">
                            {squad.slList.length > 0 ? (
                                <div className="divide-y divide-slate-800 overflow-y-auto max-h-[300px] custom-scrollbar">
                                    {squad.slList.map((sl, idx) => (
                                        <div key={idx} className="p-3 flex justify-between items-center hover:bg-slate-900 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center">{idx + 1}</div>
                                                <span className="font-bold text-slate-200">{sl.name}</span>
                                            </div>
                                            <div className="text-xs font-mono text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-900/50">
                                                {sl.count} Msn
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-600 p-6 text-center">
                                    <Archive size={32} className="mb-2 opacity-50" />
                                    <p className="text-sm italic">Aucun historique de déploiement pour cette unité.</p>
                                </div>
                            )}
                        </div>

                    </div>

                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>
        );
    };

    const handleCreateSquad = () => {
        const name = prompt("Nom de la nouvelle unité ?");
        if (name && !squadRegistry.find(s => s.name === name)) {
            const newSquad = {
                id: `def_${name.toLowerCase().replace(/\s/g, '_')}_${Date.now()}`,
                name: name,
                color: "bg-slate-700 border-slate-800 text-white", // Default
                freq: "30.0",
                type: 'infantry'
            };
            updateSquadRegistry([...squadRegistry, newSquad]);
        }
    };


    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <PageTitle title="Registre des Unités" subtitle="Base de données et configuration des escouades." icon={Shield} />
                <div className="flex gap-3">
                    <button
                        onClick={resetSquadRegistry}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-4 py-2 rounded font-bold uppercase text-sm flex items-center gap-2 transition-colors border border-slate-700"
                    >
                        <RefreshCw size={16} /> Mettre à jour (Défauts)
                    </button>
                    <button
                        onClick={handleCreateSquad}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold uppercase text-sm flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/50"
                    >
                        <Plus size={16} /> Ajouter Unité
                    </button>
                </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSquads.map((squad) => {
                    // Extract safe color for preview if string is complex
                    // Usually string is "bg-emerald-700 border-emerald-800 text-white"
                    // We directly apply it to card
                    return (
                        <div
                            key={squad.id}
                            onClick={() => setSelectedSquad(squad)}
                            style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                            className={`group relative overflow-hidden rounded-xl border transition-all cursor-pointer hover:scale-[1.02] hover:shadow-xl ${squad.color} bg-opacity-10 border-opacity-50 hover:border-opacity-100 items-stretch flex flex-col`}
                        >
                            {/* Color Header Strip */}
                            <div className={`h-2 w-full ${squad.color.split(' ')[0]} opacity-80`}></div>

                            <div className="p-5 flex-1 flex flex-col bg-[#0f172a]">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className={`text-2xl font-black font-tech uppercase ${squad.color.split(' ')[2] || 'text-white'}`}>
                                        {squad.name}
                                    </h3>
                                    <div className="p-2 rounded bg-slate-900 border border-slate-800 group-hover:border-white transition-colors">
                                        <ChevronRight size={16} className="text-slate-500 group-hover:text-white" />
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <Radio size={16} className="text-blue-500" />
                                        <span className="font-mono font-bold text-white">{squad.freq} MHz</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <History size={16} className="text-amber-500" />
                                        <span className="font-mono font-bold text-white">{squad.missionCount} Missions</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-800">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-2">Dernier Chef</div>
                                    <div className="flex items-center gap-2">
                                        <Shield size={12} className="text-slate-600" />
                                        <span className="text-sm font-bold text-slate-300">
                                            {squad.history.length > 0 ? squad.history[0].sl : 'Aucun'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedSquad && (
                <EditModal
                    squad={selectedSquad}
                    onClose={() => setSelectedSquad(null)}
                />
            )}
        </div>
    );
}
