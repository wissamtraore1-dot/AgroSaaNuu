import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wheat, LayoutDashboard, Package, ShoppingBag,
  DollarSign, User, LogOut, Menu, X, Bell, ChevronDown,
  ShoppingCart, Heart, Truck, MapPin, Navigation
} from 'lucide-react';

// ===== MENUS PAR RÔLE =====
const menuItemsByRole = {
  seller: [
    { icon: LayoutDashboard, label: 'Tableau de bord', to: '/seller/dashboard'  },
    { icon: Package,         label: 'Mes produits',    to: '/seller/products'   },
    { icon: ShoppingBag,     label: 'Commandes',       to: '/seller/orders'     },
    { icon: DollarSign,      label: 'Gains',           to: '/seller/earnings'   },
    { icon: User,            label: 'Profil',          to: '/seller/profile'    },
  ],
  buyer: [
    { icon: LayoutDashboard, label: 'Tableau de bord', to: '/buyer/dashboard'   },
    { icon: ShoppingCart,    label: 'Catalogue',       to: '/buyer/catalog'     },
    { icon: ShoppingBag,     label: 'Mes commandes',   to: '/buyer/orders'      },
    { icon: Heart,           label: 'Favoris',         to: '/buyer/favorites'   },
    { icon: User,            label: 'Profil',          to: '/buyer/profile'     },
  ],
  transporter: [
    { icon: LayoutDashboard, label: 'Tableau de bord', to: '/transporter/dashboard'    },
    { icon: Truck,           label: 'Mes véhicules',   to: '/transporter/vehicles'     },
    { icon: MapPin,          label: 'Disponibilité',   to: '/transporter/availability' },
    { icon: Navigation,      label: 'Missions',        to: '/transporter/jobs'         },
    { icon: Package,         label: 'Livraisons',      to: '/transporter/deliveries'   },
    { icon: User,            label: 'Profil',          to: '/transporter/profile'      },
  ],
};

// ===== PROFILS PAR RÔLE =====
const profileByRole = {
  seller:      { nom: 'Moussa K.', role: 'Vendeur',      initiale: 'M', gradient: 'linear-gradient(135deg, #1a5c2a, #4db86a)' },
  buyer:       { nom: 'Kofi A.',   role: 'Acheteur',     initiale: 'K', gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)' },
  transporter: { nom: 'Sèna B.',   role: 'Transporteur', initiale: 'S', gradient: 'linear-gradient(135deg, #d97706, #fbbf24)' },
};

export default function DashboardLayout({ children, role = 'seller' }) {
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ MENU ET PROFIL SELON LE RÔLE
  const menuItems = menuItemsByRole[role] || menuItemsByRole.seller;
  const profile   = profileByRole[role]   || profileByRole.seller;

  const handleLogout = () => navigate('/auth/login');

  return (
    <div style={styles.wrapper}>

      {/* ===== SIDEBAR DESKTOP ===== */}
      <motion.aside
        style={styles.sidebar}
        animate={{ width: sidebarOpen ? '240px' : '70px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="d-none d-lg-flex flex-column"
      >
        {/* LOGO */}
        <div style={styles.sidebarLogo}>
          <div style={styles.logoIcon}>
            <Wheat size={20} color="#1a5c2a" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                style={styles.logoText}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                Agri<span style={{ color: '#f0c040' }}>Connect</span>
              </motion.span>
            )}
          </AnimatePresence>
          <button
            style={styles.toggleBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={18} color="rgba(255,255,255,0.7)" />
          </button>
        </div>

        {/* MENU DESKTOP */}
        <nav style={styles.sidebarNav}>
          {menuItems.map((item) => {
            const Icon   = item.icon;
            const active = location.pathname === item.to;
            return (
              <motion.div key={item.to} whileHover={{ x: 4 }}>
                <Link
                  to={item.to}
                  style={{
                    ...styles.menuItem,
                    background: active ? 'rgba(240,192,64,0.15)' : 'transparent',
                    borderLeft: active ? '3px solid #f0c040'     : '3px solid transparent',
                    color:      active ? '#f0c040'               : 'rgba(255,255,255,0.75)',
                  }}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        style={styles.menuLabel}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* DÉCONNEXION DESKTOP */}
        <motion.button
          style={styles.logoutBtn}
          onClick={handleLogout}
          whileHover={{ background: 'rgba(239,68,68,0.15)' }}
        >
          <LogOut size={20} color="#ef4444" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: '600' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Déconnexion
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

      </motion.aside>

      {/* ===== SIDEBAR MOBILE ===== */}
      <AnimatePresence>
        {mobileSidebar && (
          <>
            <motion.div
              style={styles.mobileOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebar(false)}
            />
            <motion.aside
              style={{
                ...styles.sidebar,
                width: '240px',
                position: 'fixed',
                zIndex: 200,
              }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3 }}
              className="d-flex flex-column"
            >
              {/* LOGO MOBILE */}
              <div style={styles.sidebarLogo}>
                <div style={styles.logoIcon}>
                  <Wheat size={20} color="#1a5c2a" />
                </div>
                <span style={styles.logoText}>
                  Agri<span style={{ color: '#f0c040' }}>Connect</span>
                </span>
                <button
                  style={styles.toggleBtn}
                  onClick={() => setMobileSidebar(false)}
                >
                  <X size={18} color="rgba(255,255,255,0.7)" />
                </button>
              </div>

              {/* MENU MOBILE */}
              <nav style={styles.sidebarNav}>
                {menuItems.map((item) => {
                  const Icon   = item.icon;
                  const active = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      style={{
                        ...styles.menuItem,
                        background: active ? 'rgba(240,192,64,0.15)' : 'transparent',
                        borderLeft: active ? '3px solid #f0c040'     : '3px solid transparent',
                        color:      active ? '#f0c040'               : 'rgba(255,255,255,0.75)',
                      }}
                      onClick={() => setMobileSidebar(false)}
                    >
                      <Icon size={20} />
                      <span style={styles.menuLabel}>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* DÉCONNEXION MOBILE */}
              <motion.button
                style={styles.logoutBtn}
                onClick={handleLogout}
                whileHover={{ background: 'rgba(239,68,68,0.15)' }}
              >
                <LogOut size={20} color="#ef4444" />
                <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: '600' }}>
                  Déconnexion
                </span>
              </motion.button>

            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <div style={styles.main}>

        {/* TOPBAR */}
        <div style={styles.topbar}>
          <button
            style={styles.burgerBtn}
            className="d-lg-none"
            onClick={() => setMobileSidebar(true)}
          >
            <Menu size={22} color="#1a2e10" />
          </button>

          <div style={{ flex: 1 }} />

          {/* NOTIFICATIONS */}
          <motion.button
            style={styles.iconBtn}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell size={20} color="#6b7280" />
            <span style={styles.notifBadge}>3</span>
          </motion.button>

          {/* PROFIL — change selon le rôle */}
          <div style={styles.profileBtn}>
            <div style={{
              ...styles.avatarCircle,
              background: profile.gradient,
            }}>
              {profile.initiale}
            </div>
            <div className="d-none d-md-flex flex-column">
              <span style={styles.profileName}>{profile.nom}</span>
              <span style={styles.profileRole}>{profile.role}</span>
            </div>
            <ChevronDown size={16} color="#6b7280" />
          </div>

        </div>

        {/* PAGE CONTENT */}
        <motion.div
          style={styles.content}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>

      </div>
    </div>
  );
}

// ===== STYLES =====
const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f4f6f4',
  },
  sidebar: {
    background: 'linear-gradient(180deg, #0d2b14 0%, #1a5c2a 100%)',
    height: '100vh',
    position: 'sticky',
    top: 0,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
    zIndex: 100,
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '1.2rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logoIcon: {
    background: '#f0c040',
    borderRadius: '8px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    color: 'white',
    fontWeight: '900',
    fontSize: '1.1rem',
    flex: 1,
    whiteSpace: 'nowrap',
  },
  toggleBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    marginLeft: 'auto',
    flexShrink: 0,
  },
  sidebarNav: {
    flex: 1,
    padding: '1rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflowY: 'auto',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0.75rem 1rem',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  menuLabel: {
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '1rem',
    background: 'transparent',
    border: 'none',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    transition: 'background 0.2s',
    whiteSpace: 'nowrap',
  },
  mobileOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 199,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topbar: {
    background: 'white',
    padding: '0.85rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 99,
  },
  burgerBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
  },
  iconBtn: {
    background: '#f4f6f4',
    border: 'none',
    borderRadius: '10px',
    padding: '8px',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    background: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 12px',
    background: '#f4f6f4',
    borderRadius: '12px',
    cursor: 'pointer',
  },
  avatarCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.9rem',
    flexShrink: 0,
  },
  profileName: { fontSize: '0.88rem', fontWeight: '700', color: '#1a2e10' },
  profileRole: { fontSize: '0.75rem', color: '#6b7280' },
  content: {
    flex: 1,
    padding: '1.5rem',
    overflowY: 'auto',
  },
};