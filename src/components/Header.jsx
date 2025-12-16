import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Gift } from 'lucide-react';
import { useGame } from '../context/GameContext';
import './Header.css';

const Header = ({ onMenuClick }) => {
    const location = useLocation();
    const { allPlayers, authenticatedUser } = useGame();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date) => {
        const day = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        // Capitalize first letter of day
        const dayCap = day.charAt(0).toUpperCase() + day.slice(1);
        return `${dayCap} - ${time}`;
    };

    // VÉRIFICATION DES ANNIVERSAIRES (Calcul automatique)
    const celebratingPlayers = useMemo(() => {
        if (!allPlayers) return [];
        const todayDay = currentTime.getDate();
        const todayMonth = currentTime.getMonth() + 1; // JS months are 0-11

        return allPlayers.filter(p => {
            if (!p.joinDate) return false;
            const [d, m, y] = p.joinDate.split('/');
            // Check day and month match
            return parseInt(d) === todayDay && parseInt(m) === todayMonth;
        });
    }, [allPlayers, currentTime]);


    // GESTION DE LA MODALE ANNIVERSAIRE
    const [showAnniversaryModal, setShowAnniversaryModal] = useState(false);

    return (
        <>
            <div className="header-wrapper">
                <header className="app-header">
                    <div className="header-left flex items-center shrink-0">
                        <button className="menu-toggle font-display font-bold text-sm tracking-widest border border-white rounded px-3 py-1 bg-white hover:bg-white transition-colors uppercase" onClick={onMenuClick}>
                            MENU
                        </button>

                        {/* Mobile Logo added */}
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="h-8 w-auto mr-3 md:hidden" />

                        <div className="flex flex-col ml-1 md:ml-4">
                            {authenticatedUser ? (
                                <>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wide leading-none mb-0.5">{authenticatedUser.grade}</span>
                                    <span className="font-bold text-lg tracking-wider text-white uppercase leading-none">{authenticatedUser.name}</span>
                                </>
                            ) : (
                                <span className="font-bold text-lg tracking-wider text-white uppercase leading-none">NON CONNECTÉ</span>
                            )}
                        </div>
                    </div>

                    <div className="header-right flex items-center gap-6 shrink-0">
                        <div className="h-8 w-px bg-gray-700"></div>

                        <div className="text-right">
                            <span className="text-lg font-bold text-white tracking-widest font-display uppercase">{formatDateTime(currentTime)}</span>
                        </div>
                    </div>
                </header>

                {/* BANNIÈRE CENTRALE D'ANNIVERSAIRE (Défilement automatique) */}
                {celebratingPlayers.length > 0 && (
                    <div
                        onClick={() => setShowAnniversaryModal(true)}
                        className="w-full h-10 bg-amber-900 border-y border-amber-500 relative flex items-center cursor-pointer hover:bg-amber-800 transition-colors group overflow-hidden"
                    >
                        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-amber-900 to-transparent z-10"></div>
                        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-amber-900 to-transparent z-10"></div>

                        {/* Texte défilant (Marquee) - Se met en pause au survol */}
                        <div className="flex items-center gap-4 animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused] w-full">
                            {/* Duplicated 3 times to ensure smooth loop on wide screens */}
                            {[1, 2, 3].map(i => (
                                <React.Fragment key={i}>
                                    <span className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-widest text-sm ml-8">
                                        <Gift size={16} className="animate-bounce" /> Joyeux Anniversaire Soldat :
                                    </span>
                                    {celebratingPlayers.map(p => (
                                        <span key={p.id} className="text-white font-display font-bold text-lg mx-4">
                                            {p.name}
                                        </span>
                                    ))}
                                    <span className="mx-8 opacity-0">|</span>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MODALE DÉTAIL ANNIVERSAIRES (Popup) */}
            {showAnniversaryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black  animate-in fade-in duration-200 p-4">
                    <div className="bg-slate-900 border border-amber-500 rounded-2xl max-w-2xl w-full shadow-2xl relative overflow-hidden">
                        {/* Header */}
                        <div className="bg-amber-900 p-6 border-b border-amber-500 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500 rounded-xl border border-amber-500">
                                    <Gift size={32} className="text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white font-display uppercase tracking-wide">Anniversaires du Jour</h2>
                                    <p className="text-amber-200 text-sm font-mono uppercase tracking-wider">Célébration d'engagement</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAnniversaryModal(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {celebratingPlayers.map(p => {
                                    // Calculate years
                                    const joinYear = p.joinDate ? parseInt(p.joinDate.split('/')[2]) : 2024;
                                    const years = currentTime.getFullYear() - joinYear;

                                    return (
                                        <div key={p.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4 hover:border-amber-500 transition-colors group">
                                            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 font-bold text-lg border border-slate-800 group-hover:bg-amber-900 group-hover:text-amber-400 group-hover:border-amber-500 transition-all">
                                                {p.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{p.name}</h3>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <span className="uppercase tracking-wider font-bold bg-slate-800 px-1.5 py-0.5 rounded">{p.grade}</span>
                                                    <span>•</span>
                                                    <span className="text-amber-400 font-bold">{years} {years > 1 ? 'ans' : 'an'} de service</span>
                                                </div>
                                                <div className="mt-1 text-[10px] text-slate-500 font-mono">
                                                    Arrivé le {p.joinDate}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500">
                            Appuyez sur ECHAP pour fermer ou cliquez sur la croix.
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;

