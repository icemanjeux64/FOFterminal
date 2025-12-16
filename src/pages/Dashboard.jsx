import React, { useMemo, useState, useEffect } from 'react';
import './Dashboard.css';
import { useGame } from '../context/GameContext';
import { Users, Shield, AlertTriangle, Activity, Award, Briefcase, Calendar, Target, FileText, TrendingUp, CheckCircle, Scale } from 'lucide-react';
import { PlayerProfileContent } from './PlayerProfile';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, colorClass, icon: Icon, gradient, onClick }) => (
    <div
        onClick={onClick}
        className={`relative overflow-hidden rounded-2xl p-6 border border-white shadow-2xl group transition-all duration-300 hover:scale-[1.02] ${gradient} ${onClick ? 'cursor-pointer hover:shadow-blue-900' : ''}`}
    >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            {Icon && <Icon size={120} />}
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-white `}>
                    {Icon && <Icon size={24} className="text-white" />}
                </div>
                <p className="text-xs font-bold text-blue-100 uppercase tracking-widest">{title}</p>
            </div>

            <h3 className="text-5xl font-black text-white font-display tracking-tight drop-shadow-lg">{value}</h3>

            <div className="mt-4 h-1 w-full bg-black rounded-full overflow-hidden">
                <div className="h-full bg-white w-2/3 rounded-full"></div>
            </div>
        </div>
    </div>
);

// --- PERSONAL DASHBOARD FOR SOLDIERS / STAFF ---
const SoldierDashboard = ({ role }) => {
    const { allPlayers, archives, trainingSessions, sanctions, authenticatedUser } = useGame();
    const navigate = useNavigate();

    const myPlayer = authenticatedUser;

    // Compute derived data for the ProfileContent
    const serviceHistory = useMemo(() => {
        if (!myPlayer || !archives) return [];
        return archives.filter(a => a.sl === myPlayer.name).sort((a, b) => b.id - a.id);
    }, [archives, myPlayer]);

    const trainingHistory = useMemo(() => {
        if (!myPlayer || !trainingSessions) return [];
        return trainingSessions.filter(s => s.instructor === myPlayer.name || (s.attendees && s.attendees.includes(myPlayer.name)));
    }, [trainingSessions, myPlayer]);

    const playerSanctions = useMemo(() => {
        if (!myPlayer || !sanctions) return [];
        return sanctions.filter(s => s.playerId === myPlayer.id || s.playerName === myPlayer.name);
    }, [myPlayer, sanctions]);

    if (!myPlayer) return <div className="text-white">Chargement du profil...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* WELCOME HEADER */}
            <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a] bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-xl border border-slate-700 flex justify-between items-center shadow-lg">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display mb-1">
                        DASHBOARD PERSONNEL
                    </h1>
                    <p className="text-blue-400 font-mono text-sm uppercase tracking-widest">
                        {role} ACCESS GRANTED // ID: {myPlayer.id.substring(0, 8)}
                    </p>
                </div>
                <div className="hidden md:block">
                    <img src="/logo.png" className="h-16 opacity-50 grayscale" alt="Logo" />
                </div>
            </div>

            {/* QUICK ACTIONS BAR */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Available for Everyone */}
                <button
                    onClick={() => navigate('/app/missions/inscription')}
                    style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                    className="p-4 bg-[#0f172a] hover:bg-blue-900 border border-slate-700 hover:border-blue-500 rounded-lg flex flex-col items-center gap-2 group transition-all"
                >
                    <Target size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">S'inscrire Mission</span>
                </button>

                <button
                    onClick={() => navigate('/app/formation/list')}
                    style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                    className="p-4 bg-[#0f172a] hover:bg-emerald-900 border border-slate-700 hover:border-emerald-500 rounded-lg flex flex-col items-center gap-2 group transition-all"
                >
                    <Award size={24} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Catalogue Formations</span>
                </button>

                <button
                    onClick={() => navigate('/app/ops/logistique')}
                    style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                    className="p-4 bg-[#0f172a] hover:bg-amber-900 border border-slate-700 hover:border-amber-500 rounded-lg flex flex-col items-center gap-2 group transition-all"
                >
                    <Briefcase size={24} className="text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Logistique</span>
                </button>

                {/* Role Specific */}
                {role === 'TRAINER' && (
                    <button
                        onClick={() => navigate('/app/formation/seances')}
                        style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                        className="p-4 bg-[#0f172a] hover:bg-purple-900 border border-slate-700 hover:border-purple-500 rounded-lg flex flex-col items-center gap-2 group transition-all"
                    >
                        <Calendar size={24} className="text-purple-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Gérer Séances</span>
                    </button>
                )}

                {role === 'MODERATOR' && (
                    <button
                        onClick={() => navigate('/app/moderation/sanctions')}
                        style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                        className="p-4 bg-[#0f172a] hover:bg-red-900 border border-slate-700 hover:border-red-500 rounded-lg flex flex-col items-center gap-2 group transition-all"
                    >
                        <Shield size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Modération</span>
                    </button>
                )}
            </div>

            {/* PLAYER PROFILE EMBED */}
            <div className="opacity-90 hover:opacity-100 transition-opacity">
                <PlayerProfileContent
                    player={myPlayer}
                    isEditing={false}
                    setIsEditing={() => { }}
                    editForm={null}
                    setEditForm={() => { }}
                    saveChanges={() => { }}
                    handleAddRole={() => { }}
                    handleRemoveRole={() => { }}
                    serviceHistory={serviceHistory}
                    trainingHistory={trainingHistory}
                    playerSanctions={playerSanctions}
                    showNavigation={false} // Hide back button etc.
                    startEditing={null} // Disable editing
                />
            </div>
        </div>
    );
};


// --- GLOBAL DASHBOARD (ADMIN) ---
const AdminDashboard = () => {
    const { allPlayers, squads, staff, sanctions, authenticatedUser } = useGame();
    const navigate = useNavigate();

    // Stats Calculations make sure safely accessed
    const totalEffectif = allPlayers ? allPlayers.length : 0;
    const squadsActive = squads ? squads.filter(s => s.slId).length : 0;
    // Removed staffPresent and servicesActive as requested

    // Recent Activity (Simple version - TRAININGS)
    const recentActivity = useMemo(() => {
        if (!allPlayers) return [];
        let activities = [];
        allPlayers.forEach(p => {
            if (p.trainings) {
                p.trainings.forEach(t => {
                    // try parse date
                    const parts = t.date.split('/');
                    if (parts.length === 3) {
                        const dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
                        activities.push({
                            player: p.name,
                            type: 'training',
                            name: t.name,
                            date: dateObj,
                            dateStr: t.date,
                            valid: t.validated
                        });
                    }
                });
            }
        });
        return activities.sort((a, b) => b.date - a.date).slice(0, 5);
    }, [allPlayers]);

    // Latest Sanctions
    const latestSanctions = useMemo(() => {
        if (!sanctions) return [];
        // Sort by timestamp desc (assuming timestamp exists, if not calculate from date string)
        return [...sanctions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 5);
    }, [sanctions]);

    return (
        <div className="py-2 w-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 font-display uppercase tracking-tight">
                        Dashboard - {authenticatedUser?.name || 'COMMANDEMENT'}
                    </h1>
                    <p className="text-gray-400">Centre de commandement FOF - Données en Temps Réel</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => window.confirm("Réinitialiser avec les données du fichier JSON ? (Perte des modifs locales)") && window.localStorage.clear() || window.location.reload()}
                        className="px-4 py-2 bg-red-900 hover:bg-red-800 border border-red-700 hover:border-red-500 rounded-lg flex items-center gap-2 text-white font-bold uppercase text-xs transition-all"
                    >
                        ↻ Reset Données
                    </button>
                    <div className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg flex items-center gap-2 text-green-500 font-bold uppercase text-sm animate-pulse">
                        <Activity size={16} /> Système en ligne
                    </div>
                </div>
            </div>

            {/* Top Stats Grid - REMOVED 2 CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <StatCard
                    title="Effectif Total"
                    value={totalEffectif}
                    icon={Users}
                    gradient="bg-gradient-to-br from-blue-600 to-blue-900"
                    onClick={() => navigate('/app/players')}
                />
                <StatCard
                    title="Escouades Actives"
                    value={squadsActive}
                    icon={Shield}
                    gradient="bg-gradient-to-br from-emerald-600 to-emerald-900"
                    onClick={() => navigate('/app/ops/escouades')} // Or chef-escouade
                />
            </div>

            {/* QUICK ACTIONS ADMIN */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <button
                    onClick={() => navigate('/app/players')}
                    style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                    className="p-4 bg-[#0f172a] hover:bg-slate-700 border border-slate-700 hover:border-blue-500 rounded-lg flex flex-col items-center gap-2 group transition-all"
                >
                    <Users size={24} className="text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Gestion Effectifs</span>
                </button>

                <button
                    onClick={() => navigate('/app/admin/promotions')}
                    style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                    className="p-4 bg-[#0f172a] hover:bg-slate-700 border border-slate-700 hover:border-yellow-500 rounded-lg flex flex-col items-center gap-2 group transition-all"
                >
                    <TrendingUp size={24} className="text-yellow-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Promotions</span>
                </button>

                <button
                    onClick={() => navigate('/app/formation/validation')}
                    style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                    className="p-4 bg-[#0f172a] hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 rounded-lg flex flex-col items-center gap-2 group transition-all"
                >
                    <CheckCircle size={24} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Validations</span>
                </button>

                <button
                    onClick={() => navigate('/app/moderation/sanctions')}
                    style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                    className="p-4 bg-[#0f172a] hover:bg-slate-700 border border-slate-700 hover:border-red-500 rounded-lg flex flex-col items-center gap-2 group transition-all"
                >
                    <Scale size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Sanctions</span>
                </button>
            </div>

            {/* CONTENT GRID: Activity & Sanctions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Activity Feed */}
                <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="modern-panel bg-[#0f172a] p-6 h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold font-display uppercase flex items-center gap-2">
                            <Activity size={24} className="text-blue-400" /> Activité Récente (Qualifs)
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {recentActivity.length > 0 ? recentActivity.map((act, i) => (
                            <div key={i} className="flex items-center p-4 rounded-lg bg-slate-800 hover:bg-slate-800 transition-colors border-l-2 border-transparent hover:border-blue-500 group">
                                <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center text-slate-300 mr-4 font-bold text-lg font-display uppercase group-hover:bg-blue-900 group-hover:text-blue-300 transition-colors">
                                    {act.player.substring(0, 2)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-lg">{act.player}</h4>
                                    <p className="text-slate-400 text-sm">A validé la qualification <span className="text-blue-400 font-bold">{act.name}</span></p>
                                    <p className="text-xs text-gray-500 uppercase mt-1 font-bold tracking-wide flex items-center gap-1">
                                        <Award size={12} /> Validé le {act.dateStr}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-500 italic">Aucune activité récente.</div>
                        )}
                    </div>
                </div>

                {/* Latest Sanctions Feed */}
                <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="modern-panel bg-[#0f172a] p-6 h-full border-red-900">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold font-display uppercase flex items-center gap-2 text-red-500">
                            <AlertTriangle size={24} /> Dernières Sanctions
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {latestSanctions.length > 0 ? latestSanctions.map((s, i) => (
                            <div key={i} className="flex items-center p-4 rounded-lg bg-red-900 hover:bg-red-900 transition-colors border-l-2 border-transparent hover:border-red-500 group">
                                <div className="w-12 h-12 rounded bg-red-950 flex items-center justify-center text-red-500 mr-4 font-bold text-lg font-display uppercase border border-red-900">
                                    {s.scale}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-white text-lg">{s.playerName}</h4>
                                        <span className="text-[10px] font-mono text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-900">{s.date}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm italic">"{s.reason}"</p>
                                    {s.duration && (
                                        <p className="text-xs text-red-400 uppercase mt-1 font-bold tracking-wide flex items-center gap-1">
                                            <Calendar size={12} /> Durée: {s.duration}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-500 italic">Aucune sanction récente.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

const Dashboard = () => {
    const { currentUserRole } = useGame();

    // Route based on role
    // ADMIN sees Global Dashboard
    // OTHERS see Personal Dashboard
    if (currentUserRole === 'ADMIN') {
        return <AdminDashboard />;
    } else {
        return <SoldierDashboard role={currentUserRole} />;
    }
};

export default Dashboard;



