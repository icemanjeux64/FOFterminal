import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { BookOpen, Plus, Clock, Users, Award, Trash2, Edit2, CheckCircle, Save } from 'lucide-react';
import PageTitle from '../components/PageTitle';

export default function TrainingCatalog() {
    const { trainingModules: modules, setTrainingModules: setModules, ranks, currentUserRole } = useGame();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null); // If null, creating new.

    // Sort ranks for dropdown
    const rankOptions = ranks ? [...ranks].sort((a, b) => a.level - b.level).map(r => r.name) : ['Recrue', 'Soldat'];

    // RBAC: Can edit?
    const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'TRAINER';

    const [formData, setFormData] = useState({
        title: '',
        slots: 1,
        minRank: 'Recrue',
        duration: '',
        description: ''
    });

    const openCreateModal = () => {
        if (!canEdit) return;
        setEditingId(null);
        setFormData({ title: '', slots: 1, minRank: 'Recrue', duration: '', description: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (module) => {
        if (!canEdit) return;
        setEditingId(module.id);
        setFormData({
            title: module.title,
            slots: module.slots,
            minRank: module.minRank,
            duration: module.duration,
            description: module.description || ''
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.title || !formData.duration) return;

        if (editingId) {
            // Update
            setModules(prev => prev.map(m => m.id === editingId ? { ...m, ...formData, slots: parseInt(formData.slots) } : m));
        } else {
            // Create
            const module = {
                id: Date.now(), // or string id
                ...formData,
                slots: parseInt(formData.slots)
            };
            setModules(prev => [...prev, module]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id, e) => {
        e.stopPropagation(); // Prevent opening modal
        if (window.confirm("Supprimer ce module ?")) {
            setModules(prev => prev.filter(m => m.id !== id));
            if (editingId === id) setIsModalOpen(false);
        }
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <PageTitle
                    title="Catalogue de Formations"
                    subtitle="Gestion des modules et cursus d'instruction."
                    icon={BookOpen}
                />

                {canEdit && (
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase py-2 px-4 rounded-lg shadow-lg shadow-blue-900 transition-all active:scale-95"
                    >
                        <Plus size={20} /> Nouveau Module
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map(module => (
                    <div
                        key={module.id}
                        onClick={() => canEdit && openEditModal(module)}
                        style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 10 }}
                        className={`bg-[#0f172a] border border-slate-700 rounded-xl overflow-hidden transition-all group relative ${canEdit ? 'hover:border-blue-500 hover:shadow-lg hover:shadow-blue-900 cursor-pointer' : ''}`}
                    >
                        {canEdit && (
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 size={16} className="text-blue-400" />
                            </div>
                        )}

                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start pr-6">
                                <h3 className={`text-xl font-black text-white font-tech uppercase leading-tight transition-colors ${canEdit ? 'group-hover:text-blue-400' : ''}`}>
                                    {module.title}
                                </h3>
                            </div>

                            <p className="text-slate-400 text-sm leading-relaxed h-20 overflow-y-auto custom-scrollbar">
                                {module.description || "Aucune description."}
                            </p>

                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700">
                                <div className="flex items-center gap-2 text-slate-300 text-sm font-bold bg-slate-950 p-2 rounded border border-slate-800">
                                    <Award size={16} className="text-amber-500" />
                                    <span>{module.minRank}+</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300 text-sm font-bold bg-slate-950 p-2 rounded border border-slate-800">
                                    <Clock size={16} className="text-blue-500" />
                                    <span>{module.duration}</span>
                                </div>
                                <div className="col-span-2 flex items-center gap-2 text-slate-300 text-sm font-bold bg-slate-950 p-2 rounded border border-slate-800">
                                    <Users size={16} className="text-emerald-500" />
                                    <span>{module.slots} Place{module.slots > 1 ? 's' : ''} Max</span>
                                </div>
                            </div>
                        </div>

                        {canEdit ? (
                            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs font-mono text-slate-500 uppercase">
                                <span>ID: {module.id}</span>
                                <button
                                    onClick={(e) => handleDelete(module.id, e)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-950 rounded transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end items-center text-xs font-bold text-slate-600 uppercase">
                                <span>Consultation Uniquement</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* MODAL (Only render if canEdit to be safe) */}
            {canEdit && isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950  p-4 animate-in fade-in duration-200">
                    <div style={{ backgroundColor: '#0f172a', position: 'relative', zIndex: 100 }} className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-black flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white uppercase font-tech flex items-center gap-3">
                                {editingId ? <Edit2 className="text-blue-500" /> : <Plus className="text-green-500" />}
                                {editingId ? "Modifier le Module" : "Créer un Module"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">✕</button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Titre de la formation</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors font-bold"
                                    placeholder="Ex: Formation Pilote..."
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Grade Minimum</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors cursor-pointer"
                                        value={formData.minRank}
                                        onChange={e => setFormData({ ...formData, minRank: e.target.value })}
                                    >
                                        {rankOptions.map(rank => (
                                            <option key={rank} value={rank}>{rank}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Durée Estimée</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Ex: 2h00"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Places Disponibles</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors"
                                    value={formData.slots}
                                    onChange={e => setFormData({ ...formData, slots: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description / Programme</label>
                                <textarea
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors h-32 resize-none"
                                    placeholder="Détails du contenu pédagogique..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase rounded transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase rounded transition-colors shadow-lg shadow-blue-600 flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> {editingId ? "Enregistrer" : "Créer le Module"}
                            </button>
                            {editingId && (
                                <button
                                    onClick={(e) => handleDelete(editingId, e)}
                                    className="px-4 bg-red-900 hover:bg-red-900 text-red-500 rounded font-bold"
                                    title="Supprimer"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



