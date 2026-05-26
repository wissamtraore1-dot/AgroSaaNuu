import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../../Components/layout/Footer';
import { useAuth } from '../../context/AuthContext';

import { 
  Wheat, Eye, EyeOff, AlertCircle, Loader, ArrowLeft
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, isBuyer, isSeller, isTransporter } = useAuth();
  const location = useLocation();
  const [form, setForm]       = useState({ identifiant: '', password: '', remember: true });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifiant || !form.password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const data = await login(form.identifiant, form.password);
      const role = data.user?.role;
      const from = location.state?.from?.pathname;

      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'BUYER' || isBuyer) {
        navigate('/buyer/dashboard', { replace: true });
      } else if (role === 'SELLER' || isSeller) {
        navigate('/seller/dashboard', { replace: true });
      } else if (role === 'TRANSPORTER' || isTransporter) {
        navigate('/transporter/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <>
      <div style={styles.page}>

      {/* FOND NEUTRE */}
      <div style={styles.bgScene} />

      {/* CARTE LOGIN */}
      <div style={styles.cardWrap}>
        <motion.div
          style={styles.card}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >

          {/* BOUTON RETOUR */}
          <motion.button
            style={styles.backBtn}
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.1, background: '#f3f4f6' }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} color="#6b7280" />
          </motion.button>

          {/* LOGO */}
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}>
              <Wheat size={26} color="#1a5c2a" />
            </div>
            <span style={styles.logoText}>
              Agro<span style={{ color: '#f0c040' }}>SaaNuu</span>
            </span>
          </div>

          {/* TITRE */}
          <h2 style={styles.title}>Bon retour 👋</h2>
          <p style={styles.subtitle}>Connectez-vous à votre compte AgroSaaNuu</p>

          {/* ERREUR */}
          <AnimatePresence>
            {error && (
              <motion.div
                style={styles.errorBox}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <AlertCircle size={15} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FORMULAIRE */}
          <form onSubmit={handleSubmit} style={styles.form}>

            {/* IDENTIFIANT */}
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Identifiant</label>
              <input
                type="text"
                name="identifiant"
                value={form.identifiant}
                onChange={handleChange}
                placeholder="Email ou numéro de téléphone"
                style={styles.input}
              />
            </div>

            {/* MOT DE PASSE */}
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Mot de passe</label>
              <div style={styles.inputWrap}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Saisir le mot de passe"
                  style={{ ...styles.input, paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={styles.eyeBtn}
                >
                  {showPwd
                    ? <EyeOff size={18} color="#9ca3af" />
                    : <Eye    size={18} color="#9ca3af" />
                  }
                </button>
              </div>
            </div>

            {/* SE SOUVENIR + MOT DE PASSE OUBLIÉ */}
            <div style={styles.rememberRow}>
              <label style={styles.rememberLabel}>
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                Se souvenir de moi
              </label>
              <Link to="/auth/forgot-password" style={styles.forgotLink}>
                Mot de passe oublié ?
              </Link>
            </div>

            {/* BOUTON SE CONNECTER */}
            <motion.button
              type="submit"
              style={{ ...styles.submitBtn, opacity: submitting ? 0.85 : 1 }}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              disabled={submitting}
            >
              {submitting ?  (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader size={20} />
                </motion.div>
              ) : (
                'Se connecter'
              )}
            </motion.button>

          </form>

          {/* SÉPARATEUR */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
          </div>

          {/* BOUTON GOOGLE */}
          <motion.button
            style={styles.googleBtn}
            whileHover={{ scale: 1.02, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Logo Google SVG */}
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Ou se connecter avec Google
          </motion.button>

          {/* INSCRIPTION */}
          <p style={styles.registerText}>
            Vous n'avez pas de compte ?{' '}
            <Link to="/auth/register" style={styles.registerLink}>
              Inscrivez-vous maintenant
            </Link>
          </p>

        </motion.div>
        </div>
        </div>
<Footer />
</>
);
}
// ===== STYLES =====
const styles = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // FOND NEUTRE
  bgScene: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
  },

  // CARTE
  cardWrap: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '460px',
    padding: '1rem',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '2.2rem 2rem',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    position: 'relative',
    border: '1px solid rgba(0,0,0,0.04)',
  },
  backBtn: {
    position: 'absolute',
    top: '1.2rem',
    left: '1.2rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },

  // LOGO
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '1.2rem',
  },
  logoIcon: {
    background: '#f0c040',
    borderRadius: '12px',
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.6rem',
    fontWeight: '900',
    color: '#1a2e10',
    letterSpacing: '-0.03em',
  },

  // TEXTES
  title: {
    textAlign: 'center',
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#1a2e10',
    marginBottom: '0.3rem',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: '0.88rem',
    color: '#6b7280',
    marginBottom: '1.2rem',
  },

  // ERREUR
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '0.65rem 1rem',
    marginBottom: '1rem',
    fontSize: '0.85rem',
    color: '#dc2626',
  },

  // FORM
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  fieldWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.87rem',
    fontWeight: '600',
    color: '#374151',
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '0.8rem 1rem',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '0.92rem',
    outline: 'none',
    color: '#1a2e10',
    background: '#fafafa',
    transition: 'border-color 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
  },

  // REMEMBER
  rememberRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rememberLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.87rem',
    color: '#374151',
    cursor: 'pointer',
    fontWeight: '500',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#1a5c2a',
    cursor: 'pointer',
  },
  forgotLink: {
    fontSize: '0.87rem',
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },

  // SUBMIT
  submitBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '0.9rem',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
    marginTop: '0.3rem',
  },

  // SÉPARATEUR
  divider: {
    margin: '1.2rem 0',
  },
  dividerLine: {
    height: '1px',
    background: '#e5e7eb',
  },

  // GOOGLE
  googleBtn: {
    width: '100%',
    background: 'white',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    padding: '0.8rem',
    fontSize: '0.92rem',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '1.2rem',
    transition: 'all 0.2s',
  },

  // INSCRIPTION
  registerText: {
    textAlign: 'center',
    fontSize: '0.88rem',
    color: '#6b7280',
    margin: 0,
  },
  registerLink: {
    color: '#2563eb',
    fontWeight: '700',
    textDecoration: 'none',
  },
};
