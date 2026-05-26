// ============================================================
// AgroConnect — Main Router (all routes in one file)
// src/routes/AppRouter.jsx
// ============================================================
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Layouts
import PublicLayout  from '../Components/layout/PublicLayout';
import AuthLayout    from '../Components/layout/AuthLayout';

// Pages publiques
import Home          from '../pages/public/Home';
import Products      from '../pages/public/Products';
import Transporters  from '../pages/public/Transporters';
import News          from '../pages/public/News';
import MarketPrices  from '../pages/public/MarketPrices';
import Help          from '../pages/public/Help';
import Contact       from '../pages/public/Contact';

// Auth
import Login         from '../pages/auth/Login';
import Register      from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import SMSAuth       from '../pages/auth/SMSAuth';  // NOUVEAU

// Buyer
import BuyerDashboard   from '../pages/buyer/Dashboard';
import BuyerProfile     from '../pages/buyer/Profile';
import BuyerCheckout    from '../pages/buyer/Checkout';
import BuyerOrderTracking from '../pages/buyer/OrderTracking';

// Seller
import SellerDashboard  from '../pages/seller/Dashboard';
import SellerProfile    from '../pages/seller/Profile';

// Transporter
import TransporterDashboard from '../pages/transporter/Dashboard';
import TransporterProfile   from '../pages/transporter/Profile';

// Finance
import Wallet        from '../pages/finance/Wallet';
import Deposit       from '../pages/finance/Deposit';
import Withdraw      from '../pages/finance/Withdrawal';

// Erreurs
import NotFound      from '../pages/errors/NotFound';
import AccessDenied  from '../pages/errors/AccessDenied';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ===== PUBLIQUES ===== */}
          <Route element={<PublicLayout />}>
            <Route path="/"              element={<Home />}         />
            <Route path="/products"      element={<Products />}     />
            <Route path="/transporters"  element={<Transporters />} />
            <Route path="/news"          element={<News />}         />
            <Route path="/market-prices" element={<MarketPrices />} />
            <Route path="/help"          element={<Help />}         />
            <Route path="/contact"       element={<Contact />}      />
          </Route>

          {/* ===== AUTH ===== */}
          <Route element={<AuthLayout />}>
            <Route path="/auth/login"           element={<Login />}          />
            <Route path="/auth/register"        element={<Register />}       />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/sms"             element={<SMSAuth />}        />  {/* NOUVEAU */}
          </Route>

          {/* ===== BUYER — protégé ===== */}
          <Route path="/buyer/dashboard"
            element={<ProtectedRoute roles={['BUYER']}><BuyerDashboard /></ProtectedRoute>}
          />
          <Route path="/buyer/profile"
            element={<ProtectedRoute roles={['BUYER']}><BuyerProfile /></ProtectedRoute>}
          />
          <Route path="/buyer/checkout"
            element={<ProtectedRoute roles={['BUYER']}><BuyerCheckout /></ProtectedRoute>}
          />
          <Route path="/buyer/order-tracking"
            element={<ProtectedRoute roles={['BUYER']}><BuyerOrderTracking /></ProtectedRoute>}
          />

          {/* ===== SELLER — protégé ===== */}
          <Route path="/seller/dashboard"
            element={<ProtectedRoute roles={['SELLER']}><SellerDashboard /></ProtectedRoute>}
          />
          <Route path="/seller/profile"
            element={<ProtectedRoute roles={['SELLER']}><SellerProfile /></ProtectedRoute>}
          />

          {/* ===== TRANSPORTER — protégé ===== */}
          <Route path="/transporter/dashboard"
            element={<ProtectedRoute roles={['TRANSPORTER']}><TransporterDashboard /></ProtectedRoute>}
          />
          <Route path="/transporter/profile"
            element={<ProtectedRoute roles={['TRANSPORTER']}><TransporterProfile /></ProtectedRoute>}
          />

          {/* ===== FINANCE — tous connectés ===== */}
          <Route path="/finance/wallet"
            element={<ProtectedRoute><Wallet /></ProtectedRoute>}
          />
          <Route path="/finance/deposit"
            element={<ProtectedRoute><Deposit /></ProtectedRoute>}
          />
          <Route path="/finance/withdraw"
            element={<ProtectedRoute><Withdraw /></ProtectedRoute>}
          />

          {/* ===== ERREURS ===== */}
          <Route path="/unauthorized" element={<AccessDenied />} />
          <Route path="*"             element={<NotFound />}     />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
