import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, ShieldCheck, ShieldQuestion, Package,
  TrendingUp, Newspaper, CreditCard, ArrowDownLeft,
  AlertTriangle, Bell, ScrollText, LogOut, Menu, X,
  ChevronDown, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/logo.jpeg';

const MENU = [
  {
    section: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Tableau de bord', to: '/admin/dashboard' },
    ],
  },
  {
    section: 'Utilisateurs',
    items: [
      { icon: Users,          label: 'Tous les utilisateurs', to: '/admin/users'          },
      { icon: ShieldCheck,    label: 'Validations KYC',       to: '/admin/kyc'            },
      { icon: ShieldQuestion, label: 'Vérifications',          to: '/admin/verifications'  },
    ],
  },
  {
    section: 'Contenu',
    items: [
      { icon: Package,    label: 'Modérer produits',    to: '/admin/products'      },
      { icon: TrendingUp, label: 'Prix de référence',   to: '/admin/market-prices' },
      { icon: Newspaper,  label: 'Actualités',          to: '/admin/news'          },
    ],
  },
  {
    section: 'Finance',
    items: [
      { icon: ArrowDownLeft, label: 'Retraits vendeurs', to: '/admin/withdrawals'  },
      { icon: CreditCard,    label: 'Transactions',      to: '/admin/transactions' },
      { icon: AlertTriangle, label: 'Litiges',           to: '/admin/disputes'     },
    ],
  },
  {
    section: 'Système',
    items: [
      { icon: Bell,       label: 'Notifications',  to: '/admin/notifications' },
      { icon: ScrollText, label: 'Logs activité',  to: '/admin/logs'          },
    ],
  },
];

export default function AdminLayout({ children }) {
  const [open,   setOpen]   = useState(true);
  const [mobile, setMobile] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '1.2rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={logo} alt="logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
        <AnimatePresence mode="wait">
          {(open || mobile) && (
            <motion.div key="admin-logo-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ color: 'white', fontWeight: '900', fontSize: '1rem', lineHeight: 1.2 }}>
                Agro<span style={{ color: '#4ade80' }}>SaaNuu</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Administration
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!mobile && (
          <button
            onClick={() => setOpen(!open)}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
          >
            <Menu size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.8rem 0' }}>
        {MENU.map((group) => (
          <div key={group.section}>
            <AnimatePresence mode="wait">
              {(open || mobile) && (
                <motion.div
                  key={group.section + '-header'}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ padding: '0.5rem 1rem 0.3rem', fontSize: '0.65rem', fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  {group.section}
                </motion.div>
              )}
            </AnimatePresence>
            {group.items.map(({ icon: Icon, label, to }) => {
              const active = location.pathname === to || location.pathname.startsWith(to + '/');
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobile(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '0.65rem 1rem',
                    textDecoration: 'none',
                    color: active ? '#f0c040' : 'rgba(255,255,255,0.7)',
                    background: active ? 'rgba(240,192,64,0.12)' : 'transparent',
                    borderLeft: active ? '3px solid #f0c040' : '3px solid transparent',
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.88rem',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 1.8} style={{ flexShrink: 0 }} />
                  <AnimatePresence mode="wait">
                    {(open || mobile) && (
                      <motion.span key={to + '-label'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ whiteSpace: 'nowrap' }}>
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Déconnexion */}
      <button
        onClick={handleLogout}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'transparent', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#ef4444', cursor: 'pointer', width: '100%', textAlign: 'left' }}
      >
        <LogOut size={18} style={{ flexShrink: 0 }} />
        <AnimatePresence mode="wait">
          {(open || mobile) && (
            <motion.span key="admin-logout-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontSize: '0.88rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
              Déconnexion
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f4' }}>

      {/* Sidebar desktop */}
      <motion.aside
        animate={{ width: open ? '230px' : '62px' }}
        transition={{ duration: 0.25 }}
        style={{ background: 'linear-gradient(180deg, #0d1f14 0%, #1a3d24 100%)', height: '100vh', position: 'sticky', top: 0, flexShrink: 0, overflow: 'hidden', boxShadow: '4px 0 20px rgba(0,0,0,0.2)', zIndex: 100 }}
        className="d-none d-lg-block"
      >
        <SidebarContent />
      </motion.aside>

      {/* Sidebar mobile overlay */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            key="admin-mobile-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobile(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 199 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobile && (
          <motion.aside
            key="admin-mobile-sidebar"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ duration: 0.25 }}
            style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: '230px', background: 'linear-gradient(180deg, #0d1f14 0%, #1a3d24 100%)', zIndex: 200, overflow: 'hidden' }}
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <div style={{ background: 'white', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 99 }}>
          <button
            className="d-lg-none"
            onClick={() => setMobile(true)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}
          >
            <Menu size={22} color="#1a2e10" />
          </button>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#ef4444', background: '#fee2e2', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.05em' }}>
              ADMIN
            </span>
          </div>
          <Link to="/" style={{ fontSize: '0.82rem', color: '#1a5c2a', textDecoration: 'none', fontWeight: '600' }}>
            ← Site public
          </Link>
        </div>

        {/* Contenu page */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
