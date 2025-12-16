import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './layouts/Layout';
import { GameProvider, useGame } from './context/GameContext';
import Login from './pages/Login'; // Import Login
import Landing from './pages/Landing'; // Import Landing
import Dashboard from './pages/Dashboard';
import Joueurs from './pages/Joueurs';
import PlayerProfile from './pages/PlayerProfile';
import RolesManagement from './pages/RolesManagement';
import GradesManagement from './pages/GradesManagement';
import Promotions from './pages/Promotions';
import Sanctions from './pages/Sanctions';
import MissionRegistration from './pages/MissionRegistration';
import Missions from './pages/Missions';
import PolesManagement from './pages/PolesManagement';

import Construction from './pages/Construction';
import ConflictTracking from './pages/ConflictTracking';
import StaffTracking from './pages/StaffTracking';
import Logistics from './pages/Logistics';

import SquadManagement from './pages/SquadManagement';
import SquadsList from './pages/SquadsList';
import ServicesHistory from './pages/ServicesHistory';
import TrainingCatalog from './pages/TrainingCatalog';
import TrainingSessions from './pages/TrainingSessions';
import TrainingValidation from './pages/TrainingValidation';

// Auth Guard Component
const ProtectedRoute = ({ children }) => {
  const { authenticatedUser } = useGame();
  const location = useLocation();

  if (!authenticatedUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route path="/app" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="players" element={<Joueurs />} />
        <Route path="players/:id" element={<PlayerProfile />} />
        <Route path="missions/inscription" element={<MissionRegistration />} />
        <Route path="missions/gestion" element={<Missions />} />

        {/* Administration */}
        <Route path="admin/roles" element={<RolesManagement />} />
        <Route path="admin/grades" element={<GradesManagement />} />
        <Route path="admin/notes" element={<Construction title="Notes & Hiérarchie" subtitle="Gestion du système de notation et de la hiérarchie militaire." />} />
        <Route path="admin/poles" element={<PolesManagement />} />
        <Route path="admin/objectifs" element={<Construction title="Objectifs de Formation" subtitle="Définition des cursus et objectifs pédagogiques." />} />
        <Route path="admin/promotions" element={<Promotions />} />
        <Route path="admin/promotions-hist" element={<Construction title="Historique des Promotions" subtitle="Consultation des archives de promotions." />} />

        {/* Formation */}
        <Route path="formation/list" element={<TrainingCatalog />} />
        <Route path="formation/seances" element={<TrainingSessions />} />
        <Route path="formation/validation" element={<TrainingValidation />} />

        {/* Modération */}
        <Route path="moderation/sanctions" element={<Sanctions />} />

        {/* Opérations */}
        <Route path="ops/conflict-tracking" element={<ConflictTracking />} />
        <Route path="ops/suivi" element={<StaffTracking />} />
        <Route path="ops/logistique" element={<Logistics />} />
        <Route path="ops/escouades" element={<SquadsList />} />
        <Route path="ops/chef-escouade" element={<SquadManagement />} />
        <Route path="ops/services-hist" element={<ServicesHistory />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <GameProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppRoutes />
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
