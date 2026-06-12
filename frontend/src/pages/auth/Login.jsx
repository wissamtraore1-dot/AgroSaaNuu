import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Eye, EyeOff, AlertCircle, Loader,
  Shield, TrendingUp, Users, ArrowRight, ArrowLeft
} from 'lucide-react';
import logo from '../../assets/images/logo.jpeg';

const FEATURES = [
  { icon: Shield,     text: 'Paiements sécurisés via escrow — votre argent protégé à chaque transaction' },
  { icon: TrendingUp, text: 'Prix du marché en temps réel pour maïs, riz, mil, soja et plus' },
  { icon: Users,      text: 'Des centaines de vendeurs vérifiés au Bénin prêts à vous livrer' },
];

const STATS = [
  { value: '500+', label: 'Vendeurs' },
  { value: '12k+', label: 'Acheteurs' },
  { value: '98%',  label: 'Satisfaction' },
];

export default function Login() {
  const navigate   = useNavigate();
  const { login, isBuyer, isSeller, isTransporter } = useAuth();
  const location   = useLocation();

  const [form, setForm]         = useState({ identifiant: '', password: '', remember: true });
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused]   = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifiant || !form.password) { setError('Veuillez remplir tous les champs.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const data = await login(form.identifiant, form.password);
      const role = data.user?.role;
      const from = location.state?.from?.pathname;
      if (from)                              navigate(from, { replace: true });
      else if (role === 'ADMIN')                         navigate('/admin/dashboard',        { replace: true });
      else if (role === 'BUYER'        || isBuyer)       navigate('/buyer/dashboard',        { replace: true });
      else if (role === 'SELLER'       || isSeller)      navigate('/seller/dashboard',       { replace: true });
      else if (role === 'TRANSPORTER'  || isTransporter) navigate('/transporter/dashboard',  { replace: true });
      else                                               navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (name) => ({
    width: '100%', padding: '0.85rem 1rem',
    border: `1.5px solid ${focused === name ? '#1a5c2a' : '#e5e7eb'}`,
    borderRadius: '12px', fontSize: '0.93rem',
    outline: 'none', color: '#1a2e10', background: focused === name ? '#fafff9' : '#fafafa',
    transition: 'all 0.2s', boxShadow: focused === name ? '0 0 0 3px rgba(26,92,42,0.08)' : 'none',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#d6d1c4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: '420px' }}
        >

          {/* Bouton retour */}
          <div style={{ marginBottom: '1.2rem' }}>
            <motion.button
              onClick={() => navigate(-1)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <ArrowLeft size={16} color="#374151" />
              Retour
            </motion.button>
          </div>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '2rem' }}>
            <img src={logo} alt="AgroSaaNuu" style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '10px' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1a2e10' }}>
              Agro<span style={{ color: '#1a5c2a' }}>SaaNuu</span>
            </span>
          </div>

          {/* Carte formulaire */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '2.2rem 2rem', boxShadow: '0 2px 24px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb' }}>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.3rem' }}>
              Bon retour
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Connectez-vous à votre compte AgroSaaNuu
            </p>

            {/* Erreur */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '0.7rem 1rem', marginBottom: '1.2rem', fontSize: '0.85rem', color: '#dc2626' }}
                >
                  <AlertCircle size={15} /> <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: '600', color: '#374151' }}>Email</label>
                <input
                  type="text" name="identifiant" value={form.identifiant} onChange={handleChange}
                  onFocus={() => setFocused('identifiant')} onBlur={() => setFocused('')}
                  placeholder="votre@email.com"
                  style={inputStyle('identifiant')}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: '600', color: '#374151' }}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                    placeholder="Votre mot de passe"
                    style={{ ...inputStyle('password'), paddingRight: '3rem' }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                    {showPwd ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#374151', cursor: 'pointer' }}>
                  <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} style={{ accentColor: '#1a5c2a', width: '15px', height: '15px' }} />
                  Se souvenir de moi
                </label>
                <Link to="/auth/forgot-password" style={{ fontSize: '0.86rem', color: '#1a5c2a', textDecoration: 'none', fontWeight: '600' }}>
                  Mot de passe oublié ?
                </Link>
              </div>

              <motion.button
                type="submit"
                style={{
                  background: submitting ? '#4db86a' : 'linear-gradient(135deg, #1a5c2a 0%, #2d8c47 100%)',
                  color: 'white', border: 'none', borderRadius: '12px', padding: '0.9rem',
                  fontSize: '0.97rem', fontWeight: '700', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 20px rgba(26,92,42,0.35)', marginTop: '0.2rem',
                  transition: 'all 0.2s',
                }}
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
                disabled={submitting}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {submitting ? (
                    <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={18} /></motion.div>
                      Connexion…
                    </motion.span>
                  ) : (
                    <motion.span key="idle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      Se connecter <ArrowRight size={16} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

            </form>

            {/* Séparateur */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1.3rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: '500' }}>ou</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>

            {/* Google */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
              whileTap={{ scale: 0.98 }}
              style={{ width: '100%', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '0.8rem', fontSize: '0.91rem', fontWeight: '600', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '1.2rem', transition: 'all 0.2s' }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continuer avec Google
            </motion.button>

            <p style={{ textAlign: 'center', fontSize: '0.87rem', color: '#6b7280', margin: 0 }}>
              Pas encore de compte ?{' '}
              <Link to="/auth/register" style={{ color: '#1a5c2a', fontWeight: '700', textDecoration: 'none' }}>
                S'inscrire gratuitement
              </Link>
            </p>

          </div>
        </motion.div>

    </div>
  );
}
