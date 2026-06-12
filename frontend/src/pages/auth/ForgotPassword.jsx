import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader, Smartphone } from 'lucide-react';
import AuthService from '../../services/auth.service';
import logo from '../../assets/images/logo.jpeg';

const GREEN = '#1a5c2a';

export default function ForgotPassword() {
  const navigate  = useNavigate();
  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 8) { setError('Numéro invalide'); return; }
    try {
      setLoading(true);
      setError('');
      await AuthService.requestOTP(cleaned);
      setSent(true);
    } catch {
      setError('Impossible d\'envoyer le SMS. Vérifiez le numéro.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div style={s.wrap}>
      <div style={s.card}>
        <img src={logo} alt="AgroSaaNuu" style={s.logo} />
        <p style={s.brand}>AgroSaaNuu</p>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}><Smartphone size={40} color="#1a5c2a" /></div>
        <h2 style={s.title}>Code envoyé !</h2>
        <p style={s.subtitle}>
          Un code a été envoyé au numéro <strong>{phone}</strong>. Vérifiez vos SMS.
        </p>
        <motion.button
          style={s.btn}
          onClick={() => navigate('/auth/login')}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        >
          Retour à la connexion
        </motion.button>
      </div>
    </div>
  );

  return (
    <div style={s.wrap}>
      {/* Cercles décoratifs */}
      <div style={{ position: 'absolute', top: '-80px',  left: '-80px',  width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(180,160,120,0.12)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(180,160,120,0.12)', pointerEvents: 'none' }} />

      <motion.div
        style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
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

        <div style={s.card}>

          {/* Logo + Titre */}
          <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
            <img src={logo} alt="AgroSaaNuu" style={s.logo} />
            <p style={s.brand}>AgroSaaNuu</p>
            <h2 style={s.title}>Mot de passe oublié</h2>
            <p style={s.subtitle}>
              Vous recevrez un code, veuillez entrez votre numéro de téléphone ou email
            </p>
          </div>

          {/* Erreur */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={s.errorBox}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            <label style={s.label}>Numéro de téléphone ou email</label>
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setError(''); }}
              placeholder="Entrez votre numéro de téléphone"
              style={s.input}
              autoFocus
            />

            <motion.button
              type="submit"
              style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {loading ? (
                  <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-flex' }}><Loader size={16} /></motion.div>
                    <span> Envoi…</span>
                  </motion.span>
                ) : (
                  <motion.span key="idle"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    Envoyer le SMS
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Retour */}
          <button
            style={s.backBtn}
            onClick={() => navigate('/auth/login')}
          >
            ← Retour à la connexion
          </button>

        </div>
      </motion.div>
    </div>
  );
}

const s = {
  wrap: {
    minHeight: '100vh',
    background: '#f2ede4',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem 1rem',
    position: 'relative', overflow: 'hidden',
  },
  card: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '28px',
    padding: '2.4rem 2rem',
    boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(8px)',
  },
  logo: {
    width: '64px', height: '64px',
    borderRadius: '50%', objectFit: 'cover',
    display: 'block', margin: '0 auto 0.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  },
  brand: {
    fontSize: '1.3rem', fontWeight: '900',
    color: '#1a2e10', margin: '0 0 0.5rem', textAlign: 'center',
  },
  title: {
    fontSize: '1.5rem', fontWeight: '800',
    color: GREEN, margin: '0 0 0.6rem', textAlign: 'center',
  },
  subtitle: {
    fontSize: '0.88rem', color: '#6b7280',
    lineHeight: 1.6, margin: '0 0 1.2rem', textAlign: 'center',
  },
  label: {
    display: 'block',
    fontSize: '1rem', fontWeight: '700',
    color: '#1a2e10', marginBottom: '8px',
  },
  input: {
    width: '100%', padding: '0.85rem 1rem',
    border: '2px solid #c4b9a8', borderRadius: '14px',
    fontSize: '0.92rem', outline: 'none',
    background: '#fafafa', color: '#1a2e10',
    boxSizing: 'border-box', marginBottom: '1.2rem',
    transition: 'border-color 0.2s',
  },
  btn: {
    width: '100%', padding: '0.95rem',
    background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`,
    color: 'white', border: 'none', borderRadius: '50px',
    fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    boxShadow: '0 4px 20px rgba(26,92,42,0.28)',
  },
  backBtn: {
    width: '100%', marginTop: '1rem',
    background: 'none', border: 'none',
    color: '#9ca3af', fontSize: '0.88rem',
    cursor: 'pointer', textAlign: 'center',
  },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: '10px', padding: '0.65rem 1rem',
    marginBottom: '1rem', fontSize: '0.84rem', color: '#dc2626',
    textAlign: 'center',
  },
};
