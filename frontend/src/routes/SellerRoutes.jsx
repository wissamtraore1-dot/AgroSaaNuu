// ============================================================
// AgroSaaNuu — Seller Routes
// src/routes/SellerRoutes.jsx
// ============================================================
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute  from '../Components/common/ProtectedRoute';
import RoleGuard       from '../Components/common/RoleGuard';
import DashboardLayout from '../Components/layout/DashboardLayout';

import Dashboard   from '../pages/seller/Dashboard';
import Products    from '../pages/seller/Products';
import AddProduct  from '../pages/seller/AddProduct';
import EditProduct from '../pages/seller/EditProduct';
import Orders      from '../pages/seller/Orders';
import OrderDetail from '../pages/seller/OrderDetail';
import Earnings    from '../pages/seller/Earnings';
import Profile     from '../pages/seller/Profile';
import Wallet      from '../pages/seller/Wallet';

const SellerRoutes = () => (
    <>
  <Route element={<ProtectedRoute />}>
    <Route element={<RoleGuard role="seller" />}>
      <Route element={<DashboardLayout />}>
        <Route path="/seller/dashboard"              element={<Dashboard />} />
        <Route path="/seller/products"               element={<Products />} />
        <Route path="/seller/products/add"           element={<AddProduct />} />
        <Route path="/seller/products/:id/edit"      element={<EditProduct />} />
        <Route path="/seller/orders"                 element={<Orders />} />
        <Route path="/seller/orders/:id"             element={<OrderDetail />} />
        <Route path="/seller/earnings"               element={<Earnings />} />
        <Route path="/seller/profile"                element={<Profile />} />
        <Route path="/seller/wallet"                 element={<Wallet />} />
      </Route>
    </Route>
  </Route>
  </>
);

export default SellerRoutes;