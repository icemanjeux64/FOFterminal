import React, { useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import { History, Search, Calendar, User, Clock, Briefcase } from 'lucide-react';
import PageTitle from '../components/PageTitle';

export default function ServicesHistory() {
    const { serviceHistory } = useGame();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredHistory = useMemo(() => {
        if (!serviceHistory) return [];
        return serviceHistory.filter(entry =>
            entry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.role?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [serviceHistory, searchTerm]);

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <PageTitle title="Services Historiques" subtitle="Journal des services État-Major et Commandement." icon={History} />

            {/* SEARCH */}
            <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="p-4 rounded-xl border border-slate-700 bg-[#0f172a] flex items-center gap-4">
                <Search className="text-slate-500" />
                <input
                    placeholder="Rechercher officier ou rôle..."
                    className="bg-transparent text-white w-full outline-none font-bold placeholder:font-normal"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* LIST */}
            <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-[#0f172a] text-slate-400 uppercase text-xs font-bold tracking-wider border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Opérateur</th>
                            <th className="px-6 py-4">Poste</th>
                            <th className="px-6 py-4">Horaire</th>
                            <th className="px-6 py-4 text-right">Durée</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                        {filteredHistory.length > 0 ? (
                            filteredHistory.map((entry) => (
                                <tr key={entry.id} className="hover:bg-slate-900 transition-colors group">
                                    <td className="px-6 py-4 text-slate-500 font-mono">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} /> {entry.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 font-bold group-hover:bg-blue-900 group-hover:text-white transition-colors">
                                                <User size={14} />
                                            </div>
                                            <span className="font-bold text-white uppercase">{entry.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2 w-fit">
                                            <Briefcase size={12} className="text-blue-500" /> {entry.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 font-mono">
                                        {entry.startTime} - {entry.endTime}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500 font-mono">
                                        {/* Placeholder duration calculation if not stored */}
                                        <span className="flex items-center justify-end gap-1">
                                            <Clock size={14} /> {entry.duration || '-'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic">
                                    Aucun historique de service enregistré.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
