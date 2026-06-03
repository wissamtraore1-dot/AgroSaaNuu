// src/pages/auth/Auth.jsx — Authentification style 1xBet
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';
import {
  Phone, Mail, Eye, EyeOff, ArrowLeft,
  AlertCircle, Check, ShoppingCart, Store, Truck, Lock, Loader,
} from 'lucide-react';
import logo from '../../assets/images/logo.jpeg';

// ── Constantes de couleurs ──
const GREEN  = '#1a5c2a';
const BG     = '#d6d1c4';

const ROLES = [
  { id: 'BUYER',       Icon: ShoppingCart, label: 'Acheteur',     desc: 'Achetez des céréales',           color: '#2563eb', bg: '#eff6ff' },
  { id: 'SELLER',      Icon: Store,        label: 'Vendeur',      desc: 'Vendez vos produits agricoles',  color: GREEN,     bg: '#f0fdf4' },
  { id: 'TRANSPORTER', Icon: Truck,        label: 'Transporteur', desc: 'Proposez vos services',          color: '#d97706', bg: '#fffbeb' },
];

const slide = {
  initial: { x: 32, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.28 } },
  exit:    { x: -32, opacity: 0, transition: { duration: 0.18 } },
};

// ── Composant principal ──
export default function Auth() {
  const navigate = useNavigate();
  const { login, updateUser } = useAuth();

  // Onglet actif
  const [tab, setTab] = useState('phone'); // 'phone' | 'email'

  // ─ Phone flow ─
  const [phoneStep, setPhoneStep] = useState('input'); // input | otp | role | password
  const [phone,      setPhone]      = useState('+229 ');
  const [isExisting, setIsExisting] = useState(false);
  const [otp,        setOtp]        = useState(Array(6).fill(''));
  const [role,       setRole]       = useState('');
  const [pwd,        setPwd]        = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [timer,      setTimer]      = useState(0);

  // ─ Email flow ─
  const [email,        setEmail]       = useState('');
  const [emailPwd,     setEmailPwd]    = useState('');
  const [showEmailPwd, setShowEmailPwd] = useState(false);

  // ─ Partagé ─
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [focused, setFocused] = useState('');

  // Compte à rebours
  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const fmtTimer = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const clearError = () => setError('');

  // ──────────────────────────────
  // FLOW TÉLÉPHONE
  // ──────────────────────────────

  const handleRequestOTP = async e => {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 8) { setError('Numéro de téléphone invalide'); return; }
    setLoading(true); clearError();
    try {
      const res = await AuthService.requestOTP(cleaned);
      setIsExisting(!!res.existing);
      setTimer(300);
      setPhoneStep('otp');
      // En développement : afficher le code dans la console
      if (res.code_dev) console.log(`[DEV] Code OTP: ${res.code_dev}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du SMS');
    } finally { setLoading(false); }
  };

  const handleOTPChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleOTPKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0)
      document.getElementById(`otp-${i - 1}`)?.focus();
  };

  const handleVerifyOTP = async e => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Entrez les 6 chiffres'); return; }

    if (isExisting) {
      // Connexion utilisateur existant via OTP
      setLoading(true); clearError();
      try {
        const res = await AuthService.phoneLogin(phone.replace(/\s/g, ''), code);
        updateUser(res.user);
        navigate(`/${res.user.role.toLowerCase()}/dashboard`, { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || 'Code invalide');
      } finally { setLoading(false); }
    } else {
      // Nouvel utilisateur → sélection du rôle
      setPhoneStep('role');
    }
  };

  const handleRoleSelect = r => {
    setRole(r);
    setPhoneStep('password');
  };

  const handleRegister = async (skipPwd = false) => {
    if (!skipPwd && pwd && pwd.length < 8) { setError('Mot de passe : 8 caractères minimum'); return; }
    if (!skipPwd && pwd && pwd !== pwdConfirm) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true); clearError();
    try {
      const res = await AuthService.verifyOTPAndRegister({
        phone: phone.replace(/\s/g, ''),
        code:  otp.join(''),
        role,
        password: (skipPwd || !pwd) ? undefined : pwd,
      });
      updateUser(res.user);
      navigate(`/${res.user.role.toLowerCase()}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte');
      // Si l'OTP a expiré, revenir à la saisie OTP
      if (err.response?.data?.message?.includes('expiré')) setPhoneStep('otp');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    clearError();
    try {
      const res = await AuthService.resendOTP(phone.replace(/\s/g, ''));
      setTimer(300);
      setOtp(Array(6).fill(''));
      if (res.code_dev) console.log(`[DEV] Code OTP renvoyé: ${res.code_dev}`);
    } catch { setError('Impossible de renvoyer le code'); }
  };

  const goBack = () => {
    clearError();
    const prev = { otp: 'input', role: 'otp', password: 'role' };
    setPhoneStep(prev[phoneStep] || 'input');
  };

  // ──────────────────────────────
  // FLOW EMAIL
  // ──────────────────────────────

  const handleEmailLogin = async e => {
    e.preventDefault();
    if (!email || !emailPwd) { setError('Remplissez tous les champs'); return; }
    setLoading(true); clearError();
    try {
      const data = await login(email, emailPwd);
      navigate(`/${data.user.role.toLowerCase()}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally { setLoading(false); }
  };

  // ──────────────────────────────
  // STYLES PARTAGÉS
  // ──────────────────────────────

  const inputStyle = name => ({
    width: '100%', padding: '0.82rem 1rem',
    border: `1.5px solid ${focused === name ? GREEN : '#e5e7eb'}`,
    borderRadius: '12px', fontSize: '0.93rem', outline: 'none',
    color: '#1a2e10', background: focused === name ? '#fafff9' : '#fafafa',
    transition: 'all 0.2s',
    boxShadow: focused === name ? '0 0 0 3px rgba(26,92,42,0.08)' : 'none',
  });

  const btnPrimary = {
    width: '100%', padding: '0.9rem', marginTop: '0.4rem',
    background: `linear-gradient(135deg, ${GREEN} 0%, #2d8c47 100%)`,
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '0.97rem', fontWeight: '700', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    boxShadow: '0 4px 20px rgba(26,92,42,0.28)', transition: 'opacity 0.2s',
  };

  const stepLabel = { input: 'Connexion / Inscription', otp: 'Code de vérification', role: 'Votre activité', password: 'Sécurité du compte' };

  // ──────────────────────────────
  // RENDU
  // ──────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '430px' }}
      >
        {/* Bouton retour */}
        <div style={{ marginBottom: '1rem' }}>
          <motion.button onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            <ArrowLeft size={16} /> Retour
          </motion.button>
        </div>

        {/* Carte principale */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 2px 24px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <img src={logo} alt="AgroSaaNuu" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1a2e10' }}>
              Agro<span style={{ color: GREEN }}>SaaNuu</span>
            </span>
          </div>

          {/* Onglets (visibles sur la page d'accueil ou onglet email) */}
          {(phoneStep === 'input' || tab === 'email') && (
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '12px', padding: '4px', marginBottom: '1.5rem', gap: '4px' }}>
              {[
                { id: 'phone', Icon: Phone, label: 'Téléphone' },
                { id: 'email', Icon: Mail,  label: 'Email' },
              ].map(t => (
                <button key={t.id}
                  onClick={() => { setTab(t.id); clearError(); }}
                  style={{
                    flex: 1, padding: '0.6rem 0.5rem', border: 'none', borderRadius: '9px', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: '600',
                    background: tab === t.id ? 'white' : 'transparent',
                    color:      tab === t.id ? GREEN   : '#6b7280',
                    boxShadow:  tab === t.id ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.2s',
                  }}
                >
                  <t.Icon size={15} /> {t.label}
                </button>
              ))}
            </div>
          )}

          {/* En-tête d'étape (phone flow, après input) */}
          {tab === 'phone' && phoneStep !== 'input' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.4rem' }}>
              <button onClick={goBack}
                style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
              >
                <ArrowLeft size={18} color="#374151" />
              </button>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af', fontWeight: '500' }}>
                  {phone.replace(/\s/g, '')}
                </p>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1a2e10' }}>
                  {stepLabel[phoneStep]}
                </h3>
              </div>
            </div>
          )}

          {/* Message d'erreur */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: '#dc2626' }}
              >
                <AlertCircle size={15} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════════════════════ */}
          {/* ONGLET TÉLÉPHONE               */}
          {/* ══════════════════════════════ */}
          {tab === 'phone' && (
            <AnimatePresence mode="wait">

              {/* Étape 1 : saisie du numéro */}
              {phoneStep === 'input' && (
                <motion.form key="phone-input" {...slide} onSubmit={handleRequestOTP}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Numéro de téléphone
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Phone size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} />
                      <input
                        type="tel" value={phone}
                        onChange={e => { setPhone(e.target.value); clearError(); }}
                        onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                        placeholder="+229 01 23 45 67 89"
                        style={{ ...inputStyle('phone'), paddingLeft: '2.5rem' }}
                      />
                    </div>
                    <p style={{ fontSize: '0.74rem', color: '#9ca3af', margin: '5px 0 0 2px' }}>
                      Format Bénin : +229 XX XX XX XX
                    </p>
                  </div>

                  <motion.button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.75 : 1 }}
                    disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading
                      ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div> Envoi…</>
                      : 'Recevoir le code SMS'
                    }
                  </motion.button>

                  {/* Séparateur */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1.2rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>ou</span>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                  </div>

                  {/* Google (placeholder) */}
                  <button type="button" disabled title="Bientôt disponible"
                    style={{ width: '100%', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '0.78rem', fontSize: '0.9rem', fontWeight: '600', color: '#9ca3af', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '1rem', opacity: 0.65 }}
                  >
                    <GoogleIcon />
                    Continuer avec Google (bientôt)
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '0.80rem', color: '#9ca3af', margin: 0 }}>
                    En continuant, vous acceptez nos{' '}
                    <a href="#" style={{ color: GREEN, textDecoration: 'none', fontWeight: '600' }}>conditions d'utilisation</a>
                  </p>
                </motion.form>
              )}

              {/* Étape 2 : OTP */}
              {phoneStep === 'otp' && (
                <motion.form key="otp" {...slide} onSubmit={handleVerifyOTP}>
                  <p style={{ textAlign: 'center', fontSize: '0.88rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                    {isExisting
                      ? <>Code envoyé sur <strong style={{ color: '#1a2e10' }}>{phone}</strong><br /><span style={{ fontSize: '0.8rem' }}>Connectez-vous avec votre code</span></>
                      : <>Code envoyé sur <strong style={{ color: '#1a2e10' }}>{phone}</strong></>
                    }
                  </p>

                  {/* 6 cases OTP */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.2rem' }}>
                    {otp.map((d, i) => (
                      <input
                        key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength="1"
                        value={d}
                        onChange={e => handleOTPChange(i, e.target.value)}
                        onKeyDown={e => handleOTPKey(i, e)}
                        autoFocus={i === 0}
                        style={{
                          width: '46px', height: '52px', fontSize: '1.4rem', fontWeight: '700',
                          textAlign: 'center', border: `2px solid ${d ? GREEN : '#e5e7eb'}`,
                          borderRadius: '10px', outline: 'none', color: '#1a2e10',
                          background: d ? '#f0fdf4' : '#fafafa', transition: 'all 0.15s',
                        }}
                      />
                    ))}
                  </div>

                  {/* Compte à rebours / Renvoyer */}
                  <div style={{ textAlign: 'center', marginBottom: '1.2rem', minHeight: '24px' }}>
                    {timer > 0
                      ? <span style={{ fontSize: '0.84rem', color: '#6b7280' }}>
                          Code expire dans <strong style={{ color: GREEN }}>{fmtTimer(timer)}</strong>
                        </span>
                      : <button type="button" onClick={handleResend}
                          style={{ background: 'none', border: 'none', color: GREEN, cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', textDecoration: 'underline' }}
                        >
                          Renvoyer le code
                        </button>
                    }
                  </div>

                  <motion.button type="submit"
                    style={{ ...btnPrimary, opacity: (loading || otp.join('').length !== 6) ? 0.65 : 1 }}
                    disabled={loading || otp.join('').length !== 6}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  >
                    {loading
                      ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div> Vérification…</>
                      : <><Check size={16} /> Vérifier</>
                    }
                  </motion.button>
                </motion.form>
              )}

              {/* Étape 3 : Sélection du rôle */}
              {phoneStep === 'role' && (
                <motion.div key="role" {...slide}>
                  <p style={{ textAlign: 'center', fontSize: '0.88rem', color: '#6b7280', marginBottom: '1.2rem' }}>
                    Comment allez-vous utiliser AgroSaaNuu ?
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {ROLES.map(({ id, Icon, label, desc, color, bg }) => (
                      <motion.button key={id}
                        onClick={() => handleRoleSelect(id)}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '14px',
                          padding: '1rem', border: `2px solid ${role === id ? color : '#e5e7eb'}`,
                          borderRadius: '14px', background: role === id ? bg : 'white',
                          cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                          boxShadow: role === id ? `0 0 0 3px ${color}25` : 'none',
                        }}
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
                </motion.div>
              )}

              {/* Étape 4 : Mot de passe (optionnel) */}
              {phoneStep === 'password' && (
                <motion.div key="password" {...slide}>
                  <p style={{ fontSize: '0.87rem', color: '#6b7280', marginBottom: '1.2rem', textAlign: 'center' }}>
                    Protégez votre compte avec un mot de passe<br />
                    <span style={{ fontSize: '0.78rem' }}>(optionnel — vous pouvez toujours vous connecter par SMS)</span>
                  </p>

                  {/* Champ mot de passe */}
                  <div style={{ marginBottom: '0.8rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Mot de passe
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        type={showPwd ? 'text' : 'password'} value={pwd}
                        onChange={e => { setPwd(e.target.value); clearError(); }}
                        onFocus={() => setFocused('pwd')} onBlur={() => setFocused('')}
                        placeholder="Minimum 8 caractères"
                        style={{ ...inputStyle('pwd'), paddingLeft: '2.5rem', paddingRight: '3rem' }}
                      />
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                      >
                        {showPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmer */}
                  {pwd.length > 0 && (
                    <div style={{ marginBottom: '0.8rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        Confirmer le mot de passe
                      </label>
                      <input
                        type={showPwd ? 'text' : 'password'} value={pwdConfirm}
                        onChange={e => setPwdConfirm(e.target.value)}
                        onFocus={() => setFocused('pwdc')} onBlur={() => setFocused('')}
                        placeholder="Répétez le mot de passe"
                        style={{ ...inputStyle('pwdc'), borderColor: pwdConfirm && pwdConfirm !== pwd ? '#ef4444' : undefined }}
                      />
                      {pwdConfirm && pwdConfirm !== pwd && (
                        <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                          ❌ Ne correspondent pas
                        </span>
                      )}
                      {pwdConfirm && pwdConfirm === pwd && (
                        <span style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px', display: 'block' }}>
                          ✅ Correspondent
                        </span>
                      )}
                    </div>
                  )}

                  {/* Boutons */}
                  <motion.button onClick={() => handleRegister(false)}
                    style={{ ...btnPrimary, opacity: loading ? 0.75 : 1 }}
                    disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  >
                    {loading
                      ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div> Création…</>
                      : <><Check size={16} /> Créer mon compte</>
                    }
                  </motion.button>

                  <button type="button" onClick={() => handleRegister(true)} disabled={loading}
                    style={{ width: '100%', marginTop: '10px', padding: '0.78rem', background: 'transparent', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.88rem', color: '#6b7280', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500', transition: 'border-color 0.2s' }}
                  >
                    Continuer sans mot de passe
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          )}

          {/* ══════════════════════════════ */}
          {/* ONGLET EMAIL                   */}
          {/* ══════════════════════════════ */}
          {tab === 'email' && (
            <motion.form key="email-form" {...slide} onSubmit={handleEmailLogin}>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Adresse email
                </label>
                <input
                  type="email" value={email}
                  onChange={e => { setEmail(e.target.value); clearError(); }}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                  placeholder="votre@email.com"
                  style={inputStyle('email')}
                />
              </div>

              <div style={{ marginBottom: '0.6rem' }}>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showEmailPwd ? 'text' : 'password'} value={emailPwd}
                    onChange={e => { setEmailPwd(e.target.value); clearError(); }}
                    onFocus={() => setFocused('emailPwd')} onBlur={() => setFocused('')}
                    placeholder="Votre mot de passe"
                    style={{ ...inputStyle('emailPwd'), paddingRight: '3rem' }}
                  />
                  <button type="button" onClick={() => setShowEmailPwd(v => !v)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                  >
                    {showEmailPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                <Link to="/auth/forgot-password" style={{ fontSize: '0.83rem', color: GREEN, textDecoration: 'none', fontWeight: '600' }}>
                  Mot de passe oublié ?
                </Link>
              </div>

              <motion.button type="submit"
                style={{ ...btnPrimary, opacity: loading ? 0.75 : 1 }}
                disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              >
                {loading
                  ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div> Connexion…</>
                  : 'Se connecter'
                }
              </motion.button>

              {/* Google */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1.1rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>ou</span>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              </div>

              <button type="button" disabled title="Bientôt disponible"
                style={{ width: '100%', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '0.78rem', fontSize: '0.9rem', fontWeight: '600', color: '#9ca3af', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: 0.65 }}
              >
                <GoogleIcon />
                Continuer avec Google (bientôt)
              </button>
            </motion.form>
          )}

          {/* Pied de page */}
          {(phoneStep === 'input' || tab === 'email') && (
            <p style={{ textAlign: 'center', fontSize: '0.84rem', color: '#6b7280', marginTop: '1.2rem', marginBottom: 0 }}>
              {tab === 'phone'
                ? <>Vous avez un compte email ?{' '}<button type="button" onClick={() => setTab('email')} style={{ background: 'none', border: 'none', color: GREEN, fontWeight: '700', cursor: 'pointer', fontSize: '0.84rem', padding: 0 }}>Connexion email</button></>
                : <>Nouveau sur AgroSaaNuu ?{' '}<button type="button" onClick={() => setTab('phone')} style={{ background: 'none', border: 'none', color: GREEN, fontWeight: '700', cursor: 'pointer', fontSize: '0.84rem', padding: 0 }}>Créer un compte</button></>
              }
            </p>
          )}

        </div>
      </motion.div>
    </div>
  );
}

// Icône Google
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
