// ============================================================
// AgroConnect — Finance Routes
// src/routes/FinanceRoutes.jsx
// ============================================================
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../Components/common/ProtectedRoute';
import DashboardLayout from '../Components/layout/DashboardLayout';

import Wallet        from '../pages/finance/Wallet';
import Transactions  from '../pages/finance/Transactions';
import Deposit       from '../pages/finance/Deposit';
import Withdrawal    from '../pages/finance/Withdrawal';
import PaymentStatus from '../pages/finance/PaymentStatus';

const FinanceRoutes = () => (
    <>
  <Route element={<ProtectedRoute />}>
    <Route element={<DashboardLayout />}>
      <Route path="/finance/wallet"          element={<Wallet />} />
      <Route path="/finance/transactions"    element={<Transactions />} />
      <Route path="/finance/deposit"         element={<Deposit />} />
      <Route path="/finance/withdrawal"      element={<Withdrawal />} />
      <Route path="/finance/payment-status"  element={<PaymentStatus />} />
    </Route>
  </Route>
  </>
);

export default FinanceRoutes;