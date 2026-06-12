// src/pages/auth/Auth.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';
import {
  Phone, Mail, Eye, EyeOff, ArrowLeft, AlertCircle,
  Check, ShoppingCart, Store, Truck, Lock, Loader, User,
  XCircle, CheckCircle,
} from 'lucide-react';
import logo from '../../assets/images/logo.jpeg';

const GREEN = '#1a5c2a';
const BG    = '#f2ede4';

const ROLES = [
  { id: 'BUYER',       Icon: ShoppingCart, label: 'Acheteur',     desc: 'Achetez des céréales',          color: '#2563eb', bg: '#eff6ff' },
  { id: 'SELLER',      Icon: Store,        label: 'Vendeur',      desc: 'Vendez vos produits agricoles', color: GREEN,     bg: '#f0fdf4' },
  { id: 'TRANSPORTER', Icon: Truck,        label: 'Transporteur', desc: 'Proposez vos services',         color: '#d97706', bg: '#fffbeb' },
];

const slide = {
  initial: { x: 32, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.28 } },
  exit:    { x: -32, opacity: 0, transition: { duration: 0.18 } },
};

export default function Auth() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, updateUser } = useAuth();

  // ── Mode synchronisé avec l'URL ─────────────────────
  const isLoginRoute = location.pathname.includes('login');
  const [mode, setMode] = useState(isLoginRoute ? 'login' : 'register');

  useEffect(() => {
    const isLogin = location.pathname.includes('login');
    setMode(isLogin ? 'login' : 'register');
    setRegStep('role');
    setError('');
    setOtp(Array(6).fill(''));
  }, [location.pathname]);

  // ── Inscription ─────────────────────────────────────
  const [regStep,    setRegStep]    = useState('role'); // role | form | otp
  const [role,       setRole]       = useState('');
  const [nomComplet,  setNomComplet]  = useState('');
  const [phone,       setPhone]       = useState('');
  const [phoneError,  setPhoneError]  = useState('');
  const [regEmail,    setRegEmail]    = useState('');
  const [pwd,         setPwd]         = useState('');
  const [pwdConfirm,  setPwdConfirm]  = useState('');
  const [showPwd,    setShowPwd]    = useState(false);

  // ── OTP partagé ──────────────────────────────────────
  const [otp,    setOtp]    = useState(Array(6).fill(''));
  const [timer,  setTimer]  = useState(0);
  const [devOtp, setDevOtp] = useState(''); // code affiché en mode dev local

  // ── Connexion ────────────────────────────────────────
  const [loginId,      setLoginId]      = useState(''); // email ou téléphone
  const [loginPwd,     setLoginPwd]     = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // ── Partagé ──────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [focused, setFocused] = useState('');

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const fmtTimer = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const clearError = () => setError('');

  // ═══════════════════════════════════════
  // INSCRIPTION
  // ═══════════════════════════════════════

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    clearError();
    if (digits.length > 0 && digits.length < 10) setPhoneError('Le numéro doit contenir exactement 10 chiffres.');
    else                                          setPhoneError('');
  };

  const validerForm = () => {
    if (!nomComplet.trim()) { setError('Le nom complet est requis'); return false; }
    if (phone.length !== 10) { setError('Le numéro de téléphone doit contenir exactement 10 chiffres.'); return false; }
    if (!regEmail.trim())   { setError('L\'adresse email est requise'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) { setError('Adresse email invalide'); return false; }
    if (!pwd.trim())        { setError('Le mot de passe est obligatoire'); return false; }
    if (pwd.length < 8)     { setError('Mot de passe : 8 caractères minimum'); return false; }
    if (pwd !== pwdConfirm) { setError('Les mots de passe ne correspondent pas'); return false; }
    return true;
  };

  const handleSubmitForm = async e => {
    e.preventDefault();
    if (!validerForm()) return;
    setLoading(true); clearError();
    try {
      const cleaned = phone.replace(/\s/g, '');
      const res = await AuthService.requestOTP(cleaned);
      if (res.existing) {
        setError('Ce numéro est déjà enregistré. Connectez-vous.');
        return;
      }
      setTimer(300);
      if (res.code_dev) {
        setDevOtp(res.code_dev);
        setOtp(res.code_dev.split(''));
      } else {
        setDevOtp('');
        setOtp(Array(6).fill(''));
      }
      setRegStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du SMS');
    } finally { setLoading(false); }
  };

  const handleVerifyRegOTP = async e => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Entrez les 6 chiffres'); return; }
    setLoading(true); clearError();
    try {
      const payload = {
        phone:       phone.replace(/\s/g, ''),
        code,
        role,
        nom_complet: nomComplet.trim(),
        email:       regEmail.trim(),
        password:    pwd,
      };
      const res = await AuthService.verifyOTPAndRegister(payload);
      const u = res.user;
      if (!u?.role) throw new Error('Données utilisateur invalides. Réessayez.');
      updateUser(u);
      navigate(`/${u.role.toLowerCase()}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide ou expiré');
      if (err.response?.data?.message?.includes('expiré')) setRegStep('form');
    } finally { setLoading(false); }
  };

  const handleResendReg = async () => {
    clearError();
    try {
      const res = await AuthService.resendOTP(phone.replace(/\s/g, ''));
      setTimer(300);
      if (res.code_dev) {
        setDevOtp(res.code_dev);
        setOtp(res.code_dev.split(''));
      } else {
        setDevOtp('');
        setOtp(Array(6).fill(''));
      }
    } catch { setError('Impossible de renvoyer le code'); }
  };

  // ═══════════════════════════════════════
  // CONNEXION
  // ═══════════════════════════════════════

  const handleLogin = async e => {
    e.preventDefault();
    if (!loginId.trim())  { setError('Renseignez votre email ou numéro de téléphone'); return; }
    if (!loginPwd.trim()) { setError('Renseignez votre mot de passe'); return; }
    setLoading(true); clearError();
    try {
      const data = await AuthService.loginUnifie(loginId.trim(), loginPwd);
      const u = data.user;
      if (!u?.role) throw new Error('Données utilisateur invalides. Réessayez.');
      updateUser(u);
      navigate(`/${u.role.toLowerCase()}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Identifiant ou mot de passe incorrect');
    } finally { setLoading(false); }
  };

  // ═══════════════════════════════════════
  // HELPERS STYLES
  // ═══════════════════════════════════════

  const inp = name => ({
    width: '100%', padding: '0.82rem 1rem 0.82rem 2.5rem',
    border: `2px solid ${focused === name ? GREEN : '#c4b9a8'}`,
    borderRadius: '12px', fontSize: '0.92rem', outline: 'none',
    color: '#1a2e10', background: focused === name ? '#fafff9' : '#fafafa',
    transition: 'all 0.2s', boxShadow: focused === name ? '0 0 0 3px rgba(26,92,42,0.08)' : 'none',
    boxSizing: 'border-box',
  });

  const btnPrimary = {
    width: '100%', padding: '0.9rem', marginTop: '0.4rem',
    background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`,
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '0.97rem', fontWeight: '700', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    boxShadow: '0 4px 20px rgba(26,92,42,0.28)',
  };

  const IL = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' };
  const LB = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' };
  const FW = { marginBottom: '0.9rem' };

  const switchTo = m => {
    setMode(m); clearError();
    setOtp(Array(6).fill(''));
    setRegEmail('');
    setLoginId('');
    setLoginPwd('');
  };

  // ═══════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════

  const showBack = mode === 'register' && regStep !== 'role';

  const handleBack = () => {
    clearError();
    if (mode === 'register') {
      if (regStep === 'form') setRegStep('role');
      if (regStep === 'otp')  setRegStep('form');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', position: 'relative', overflow: 'hidden' }}>

      {/* Cercles décoratifs background */}
      <div style={{ position: 'absolute', top: '-80px',  left: '-80px',  width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(180,160,120,0.12)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(180,160,120,0.12)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%',    right: '-40px',  width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(180,160,120,0.08)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}
      >

        {/* Bouton retour */}
        <div style={{ marginBottom: '1rem' }}>
          <motion.button onClick={showBack ? handleBack : () => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.7)', border: '1px solid #e0d8cc', borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#374151', backdropFilter: 'blur(4px)' }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            <ArrowLeft size={16} /> Retour
          </motion.button>
        </div>

        {/* Carte */}
        <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: '24px', padding: '2.2rem 2rem', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', backdropFilter: 'blur(8px)' }}>

          {/* Logo centré */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.4rem' }}>
            <img src={logo} alt="AgroSaaNuu" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.6rem', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1a2e10' }}>AgroSaaNuu</span>
          </div>

          {/* Erreur */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: '#dc2626' }}
              >
                <AlertCircle size={15} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* ══════════════════════════════════
                INSCRIPTION — Étape 1 : Rôle
            ══════════════════════════════════ */}
            {mode === 'register' && regStep === 'role' && (
              <motion.div key="role" {...slide}>
                <p style={{ textAlign: 'center', fontSize: '0.92rem', fontWeight: '700', color: '#1a2e10', marginBottom: '0.3rem' }}>
                  Créer un compte
                </p>
                <p style={{ textAlign: 'center', fontSize: '0.84rem', color: '#6b7280', marginBottom: '1.4rem' }}>
                  Quel est votre rôle sur la plateforme ?
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {ROLES.map(({ id, Icon, label, desc, color, bg }) => (
                    <motion.button key={id}
                      onClick={() => { setRole(id); setRegStep('form'); clearError(); }}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '1rem', border: `2px solid ${role === id ? color : '#e5e7eb'}`, borderRadius: '14px', background: role === id ? bg : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', boxShadow: role === id ? `0 0 0 3px ${color}22` : 'none' }}
                    >
                      <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${color}30` }}>
                        <Icon size={22} color={color} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: '700', color: '#1a2e10', fontSize: '0.95rem' }}>{label}</p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>{desc}</p>
                      </div>
                      {role === id && <Check size={18} color={color} style={{ marginLeft: 'auto' }} />}
                    </motion.button>
                  ))}
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.84rem', color: '#9ca3af', margin: '1.2rem 0 0' }}>
                  Déjà inscrit ?{' '}
                  <Link to="/auth/login" style={{ color: GREEN, fontWeight: '700', textDecoration: 'none' }}>
                    Connexion
                  </Link>
                </p>
              </motion.div>
            )}

            {/* ══════════════════════════════════
                INSCRIPTION — Étape 2 : Formulaire
            ══════════════════════════════════ */}
            {mode === 'register' && regStep === 'form' && (
              <motion.form key="reg-form" {...slide} onSubmit={handleSubmitForm}>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '1.2rem', textAlign: 'center' }}>
                  {role === 'BUYER' && 'Inscription Acheteur'}
                  {role === 'SELLER' && 'Inscription Vendeur'}
                  {role === 'TRANSPORTER' && 'Inscription Transporteur'}
                </p>

                {/* Nom complet */}
                <div style={FW}>
                  <label style={LB}>Nom complet *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} color="#9ca3af" style={IL} />
                    <input type="text" value={nomComplet} onChange={e => { setNomComplet(e.target.value); clearError(); }}
                      onFocus={() => setFocused('nom')} onBlur={() => setFocused('')}
                      placeholder="Prénom et Nom" style={inp('nom')} />
                  </div>
                </div>

                {/* Téléphone */}
                <div style={FW}>
                  <label style={LB}>Numéro de téléphone *</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} color="#9ca3af" style={IL} />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={handlePhoneChange}
                      onFocus={() => setFocused('tel')}
                      onBlur={() => setFocused('')}
                      placeholder="Entrez un numéro de téléphone"
                      style={{ ...inp('tel'), borderColor: phoneError ? '#ef4444' : undefined }}
                    />
                  </div>
                  {phoneError
                    ? <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>{phoneError}</span>
                    : <span style={{ fontSize: '0.74rem', color: '#9ca3af', marginTop: '3px', display: 'block' }}>{phone.length}/10 chiffres</span>
                  }
                </div>

                {/* Email */}
                <div style={FW}>
                  <label style={LB}>Adresse email *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="#9ca3af" style={IL} />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => { setRegEmail(e.target.value); clearError(); }}
                      onFocus={() => setFocused('regEmail')}
                      onBlur={() => setFocused('')}
                      placeholder="votre@email.com"
                      style={inp('regEmail')}
                      autoComplete="email"
                    />
                  </div>
                  {regEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail) && (
                    <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={13} /> Format email invalide</span>
                  )}
                  {regEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail) && (
                    <span style={{ fontSize: '0.74rem', color: '#16a34a', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={13} /> Email valide</span>
                  )}
                </div>

                {/* Mot de passe */}
                <div style={FW}>
                  <label style={LB}>Mot de passe *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#9ca3af" style={IL} />
                    <input type={showPwd ? 'text' : 'password'} value={pwd}
                      onChange={e => { setPwd(e.target.value); clearError(); }}
                      onFocus={() => setFocused('pwd')} onBlur={() => setFocused('')}
                      placeholder="Minimum 8 caractères"
                      style={{ ...inp('pwd'), paddingRight: '3rem' }} />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                      {showPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                    </button>
                  </div>
                </div>

                {/* Confirmation mot de passe */}
                <div style={FW}>
                  <label style={LB}>Confirmer le mot de passe *</label>
                  <input type={showPwd ? 'text' : 'password'} value={pwdConfirm}
                    onChange={e => { setPwdConfirm(e.target.value); clearError(); }}
                    onFocus={() => setFocused('pwdc')} onBlur={() => setFocused('')}
                    placeholder="Répétez le mot de passe"
                    style={{ ...inp('pwdc'), paddingLeft: '1rem', borderColor: pwdConfirm && pwdConfirm !== pwd ? '#ef4444' : undefined }}
                  />
                  {pwdConfirm && pwdConfirm !== pwd && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={13} /> Ne correspondent pas</span>}
                  {pwdConfirm && pwdConfirm === pwd && pwd.length > 0 && <span style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={13} /> Correspondent</span>}
                </div>

                <motion.button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.75 : 1 }}
                  disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {loading ? (
                      <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div>
                        <span> Création du compte…</span>
                      </motion.span>
                    ) : (
                      <motion.span key="idle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <Check size={15} /><span> S'inscrire</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

              </motion.form>
            )}

            {/* ══════════════════════════════════
                INSCRIPTION — Étape 3 : OTP
            ══════════════════════════════════ */}
            {mode === 'register' && regStep === 'otp' && (
              <motion.form key="reg-otp" {...slide} onSubmit={handleVerifyRegOTP}>
                <p style={{ textAlign: 'center', fontSize: '1rem', fontWeight: '700', color: '#1a2e10', marginBottom: '0.3rem' }}>
                  Vérification du numéro
                </p>
                <p style={{ textAlign: 'center', fontSize: '0.88rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                  Code envoyé au <strong style={{ color: '#1a2e10' }}>{phone}</strong>
                </p>

                {devOtp && (
                  <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: '10px', padding: '0.6rem 1rem', marginBottom: '1rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#92400e', display: 'block', marginBottom: '2px' }}>Code de vérification (serveur local)</span>
                    <strong style={{ fontSize: '1.3rem', letterSpacing: '0.2em', color: '#713f12' }}>{devOtp}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.2rem' }}>
                  {otp.map((d, i) => (
                    <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength="1" value={d}
                      onChange={e => {
                        if (!/^\d?$/.test(e.target.value)) return;
                        const next = [...otp]; next[i] = e.target.value; setOtp(next);
                        if (e.target.value && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
                      }}
                      onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`otp-${i - 1}`)?.focus(); }}
                      autoFocus={i === 0}
                      style={{ width: '46px', height: '52px', fontSize: '1.4rem', fontWeight: '700', textAlign: 'center', border: `2px solid ${d ? GREEN : '#e5e7eb'}`, borderRadius: '10px', outline: 'none', color: '#1a2e10', background: d ? '#f0fdf4' : '#fafafa', transition: 'all 0.15s' }}
                    />
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.2rem', minHeight: '22px' }}>
                  {timer > 0
                    ? <span style={{ fontSize: '0.84rem', color: '#6b7280' }}>Expire dans <strong style={{ color: GREEN }}>{fmtTimer(timer)}</strong></span>
                    : <button type="button" onClick={handleResendReg} style={{ background: 'none', border: 'none', color: GREEN, cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', textDecoration: 'underline' }}>Renvoyer le code</button>
                  }
                </div>

                <motion.button type="submit"
                  style={{ ...btnPrimary, opacity: (loading || otp.join('').length !== 6) ? 0.65 : 1 }}
                  disabled={loading || otp.join('').length !== 6}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {loading ? (
                      <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div>
                        <span> Création du compte…</span>
                      </motion.span>
                    ) : (
                      <motion.span key="idle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <Check size={16} /><span> Créer mon compte</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.form>
            )}

            {/* ══════════════════════════════════
                CONNEXION
            ══════════════════════════════════ */}
            {mode === 'login' && (
              <motion.form key="login" {...slide} onSubmit={handleLogin}>

                <p style={{ textAlign: 'center', fontSize: '1.05rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1.5rem' }}>
                  Connexion
                </p>

                {/* Email ou téléphone */}
                <div style={FW}>
                  <label style={LB}>Email ou numéro de téléphone</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} color="#9ca3af" style={IL} />
                    <input
                      type="text"
                      value={loginId}
                      onChange={e => { setLoginId(e.target.value); clearError(); }}
                      onFocus={() => setFocused('loginId')}
                      onBlur={() => setFocused('')}
                      placeholder=""
                      style={inp('loginId')}
                      autoComplete="username"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div style={FW}>
                  <label style={LB}>Mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#9ca3af" style={IL} />
                    <input
                      type={showLoginPwd ? 'text' : 'password'}
                      value={loginPwd}
                      onChange={e => { setLoginPwd(e.target.value); clearError(); }}
                      onFocus={() => setFocused('loginPwd')}
                      onBlur={() => setFocused('')}
                      placeholder=""
                      style={{ ...inp('loginPwd'), paddingRight: '3rem' }}
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowLoginPwd(v => !v)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                      {showLoginPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                    </button>
                  </div>
                </div>

                {/* Mot de passe oublié */}
                <div style={{ textAlign: 'right', marginBottom: '1.2rem', marginTop: '-0.4rem' }}>
                  <Link to="/auth/forgot-password" style={{ fontSize: '0.83rem', color: GREEN, textDecoration: 'none', fontWeight: '600' }}>
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* Bouton connexion */}
                <motion.button type="submit"
                  style={{ ...btnPrimary, borderRadius: '50px', fontSize: '1rem', padding: '0.95rem', letterSpacing: '0.02em', opacity: loading ? 0.75 : 1 }}
                  disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {loading ? (
                      <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div>
                        <span> Connexion…</span>
                      </motion.span>
                    ) : (
                      <motion.span key="idle"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        Connexion
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Inscription */}
                <p style={{ textAlign: 'center', fontSize: '0.84rem', color: '#6b7280', marginTop: '1rem', marginBottom: 0 }}>
                  Pas encore de compte ?{' '}
                  <Link to="/auth/register" style={{ color: GREEN, fontWeight: '700', textDecoration: 'none' }}>
                    Inscription
                  </Link>
                </p>

              </motion.form>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
