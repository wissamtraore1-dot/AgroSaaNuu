import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Search, Truck, Newspaper, TrendingUp,
  HelpCircle, Leaf, User, LogOut,
  LayoutDashboard, ChevronDown, X, Mic, SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import logo from '../../assets/images/logo.jpeg';

const DASHBOARD = {
  BUYER:       '/buyer/dashboard',
  SELLER:      '/seller/dashboard',
  TRANSPORTER: '/transporter/dashboard',
  ADMIN:       '/admin/',
};

const NAV_LINKS = [
  { to: '/products',      icon: Leaf,       label: 'Céréales'       },
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

// ── Barre de recherche moderne ──────────────────────────────
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

  // Sync avec l'URL
  useEffect(() => {
    if (location.pathname === '/products') setQuery(searchParams.get('search') || '');
    else setQuery('');
  }, [location.pathname, searchParams]);

  // Ferme suggestions au clic extérieur
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
    <div ref={wrapRef} style={{ position: 'relative', flex: 1, maxWidth: '640px' }}>

      {/* Conteneur principal */}
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
              display:    'flex',
              alignItems: 'center',
              gap:        '5px',
              background: '#f4f6f4',
              border:     'none',
              borderRight:'1px solid #e5e7eb',
              padding:    '0 14px',
              height:     '46px',
              cursor:     'pointer',
              fontSize:   '0.80rem',
              fontWeight: '600',
              color:      '#374151',
              whiteSpace: 'nowrap',
              borderRadius:'50px 0 0 50px',
            }}
          >
            {categorie === 'Toutes catégories' ? 'Toutes' : categorie}
            <ChevronDown size={13} color="#9ca3af" style={{ transform: catOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>

          {catOpen && (
            <div style={{
              position:  'absolute',
              top:       'calc(100% + 8px)',
              left:      0,
              background:'white',
              borderRadius:'14px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
              border:    '1px solid #e5e7eb',
              zIndex:    1000,
              minWidth:  '180px',
              overflow:  'hidden',
              padding:   '6px',
            }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setCat(c); setCatOpen(false); inputRef.current?.focus(); }}
                  style={{
                    display:     'block',
                    width:       '100%',
                    textAlign:   'left',
                    background:  c === categorie ? '#f0fdf4' : 'transparent',
                    color:       c === categorie ? '#1a5c2a' : '#374151',
                    fontWeight:  c === categorie ? '700' : '500',
                    border:      'none',
                    borderRadius:'10px',
                    padding:     '9px 12px',
                    cursor:      'pointer',
                    fontSize:    '0.85rem',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Icône loupe */}
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
            fontSize:   '0.92rem',
            color:      '#1a2e10',
            background: 'transparent',
            padding:    '0 4px',
            height:     '46px',
          }}
        />

        {/* Effacer */}
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
            flexShrink:  0,
            height:      '46px',
            padding:     '0 22px',
            background:  'linear-gradient(135deg, #1a5c2a 0%, #2d8c47 100%)',
            border:      'none',
            borderRadius:'0 50px 50px 0',
            color:       'white',
            fontWeight:  '700',
            fontSize:    '0.88rem',
            cursor:      'pointer',
            display:     'flex',
            alignItems:  'center',
            gap:         '6px',
            letterSpacing:'0.02em',
            transition:  'filter 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
        >
          <Search size={15} />
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
          <p style={{ fontSize: '0.72rem', fontWeight: '700', color: '#9ca3af', padding: '6px 12px 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Recherches populaires
          </p>
          {filteredSug.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => { setQuery(s); submit(s); }}
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         '10px',
                width:       '100%',
                textAlign:   'left',
                background:  'transparent',
                border:      'none',
                borderRadius:'10px',
                padding:     '9px 12px',
                cursor:      'pointer',
                fontSize:    '0.87rem',
                color:       '#374151',
                fontWeight:  '500',
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
  const navigate              = useNavigate();
  const location              = useLocation();
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
      <div className="container py-3">

        {/* ── TOP ROW ── */}
        <div className="d-flex align-items-center gap-3">

          {/* Logo */}
          <Link to="/" className="d-flex align-items-center text-decoration-none flex-shrink-0">
            <img src={logo} alt="logo" style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '10px' }} />
            <h4 className="ms-2 mb-0 fw-bold d-none d-md-block text-nowrap" style={{ fontSize: '1.1rem' }}>
              Agro<span style={{ color: '#1a5c2a' }}>SaaNuu</span>
            </h4>
          </Link>

          {/* Barre de recherche moderne */}
          <SearchBar onSearch={handleSearch} />

          {/* Zone utilisateur */}
          {isAuthenticated && user ? (
            <div style={{ position: 'relative', flexShrink: 0 }} ref={menuRef}>
              <button style={S.avatarBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <div style={S.avatar}>{getInitials(user)}</div>
                <div className="d-none d-lg-flex flex-column text-start" style={{ lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1a2e10' }}>{user.prenom || user.email?.split('@')[0]}</span>
                  <span style={{ fontSize: '0.70rem', color: '#6b7280' }}>{user.role}</span>
                </div>
                <ChevronDown size={14} color="#6b7280" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>

              {menuOpen && (
                <div style={S.dropdown}>
                  <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #f0f0f0' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: '#1a2e10' }}>{user.prenom} {user.nom}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>{user.email}</p>
                  </div>
                  <div style={{ padding: '6px' }}>
                    <Link to={dashboardLink} style={S.dropItem} onClick={() => setMenuOpen(false)}>
                      <LayoutDashboard size={15} color="#1a5c2a" /> Mon espace
                    </Link>
                    <Link to="/auth/login" style={S.dropItem} onClick={() => setMenuOpen(false)}>
                      <User size={15} color="#374151" /> Mon profil
                    </Link>
                    <div style={S.dropDivider} />
                    <button style={{ ...S.dropItem, color: '#dc2626', border: 'none', background: 'none', width: '100%', textAlign: 'left' }} onClick={handleLogout}>
                      <LogOut size={15} color="#dc2626" /> Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex gap-2 flex-shrink-0">
              <Link to="/auth/login" style={S.btnLogin}>
                <User size={15} />
                <span className="d-none d-sm-inline">Connexion</span>
              </Link>
              <Link to="/auth/register" style={S.btnRegister} className="d-none d-lg-flex">
                S'inscrire
              </Link>
            </div>
          )}

          {/* Switcher FR / EN */}
          <LanguageSwitcher />
        </div>

        {/* ── NAV LINKS ── */}
        <nav className="d-flex align-items-center justify-content-center mt-3 gap-4 flex-wrap">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="d-flex align-items-center gap-1 text-decoration-none"
                style={{
                  fontSize:      '0.87rem',
                  fontWeight:    active ? '700' : '500',
                  color:         active ? '#1a5c2a' : '#374151',
                  borderBottom:  active ? '2px solid #1a5c2a' : '2px solid transparent',
                  paddingBottom: '2px',
                  transition:    'all 0.15s',
                }}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
          {isAuthenticated && (
            <Link
              to={dashboardLink}
              className="d-flex align-items-center gap-1 text-decoration-none"
              style={{ fontSize: '0.87rem', fontWeight: '700', color: '#1a5c2a', background: '#f0fdf4', borderRadius: '20px', padding: '3px 12px' }}
            >
              <LayoutDashboard size={14} />
              Tableau de bord
            </Link>
          )}
        </nav>

      </div>
    </header>
  );
}

const S = {
  avatarBtn:   { display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '50px', padding: '5px 12px 5px 5px', cursor: 'pointer', transition: 'all 0.2s' },
  avatar:      { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a5c2a, #4db86a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.82rem', flexShrink: 0 },
  dropdown:    { position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.14)', border: '1px solid #e5e7eb', minWidth: '200px', zIndex: 999, overflow: 'hidden' },
  dropItem:    { display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.87rem', fontWeight: '600', color: '#374151', textDecoration: 'none', cursor: 'pointer', transition: 'background 0.15s' },
  dropDivider: { height: '1px', background: '#f0f0f0', margin: '4px 0' },
  btnLogin:    { display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #d1d5db', borderRadius: '50px', padding: '7px 16px', textDecoration: 'none', fontWeight: '600', fontSize: '0.84rem', color: '#374151', whiteSpace: 'nowrap' },
  btnRegister: { alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #1a5c2a, #2d8c47)', border: 'none', borderRadius: '50px', padding: '7px 18px', textDecoration: 'none', fontWeight: '700', fontSize: '0.84rem', color: 'white', whiteSpace: 'nowrap' },
};
