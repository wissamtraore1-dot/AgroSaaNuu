import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Search, Truck, Newspaper, TrendingUp,
  HelpCircle, Leaf, User, LogOut,
  LayoutDashboard, ChevronDown, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import logo from '../../assets/images/logo.jpeg';

const DASHBOARD = {
  BUYER:       '/buyer/dashboard',
  SELLER:      '/seller/dashboard',
  TRANSPORTER: '/transporter/dashboard',
  ADMIN:       '/admin/dashboard',
};

const NAV_LINKS = [
  { to: '/products',      icon: Leaf,       label: 'Produits'       },
  { to: '/transporters',  icon: Truck,       label: 'Transport'      },
  { to: '/news',          icon: Newspaper,   label: 'Actualités'     },
  { to: '/market-prices', icon: TrendingUp,  label: 'Prix du marché' },
  { to: '/help',          icon: HelpCircle,  label: 'Aide'           },
];

const CATEGORIES = ['Toutes catégories', 'Maïs', 'Riz', 'Mil', 'Sorgho', 'Soja', 'Arachides', 'Haricots'];

const SUGGESTIONS = [
  'Maïs 2 tonnes Cotonou',
  'Riz local Parakou',
  'Soja certifié',
  'Mil rouge Natitingou',
  'Transporteur disponible',
];

function getInitials(user) {
  return `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || '?';
}

// ── Barre de recherche ──────────────────────────────────────
function SearchBar({ onSearch }) {
  const location              = useLocation();
  const [searchParams]        = useSearchParams();
  const [query, setQuery]     = useState(location.pathname === '/products' ? (searchParams.get('search') || '') : '');
  const [categorie, setCat]   = useState('Toutes catégories');
  const [catOpen, setCatOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showSug, setShowSug] = useState(false);
  const inputRef = useRef(null);
  const wrapRef  = useRef(null);

  useEffect(() => {
    if (location.pathname === '/products') setQuery(searchParams.get('search') || '');
    else setQuery('');
  }, [location.pathname, searchParams]);

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setShowSug(false); setCatOpen(false); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filteredSug = SUGGESTIONS.filter(s => !query || s.toLowerCase().includes(query.toLowerCase()));

  const submit = (val) => {
    const q = (val ?? query).trim();
    setShowSug(false);
    onSearch(q, categorie !== 'Toutes catégories' ? categorie : '');
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1 }}>

      <div style={{
        display:      'flex',
        alignItems:   'center',
        background:   'white',
        borderRadius: '50px',
        boxShadow:    focused ? '0 0 0 3px rgba(26,92,42,0.18), 0 4px 20px rgba(0,0,0,0.10)' : '0 2px 12px rgba(0,0,0,0.10)',
        overflow:     'hidden',
        transition:   'box-shadow 0.2s',
        border:       `1.5px solid ${focused ? '#1a5c2a' : 'transparent'}`,
      }}>

        {/* Sélecteur de catégorie */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setCatOpen(!catOpen)}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '6px',
              background:   '#f4f6f4',
              border:       'none',
              borderRight:  '1px solid #e5e7eb',
              padding:      '0 16px',
              height:       '48px',
              cursor:       'pointer',
              fontSize:     '0.88rem',
              fontWeight:   '600',
              color:        '#374151',
              whiteSpace:   'nowrap',
              borderRadius: '50px 0 0 50px',
            }}
          >
            <span>{categorie === 'Toutes catégories' ? 'Toutes' : categorie}</span>
            <ChevronDown size={14} color="#9ca3af" style={{ transform: catOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>

          {catOpen && (
            <div style={{
              position:     'absolute',
              top:          'calc(100% + 8px)',
              left:         0,
              background:   'white',
              borderRadius: '14px',
              boxShadow:    '0 8px 30px rgba(0,0,0,0.14)',
              border:       '1px solid #e5e7eb',
              zIndex:       1000,
              minWidth:     '190px',
              overflow:     'hidden',
              padding:      '6px',
            }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setCat(c); setCatOpen(false); inputRef.current?.focus(); }}
                  style={{
                    display:      'block',
                    width:        '100%',
                    textAlign:    'left',
                    background:   c === categorie ? '#f0fdf4' : 'transparent',
                    color:        c === categorie ? '#1a5c2a' : '#374151',
                    fontWeight:   c === categorie ? '700' : '500',
                    border:       'none',
                    borderRadius: '10px',
                    padding:      '10px 14px',
                    cursor:       'pointer',
                    fontSize:     '0.90rem',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loupe */}
        <div style={{ padding: '0 10px 0 14px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Search size={18} color={focused ? '#1a5c2a' : '#9ca3af'} />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSug(true); }}
          onFocus={() => { setFocused(true); setShowSug(true); }}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Rechercher céréales, ville, vendeur..."
          style={{
            flex:       1,
            border:     'none',
            outline:    'none',
            fontSize:   '0.95rem',
            color:      '#1a2e10',
            background: 'transparent',
            padding:    '0 4px',
            height:     '48px',
          }}
        />

        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setShowSug(false); onSearch('', ''); inputRef.current?.focus(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 6px', display: 'flex', alignItems: 'center', color: '#9ca3af', flexShrink: 0 }}
          >
            <X size={16} />
          </button>
        )}

        {/* Bouton Chercher */}
        <button
          type="button"
          onClick={() => submit()}
          style={{
            flexShrink:    0,
            height:        '48px',
            padding:       '0 24px',
            background:    'linear-gradient(135deg, #1a5c2a 0%, #2d8c47 100%)',
            border:        'none',
            borderRadius:  '0 50px 50px 0',
            color:         'white',
            fontWeight:    '700',
            fontSize:      '0.94rem',
            cursor:        'pointer',
            display:       'flex',
            alignItems:    'center',
            gap:           '7px',
            letterSpacing: '0.02em',
            transition:    'filter 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
        >
          <Search size={16} />
          Chercher
        </button>
      </div>

      {/* Suggestions */}
      {showSug && focused && filteredSug.length > 0 && (
        <div style={{
          position:     'absolute',
          top:          'calc(100% + 8px)',
          left:         0,
          right:        0,
          background:   'white',
          borderRadius: '16px',
          boxShadow:    '0 8px 30px rgba(0,0,0,0.14)',
          border:       '1px solid #e5e7eb',
          zIndex:       1000,
          overflow:     'hidden',
          padding:      '6px',
        }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', padding: '7px 14px 5px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Recherches populaires
          </p>
          {filteredSug.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => { setQuery(s); submit(s); }}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '10px',
                width:        '100%',
                textAlign:    'left',
                background:   'transparent',
                border:       'none',
                borderRadius: '10px',
                padding:      '10px 14px',
                cursor:       'pointer',
                fontSize:     '0.90rem',
                color:        '#374151',
                fontWeight:   '500',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Search size={14} color="#9ca3af" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Composant principal ──────────────────────────────────────
export default function Navbar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (query, categorie) => {
    const params = new URLSearchParams();
    if (query)     params.set('search', query);
    if (categorie) params.set('categorie', categorie);
    navigate(params.toString() ? `/products?${params}` : '/products');
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  const dashboardLink = user ? (DASHBOARD[user.role] || '/') : '/auth/login';

  return (
    <header style={{ backgroundColor: '#d6d1c4', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      <div
        className="px-4 px-lg-5 py-3"
        style={{
          display:             'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gridTemplateRows:    'auto auto',
          columnGap:           '12px',
          rowGap:              '10px',
          alignItems:          'center',
        }}
      >

        {/* ── Col 1 ligne 1 : Logo ── */}
        <Link to="/" className="d-flex align-items-center text-decoration-none" style={{ gridColumn: 1, gridRow: 1 }}>
          <img src={logo} alt="logo" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '11px' }} />
          <span className="ms-2 d-none d-md-block text-nowrap" style={{ fontSize: '1.18rem', fontWeight: '800', color: '#1a2e10' }}>
            Agro<span style={{ color: '#1a5c2a' }}>SaaNuu</span>
          </span>
        </Link>

        {/* ── Col 2 ligne 1 : Barre de recherche ── */}
        <div style={{ gridColumn: 2, gridRow: 1 }}>
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* ── Col 3 ligne 1 : Zone utilisateur ── */}
        <div style={{ gridColumn: 3, gridRow: 1 }}>
          {isAuthenticated && user ? (
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button style={S.avatarBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <div style={S.avatar}>{getInitials(user)}</div>
                <div className="d-none d-lg-flex flex-column text-start" style={{ lineHeight: 1.3 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1a2e10' }}>{user.prenom || user.email?.split('@')[0]}</span>
                  <span style={{ fontSize: '0.76rem', color: '#6b7280' }}>{user.role}</span>
                </div>
                <ChevronDown size={14} color="#6b7280" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>

              {menuOpen && (
                <div style={S.dropdown}>
                  <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid #f0f0f0' }}>
                    <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: '#1a2e10' }}>{user.prenom} {user.nom}</p>
                    <p style={{ margin: 0, fontSize: '0.80rem', color: '#6b7280', marginTop: '2px' }}>{user.email}</p>
                  </div>
                  <div style={{ padding: '6px' }}>
                    <Link to={dashboardLink} style={S.dropItem} onClick={() => setMenuOpen(false)}>
                      <LayoutDashboard size={16} color="#1a5c2a" /> Mon espace
                    </Link>
                    <Link to="/auth/login" style={S.dropItem} onClick={() => setMenuOpen(false)}>
                      <User size={16} color="#374151" /> Mon profil
                    </Link>
                    <div style={S.dropDivider} />
                    <button style={{ ...S.dropItem, color: '#dc2626', border: 'none', background: 'none', width: '100%', textAlign: 'left' }} onClick={handleLogout}>
                      <LogOut size={16} color="#dc2626" /> Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/auth/login" style={S.btnLogin}>
                <User size={15} />
                <span className="d-none d-sm-inline">Connexion</span>
              </Link>
              <Link to="/auth/register" style={S.btnRegister} className="d-none d-lg-flex">
                S'inscrire
              </Link>
            </div>
          )}
        </div>

        {/* ── Col 1 ligne 2 : spacer invisible (même largeur que logo) ── */}
        <div style={{ gridColumn: 1, gridRow: 2 }} />

        {/* ── Col 2 ligne 2 : liens de navigation ── */}
        <nav
          style={{
            gridColumn:     2,
            gridRow:        2,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexWrap:       'wrap',
            gap:            '2rem',
          }}
        >
          {NAV_LINKS.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="d-flex align-items-center gap-1 text-decoration-none"
                style={{
                  fontSize:      '0.93rem',
                  fontWeight:    active ? '700' : '500',
                  color:         active ? '#1a5c2a' : '#374151',
                  borderBottom:  active ? '2px solid #1a5c2a' : '2px solid transparent',
                  paddingBottom: '3px',
                  transition:    'all 0.15s',
                }}
              >
                <Icon size={15} />
                <span>{label}</span>
              </Link>
            );
          })}
          {isAuthenticated && (
            <Link
              to={dashboardLink}
              className="d-flex align-items-center gap-1 text-decoration-none"
              style={{ fontSize: '0.93rem', fontWeight: '700', color: '#1a5c2a', background: '#f0fdf4', borderRadius: '20px', padding: '5px 14px' }}
            >
              <LayoutDashboard size={15} />
              <span>Tableau de bord</span>
            </Link>
          )}
        </nav>

        {/* ── Col 3 ligne 2 : spacer invisible (même largeur que user zone) ── */}
        <div style={{ gridColumn: 3, gridRow: 2 }} />

      </div>
    </header>
  );
}

const S = {
  avatarBtn:   { display: 'flex', alignItems: 'center', gap: '9px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '50px', padding: '6px 13px 6px 6px', cursor: 'pointer', transition: 'all 0.2s' },
  avatar:      { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a5c2a, #4db86a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.88rem', flexShrink: 0 },
  dropdown:    { position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.14)', border: '1px solid #e5e7eb', minWidth: '210px', zIndex: 999, overflow: 'hidden' },
  dropItem:    { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '0.92rem', fontWeight: '600', color: '#374151', textDecoration: 'none', cursor: 'pointer', transition: 'background 0.15s' },
  dropDivider: { height: '1px', background: '#f0f0f0', margin: '4px 0' },
  btnLogin:    { display: 'flex', alignItems: 'center', gap: '7px', background: 'white', border: '1px solid #d1d5db', borderRadius: '50px', padding: '8px 18px', textDecoration: 'none', fontWeight: '600', fontSize: '0.92rem', color: '#374151', whiteSpace: 'nowrap' },
  btnRegister: { alignItems: 'center', gap: '7px', background: 'linear-gradient(135deg, #1a5c2a, #2d8c47)', border: 'none', borderRadius: '50px', padding: '8px 20px', textDecoration: 'none', fontWeight: '700', fontSize: '0.92rem', color: 'white', whiteSpace: 'nowrap' },
};
