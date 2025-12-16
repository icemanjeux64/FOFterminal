import React, { useState } from 'react';
import { Shield, Lock, User, Terminal, ChevronRight, AlertTriangle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { allPlayers, login, getCredentials, createCredentials } = useGame();
    const [step, setStep] = useState(1); // 1: Matricule, 2: Password
    const [matricule, setMatricule] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [identifiedPlayer, setIdentifiedPlayer] = useState(null);
    const [isFirstTime, setIsFirstTime] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);
    const navigate = useNavigate();

    const handleCheckMatricule = (e) => {
        e.preventDefault();
        setError('');

        // Find player by Matricule
        const player = allPlayers.find(p => p.matricule?.toUpperCase() === matricule.toUpperCase());

        if (player) {
            setIdentifiedPlayer(player);
            // Check if credentials exist for this player
            const hasCreds = getCredentials(player.matricule);
            setIsFirstTime(!hasCreds);
            setStep(2);
        } else {
            setError("Matricule non reconnu dans la base de données.");
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (isFirstTime) {
            // Create Password
            if (password.length < 4) {
                setError("Le mot de passe doit contenir au moins 4 caractères.");
                return;
            }
            createCredentials(identifiedPlayer.matricule, password);
            login(identifiedPlayer);
            navigate('/app');
        } else {
            // Verify Password
            const success = login(identifiedPlayer, password);
            if (success) {
                setIsLaunching(true);
                setTimeout(() => navigate('/app'), 4000);
            } else {
                setError("Mot de passe incorrect.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {isLaunching && <LoadingConsole player={identifiedPlayer} />}

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <img src="/logo.png" alt="FOF Logo" className="w-40 h-auto drop-shadow-2xl animate-in fade-in zoom-in duration-700" />
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-wider font-tech mb-2">Accès Sécurisé</h1>
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Base de Données Forces Spéciales</p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleCheckMatricule} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Identifiant Matricule</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={matricule}
                                    onChange={(e) => setMatricule(e.target.value.toUpperCase())}
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white font-mono font-bold tracking-wider placeholder-slate-700 focus:outline-none focus:border-blue-500 transition-all uppercase"
                                    placeholder="FOF_XXXX"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-xs font-bold flex items-center gap-2 bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                                <AlertTriangle size={14} /> {error}
                            </div>
                        )}

                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl uppercase tracking-widest transition-all hover:scale-[1.02] shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                            Identifier <ChevronRight size={18} />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-6 animate-in slide-in-from-right-10 duration-300">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-6 flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                                {identifiedPlayer.name.charAt(0)}
                            </div>
                            <div>
                                <div className="text-white font-bold uppercase text-sm">{identifiedPlayer.name}</div>
                                <div className="text-slate-500 text-xs font-mono">{identifiedPlayer.grade}</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                                {isFirstTime ? 'Définir un Mot de Passe' : 'Mot de Passe'}
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                    autoFocus
                                />
                            </div>
                            {isFirstTime && <p className="text-[10px] text-slate-500 pl-1">* Première connexion : définissez votre mot de passe personnel.</p>}
                        </div>

                        {error && (
                            <div className="text-red-500 text-xs font-bold flex items-center gap-2 bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                                <AlertTriangle size={14} /> {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setStep(1)} className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-4 rounded-xl transition-all">
                                ←
                            </button>
                            <button type="submit" className={`flex-1 bg-gradient-to-r ${isFirstTime ? 'from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400' : 'from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400'} text-white font-bold py-4 rounded-xl uppercase tracking-widest transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2`}>
                                {isFirstTime ? 'Initialiser Compte' : 'Connexion'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="absolute bottom-4 text-slate-600 text-[10px] font-mono uppercase tracking-widest opacity-50">
                Système Sécurisé FOF-OS v3.2
            </div>
        </div>
    );
};

export default Login;

const LoadingConsole = ({ player }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black text-green-500 font-mono p-8 flex flex-col justify-center items-center">
            <div className="max-w-3xl w-full space-y-2">
                <Line delay={0}>&gt; ESTABLISHING SECURE CONNECTION...</Line>
                <Line delay={800}>&gt; ENCRYPTING DATA STREAM [256-BIT]...</Line>
                <Line delay={1600}>&gt; VERIFYING BIOMETRIC SIGNATURE...</Line>
                <Line delay={2400} className="text-blue-400">&gt; IDENTITY CONFIRMED.</Line>
                <Line delay={2500} className="text-white text-xl md:text-3xl font-bold uppercase py-4">
                    &gt; BIENVENUE, {player.grade} {player.name}
                </Line>
                <Line delay={3200}>&gt; LOADING TACTICAL DASHBOARD...</Line>

                <div className="h-1 w-full bg-slate-800 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 animate-[width_3s_ease-out_forwards]" style={{ width: '0%', animationName: 'progress' }}></div>
                </div>
                <style>{`
                    @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
                `}</style>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-scan"></div>
        </div>
    );
};

const Line = ({ delay, children, className = "" }) => {
    const [visible, setVisible] = React.useState(false);
    React.useEffect(() => {
        const timer = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    if (!visible) return null;
    return <div className={`animate-in fade-in slide-in-from-left-2 duration-300 ${className}`}>{children}</div>;
};
