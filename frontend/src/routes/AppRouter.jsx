// ============================================================
// AgroConnect — Main Router (all routes in one file)
// src/routes/AppRouter.jsx
// ============================================================
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { LoyaltyProvider } from '../context/LoyaltyContext';
import { WalletProvider } from '../context/WalletContext';
import { CartProvider } from '../context/CartContext';
import Notification from '../Components/common/Notification';
import ProtectedRoute from '../Components/common/ProtectedRoute';

// Layouts
import PublicLayout  from '../Components/layout/PublicLayout';
import AuthLayout    from '../Components/layout/AuthLayout';

// Pages publiques
import Home          from '../pages/public/Home';
import Products      from '../pages/public/Products';
import ProductDetail from '../pages/public/ProductDetail';
import Transporters  from '../pages/public/Transporters';
import News          from '../pages/public/News';
import NewsDetail    from '../pages/public/NewsDetail';
import MarketPrices  from '../pages/public/MarketPrices';
import Help          from '../pages/public/Help';
import Contact       from '../pages/public/Contact';

// Auth
import Auth           from '../pages/auth/Auth';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Onboarding
import ProfilPersonnel from '../pages/onboarding/ProfilPersonnel';
import SetupActivite   from '../pages/onboarding/SetupActivite';

// Buyer
import BuyerDashboard     from '../pages/buyer/Dashboard';
import BuyerProfile       from '../pages/buyer/Profile';
import BuyerCatalog       from '../pages/buyer/Catalog';
import BuyerCart          from '../pages/buyer/Cart';
import BuyerCheckout      from '../pages/buyer/Checkout';
import BuyerOrders        from '../pages/buyer/Orders';
import BuyerOrderDetail   from '../pages/buyer/OrderDetail';
import BuyerOrderTracking from '../pages/buyer/OrderTracking';
import BuyerReceipt       from '../pages/buyer/Receipt';
import BuyerPoints        from '../pages/buyer/Points';
import MesLitiges         from '../pages/buyer/MesLitiges';
import BuyerFavorites     from '../pages/buyer/Favorites';

// Seller
import SellerDashboard   from '../pages/seller/Dashboard';
import SellerProfile     from '../pages/seller/Profile';
import SellerProducts    from '../pages/seller/Products';
import SellerAddProduct  from '../pages/seller/AddProduct';
import SellerEditProduct from '../pages/seller/EditProduct';
import SellerOrders      from '../pages/seller/Orders';
import SellerOrderDetail from '../pages/seller/OrderDetail';
import SellerEarnings    from '../pages/seller/Earnings';
import CompleterProfil   from '../pages/seller/CompleterProfil';

// Transporter
import TransporterDashboard  from '../pages/transporter/Dashboard';
import TransporterProfile    from '../pages/transporter/Profile';
import TransporterVehicles   from '../pages/transporter/Vehicles';
import TransporterAddVehicle from '../pages/transporter/AddVehicle';
import EnregistrerVehicule   from '../pages/transporter/EnregistrerVehicule';
import TransporterMissions   from '../pages/transporter/Missions';
import TransporterDeliveries from '../pages/transporter/Deliveries';
import TransporterAvailability from '../pages/transporter/Availability';

// Finance
import Wallet        from '../pages/finance/Wallet';
import Deposit       from '../pages/finance/Deposit';
import Withdraw      from '../pages/finance/Withdrawal';
import Transactions  from '../pages/finance/Transactions';
import PaymentStatus from '../pages/finance/PaymentStatus';

// Notifications (toutes les rôles)
import Notifications from '../pages/Notifications';

// Admin
import AdminDashboard      from '../pages/admin/Dashboard';
import AdminUsers          from '../pages/admin/Users';
import AdminKYC            from '../pages/admin/KYC';
import AdminVerifications  from '../pages/admin/Verifications';
import AdminProducts    from '../pages/admin/Products';
import AdminMarketPrices from '../pages/admin/MarketPrices';
import AdminWithdrawals from '../pages/admin/Withdrawals';
import AdminDisputes    from '../pages/admin/Disputes';
import AdminTransactions from '../pages/admin/Transactions';
import AdminNews        from '../pages/admin/News';
import AdminNotifications from '../pages/admin/Notifications';
import AdminLogs        from '../pages/admin/Logs';

// Erreurs
import NotFound    from '../pages/errors/NotFound';
import AccessDenied from '../pages/errors/AccessDenied';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <WalletProvider>
          <CartProvider>
          <LoyaltyProvider>
          <Notification />
          <Routes>

          {/* ===== PUBLIQUES ===== */}
          <Route element={<PublicLayout />}>
            <Route path="/"              element={<Home />}          />
            <Route path="/products"      element={<Products />}      />
            <Route path="/products/:id"  element={<ProductDetail />} />
            <Route path="/transporters"  element={<Transporters />}  />
            <Route path="/news"          element={<News />}          />
            <Route path="/news/:id"      element={<NewsDetail />}    />
            <Route path="/market-prices" element={<MarketPrices />}  />
            <Route path="/help"          element={<Help />}          />
            <Route path="/contact"       element={<Contact />}       />
          </Route>

          {/* ===== AUTH ===== */}
          <Route element={<AuthLayout />}>
            <Route path="/auth"                 element={<Auth />}           />
            <Route path="/auth/login"           element={<Auth />}           />
            <Route path="/auth/register"        element={<Auth />}           />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* ===== ONBOARDING ===== */}
          <Route path="/onboarding/profil"
            element={<ProtectedRoute><ProfilPersonnel /></ProtectedRoute>}
          />
          <Route path="/onboarding/activite"
            element={<ProtectedRoute roles={['SELLER','TRANSPORTER']}><SetupActivite /></ProtectedRoute>}
          />

          {/* ===== BUYER ===== */}
          <Route path="/buyer/dashboard"
            element={<ProtectedRoute roles={['BUYER']}><BuyerDashboard /></ProtectedRoute>}
          />
          <Route path="/buyer/profile"
            element={<ProtectedRoute roles={['BUYER']}><BuyerProfile /></ProtectedRoute>}
          />
          <Route path="/buyer/catalog"
            element={<ProtectedRoute roles={['BUYER']}><BuyerCatalog /></ProtectedRoute>}
          />
          <Route path="/buyer/cart"
            element={<ProtectedRoute roles={['BUYER']}><BuyerCart /></ProtectedRoute>}
          />
          <Route path="/buyer/checkout"
            element={<ProtectedRoute roles={['BUYER']}><BuyerCheckout /></ProtectedRoute>}
          />
          <Route path="/buyer/orders"
            element={<ProtectedRoute roles={['BUYER']}><BuyerOrders /></ProtectedRoute>}
          />
          <Route path="/buyer/orders/:id"
            element={<ProtectedRoute roles={['BUYER']}><BuyerOrderDetail /></ProtectedRoute>}
          />
          <Route path="/buyer/order-tracking/:id"
            element={<ProtectedRoute roles={['BUYER']}><BuyerOrderTracking /></ProtectedRoute>}
          />
          <Route path="/buyer/receipt/:id"
            element={<ProtectedRoute roles={['BUYER']}><BuyerReceipt /></ProtectedRoute>}
          />
          <Route path="/buyer/points"
            element={<ProtectedRoute roles={['BUYER']}><BuyerPoints /></ProtectedRoute>}
          />
          <Route path="/buyer/favorites"
            element={<ProtectedRoute roles={['BUYER']}><BuyerFavorites /></ProtectedRoute>}
          />
          <Route path="/buyer/problemes"
            element={<ProtectedRoute roles={['BUYER']}><MesLitiges /></ProtectedRoute>}
          />

          {/* ===== SELLER ===== */}
          <Route path="/seller/dashboard"
            element={<ProtectedRoute roles={['SELLER']}><SellerDashboard /></ProtectedRoute>}
          />
          <Route path="/seller/profile"
            element={<ProtectedRoute roles={['SELLER']}><SellerProfile /></ProtectedRoute>}
          />
          <Route path="/seller/products"
            element={<ProtectedRoute roles={['SELLER']}><SellerProducts /></ProtectedRoute>}
          />
          <Route path="/seller/add-product"
            element={<ProtectedRoute roles={['SELLER']}><SellerAddProduct /></ProtectedRoute>}
          />
          <Route path="/seller/edit-product/:id"
            element={<ProtectedRoute roles={['SELLER']}><SellerEditProduct /></ProtectedRoute>}
          />
          <Route path="/seller/orders"
            element={<ProtectedRoute roles={['SELLER']}><SellerOrders /></ProtectedRoute>}
          />
          <Route path="/seller/orders/:id"
            element={<ProtectedRoute roles={['SELLER']}><SellerOrderDetail /></ProtectedRoute>}
          />
          <Route path="/seller/earnings"
            element={<ProtectedRoute roles={['SELLER']}><SellerEarnings /></ProtectedRoute>}
          />
          <Route path="/seller/completer-profil"
            element={<ProtectedRoute roles={['SELLER']}><CompleterProfil /></ProtectedRoute>}
          />

          {/* ===== TRANSPORTER ===== */}
          <Route path="/transporter/dashboard"
            element={<ProtectedRoute roles={['TRANSPORTER']}><TransporterDashboard /></ProtectedRoute>}
          />
          <Route path="/transporter/profile"
            element={<ProtectedRoute roles={['TRANSPORTER']}><TransporterProfile /></ProtectedRoute>}
          />
          <Route path="/transporter/vehicles"
            element={<ProtectedRoute roles={['TRANSPORTER']}><TransporterVehicles /></ProtectedRoute>}
          />
          <Route path="/transporter/add-vehicle"
            element={<ProtectedRoute roles={['TRANSPORTER']}><TransporterAddVehicle /></ProtectedRoute>}
          />
          <Route path="/transporter/enregistrer-vehicule"
            element={<ProtectedRoute roles={['TRANSPORTER']}><EnregistrerVehicule /></ProtectedRoute>}
          />
          <Route path="/transporter/missions"
            element={<ProtectedRoute roles={['TRANSPORTER']}><TransporterMissions /></ProtectedRoute>}
          />
          <Route path="/transporter/deliveries"
            element={<ProtectedRoute roles={['TRANSPORTER']}><TransporterDeliveries /></ProtectedRoute>}
          />
          <Route path="/transporter/availability"
            element={<ProtectedRoute roles={['TRANSPORTER']}><TransporterAvailability /></ProtectedRoute>}
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
          <Route path="/finance/transactions"
            element={<ProtectedRoute><Transactions /></ProtectedRoute>}
          />
          <Route path="/finance/payment-status"
            element={<ProtectedRoute><PaymentStatus /></ProtectedRoute>}
          />

          {/* ===== NOTIFICATIONS — tous connectés ===== */}
          <Route path="/notifications"
            element={<ProtectedRoute><Notifications /></ProtectedRoute>}
          />

          {/* ===== ADMIN ===== */}
          <Route path="/admin/dashboard"    element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>}    />
          <Route path="/admin/users"        element={<ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>}        />
          <Route path="/admin/kyc"            element={<ProtectedRoute roles={['ADMIN']}><AdminKYC /></ProtectedRoute>}          />
          <Route path="/admin/verifications" element={<ProtectedRoute roles={['ADMIN']}><AdminVerifications /></ProtectedRoute>} />
          <Route path="/admin/products"     element={<ProtectedRoute roles={['ADMIN']}><AdminProducts /></ProtectedRoute>}     />
          <Route path="/admin/market-prices" element={<ProtectedRoute roles={['ADMIN']}><AdminMarketPrices /></ProtectedRoute>} />
          <Route path="/admin/withdrawals"  element={<ProtectedRoute roles={['ADMIN']}><AdminWithdrawals /></ProtectedRoute>}  />
          <Route path="/admin/disputes"     element={<ProtectedRoute roles={['ADMIN']}><AdminDisputes /></ProtectedRoute>}     />
          <Route path="/admin/transactions" element={<ProtectedRoute roles={['ADMIN']}><AdminTransactions /></ProtectedRoute>} />
          <Route path="/admin/news"         element={<ProtectedRoute roles={['ADMIN']}><AdminNews /></ProtectedRoute>}         />
          <Route path="/admin/notifications" element={<ProtectedRoute roles={['ADMIN']}><AdminNotifications /></ProtectedRoute>} />
          <Route path="/admin/logs"         element={<ProtectedRoute roles={['ADMIN']}><AdminLogs /></ProtectedRoute>}         />

          {/* ===== ERREURS ===== */}
          <Route path="/unauthorized" element={<AccessDenied />} />
          <Route path="*"             element={<NotFound />}     />

          </Routes>
          </LoyaltyProvider>
          </CartProvider>
          </WalletProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
