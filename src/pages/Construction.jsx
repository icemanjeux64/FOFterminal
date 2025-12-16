import React from 'react';
import { Hammer, Construction as ConstructionIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Construction = ({ title, subtitle }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-full p-12 text-center fade-in">
            <div className="glass-panel p-12 flex flex-col items-center max-w-2xl w-full relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500 rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>

                <div className="mb-6 p-4 rounded-full bg-white border border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    <ConstructionIcon size={48} className="text-blue-400" />
                </div>

                <h2 className="text-3xl font-bold mb-2 tracking-wide text-white">{title}</h2>
                <p className="text-gray-400 mb-8 text-lg">{subtitle || "Cette section est actuellement en cours de développement."}</p>

                <div className="w-full bg-gray-700 rounded-full h-2 mb-8 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full w-1/3 rounded-full animate-pulse"></div>
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <ArrowLeft size={18} />
                    Retour
                </button>
            </div>
        </div>
    );
};

export default Construction;



