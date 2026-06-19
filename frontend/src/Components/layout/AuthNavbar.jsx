import { Link, useLocation } from 'react-router-dom';
import { Leaf, Truck, Newspaper, TrendingUp, LogIn, UserPlus } from 'lucide-react';
import logo from '../../assets/images/logo.jpeg';

const NAV_LINKS = [
  { to: '/',             label: 'Accueil'       },
  { to: '/products',     label: 'Céréales',  icon: Leaf      },
  { to: '/transporters', label: 'Transport',  icon: Truck     },
  { to: '/news',         label: 'Actualités', icon: Newspaper },
  { to: '/market-prices',label: 'Prix marché',icon: TrendingUp},
];

export default function AuthNavbar() {
  const { pathname } = useLocation();

  return (
    <header style={S.header}>
      <div className="container-fluid px-4 px-lg-5">
        <div style={S.inner}>

          {/* Logo + Nom */}
          <Link to="/" style={S.brand}>
            <img src={logo} alt="logo" style={S.logo} />
            <span style={S.brandName}>
              Agro<span style={{ color: '#f0c040' }}>SaaNuu</span>
            </span>
          </Link>

          {/* Liens de navigation */}
          <nav style={S.nav}>
            {NAV_LINKS.map(({ to, label }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    ...S.navLink,
                    color:         active ? '#f0c040' : 'rgba(255,255,255,0.88)',
                    borderBottom:  active ? '2px solid #f0c040' : '2px solid transparent',
                    fontWeight:    active ? '700' : '500',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Boutons auth */}
          <div style={S.actions}>
            <Link to="/auth/login" style={S.btnLogin}>
              <LogIn size={15} />
              Connexion
            </Link>
            <Link to="/auth/register" style={S.btnRegister}>
              <UserPlus size={15} />
              Inscription
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}

const S = {
  header: {
    background:   'linear-gradient(90deg, #0d2b14 0%, #1a5c2a 100%)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    boxShadow:    '0 2px 16px rgba(0,0,0,0.18)',
    position:     'sticky',
    top:          0,
    zIndex:       100,
  },
  inner: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    height:         '64px',
    gap:            '1.5rem',
  },
  brand: {
    display:        'flex',
    alignItems:     'center',
    gap:            '10px',
    textDecoration: 'none',
    flexShrink:     0,
  },
  logo: {
    width:        '38px',
    height:       '38px',
    objectFit:    'cover',
    borderRadius: '9px',
    border:       '2px solid rgba(240,192,64,0.5)',
  },
  brandName: {
    color:      'white',
    fontWeight: '800',
    fontSize:   '1.1rem',
    letterSpacing: '-0.01em',
  },
  nav: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.2rem',
    flex:       1,
    justifyContent: 'center',
    flexWrap:   'wrap',
  },
  navLink: {
    textDecoration: 'none',
    fontSize:       '0.87rem',
    padding:        '4px 12px',
    paddingBottom:  '2px',
    transition:     'color 0.15s',
    whiteSpace:     'nowrap',
  },
  actions: {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.6rem',
    flexShrink: 0,
  },
  btnLogin: {
    display:        'flex',
    alignItems:     'center',
    gap:            '6px',
    background:     'rgba(255,255,255,0.12)',
    border:         '1.5px solid rgba(255,255,255,0.35)',
    borderRadius:   '50px',
    padding:        '6px 16px',
    textDecoration: 'none',
    fontWeight:     '600',
    fontSize:       '0.84rem',
    color:          'white',
    whiteSpace:     'nowrap',
    transition:     'background 0.15s',
  },
  btnRegister: {
    display:        'flex',
    alignItems:     'center',
    gap:            '6px',
    background:     '#f0c040',
    border:         '1.5px solid #f0c040',
    borderRadius:   '50px',
    padding:        '6px 16px',
    textDecoration: 'none',
    fontWeight:     '700',
    fontSize:       '0.84rem',
    color:          '#1a2e10',
    whiteSpace:     'nowrap',
    transition:     'filter 0.15s',
  },
};
