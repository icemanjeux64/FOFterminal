import React, { useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Shield, Globe, Server, Camera, MoreHorizontal, UserCog, Crown, Users, X, Plus, Trash2, Edit2, Save, Search, FolderInput } from 'lucide-react';
import PageTitle from '../components/PageTitle';

const CATEGORIES = {
    STRUCTURE: {
        label: 'Structure & Commandement',
        icon: Crown,
        color: 'text-amber-500',
        keywords: ['Fondateur', 'Administrateur', 'Admin', 'Modérateur', 'Etat Major', 'Community Dev', 'GameMaster', 'Référent', 'Animateur', 'Responsable']
    },
    NATIONALITE: {
        label: 'Nationalités',
        icon: Globe,
        color: 'text-blue-500',
        keywords: ['France', 'Belgique', 'Canada', 'Suisse', 'USA', 'UK', 'Grèce', 'Algérie', 'Maroc', 'Tunisie', 'Allemagne', 'Italie', 'Espagne']
    },
    SERVEURS: {
        label: 'Serveurs & Plateformes',
        icon: Server,
        color: 'text-emerald-500',
        keywords: ['Serveur', 'Server', 'PS5', 'Xbox', 'PC', 'Booster']
    },
    MEDIA: {
        label: 'Média & Événementiel',
        icon: Camera,
        color: 'text-purple-500',
        keywords: ['Streamer', 'Photographe', 'Reporter', 'Créateur', 'Youtube']
    },
    ROLES: {
        label: 'Autres Rôles',
        icon: Users,
        color: 'text-slate-400',
        keywords: []
    }
};

const IGNORED_ROLES = [
    'Recrue', 'Soldat', 'Caporal', 'Sergent', 'Adjudant', 'Major', 'Lieutenant', 'Capitaine',
    'Commandant', 'Colonel', 'Général', 'Aspirant', '1ere Classe', 'Aucun rôle', 'Aucun rle'
];

const cleanRoleName = (role) => {
    if (!role) return '';
    let cleaned = role;

    // Fix known encoding issues
    cleaned = cleaned.replace(/\uFFFD/g, 'é');

    // Remove "2E" or "2É" prefixes (e.g. "2É Admin" -> "Admin")
    cleaned = cleaned.replace(/^2[ÉÈEéè](\s+|-)?/, '').trim();

    // Remove standalone "É" or "È" prefix
    cleaned = cleaned.replace(/^[ÉÈ]\s+/, '').trim();

    return cleaned;
};

export default function RolesManagement() {
    const { allPlayers, setAllPlayers, roleOverrides, setRoleOverrides } = useGame();
    const [selectedRole, setSelectedRole] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Aggregating Roles
    const rolesData = useMemo(() => {
        if (!allPlayers) return {};

        const counts = {};
        const playersByRole = {};

        allPlayers.forEach(player => {
            // Deduplicate roles for this player after cleaning to avoid double counting
            const uniqueRolesForPlayer = new Set();
            player.roles.forEach(rawRole => {
                if (!rawRole || IGNORED_ROLES.some(ignored => rawRole.includes(ignored) && rawRole.length < 20)) return;
                const cleaned = cleanRoleName(rawRole);
                if (cleaned) uniqueRolesForPlayer.add(cleaned);
            });

            uniqueRolesForPlayer.forEach(role => {
                if (!counts[role]) {
                    counts[role] = 0;
                    playersByRole[role] = [];
                }
                counts[role]++;
                playersByRole[role].push(player);
            });
        });

        // Categorize
        const grouped = {
            STRUCTURE: [],
            NATIONALITE: [],
            SERVEURS: [],
            MEDIA: [],
            ROLES: []
        };

        const sortedRoles = Object.keys(counts).sort();

        sortedRoles.forEach(role => {
            let assigned = false;

            // 1. Check Overrides
            if (roleOverrides && roleOverrides[role]) {
                const catKey = roleOverrides[role];
                if (grouped[catKey]) {
                    grouped[catKey].push({ name: role, count: counts[role], players: playersByRole[role] });
                    assigned = true;
                }
            }

            // 2. Check Keywords if no override
            if (!assigned) {
                for (const [key, cat] of Object.entries(CATEGORIES)) {
                    if (key === 'ROLES') continue;
                    if (cat.keywords.some(k => role.toLowerCase().includes(k.toLowerCase()))) {
                        grouped[key].push({ name: role, count: counts[role], players: playersByRole[role] });
                        assigned = true;
                        break;
                    }
                }
            }

            if (!assigned) {
                grouped.ROLES.push({ name: role, count: counts[role], players: playersByRole[role] });
            }
        });

        return grouped;
    }, [allPlayers, roleOverrides]);

    // --- ACTIONS ---

    const handleRoleUpdate = (oldName, newName) => {
        if (!newName.trim() || oldName === newName) return;
        setAllPlayers(prev => prev.map(p => ({
            ...p,
            roles: p.roles.map(r => cleanRoleName(r) === oldName ? newName : r)
        })));
        setSelectedRole(null);
    };

    const handleRoleDelete = (roleName) => {
        if (!window.confirm(`Supprimer le rôle "${roleName}" de TOUS les joueurs ?`)) return;
        setAllPlayers(prev => prev.map(p => ({
            ...p,
            roles: p.roles.filter(r => cleanRoleName(r) !== roleName)
        })));
        setSelectedRole(null);
    };

    const handleRemovePlayerFromRole = (playerId, roleName) => {
        setAllPlayers(prev => prev.map(p => {
            if (p.id !== playerId) return p;
            return { ...p, roles: p.roles.filter(r => cleanRoleName(r) !== roleName) };
        }));
    };

    const handleAddPlayerToRole = (playerId, roleName) => {
        setAllPlayers(prev => prev.map(p => {
            if (p.id !== playerId) return p;
            if (p.roles.some(r => cleanRoleName(r) === roleName)) return p;
            return { ...p, roles: [...p.roles, roleName] };
        }));
    };

    const handleCategoryChange = (e) => {
        const newCat = e.target.value;
        if (newCat === "") {
            const newOverrides = { ...roleOverrides };
            delete newOverrides[selectedRole.name];
            setRoleOverrides(newOverrides);
        } else {
            setRoleOverrides({ ...roleOverrides, [selectedRole.name]: newCat });
        }
    };


    // --- RENDER MODAL ---
    const RoleModal = () => {
        if (!selectedRole) return null;

        const [mode, setMode] = useState('view'); // view, edit
        const [newName, setNewName] = useState(selectedRole.name);
        const [playerSearch, setPlayerSearch] = useState('');

        const currentPlayers = selectedRole.players || [];
        // Filter players to add (exclude those who already have it)
        const availablePlayers = allPlayers
            ? allPlayers.filter(p => !p.roles.some(r => cleanRoleName(r) === selectedRole.name))
                .filter(p => p.name.toLowerCase().includes(playerSearch.toLowerCase()))
                .slice(0, 10)
            : [];

        const currentCategory = (roleOverrides && roleOverrides[selectedRole.name]) || '';

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black  animate-in fade-in duration-200">
                <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 100 }} className="bg-[#0f172a] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

                    {/* Header */}
                    <div className="p-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                        {mode === 'edit' ? (
                            <div className="flex items-center gap-2 w-full mr-8">
                                <input
                                    className="bg-slate-800 border-slate-600 text-white p-2 rounded w-full font-bold"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    autoFocus
                                />
                                <button onClick={() => handleRoleUpdate(selectedRole.name, newName)} className="p-2 bg-green-600 text-white rounded hover:bg-green-500"><Save size={18} /></button>
                                <button onClick={() => setMode('view')} className="p-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600"><X size={18} /></button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-black font-tech text-white uppercase">{selectedRole.name}</h3>
                                    <button onClick={() => setMode('edit')} className="text-slate-500 hover:text-blue-400 transition-colors"><Edit2 size={16} /></button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-blue-900 text-blue-400 px-2 py-1 rounded border border-blue-900">{currentPlayers.length} Membres</span>

                                    {/* Category Dropdown */}
                                    <div className="flex items-center gap-1 bg-slate-800 rounded px-2 py-1 border border-slate-700">
                                        <FolderInput size={12} className="text-slate-400" />
                                        <select
                                            value={currentCategory}
                                            onChange={handleCategoryChange}
                                            className="bg-transparent text-xs text-slate-300 font-bold outline-none cursor-pointer"
                                        >
                                            <option value="">Automatique</option>
                                            {Object.entries(CATEGORIES).map(([key, cat]) => (
                                                <option key={key} value={key}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                        <button onClick={() => setSelectedRole(null)} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Add Player */}
                        <div className="space-y-2 p-4 bg-slate-950 border border-slate-800 rounded-lg">
                            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                <Plus size={14} className="text-green-500" /> Ajouter un membre
                            </label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    placeholder="Rechercher un joueur..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-9 text-sm text-white focus:border-blue-500 outline-none placeholder:text-slate-600"
                                    value={playerSearch}
                                    onChange={e => setPlayerSearch(e.target.value)}
                                />
                            </div>
                            {playerSearch && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {availablePlayers.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => { handleAddPlayerToRole(p.id, selectedRole.name); setPlayerSearch(''); }}
                                            className="text-left text-xs bg-slate-800 hover:bg-blue-900 hover:text-white hover:border-blue-500 p-2 rounded flex justify-between items-center group transition-colors border border-transparent"
                                        >
                                            <span className="font-bold">{p.grade} {p.name}</span>
                                            <Plus size={14} className="opacity-0 group-hover:opacity-100 text-blue-400" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Players List */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Membres actuels ({currentPlayers.length})</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {currentPlayers.map(p => (
                                    <div key={p.id} className="bg-slate-900 border border-slate-800 p-2 rounded flex justify-between items-center group hover:border-red-900 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-500 text-xs text-secondary-font">
                                                <Users size={12} />
                                            </div>
                                            <span className="text-sm text-slate-300 font-bold">{p.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRemovePlayerFromRole(p.id, selectedRole.name)}
                                            className="text-slate-600 hover:text-red-500 transition-colors p-1"
                                            title="Retirer du rôle"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between">
                        <div className="text-xs text-slate-600">ID: {selectedRole.name.toLowerCase().replace(/\s/g, '_')}</div>
                        <button
                            onClick={() => handleRoleDelete(selectedRole.name)}
                            className="bg-red-900 hover:bg-red-900 text-red-500 px-4 py-2 rounded text-xs font-bold uppercase flex items-center gap-2 transition-colors"
                        >
                            <Trash2 size={14} /> Supprimer le Rôle
                        </button>
                    </div>

                </div>
            </div>
        );
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            <PageTitle title="Gestion des Rôles" subtitle="Vue d'ensemble des rôles et affectations." icon={UserCog} />

            {/* QUICK SEARCH */}
            <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                <Search className="text-slate-500" />
                <input
                    placeholder="Filtrer les rôles..."
                    className="bg-transparent text-white w-full outline-none font-bold placeholder:font-normal"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {Object.entries(CATEGORIES).map(([key, cat]) => {
                const items = rolesData[key] ? rolesData[key].filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];
                if (!items || items.length === 0) return null;

                const Icon = cat.icon;

                return (
                    <div key={key} className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                            <div className={`p-2 rounded bg-slate-900 border border-slate-800 ${cat.color}`}>
                                <Icon size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white uppercase font-tech">{cat.label}</h2>
                            <span className="text-xs font-bold bg-slate-800 text-slate-500 px-2 py-1 rounded-full">{items.length} Rôles</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {items.map(role => (
                                <div
                                    key={role.name}
                                    onClick={() => setSelectedRole(role)}
                                    style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                                    className="group bg-[#0f172a] border border-slate-800 hover:border-blue-500 rounded-xl p-4 transition-all hover:bg-slate-900 hover:shadow-lg hover:shadow-blue-900 cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-2 opacity-50">
                                        <MoreHorizontal size={16} className="text-slate-600 group-hover:text-blue-400" />
                                    </div>

                                    <div className="flex flex-col h-full justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-200 mb-1 pr-6 truncate" title={role.name}>{role.name}</h3>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 group-hover:border-blue-500 group-hover:text-blue-400 transition-colors">
                                                <Users size={12} />
                                                {role.count} Membres
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            <RoleModal />
        </div>
    );
}



