// ============================================================
// AgroConnect — Transporter Routes
// src/routes/TransporterRoutes.jsx
// ============================================================
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute  from '../Components/common/ProtectedRoute';
import RoleGuard       from '../Components/common/RoleGuard';
import DashboardLayout from '../Components/layout/DashboardLayout';

import Dashboard    from '../pages/transporter/Dashboard';
import Vehicles     from '../pages/transporter/Vehicles';
import AddVehicle   from '../pages/transporter/AddVehicle';
import Availability from '../pages/transporter/Availability';
import Missions     from '../pages/transporter/Missions';
import Deliveries   from '../pages/transporter/Deliveries';
import Profile      from '../pages/transporter/Profile';
import Tarifs       from '../pages/transporter/Tarifs';
import Wallet       from '../pages/transporter/Wallet';

const TransporterRoutes = () => (
    <>
  <Route element={<ProtectedRoute />}>
    <Route element={<RoleGuard role="transporter" />}>
      <Route element={<DashboardLayout />}>
        <Route path="/transporter/dashboard"          element={<Dashboard />} />
        <Route path="/transporter/vehicles"           element={<Vehicles />} />
        <Route path="/transporter/vehicles/add"       element={<AddVehicle />} />
        <Route path="/transporter/availability"       element={<Availability />} />
        <Route path="/transporter/missions"           element={<Missions />} />
        <Route path="/transporter/deliveries"         element={<Deliveries />} />
        <Route path="/transporter/profile"            element={<Profile />} />
        <Route path="/transporter/tarifs"             element={<Tarifs />} />
        <Route path="/transporter/wallet"             element={<Wallet />} />
      </Route>
    </Route>
  </Route>
  </>
);

export default TransporterRoutes;