import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Target, Award, Users, ChevronDown, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Landing() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">

            {/* --- NAVBAR --- */}
            <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-slate-950/90 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="FOF" className="h-10 w-auto object-contain" />
                        <span className="font-tech text-lg tracking-widest font-bold text-white hidden md:block">FOF <span className="text-blue-500">INTRA</span></span>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-blue-900/20"
                    >
                        Accès Membre
                    </button>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20">
                {/* Backgrounds */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#050b20] to-[#020617]"></div>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-950 to-transparent"></div>
                    {/* Grid Overlay */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center w-full">
                    {/* Logo - Aspect Ratio Fixed */}
                    <div className="mb-8 relative group">
                        <div className="absolute inset-0 bg-blue-600/20 blur-[80px] rounded-full opacity-60 animate-pulse"></div>
                        <img
                            src={`${import.meta.env.BASE_URL}logo.png`}
                            alt="FOF Logo"
                            className="relative z-10 h-40 md:h-64 w-auto object-contain drop-shadow-2xl animate-in fade-in zoom-in duration-1000"
                        />
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-8xl font-black uppercase tracking-tighter mb-6 font-tech text-white leading-tight break-words w-full max-w-[100vw]">
                        Force Opérationnelle <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Française</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 font-light mb-12 tracking-wide max-w-2xl mx-auto leading-relaxed">
                        L'excellence opérationnelle au service de la simulation militaire.

                    </p>

                    <div className="flex flex-col md:flex-row gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-4 bg-white text-slate-950 font-black uppercase tracking-widest rounded hover:bg-slate-200 transition-all hover:-translate-y-1 shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center gap-2"
                        >
                            Connexion Intranet <ArrowRight size={20} />
                        </button>
                        <a
                            href="https://discord.gg/BVMpxHF6hf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] border border-[#5865F2] text-white font-bold uppercase tracking-widest rounded transition-all hover:-translate-y-1 shadow-[0_0_20px_rgba(88,101,242,0.3)]"
                        >
                            Rejoindre le Discord
                        </a>
                    </div>
                </div>

                {/* Scroll Down Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-slate-500">
                    <ChevronDown size={32} />
                </div>
            </section>

            {/* --- VALEURS SECTION --- */}
            <section className="py-32 relative overflow-hidden bg-[#03081c]">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <span className="text-blue-500 font-mono text-xs font-bold uppercase tracking-widest mb-2 block">Nos Piliers</span>
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase font-tech">Valeurs Fondamentales</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ValueCard
                            icon={<Shield size={40} />}
                            title="Honneur"
                            desc="L'intégrité et le respect guident chacune de nos actions sur et en dehors du terrain."
                            color="blue"
                        />
                        <ValueCard
                            icon={<Users size={40} />}
                            title="Cohésion"
                            desc="La force du groupe prime sur l'individu. Une unité soudée est une unité invincible."
                            color="indigo"
                        />
                        <ValueCard
                            icon={<Award size={40} />}
                            title="Excellence"
                            desc="La recherche constante de la perfection tactique et de la maîtrise de nos outils."
                            color="amber"
                        />
                    </div>
                </div>
            </section>


            {/* --- ABOUT SECTION --- */}
            <section className="py-32 bg-slate-950 border-t border-white/5 relative">
                <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
                    <div className="absolute -top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-900/20 blur-[100px] rounded-full"></div>
                </div>

                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-white uppercase font-tech mb-6 leading-tight">
                            Une Structure <span className="text-blue-500">Professionnelle</span>
                        </h2>
                        <div className="space-y-6 text-slate-400 leading-relaxed text-lg">
                            <p>
                                La <strong className="text-white">Force Opérationnelle Française</strong> se distingue par une organisation inspirée des structures militaires réelles, adaptée aux exigences de la simulation moderne.
                            </p>
                            <p>
                                De la logistique complexe aux opérations spéciales, chaque membre occupe un rôle crucial. Notre hiérarchie claire et nos pôles de spécialisation permettent une immersion totale et une efficacité redoutable.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                <LiItem>Entraînements Hebdomadaires</LiItem>
                                <LiItem>Chaîne de Commandement</LiItem>
                                <LiItem>Spécialisations (Médic, AT...)</LiItem>
                                <LiItem>Opérations Inter-Clans</LiItem>
                            </ul>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-900 to-black p-8 rounded-2xl border border-slate-800 shadow-2xl relative group">
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"></div>

                        {/* Mockup Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <StatBox value="50+" label="Membres Actifs" />
                            <StatBox value="120+" label="Opérations" />
                            <StatBox value="4" label="Escouades Spécialisées" />
                            <StatBox value="24/7" label="Serveur Dédié" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CAROUSEL SECTION --- */}
            <section className="py-20 bg-[#020617] relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-white uppercase font-tech flex justify-center items-center gap-3">
                            <span className="w-12 h-1 bg-gradient-to-r from-transparent to-blue-500"></span>
                            Galerie Opérationnelle
                            <span className="w-12 h-1 bg-gradient-to-l from-transparent to-blue-500"></span>
                        </h2>
                    </div>
                    <Carousel />
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-12 bg-[#01040f] border-t border-white/5 text-center md:text-left">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="FOF" className="h-8 w-auto grayscale" />
                        <span className="font-tech text-sm tracking-widest text-slate-400 font-bold">FORCE OPÉRATIONNELLE FRANÇAISE</span>
                    </div>
                    <div className="text-slate-600 text-xs font-mono uppercase tracking-widest">
                        © 2024 FOF. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
}

// --- SUB COMPONENTS ---

const ValueCard = ({ icon, title, desc, color }) => (
    <div className="group p-8 bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-2xl hover:bg-slate-900/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-500 transition-all duration-500 group-hover:h-full h-0`}></div>
        <div className={`w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mb-6 text-${color}-500 shadow-inner border border-${color}-500/20 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white uppercase font-tech mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm">
            {desc}
        </p>
    </div>
);

const LiItem = ({ children }) => (
    <li className="flex items-center gap-3 text-slate-300 text-sm font-bold bg-slate-900/50 p-3 rounded border border-white/5">
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
        {children}
    </li>
);

const StatBox = ({ value, label }) => (
    <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
        <span className="text-3xl md:text-4xl font-black text-white font-tech mb-1">{value}</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{label}</span>
    </div>
);

const Carousel = () => {
    // REPLACER CES URLS PAR VOS IMAGES (public/img/...)
    const slides = [
        {
            id: 1,
            url: "https://placehold.co/1200x600/1e293b/475569.png?text=Deploiement+Tactique",
            title: "Déploiement Tactique",
            desc: "Coordination inter-armes sur le terrain."
        },
        {
            id: 2,
            url: "https://placehold.co/1200x600/0f172a/334155.png?text=Entrainement+Commando",
            title: "Entrainement Commando",
            desc: "Des exercices rigoureux pour une préparation optimale."
        },
        {
            id: 3,
            url: "https://placehold.co/1200x600/172554/1d4ed8.png?text=Briefing+Mission",
            title: "Planification",
            desc: "Chaque opération commence par une analyse détaillée."
        }
    ];

    const [current, setCurrent] = useState(0);

    // Auto-rotate
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const next = () => setCurrent((current + 1) % slides.length);
    const prev = () => setCurrent((current - 1 + slides.length) % slides.length);

    return (
        <div className="relative w-full max-w-5xl mx-auto h-[300px] md:h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    {/* Image */}
                    <img src={slide.url} alt={slide.title} className="w-full h-full object-cover" />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>

                    {/* Caption */}
                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                        <div className={`transition-all duration-700 delay-300 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <h3 className="text-2xl md:text-4xl font-black text-white uppercase font-tech mb-2">{slide.title}</h3>
                            <p className="text-slate-300 text-sm md:text-lg max-w-2xl">{slide.desc}</p>
                        </div>
                    </div>
                </div>
            ))}

            {/* Controls */}
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-blue-600/80 text-white p-3 rounded-full backdrop-blur transition-all opacity-0 group-hover:opacity-100">
                <ChevronLeft size={24} />
            </button>
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-blue-600/80 text-white p-3 rounded-full backdrop-blur transition-all opacity-0 group-hover:opacity-100">
                <ChevronRight size={24} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`w-12 h-1 rounded-full transition-all ${idx === current ? 'bg-blue-500' : 'bg-slate-700 hover:bg-slate-500'}`}
                    />
                ))}
            </div>
        </div>
    );
};
