import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag,
  DollarSign, User, LogOut, Menu, X, Bell, ChevronDown,
  ShoppingCart, Heart, Truck, MapPin, Navigation, ShieldAlert,
  ClipboardList, Wallet, Star, Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/logo.jpeg';
import NotificationService from '../../services/notification.service';
import CartService from '../../services/cart.service';

const GREEN      = '#1a5c2a';
const DARK_GREEN = '#0d2b14';

const menuItemsByRole = {
  seller: [
    { icon: LayoutDashboard, label: 'Tableau de bord', to: '/seller/dashboard'        },
    { icon: ClipboardList,   label: 'Compléter profil',to: '/seller/completer-profil' },
    { icon: Package,         label: 'Mes produits',    to: '/seller/products'         },
    { icon: ShoppingBag,     label: 'Commandes',       to: '/seller/orders'           },
    { icon: DollarSign,      label: 'Gains',           to: '/seller/earnings'         },
    { icon: Wallet,          label: 'Portefeuille',    to: '/finance/wallet'          },
    { icon: User,            label: 'Profil',          to: '/seller/profile'          },
  ],
  buyer: [
    { icon: LayoutDashboard, label: 'Tableau de bord', to: '/buyer/dashboard'   },
    { icon: ShoppingCart,    label: 'Catalogue',       to: '/buyer/catalog'     },
    { icon: ShoppingBag,     label: 'Mes commandes',   to: '/buyer/orders'      },
    { icon: ShieldAlert,     label: 'Mes problèmes',   to: '/buyer/problemes'   },
    { icon: Heart,           label: 'Favoris',         to: '/buyer/favorites'   },
    { icon: Star,            label: 'Mes points',      to: '/buyer/points'      },
    { icon: User,            label: 'Profil',          to: '/buyer/profile'     },
  ],
  transporter: [
    { icon: LayoutDashboard, label: 'Tableau de bord', to: '/transporter/dashboard'           },
    { icon: ClipboardList,   label: 'Enreg. véhicule', to: '/transporter/enregistrer-vehicule' },
    { icon: Truck,           label: 'Mes véhicules',   to: '/transporter/vehicles'            },
    { icon: MapPin,          label: 'Disponibilité',   to: '/transporter/availability'        },
    { icon: Navigation,      label: 'Missions',        to: '/transporter/missions'            },
    { icon: Package,         label: 'Livraisons',      to: '/transporter/deliveries'          },
    { icon: User,            label: 'Profil',          to: '/transporter/profile'             },
  ],
};

const roleLabel = { SELLER: 'Vendeur', BUYER: 'Acheteur', TRANSPORTER: 'Transporteur' };

export default function DashboardLayout({ children, role = 'seller' }) {
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [nbNotifs,      setNbNotifs]      = useState(0);
  const [nbPanier,      setNbPanier]      = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    NotificationService.nonLues()
      .then(data => setNbNotifs(data.count ?? 0))
      .catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    if (role !== 'buyer') return;
    CartService.monPanier()
      .then(data => setNbPanier(data.nombre_articles ?? 0))
      .catch(() => {});
  }, [location.pathname, role]);

  const menuItems   = menuItemsByRole[role] || menuItemsByRole.seller;
  const nomAffiche  = user?.nom_complet || 'Utilisateur';
  const initiale    = nomAffiche.charAt(0).toUpperCase();
  const roleAffiche = roleLabel[user?.role] || 'Utilisateur';

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const SidebarContent = ({ mobile = false }) => (
    <>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1.2rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <img src={logo} alt="AgroSaaNuu" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
        <span style={{ color: 'white', fontWeight: '900', fontSize: '1.1rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', opacity: (sidebarOpen || mobile) ? 1 : 0, transition: 'opacity 0.2s' }}>
          Agro<span style={{ color: '#4ade80' }}>SaaNuu</span>
        </span>
        <button
          onClick={() => mobile ? setMobileSidebar(false) : setSidebarOpen(v => !v)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', marginLeft: 'auto', flexShrink: 0 }}
        >
          {mobile ? <X size={18} color="rgba(255,255,255,0.7)" /> : <Menu size={18} color="rgba(255,255,255,0.7)" />}
        </button>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {menuItems.map(item => {
          const Icon   = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => mobile && setMobileSidebar(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '0.75rem 1rem', textDecoration: 'none',
                fontWeight: active ? '700' : '500', fontSize: '0.9rem',
                whiteSpace: 'nowrap', overflow: 'hidden',
                background: active ? 'rgba(74,222,128,0.15)' : 'transparent',
                borderLeft: active ? '3px solid #4ade80' : '3px solid transparent',
                color: active ? '#4ade80' : 'rgba(255,255,255,0.75)',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} style={{ flexShrink: 0 }} />
              <span style={{ opacity: (sidebarOpen || mobile) ? 1 : 0, transition: 'opacity 0.2s', overflow: 'hidden' }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Déconnexion */}
      <button
        onClick={handleLogout}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'transparent', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', width: '100%' }}
      >
        <LogOut size={20} color="#ef4444" style={{ flexShrink: 0 }} />
        <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: '600', opacity: (sidebarOpen || mobile) ? 1 : 0, transition: 'opacity 0.2s' }}>
          Déconnexion
        </span>
      </button>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f4' }}>

      {/* ── SIDEBAR DESKTOP ── */}
      <aside
        style={{
          background: `linear-gradient(180deg, ${DARK_GREEN} 0%, ${GREEN} 100%)`,
          height: '100vh', position: 'sticky', top: 0,
          width: sidebarOpen ? '240px' : '70px',
          transition: 'width 0.3s ease',
          flexShrink: 0, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', boxShadow: '4px 0 20px rgba(0,0,0,0.15)', zIndex: 100,
        }}
        className="d-none d-lg-flex"
      >
        <SidebarContent />
      </aside>

      {/* ── SIDEBAR MOBILE (overlay + drawer) ── */}
      {mobileSidebar && (
        <div
          onClick={() => setMobileSidebar(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }}
        />
      )}
      <aside
        style={{
          background: `linear-gradient(180deg, ${DARK_GREEN} 0%, ${GREEN} 100%)`,
          height: '100vh', position: 'fixed', top: 0, left: 0,
          width: '240px', zIndex: 200,
          transform: mobileSidebar ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          display: 'flex', flexDirection: 'column',
          boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
        }}
        className="d-flex d-lg-none"
      >
        <SidebarContent mobile />
      </aside>

      {/* ── CONTENU PRINCIPAL ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <div style={{ background: 'white', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 99 }}>

          {/* Burger mobile */}
          <button
            className="d-lg-none"
            onClick={() => setMobileSidebar(true)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}
          >
            <Menu size={22} color="#1a2e10" />
          </button>

          <div style={{ flex: 1 }} />

          {/* Accueil */}
          <button
            onClick={() => navigate('/')}
            title="Retour à l'accueil"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '10px', padding: '7px 13px', cursor: 'pointer', color: GREEN, fontSize: '0.82rem', fontWeight: '700' }}
          >
            <Home size={15} />
            <span className="d-none d-md-inline">Accueil</span>
          </button>

          {/* Panier (buyer uniquement) */}
          {role === 'buyer' && (
            <button
              onClick={() => navigate('/buyer/cart')}
              title="Mon panier"
              style={{ position: 'relative', background: '#f4f6f4', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <ShoppingCart size={20} color={nbPanier > 0 ? GREEN : '#6b7280'} />
              {nbPanier > 0 && (
                <span style={{ position: 'absolute', top: '4px', right: '4px', background: GREEN, color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                  {nbPanier > 9 ? '9+' : nbPanier}
                </span>
              )}
            </button>
          )}

          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            style={{ position: 'relative', background: '#f4f6f4', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <Bell size={20} color={nbNotifs > 0 ? GREEN : '#6b7280'} />
            {nbNotifs > 0 && (
              <span style={{ position: 'absolute', top: '4px', right: '4px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                {nbNotifs > 9 ? '9+' : nbNotifs}
              </span>
            )}
          </button>

          {/* Profil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', background: '#f4f6f4', borderRadius: '12px', cursor: 'pointer' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${GREEN}, #4db86a)`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem', flexShrink: 0 }}>
              {initiale}
            </div>
            <div className="d-none d-md-flex flex-column">
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1a2e10' }}>{nomAffiche}</span>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{roleAffiche}</span>
            </div>
            <ChevronDown size={16} color="#6b7280" />
          </div>
        </div>

        {/* Contenu page */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {children}
        </div>

      </div>
    </div>
  );
}
