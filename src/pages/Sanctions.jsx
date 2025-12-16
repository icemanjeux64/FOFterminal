import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Shield, AlertTriangle, Gavel, User, Calendar, Check, Search, AlertOctagon } from 'lucide-react';
import PageTitle from '../components/PageTitle';

const SCALE_DEFINITIONS = {
    1: { label: "Rappel à l'ordre", color: "text-yellow-500", border: "border-yellow-500", bg: "bg-yellow-500", desc: "Avertissement simple sans conséquence immédiate." },
    2: { label: "Ban Temporaire", color: "text-orange-500", border: "border-orange-500", bg: "bg-orange-500", desc: "Suspension de 24h à 72h selon la gravité." },
    3: { label: "Ban Définitif", color: "text-red-500", border: "border-red-500", bg: "bg-red-500", desc: "Exclusion permanente de la structure." }
};

export default function Sanctions() {
    const { allPlayers, sanctions, setSanctions } = useGame();

    // Form State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [scale, setScale] = useState(1);
    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState('24h'); // Default for Scale 2

    // Search Logic
    const filteredPlayers = useMemo(() => {
        if (!searchTerm || selectedPlayer) return [];
        return allPlayers
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 5);
    }, [allPlayers, searchTerm, selectedPlayer]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedPlayer || !reason) return;

        const newSanction = {
            id: Date.now(),
            playerId: selectedPlayer.id,
            playerName: selectedPlayer.name, // Snapshot name in case it changes
            date: new Date().toLocaleDateString('fr-FR'),
            timestamp: Date.now(),
            scale,
            reason,
            duration: scale === 2 ? duration : null,
            author: "Admin" // Replace with logged user later if auth exists
        };

        setSanctions(prev => [newSanction, ...prev]);

        // Reset
        setSelectedPlayer(null);
        setSearchTerm('');
        setReason('');
        setScale(1);
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            <PageTitle
                title="Gestion des Sanctions"
                subtitle="Interface de modération et suivi disciplinaire."
                icon={Gavel}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: FORM */}
                <div className="lg:col-span-1 space-y-6">
                    <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Shield size={120} />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <AlertTriangle className="text-red-500" /> Nouvelle Sanction
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                            {/* Player Search */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Joueur concerné</label>
                                <div className="relative">
                                    <div className="flex items-center bg-slate-800 border border-slate-600 rounded-lg focus-within:border-blue-500 transition-colors">
                                        <div className="pl-3 text-slate-400"><Search size={18} /></div>
                                        <input
                                            type="text"
                                            value={selectedPlayer ? selectedPlayer.name : searchTerm}
                                            onChange={(e) => { setSearchTerm(e.target.value); setSelectedPlayer(null); }}
                                            className="bg-transparent border-none text-white text-sm w-full py-2 px-3 focus:outline-none placeholder-slate-500 font-bold"
                                            placeholder="Rechercher un joueur..."
                                            required
                                        />
                                        {selectedPlayer && (
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedPlayer(null); setSearchTerm(''); }}
                                                className="px-3 hover:text-red-400 text-slate-400"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    {/* Dropdown Results */}
                                    {filteredPlayers.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 overflow-hidden">
                                            {filteredPlayers.map(p => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => { setSelectedPlayer(p); setSearchTerm(p.name); }}
                                                    className="p-3 hover:bg-slate-700 cursor-pointer flex items-center justify-between group"
                                                >
                                                    <span className="font-bold text-slate-200">{p.name}</span>
                                                    <span className="text-xs text-slate-500 uppercase group-hover:text-blue-400">{p.grade}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Scale Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase">Échelle de Sanction</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {[1, 2, 3].map((lvl) => (
                                        <div
                                            key={lvl}
                                            onClick={() => setScale(lvl)}
                                            className={`cursor-pointer p-3 rounded-lg border-2 transition-all flex items-start gap-3 ${scale === lvl
                                                ? `${SCALE_DEFINITIONS[lvl].border} ${SCALE_DEFINITIONS[lvl].bg}`
                                                : 'border-slate-800 bg-slate-900 hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${scale === lvl ? SCALE_DEFINITIONS[lvl].border : 'border-slate-600'}`}>
                                                {scale === lvl && <div className={`w-2 h-2 rounded-full ${SCALE_DEFINITIONS[lvl].color.replace('text-', 'bg-')}`}></div>}
                                            </div>
                                            <div>
                                                <div className={`font-bold text-sm ${scale === lvl ? 'text-white' : 'text-slate-400'}`}>Échelle {lvl} - {SCALE_DEFINITIONS[lvl].label}</div>
                                                <div className="text-xs text-slate-500 mt-1 leading-tight">{SCALE_DEFINITIONS[lvl].desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Duration (Only for Scale 2) */}
                            {scale === 2 && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Durée du Ban</label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-600 text-white rounded p-2 text-sm font-bold focus:border-orange-500 focus:outline-none"
                                    >
                                        <option value="24h">24 Heures</option>
                                        <option value="48h">48 Heures</option>
                                        <option value="72h">72 Heures</option>
                                    </select>
                                </div>
                            )}

                            {/* Reason */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Motif / Justification</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 text-white rounded p-3 text-sm min-h-[100px] focus:border-blue-500 focus:outline-none placeholder-slate-600"
                                    placeholder="Expliquez la raison de la sanction..."
                                    required
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={!selectedPlayer || !reason}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase tracking-wider rounded-lg shadow-lg hover:shadow-red-900 transition-all"
                            >
                                Appliquer la Sanction
                            </button>

                        </form>
                    </div>
                </div>

                {/* RIGHT: HISTORY */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display uppercase">
                            <Calendar size={20} className="text-slate-400" /> Historique des Sanctions
                        </h2>
                        <span className="text-xs font-bold text-slate-500 uppercase bg-slate-900 px-2 py-1 rounded">Total: {sanctions.length}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {sanctions.length > 0 ? (
                            sanctions.map(sanction => (
                                <div key={sanction.id} style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 hover:border-slate-600 transition-colors group">
                                    {/* Scale Indicator */}
                                    <div className={`md:w-32 flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-lg border bg-opacity-5 ${SCALE_DEFINITIONS[sanction.scale].bg} ${SCALE_DEFINITIONS[sanction.scale].border}`}>
                                        <AlertOctagon size={24} className={SCALE_DEFINITIONS[sanction.scale].color} />
                                        <span className={`mt-1 text-xs font-bold uppercase ${SCALE_DEFINITIONS[sanction.scale].color}`}>Échelle {sanction.scale}</span>
                                        {sanction.duration && <span className="text-[10px] text-white font-mono bg-slate-950 px-1.5 rounded mt-1">{sanction.duration}</span>}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="text-lg font-bold text-white">{sanction.playerName}</h4>
                                                <p className="text-xs text-slate-500 uppercase">Sanctionné par {sanction.author}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-slate-400 block">{sanction.date}</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded border border-slate-800 text-sm text-slate-300 italic">
                                            "{sanction.reason}"
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl text-slate-600">
                                <Check size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-bold text-lg">Aucune sanction enregistrée.</p>
                                <p className="text-sm">Le casier est vierge pour le moment.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}



