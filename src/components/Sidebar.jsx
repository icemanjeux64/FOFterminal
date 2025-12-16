import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { useGame } from '../context/GameContext';

const Sidebar = ({ onClose }) => {
    const { currentUserRole, setCurrentUserRole, isSquadLeaderRole, setIsSquadLeaderRole } = useGame();

    // État d'ouverture des groupes de menu (Accordéon)
    const [openGroups, setOpenGroups] = useState({
        admin: true,
        formation: true,
        moderation: true,
        ops: true,
        milsim: true
    });

    const toggleGroup = (group) => {
        setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const NavItem = ({ to, label, subLabel }) => (
        <NavLink
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
        >
            <div className="nav-item-content">
                <span className="nav-main-label">{label}</span>
                {subLabel && <span className="nav-sub-label">{subLabel}</span>}
            </div>
        </NavLink>
    );

    const GroupHeader = ({ label, subLabel, isOpen, onClick }) => (
        <div className="group-header" onClick={onClick}>
            <div className="flex items-center">
                <div className="nav-item-content" style={{ marginLeft: 0 }}>
                    <span className="nav-main-label">{label}</span>
                    {subLabel && <span className="nav-sub-label">{subLabel}</span>}
                </div>
            </div>
            <span className="text-xs font-bold text-gray-500 font-mono">
                {isOpen ? 'v' : '>'}
            </span>
        </div>
    );

    // --- GESTION DES DROITS D'ACCÈS (RBAC) ---
    // Renvoie 'true' si l'utilisateur a le droit de voir cette section.
    // Les Admins voient TOUT par défaut.
    const checkAccess = (allowedRoles) => {
        if (currentUserRole === 'ADMIN') return true; // Admin sees all
        if (!allowedRoles) return false; // If no roles specified, assume restricted
        return allowedRoles.includes(currentUserRole);
    };

    return (
        <div className="sidebar flex flex-col h-full">
            <div className="sidebar-header relative shrink-0">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="FOF Logo" className="sidebar-logo" />
                <div className="md:hidden cursor-pointer absolute right-2 top-0 px-2 py-1 rounded hover:bg-white" onClick={onClose}>
                    <span className="text-xs font-bold text-gray-400">FERMER</span>
                </div>
            </div>

            <div className="sidebar-content flex-1 overflow-y-auto">

                {/* Tableau de Bord (All) */}
                <div className="sidebar-section">
                    <div className="section-label">Tableau de Bord</div>
                    <NavItem to="/app" label="Accueil" subLabel="Tableau de bord principal" />
                </div>

                {/* Administration (Admin Only) */}
                {checkAccess(['ADMIN']) && (
                    <div className="sidebar-section">
                        <GroupHeader
                            label="Administration"
                            subLabel="Gestion administrative"
                            isOpen={openGroups.admin}
                            onClick={() => toggleGroup('admin')}
                        />
                        {openGroups.admin && (
                            <div className="submenu">
                                <NavItem to="/app/players" label="Joueurs" subLabel="Gestion des forces" />
                                <NavItem to="/app/admin/roles" label="Rôles" subLabel="Spécialisations" />
                                <NavItem to="/app/admin/grades" label="Grades" subLabel="Effectifs par rang" />
                                <NavItem to="/app/admin/notes" label="Notes" subLabel="Hiérarchie militaire" />
                                <NavItem to="/app/admin/poles" label="Pôles" subLabel="Pôles organisationnels" />
                                <NavItem to="/app/admin/objectifs" label="Objectifs" subLabel="Objectifs de formation" />
                                <NavItem to="/app/admin/promotions" label="Promotions" subLabel="Montées de grade mensuels" />
                                <NavItem to="/app/admin/promotions-hist" label="Promotions historiques" subLabel="Consultation par mois" />
                            </div>
                        )}
                    </div>
                )}

                {/* Formation (All see list/seances, Trainers/Admin see validation) */}
                <div className="sidebar-section">
                    <GroupHeader
                        label="Formation"
                        subLabel="Gestion des formations"
                        isOpen={openGroups.formation}
                        onClick={() => toggleGroup('formation')}
                    />
                    {openGroups.formation && (
                        <div className="submenu">
                            <NavItem to="/app/formation/list" label="Formations" subLabel="Formations militaires" />
                            <NavItem to="/app/formation/seances" label="Séances" subLabel="Planification des formations" />
                            {checkAccess(['TRAINER']) && (
                                <NavItem to="/app/formation/validation" label="Validation" subLabel="Validation des formations" />
                            )}
                        </div>
                    )}
                </div>

                {/* Modération (Moderator/Admin Only) */}
                {checkAccess(['MODERATOR']) && (
                    <div className="sidebar-section">
                        <GroupHeader
                            label="Modération"
                            subLabel="Gestion des sanctions"
                            isOpen={openGroups.moderation}
                            onClick={() => toggleGroup('moderation')}
                        />
                        {openGroups.moderation && (
                            <div className="submenu">
                                <NavItem to="/app/moderation/sanctions" label="Sanctions" subLabel="Gestion des sanctions" />
                            </div>
                        )}
                    </div>
                )}

                {/* Opérations */}
                <div className="sidebar-section">
                    <GroupHeader
                        label="Opérations"
                        subLabel="Gestion opérationnelle"
                        isOpen={openGroups.ops}
                        onClick={() => toggleGroup('ops')}
                    />
                    {openGroups.ops && (
                        <div className="submenu">
                            <NavItem to="/app/ops/conflict-tracking" label="Suivi de Conflit" subLabel="Carte tactique & Météo" />
                            <NavItem to="/app/ops/logistique" label="Logistique" subLabel="Gestion matériel & ravitaillement" />

                            {/* Staff Only Ops - Now accessible by HIGH_COMMAND */}
                            {checkAccess(['HIGH_COMMAND']) && (
                                <>
                                    <NavItem to="/app/ops/suivi" label="Suivi EM" subLabel="Stagiaire / Adjoint" />
                                    <NavItem to="/app/ops/escouades" label="Escouades" subLabel="Gestion des escouades" />
                                    <NavItem to="/app/ops/services-hist" label="Services historiques" subLabel="Archives des services" />
                                </>
                            )}

                            {/* Squad Leader Space - VISIBLE IF SL (Bool) or ADMIN */}
                            {(isSquadLeaderRole || currentUserRole === 'ADMIN') && (
                                <NavItem to="/app/ops/chef-escouade" label="Espace Chef d'Escouade" subLabel="Gestion des escouades" />
                            )}
                        </div>
                    )}
                </div>

                {/* Milsim */}
                <div className="sidebar-section">
                    <GroupHeader
                        label="Milsim"
                        subLabel="Gestion des missions"
                        isOpen={openGroups.milsim}
                        onClick={() => toggleGroup('milsim')}
                    />
                    {openGroups.milsim && (
                        <div className="submenu">
                            <NavItem to="/app/missions/inscription" label="S'inscrire" subLabel="Calendrier des Opérations" />
                            {(checkAccess(['GAME_MASTER']) || currentUserRole === 'ADMIN') && (
                                <NavItem to="/app/missions/gestion" label="Gestion Missions" subLabel="Espace Mission Maker / GM" />
                            )}
                        </div>
                    )}
                </div>

            </div>


        </div>
    );
};


export default Sidebar;

