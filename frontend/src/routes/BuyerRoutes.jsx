// ============================================================
// AgroConnect — Buyer Routes
// src/routes/BuyerRoutes.jsx
// ============================================================
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute    from '../Components/common/ProtectedRoute';
import RoleGuard         from '../Components/common/RoleGuard';
import DashboardLayout   from '../Components/layout/DashboardLayout';

import Dashboard    from '../pages/buyer/Dashboard';
import Catalog      from '../pages/buyer/Catalog';
import Cart         from '../pages/buyer/Cart';
import Checkout     from '../pages/buyer/Checkout';
import Orders       from '../pages/buyer/Orders';
import OrderDetail  from '../pages/buyer/OrderDetail';
import OrderTracking from '../pages/buyer/OrderTracking';
import Points       from '../pages/buyer/Points';
import Profile      from '../pages/buyer/Profile';

const BuyerRoutes = () => (
    <>
  <Route element={<ProtectedRoute />}>
    <Route element={<RoleGuard role="buyer" />}>
      <Route element={<DashboardLayout />}>
        <Route path="/buyer/dashboard"              element={<Dashboard />} />
        <Route path="/buyer/catalog"                element={<Catalog />} />
        <Route path="/buyer/cart"                   element={<Cart />} />
        <Route path="/buyer/checkout"               element={<Checkout />} />
        <Route path="/buyer/orders"                 element={<Orders />} />
        <Route path="/buyer/orders/:id"             element={<OrderDetail />} />
        <Route path="/buyer/orders/:id/tracking"    element={<OrderTracking />} />
        <Route path="/buyer/points"                 element={<Points />} />
        <Route path="/buyer/profile"                element={<Profile />} />
      </Route>
    </Route>
  </Route>
  </>
);

export default BuyerRoutes;