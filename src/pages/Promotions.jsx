import React, { useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import { TrendingUp, Clock, CheckCircle, AlertCircle, Calendar, ChevronRight, Award, UserCheck, ChevronDown } from 'lucide-react';
import PageTitle from '../components/PageTitle';

// Criteria Definition based on user images
const PROMOTION_RULES = {
    'Recrue': {
        next: 'Soldat',
        timeMonths: 0.3, // ~10 days
        timeLabel: '10 jours',
        requirements: ['Formation Recrue validée']
    },
    'Soldat': {
        next: '1ere Classe',
        timeMonths: 1,
        timeLabel: '1 mois',
        requirements: ['Activité régulière']
    },
    '1ere Classe': {
        next: 'Caporal',
        timeMonths: 1,
        timeLabel: '1 mois',
        requirements: ['Formation Qualifiante', 'Participation Conflit']
    },
    'Caporal': {
        next: 'Caporal-Chef',
        timeMonths: 1,
        timeLabel: '1 mois',
        requirements: ['Prise de responsabilités', 'Faits d\'armes positifs']
    },
    'Caporal-Chef': {
        next: 'Caporal-Chef de 1re Classe',
        timeMonths: 2,
        timeLabel: '2 mois',
        requirements: ['Investissement distinction', 'Proposition Staff']
    },
    'Caporal-Chef de 1re Classe': {
        next: 'Sergent',
        timeMonths: 0, // Special
        timeLabel: 'Sur dossier',
        requirements: ['Validation SL', 'Rôle Second/SL régulier']
    },
    'Sergent': {
        next: 'Sergent-Chef',
        timeMonths: 2,
        timeLabel: '2 mois',
        requirements: ['SL Régulier (1/semaine)', 'Reconnu compétences']
    },
    'Sergent-Chef': {
        next: 'Sergent-Chef BM2',
        timeMonths: 2,
        timeLabel: '2 mois',
        requirements: ['Investissement distinction', 'Non-Staff']
    }
};

const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const [day, month, year] = dateStr.split('/');
    return new Date(year, month - 1, day);
};

const getMonthsDifference = (d1, d2) => {
    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    // Adjust for days
    if (d2.getDate() < d1.getDate()) months--;
    // Float part for days
    const days = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
    return days / 30; // Approx
};

export default function Promotions() {
    const { allPlayers, ranks } = useGame();
    const [filter, setFilter] = useState('eligible'); // 'eligible', 'all'
    const [selectedRankFilter, setSelectedRankFilter] = useState(null);

    const promotionData = useMemo(() => {
        if (!allPlayers) return [];

        const now = new Date();

        return allPlayers.map(p => {
            const joinDate = parseDate(p.joinDate);
            const monthsTotal = getMonthsDifference(joinDate, now);
            const rule = PROMOTION_RULES[p.grade];

            if (!rule) return null; // No next rank defined (e.g. Officers or Max Rank)

            // Simplistic Eligibility: check Total Time vs Rule Time
            // NOTE: This assumes time is since last rank. We only have Total time. 
            // So we display Total Time, but mark eligibility with a caveat.
            // Actually, for lower ranks, total time is a decent proxy if fast tracked.

            const isTimeEligible = monthsTotal >= rule.timeMonths;

            return {
                ...p,
                joinDateObj: joinDate,
                monthsTotal: monthsTotal.toFixed(1),
                nextRank: rule.next,
                rule: rule,
                isTimeEligible
            };
        }).filter(Boolean); // Remove nulls
    }, [allPlayers]);

    const filteredData = useMemo(() => {
        if (filter === 'all') return promotionData;
        return promotionData.filter(p => p.isTimeEligible);
    }, [promotionData, filter]);

    const groupedByNextRank = useMemo(() => {
        const groups = {};
        filteredData.forEach(p => {
            if (!groups[p.nextRank]) groups[p.nextRank] = [];
            groups[p.nextRank].push(p);
        });
        return groups;
    }, [filteredData]);

    // Calculate unique available next ranks for buttons based on ALL data to show options
    const availableNextRanks = useMemo(() => {
        const counts = {};
        // Use filteredData to show counts relative to "All" or "Eligible" selected
        filteredData.forEach(p => {
            counts[p.nextRank] = (counts[p.nextRank] || 0) + 1;
        });
        return Object.keys(counts).sort();
    }, [filteredData]);

    const displayGroups = useMemo(() => {
        if (!selectedRankFilter) return groupedByNextRank;
        return { [selectedRankFilter]: groupedByNextRank[selectedRankFilter] || [] };
    }, [groupedByNextRank, selectedRankFilter]);

    // Color coding logic
    const getRankColor = (grade) => {
        if (!grade) return 'border-slate-700';
        const g = grade.toLowerCase().replace(/-/g, ' ');

        if (g.includes('général') || g.includes('colonel') || g.includes('commandant')) return 'border-red-600 bg-red-900 text-red-500';
        if (g.includes('capitaine') || g.includes('lieutenant') || g.includes('aspirant')) return 'border-yellow-500 bg-yellow-900 text-yellow-500';
        if (g.includes('major') || g.includes('adjudant')) return 'border-purple-500 bg-purple-900 text-purple-500';
        if (g.includes('sergent')) return 'border-amber-500 bg-amber-900 text-amber-500';
        if (g.includes('caporal')) return 'border-emerald-500 bg-emerald-900 text-emerald-500';
        if (g.includes('1ere classe') || g.includes('soldat')) return 'border-blue-600 bg-blue-900 text-blue-500';
        return 'border-slate-600 bg-slate-900 text-slate-400';
    };

    // Collapsible Logic
    const [expandedRanks, setExpandedRanks] = useState({});

    const toggleRank = (rank) => {
        setExpandedRanks(prev => ({
            ...prev,
            [rank]: !prev[rank]
        }));
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <PageTitle
                    title="Promotions du Mois"
                    subtitle="Suivi de l'éligibilité et des critères de montée en grade."
                    icon={TrendingUp}
                />

                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
                    <button
                        onClick={() => { setFilter('eligible'); setSelectedRankFilter(null); }}
                        className={`px-4 py-2 rounded text-sm font-bold uppercase transition-colors ${filter === 'eligible' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Éligibles
                    </button>
                    <button
                        onClick={() => { setFilter('all'); setSelectedRankFilter(null); }}
                        className={`px-4 py-2 rounded text-sm font-bold uppercase transition-colors ${filter === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Tout l'effectif
                    </button>
                </div>
            </div>

            {/* QUICK FILTERS BAR */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-800">
                <button
                    onClick={() => setSelectedRankFilter(null)}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase border transition-all ${selectedRankFilter === null
                        ? 'bg-slate-200 text-slate-900 border-slate-200'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                        }`}
                >
                    Tout Voir ({filteredData.length})
                </button>
                {availableNextRanks.map(rank => {
                    const rankColor = getRankColor(rank);
                    return (
                        <button
                            key={rank}
                            onClick={() => setSelectedRankFilter(rank)}
                            className={`px-3 py-1.5 rounded text-xs font-bold uppercase border transition-all flex items-center gap-2 ${selectedRankFilter === rank
                                ? 'bg-slate-800 ' + rankColor + ' shadow-lg'
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                                }`}
                        >
                            Vers {rank}
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedRankFilter === rank ? 'bg-slate-950' : 'bg-slate-800'}`}>
                                {groupedByNextRank[rank]?.length || 0}
                            </span>
                        </button>
                    );
                })}
            </div>

            {Object.entries(displayGroups).map(([nextRank, players]) => {
                if (!players || players.length === 0) return null;
                const timeLabel = (players[0] && players[0].rule) ? players[0].rule.timeLabel : 'N/A';
                const rankColorDetails = getRankColor(nextRank);
                const isExpanded = expandedRanks[nextRank] !== false; // Default open or closed? User asked to click to see list. So default closed maybe? Or default open?
                // "en clicant sur le grade voir la liste" suggests collapsible, maybe initially collapsed.
                // Let's make it initially COLLAPSED unless user filtered specifically for it.
                // Wait, if no filter is selected, existing behavior showed them all.
                // Let's stick to initially expanded for better UX, but toggleable. 
                // Or if user wants "click to see", maybe default collapsed is better if list is long.
                // Let's go with: if 'selectedRankFilter' is active, expand it. If not, maybe collapse?
                // Let's try default collapsed if no filter, to make it cleaner?
                // actually "expandedRanks[nextRank]" can be undefined initially.
                // Let's treat undefined as COLLAPSED if we want "click to see".
                // But filtered view should be expanded.

                const isOpen = selectedRankFilter === nextRank || expandedRanks[nextRank];

                return (
                    <div key={nextRank} className={`space-y-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-80'}`}>
                        <div
                            onClick={() => toggleRank(nextRank)}
                            className={`flex items-center gap-3 border border-slate-800 p-4 rounded-xl cursor-pointer hover:bg-slate-900 transition-all ${isOpen ? 'bg-slate-900' : 'bg-slate-950'}`}
                        >
                            <div className={`p-2 rounded border ${rankColorDetails}`}>
                                {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>

                            <h2 className={`text-xl font-bold uppercase font-tech ${rankColorDetails.split(' ')[2]}`}>
                                Vers {nextRank}
                            </h2>
                            <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-xs font-bold">{players.length} Candidats</span>

                            <div className="ml-auto text-xs text-slate-500 flex items-center gap-2">
                                <Clock size={14} /> Critère temps: <span className="text-slate-300 font-bold">{timeLabel}</span>
                            </div>
                        </div>

                        {isOpen && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                {players.map(p => {
                                    const currentRankColor = getRankColor(p.grade);
                                    return (
                                        <div key={p.id} style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className={`bg-[#0f172a] border rounded-xl p-5 hover:border-opacity-100 transition-colors group ${currentRankColor.split(' ')[0]} border-opacity-30`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg border ${currentRankColor}`}>
                                                        {p.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white text-lg">{p.name}</h3>
                                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                                            <span className={`uppercase tracking-wider font-bold ${currentRankColor.split(' ')[2]}`}>{p.grade}</span>
                                                            <ChevronRight size={12} />
                                                            <span className={`font-bold ${rankColorDetails.split(' ')[2]}`}>{p.nextRank}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-sm font-bold ${p.isTimeEligible ? 'text-green-400' : 'text-amber-500'}`}>
                                                        {p.monthsTotal} mois
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 uppercase">Ancienneté Totale</div>
                                                </div>
                                            </div>

                                            <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                                    <Award size={14} /> Pré-requis
                                                </h4>
                                                <ul className="space-y-2">
                                                    {p.rule.requirements.map((req, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                                            <div className="mt-1 w-3 h-3 rounded-full border border-slate-600 flex-shrink-0"></div>
                                                            <span>{req}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                                <button className="text-xs font-bold uppercase text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
                                                    <UserCheck size={14} /> Valider Dossier
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            })}

            {filteredData.length === 0 && (
                <div className="text-center py-20 bg-slate-900 rounded-xl border border-dashed border-slate-800 text-slate-500">
                    <UserCheck size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-bold">Aucun candidat éligible trouvé.</p>
                    <p className="text-sm">Vérifiez les critères ou basculez l'affichage sur "Tout l'effectif".</p>
                </div>
            )}
        </div>
    );
}



