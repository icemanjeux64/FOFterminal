import React, { useState, useRef, useEffect } from 'react';
import './Page.css';
import { useGame } from '../context/GameContext';

const ConflictTracking = () => {
    const { fleet } = useGame();
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);
    const mapContainerRef = useRef(null);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [clickPos, setClickPos] = useState({ x: 0, y: 0 }); // Percentages
    const [newPointLabel, setNewPointLabel] = useState("");
    const [newPointType, setNewPointType] = useState("infantry"); // infantry, logistics, hq, etc

    // State for map data
    const [mapData, setMapData] = useState({
        backgroundImage: 'https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?q=80&w=3000&auto=format&fit=crop',
        baseName: 'BASE AVANCÉE KHE-SANH',
        weather: 'NUAGEUX',
        airStatus: {
            medevac: 'DISPO',
            cas: 'INDISPO',
            transport: 'INDISPO'
        },
        points: [] // Empty by default as requested
    });

    // Sync Air Status with Fleet
    // Sync Air Status with Fleet
    useEffect(() => {
        if (!fleet) return;

        const checkStatus = (keywords, excludeArray = []) => {
            const relevantVehicles = fleet.filter(v =>
                v.type &&
                keywords.some(k => v.type.includes(k)) &&
                !excludeArray.some(ex => v.type.includes(ex))
            );

            if (relevantVehicles.length === 0) return 'INDISPO';

            if (relevantVehicles.some(v => v.status === 'En Mission')) return 'DÉPLOYÉ';
            if (relevantVehicles.some(v => v.status === 'Opérationnel')) return 'DISPO'; // Logistics uses 'Opérationnel', not 'Disponible' usually?
            // Logistics.jsx sets status: 'Opérationnel' initially.
            // Let's check both just in case.
            if (relevantVehicles.some(v => v.status === 'Opérationnel' || v.status === 'Disponible')) return 'DISPO';

            return 'INDISPO';
        };

        const medevacStatus = checkStatus(['MEDEVAC']);
        const casStatus = checkStatus(['Tigre', 'Strike', 'Canon', 'HAP']);
        // Transport: "Transport" covers NH90 Transport. Others cover mostly heavy lift. 
        // Gazelle non-armée might be recon, if user wants it in transport, add 'Gazelle'. 
        // User didn't explicitly ask for Gazelle non-armée in transport, just said "pas en support".
        const transportStatus = checkStatus(['Transport', 'Caïman', 'Puma', 'Cougar', 'Caracal']);

        setMapData(prev => ({
            ...prev,
            airStatus: {
                ...prev.airStatus,
                medevac: medevacStatus,
                cas: casStatus,
                transport: transportStatus
            }
        }));
    }, [fleet]);

    // Handle Background Image Change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMapData(prev => ({ ...prev, backgroundImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    // Right Click handler
    const handleRightClick = (e) => {
        e.preventDefault();
        if (!isEditing) return; // Only allow adding in edit mode

        const rect = mapContainerRef.current.getBoundingClientRect();
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

        setClickPos({ x: xPercent, y: yPercent });
        setNewPointLabel("");
        setModalOpen(true);
    };

    const handleAddPoint = () => {
        if (!newPointLabel) return;
        const newPoint = {
            id: Date.now(),
            label: newPointLabel.toUpperCase(),
            x: clickPos.x,
            y: clickPos.y,
            type: newPointType
        };
        setMapData(prev => ({
            ...prev,
            points: [...prev.points, newPoint]
        }));
        setModalOpen(false);
    };

    const handleDeletePoint = (id) => {
        if (!isEditing) return;
        setMapData(prev => ({
            ...prev,
            points: prev.points.filter(p => p.id !== id)
        }));
    };

    // Cycle Status functions
    const cycleAirStatus = (key) => {
        // If automated keys, don't cycle manually
        if (key === 'cas' || key === 'transport') return;

        const statuses = ['DISPO', 'DÉPLOYÉ', 'INDISPO'];
        setMapData(prev => {
            const currentIndex = statuses.indexOf(prev.airStatus[key]);
            const nextIndex = (currentIndex + 1) % statuses.length;
            return {
                ...prev,
                airStatus: { ...prev.airStatus, [key]: statuses[nextIndex] }
            };
        });
    };

    const cycleWeather = () => {
        const weathers = ['CLAIR', 'NUAGEUX', 'PLUIE', 'ORAGE', 'BROUILLARD'];
        setMapData(prev => {
            const currentIndex = weathers.indexOf(prev.weather);
            const nextIndex = (currentIndex + 1) % weathers.length;
            return { ...prev, weather: weathers[nextIndex] };
        });
    };

    // Style Helpers
    const getStatusStyle = (status) => {
        // ... (styles unchanged, but recreating helper due to rewrite block scope)
        const baseStyle = {
            cursor: 'default',
            userSelect: 'none',
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)'
        };

        switch (status) {
            case 'DISPO': return {
                ...baseStyle,
                color: '#4ade80',
                borderColor: 'rgba(74, 222, 128, 0.5)',
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                boxShadow: '0 0 8px rgba(74, 222, 128, 0.2)'
            };
            case 'DÉPLOYÉ': return {
                ...baseStyle,
                color: '#facc15',
                borderColor: 'rgba(250, 204, 21, 0.5)',
                backgroundColor: 'rgba(250, 204, 21, 0.1)',
                boxShadow: '0 0 8px rgba(250, 204, 21, 0.2)'
            };
            case 'INDISPO': return {
                ...baseStyle,
                color: '#f87171',
                borderColor: 'rgba(248, 113, 113, 0.5)',
                backgroundColor: 'rgba(248, 113, 113, 0.1)',
                boxShadow: '0 0 8px rgba(248, 113, 113, 0.2)'
            };
            default: return { ...baseStyle, color: '#9ca3af', borderColor: '#6b7280' };
        }
    };

    // New helper for Weather Styles
    const getWeatherStyle = (weather) => {
        const baseStyle = {
            cursor: 'default',
            userSelect: 'none',
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)'
        };

        switch (weather) {
            case 'CLAIR': return { ...baseStyle, color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.5)', backgroundColor: 'rgba(96, 165, 250, 0.1)' };
            case 'NUAGEUX': return { ...baseStyle, color: '#9ca3af', borderColor: 'rgba(156, 163, 175, 0.5)', backgroundColor: 'rgba(156, 163, 175, 0.1)' };
            case 'PLUIE': return { ...baseStyle, color: '#818cf8', borderColor: 'rgba(129, 140, 248, 0.5)', backgroundColor: 'rgba(129, 140, 248, 0.1)' };
            case 'ORAGE': return { ...baseStyle, color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.5)', backgroundColor: 'rgba(248, 113, 113, 0.1)' };
            case 'BROUILLARD': return { ...baseStyle, color: '#d1d5db', borderColor: 'rgba(209, 213, 219, 0.5)', backgroundColor: 'rgba(209, 213, 219, 0.1)' };
            default: return baseStyle;
        }
    };

    const getPointColor = (type) => {
        switch (type) {
            case 'hq': return 'border-red-500 text-red-500 shadow-red-500';
            case 'logistics': return 'border-amber-500 text-amber-500 shadow-amber-500';
            case 'transport': return 'border-blue-500 text-blue-500 shadow-blue-500';
            case 'training': return 'border-green-500 text-green-500 shadow-green-500';
            default: return 'border-cyan-400 text-cyan-400 shadow-cyan-400';
        }
    };

    return (
        <div className="flex flex-col relative" style={{ height: 'calc(100vh - 100px)' }}>

            {/* Hidden File Input */}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />

            {/* Top Controls Bar */}
            <div className="flex justify-between items-center mb-2 px-1">
                <div>
                    <h2 className="text-xl font-bold uppercase tracking-wider text-white">Suivi de Conflit</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        className={`btn-text text-xs border border-white px-3 py-1 rounded hover:bg-white ${isEditing ? 'text-green-400 border-green-500' : 'text-blue-400'}`}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? 'TERMINER ÉDITION' : 'MODE ÉDITION'}
                    </button>
                    {isEditing && (
                        <button className="btn-text text-xs text-gray-300 border border-white px-3 py-1 rounded hover:bg-white" onClick={triggerFileInput}>
                            CHANGER FOND
                        </button>
                    )}
                </div>
            </div>

            {/* Tactical Map Container */}
            <div
                ref={mapContainerRef}
                className="relative flex-1 w-full rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl"
                onContextMenu={handleRightClick} // Enable functionality
            >

                {/* Background Image */}
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${mapData.backgroundImage})` }}>
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(255, 0, 0, 0.02))',
                        backgroundSize: '100% 3px, 3px 100%',
                        boxShadow: 'inset 0 0 150px rgba(0,0,0,0.7)'
                    }}></div>
                </div>

                {/* HUD Panels (Interactive) */}
                <div className="absolute top-4 left-4 w-72 space-y-6 z-10">

                    {/* Weather Panel */}
                    <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a]  border border-slate-700 p-3 rounded group cursor-default select-none transition-colors" onClick={cycleWeather}>
                        <div className="flex items-center gap-2 mb-2 border-b border-white pb-2">
                            <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">Météo Base</div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400 uppercase">Condition Actuelle</span>
                            <div
                                className="text-[10px] font-bold font-display uppercase px-4 py-1 rounded w-[110px] text-center transition-all duration-300 flex justify-center items-center"
                                style={getWeatherStyle(mapData.weather)}
                            >
                                {mapData.weather}
                            </div>
                        </div>
                    </div>

                    {/* Air Status Panel */}
                    <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }} className="bg-[#0f172a]  border border-slate-700 p-3 rounded">
                        <div className="flex items-center gap-2 mb-3 border-b border-white pb-2">
                            <div className="text-xs font-bold text-green-400 uppercase tracking-widest">Statut Aérien</div>
                        </div>
                        <div className="space-y-2">
                            {['medevac', 'cas', 'transport'].map(type => (
                                <div key={type} className="flex justify-between items-center group cursor-default select-none" onClick={() => cycleAirStatus(type)}>
                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider group-hover:text-white transition-colors">{type === 'cas' ? 'APPUI AÉRIEN' : type}</span>
                                    <span
                                        className="text-[8px] font-bold px-3 py-1 rounded transition-all duration-300 flex items-center justify-center w-[70px]"
                                        style={getStatusStyle(mapData.airStatus[type])}
                                    >
                                        {mapData.airStatus[type]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Map Points */}
                {mapData.points.map((point) => (
                    <div
                        key={point.id}
                        className={`absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 ${isEditing ? 'cursor-no-drop hover:text-red-500' : ''}`}
                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                        onClick={() => handleDeletePoint(point.id)} // Delete on click in edit mode? OR add separate delete button
                        title={isEditing ? "Cliquez pour supprimer" : point.label}
                    >
                        {/* Point Marker */}
                        <div className={`w-3 h-3 rounded-full border shadow-[0_0_10px] bg-[#0f172a] ${getPointColor(point.type)}`}></div>

                        {/* Label Badge */}
                        <div className={`mt-1 px-1.5 py-0.5 border bg-[#0f172a]  text-[8px] font-bold uppercase tracking-wider whitespace-nowrap ${getPointColor(point.type)}`}>
                            {point.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Point Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black " onClick={() => setModalOpen(false)}>
                    <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 100 }} className="bg-[#0f172a] border border-slate-700 p-6 rounded-lg w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-4 uppercase">Nouveau Point</h3>

                        <div className="mb-4">
                            <label className="block text-xs text-gray-400 uppercase mb-1">Nom du point</label>
                            <input
                                type="text"
                                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:border-blue-500 outline-none uppercase"
                                value={newPointLabel}
                                onChange={(e) => setNewPointLabel(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs text-gray-400 uppercase mb-1">Type (Couleur)</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button className={`p-2 rounded border border-cyan-500 bg-cyan-500 text-cyan-400 text-xs ${newPointType === 'infantry' ? 'ring-1 ring-cyan-400 bg-cyan-500' : ''}`} onClick={() => setNewPointType('infantry')}>Infanterie</button>
                                <button className={`p-2 rounded border border-red-500 bg-red-500 text-red-500 text-xs ${newPointType === 'hq' ? 'ring-1 ring-red-500 bg-red-500' : ''}`} onClick={() => setNewPointType('hq')}>Command.</button>
                                <button className={`p-2 rounded border border-amber-500 bg-amber-500 text-amber-500 text-xs ${newPointType === 'logistics' ? 'ring-1 ring-amber-500 bg-amber-500' : ''}`} onClick={() => setNewPointType('logistics')}>Logistique</button>
                                <button className={`p-2 rounded border border-blue-500 bg-blue-500 text-blue-500 text-xs ${newPointType === 'transport' ? 'ring-1 ring-blue-500 bg-blue-500' : ''}`} onClick={() => setNewPointType('transport')}>Transport</button>
                                <button className={`p-2 rounded border border-green-500 bg-green-500 text-green-500 text-xs ${newPointType === 'training' ? 'ring-1 ring-green-500 bg-green-500' : ''}`} onClick={() => setNewPointType('training')}>Formation</button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button className="btn-text text-gray-400 text-xs" onClick={() => setModalOpen(false)}>ANNULER</button>
                            <button className="btn btn-primary text-xs py-1 px-4" onClick={handleAddPoint}>AJOUTER</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ConflictTracking;



