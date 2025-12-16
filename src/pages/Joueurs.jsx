import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, RefreshCw, User, Shield, ChevronUp, ChevronDown } from 'lucide-react';
import PageTitle from '../components/PageTitle';

const RANK_ORDER = ['Recrue', '1ere Classe', 'Caporal', 'Caporal-Chef', 'Sergent', 'Sergent-Chef', 'Adjudant', 'Adjudant-Chef', 'Major', 'Aspirant', 'Sous-Lieutenant', 'Lieutenant', 'Capitaine', 'Commandant', 'Lieutenant-Colonel', 'Colonel', 'Général'];

const Joueurs = () => {
    const { allPlayers } = useGame();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [selectedGrade, setSelectedGrade] = useState('all');
    const [selectedRole, setSelectedRole] = useState('all');
    const ITEMS_PER_PAGE = 20;

    const getEffectiveGrade = (player) => {
        // Normalize helper: remove hyphens, lowercase
        const norm = (s) => s.toLowerCase().replace(/-/g, ' ').trim();

        // Priority list (High to Low)
        const priorities = [...RANK_ORDER].reverse();

        // Check roles
        if (player.roles && player.roles.length > 0) {
            for (let rank of priorities) {
                if (rank === 'Major') {
                    const found = player.roles.find(r => {
                        const n = norm(r);
                        return n.includes('major') && !n.includes('etat major');
                    });
                    if (found) return rank;
                    continue;
                }

                // Check if any role matches this rank
                const found = player.roles.find(r => norm(r).includes(norm(rank)));
                if (found) {
                    return rank;
                }
            }
        }

        // Fallback to explicit grade
        return player.grade || 'Recrue';
    };

    const getRankColor = (grade) => {
        if (!grade) return 'border-slate-700';
        const g = grade.toLowerCase().replace(/-/g, ' '); // Normalize for check

        // Haut Commandement / Officiers Supérieurs
        if (g.includes('général') || g.includes('colonel') || g.includes('commandant')) return 'border-red-600';
        // Officiers Subalternes
        if (g.includes('capitaine') || g.includes('lieutenant') || g.includes('aspirant')) return 'border-yellow-500';

        // Sous-Officiers Supérieurs
        if (g.includes('major') || g.includes('adjudant chef') || g.includes('adjudant-chef')) return 'border-purple-500';
        if (g.includes('adjudant')) return 'border-purple-500';

        // Sous-Officiers Subalternes
        if (g.includes('sergent')) return 'border-amber-500';

        // Militaires du Rang
        if (g.includes('caporal')) return 'border-emerald-500';
        if (g.includes('1ere classe') || g.includes('soldat')) return 'border-blue-600';

        // Recrue / Autre
        return 'border-slate-600';
    };

    // Extract unique roles for the filter
    const uniqueRoles = useMemo(() => {
        if (!allPlayers) return [];
        const roles = new Set();
        allPlayers.forEach(p => {
            if (p.roles) p.roles.forEach(r => roles.add(r));
        });
        return Array.from(roles).sort();
    }, [allPlayers]);

    // Enhanced Filtering
    const filteredPlayers = useMemo(() => {
        if (!allPlayers) return [];
        return allPlayers.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.grade && p.grade.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.matricule && p.matricule.toLowerCase().includes(searchTerm.toLowerCase()));

            const effectiveGrade = getEffectiveGrade(p); // Use effective grade for filtering

            const matchesGrade = selectedGrade === 'all' || effectiveGrade === selectedGrade;

            const matchesRole = selectedRole === 'all' || (p.roles && p.roles.includes(selectedRole));

            return matchesSearch && matchesGrade && matchesRole;
        });
    }, [allPlayers, searchTerm, selectedGrade, selectedRole]);

    const sortedPlayers = useMemo(() => {
        let items = [...filteredPlayers];
        if (sortConfig.key) {
            items.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                // Helper for effective grade sorting if needed, but for now using regular property access
                // If sorting by grade, we should probably use effective grade
                if (sortConfig.key === 'grade') {
                    aVal = getEffectiveGrade(a);
                    bVal = getEffectiveGrade(b);
                    const indexA = RANK_ORDER.indexOf(aVal);
                    const indexB = RANK_ORDER.indexOf(bVal);
                    return (indexA === -1 ? -99 : indexA) - (indexB === -1 ? -99 : indexB);
                }

                if (sortConfig.key === 'joinDate') {
                    if (!aVal) return -1;
                    if (!bVal) return 1;
                    const [d1, m1, y1] = aVal.split('/');
                    const [d2, m2, y2] = bVal.split('/');
                    return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
                }
                if (sortConfig.key === 'roles') {
                    // Sort by count
                    return (aVal?.length || 0) - (bVal?.length || 0);
                }

                if (typeof aVal === 'string') return aVal.localeCompare(bVal);
                return (aVal || 0) - (bVal || 0);
            });
        }
        if (sortConfig.direction === 'desc') items.reverse();
        return items;
    }, [filteredPlayers, sortConfig]);

    const totalPages = Math.ceil(sortedPlayers.length / ITEMS_PER_PAGE);
    const displayedPlayers = sortedPlayers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const SortIcon = ({ colKey }) => {
        if (sortConfig.key !== colKey) return <ChevronDown size={14} className="text-slate-700 opacity-0 group-hover:opacity-50" />;
        return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-blue-400" /> : <ChevronDown size={14} className="text-blue-400" />;
    };

    return (
        <div className="w-full space-y-6">
            <PageTitle title="Registre du Personnel" subtitle="Base de données des effectifs." icon={User} />

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-[2]">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, matricule..."
                        className="w-full bg-[#0f172a]/100 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none"
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                </div>

                <div className="flex-1">
                    <select
                        className="w-full bg-[#0f172a]/100 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-blue-500 outline-none appearance-none"
                        value={selectedGrade}
                        onChange={e => { setSelectedGrade(e.target.value); setPage(1); }}
                    >
                        <option value="all">Tous les grades</option>
                        {RANK_ORDER.slice().reverse().map(rank => (
                            <option key={rank} value={rank}>{rank}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1">
                    <select
                        className="w-full bg-[#0f172a]/100 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-blue-500 outline-none appearance-none"
                        value={selectedRole}
                        onChange={e => { setSelectedRole(e.target.value); setPage(1); }}
                    >
                        <option value="all">Tous les rôles</option>
                        {uniqueRoles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-[#0f172a]/100 px-4 py-3 rounded-lg border border-slate-700 text-slate-400 font-mono text-sm flex items-center justify-center whitespace-nowrap">
                    {filteredPlayers.length} Joueurs
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedPlayers.map(player => {
                    const effectiveGrade = getEffectiveGrade(player);
                    const rankColorClass = getRankColor(effectiveGrade);

                    return (
                        <Link
                            key={player.id}
                            to={`/app/players/${encodeURIComponent(player.id)}`}
                            style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                            className={`bg-[#0f172a] border-2 rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group flex flex-col ${rankColorClass} block no-underline`}
                        >
                            <div className="p-6 flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shrink-0 shadow-inner ${rankColorClass.replace('border-', 'bg-')}`}>
                                    {player.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-white truncate font-display group-hover:text-blue-400 transition-colors">
                                        {player.name}
                                    </h3>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border tracking-wider ${effectiveGrade === 'Recrue' ? 'bg-slate-800 border-slate-700 text-slate-400' :
                                            rankColorClass.replace('border-', 'text-').replace('border-', 'bg-').replace('500', '900 ').replace('600', '900 ') + ' ' + rankColorClass.replace('border-', 'border-').replace('500', '800').replace('600', '800')
                                            }`}>
                                            {effectiveGrade}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 pb-4 flex-1">
                                {player.roles && player.roles.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {player.roles.slice(0, 4).map((role, idx) => (
                                            <span key={idx} className="text-[10px] bg-[#020617]/100 px-2 py-1 rounded text-slate-400 border border-slate-800">
                                                {role}
                                            </span>
                                        ))}
                                        {player.roles.length > 4 && (
                                            <span className="text-[10px] bg-[#020617]/100 px-2 py-1 rounded text-slate-500 border border-slate-800 shadow-sm">
                                                +{player.roles.length - 4}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-600 italic">Aucune spécialisation</span>
                                )}
                            </div>

                            <div className="bg-[#020617]/100 px-6 py-3 border-t border-slate-800 flex justify-between items-center mt-auto">
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                    <Shield size={12} />
                                    <span>Matricule: {player.matricule || player.id.substring(0, 6)}</span>
                                </div>
                                <span className="text-xs text-slate-600 font-mono">{player.joinDate}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-800 flex justify-between items-center bg-[#020617]/100 rounded-xl">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-4 py-2 bg-[#0f172a]/100 hover:bg-slate-800 disabled:opacity-50 rounded text-sm font-bold transition-colors"
                    >
                        Précédent
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm">Page {page} / {totalPages}</span>
                        <div className="h-1 w-24 bg-slate-800 rounded overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(page / totalPages) * 100}%` }}></div>
                        </div>
                    </div>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="px-4 py-2 bg-[#0f172a]/100 hover:bg-slate-800 disabled:opacity-50 rounded text-sm font-bold transition-colors"
                    >
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );
};

export default Joueurs;



