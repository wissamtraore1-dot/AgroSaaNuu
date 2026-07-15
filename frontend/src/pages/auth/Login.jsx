// src/pages/auth/Login.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';
import api from '../../services/api';
import { Eye, EyeOff, AlertCircle, Lock, Loader, User, Shield, TrendingUp, Truck, Phone, Check } from 'lucide-react';
import logo from '../../assets/images/logo.jpeg';

const GREEN = '#1a5c2a';
const BG    = '#f2ede4';

function CountUp({ to, duration = 1800, suffix = '' }) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!to) return;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * to));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [to, duration]);

  return <>{count.toLocaleString('fr-FR')}{suffix}</>;
}

export default function Login() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [loginId,      setLoginId]      = useState('');
  const [loginPwd,     setLoginPwd]     = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [focused,      setFocused]      = useState('');

  // ── Connexion par téléphone + OTP ──────────────────────────────
  const [loginMode, setLoginMode] = useState('password'); // 'password' | 'sms'
  const [smsStep,   setSmsStep]   = useState('phone');    // 'phone' | 'otp'
  const [smsPhone,  setSmsPhone]  = useState('');
  const [otp,       setOtp]       = useState(Array(6).fill(''));
  const [timer,     setTimer]     = useState(0);
  const [devOtp,    setDevOtp]    = useState('');

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const fmtTimer = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const [liveStats, setLiveStats] = useState({ vendeurs: 500, acheteurs: 12000, satisfaction: 98 });

  useEffect(() => {
    (async () => {
      try {
        const [prodRes, transpRes] = await Promise.allSettled([
          api.get('/products/', { params: { page_size: 1 } }),
          api.get('/auth/transporters/', { params: { page: 1, page_size: 1 } }),
        ]);
        const totalProduits      = prodRes.status    === 'fulfilled' ? (prodRes.value.data?.count    || 0) : 0;
        const totalTransporteurs = transpRes.status  === 'fulfilled' ? (transpRes.value.data?.count  || transpRes.value.data?.total || 0) : 0;
        setLiveStats(prev => ({
          vendeurs:      Math.max(totalProduits || prev.vendeurs, prev.vendeurs),
          acheteurs:     prev.acheteurs,
          satisfaction:  prev.satisfaction,
          transporteurs: totalTransporteurs || undefined,
        }));
      } catch { /* garde les valeurs par défaut */ }
    })();
  }, []);

  const clearError = () => setError('');

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

  const handleSendOtp = async e => {
    e.preventDefault();
    if (smsPhone.length !== 10) { setError('Le numéro doit contenir exactement 10 chiffres.'); return; }
    setLoading(true); clearError();
    try {
      const res = await AuthService.requestOTP(smsPhone);
      setTimer(300);
      if (res.code_dev) { setDevOtp(res.code_dev); setOtp(res.code_dev.split('')); }
      else              { setDevOtp(''); setOtp(Array(6).fill('')); }
      setSmsStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi du code");
    } finally { setLoading(false); }
  };

  const handleVerifyOtpLogin = async e => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Entrez les 6 chiffres'); return; }
    setLoading(true); clearError();
    try {
      const res = await AuthService.phoneLogin(smsPhone, code);
      const u = res.user;
      if (!u?.role) throw new Error('Données utilisateur invalides');
      updateUser(u);
      navigate(`/${u.role.toLowerCase()}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide ou expiré');
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    clearError();
    try {
      const res = await AuthService.resendOTP(smsPhone);
      setTimer(300);
      if (res.code_dev) { setDevOtp(res.code_dev); setOtp(res.code_dev.split('')); }
      else              { setDevOtp(''); setOtp(Array(6).fill('')); }
    } catch { setError('Impossible de renvoyer le code'); }
  };

  const inp = name => ({
    width: '100%', padding: '0.82rem 1rem 0.82rem 2.5rem',
    border: `2px solid ${focused === name ? GREEN : '#c4b9a8'}`,
    borderRadius: '12px', fontSize: '0.92rem', outline: 'none',
    color: '#1a2e10', background: focused === name ? '#fafff9' : '#fafafa',
    transition: 'all 0.2s', boxShadow: focused === name ? '0 0 0 3px rgba(26,92,42,0.08)' : 'none',
    boxSizing: 'border-box',
  });

  const btnPrimary = {
    width: '100%', padding: '0.95rem', marginTop: '0.4rem',
    background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`,
    color: 'white', border: 'none', borderRadius: '50px',
    fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    boxShadow: '0 4px 20px rgba(26,92,42,0.28)',
  };

  const IL = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' };
  const LB = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' };
  const FW = { marginBottom: '0.9rem' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* Panneau gauche branding */}
      <div style={{
        flex: '0 0 45%', background: 'linear-gradient(160deg, #0d2b14 0%, #1a5c2a 55%, #2d8c47 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '3rem', position: 'relative', overflow: 'hidden',
      }} className="d-none d-lg-flex">
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <img src={logo} alt="AgroSaaNuu" style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', marginBottom: '1.4rem', boxShadow: '0 8px 30px rgba(0,0,0,0.25)', border: '3px solid rgba(240,192,64,0.4)' }} />
          <h2 style={{ color: 'white', fontWeight: '900', fontSize: '2rem', marginBottom: '0.5rem' }}>
            Agro<span style={{ color: '#f0c040' }}>SaaNuu</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            La marketplace agricole du Bénin
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {[
              { icon: Shield,     title: 'Paiements sécurisés',           desc: "Escrow — argent bloqué jusqu'à livraison"  },
              { icon: TrendingUp, title: 'Prix du marché en temps réel',   desc: 'Maïs, riz, mil, soja — au juste prix'      },
              { icon: Truck,      title: 'Transporteurs vérifiés',         desc: 'Livraison fiable dans tout le Bénin'       },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(255,255,255,0.07)', borderRadius: '14px', padding: '0.9rem 1.1rem' }}>
                <div style={{ flexShrink: 0, marginTop: '2px' }}><f.icon size={18} color="#f0c040" /></div>
                <div>
                  <p style={{ margin: 0, color: 'white', fontWeight: '700', fontSize: '0.88rem' }}>{f.title}</p>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', marginTop: '2px' }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem' }}>
            {[
              { value: liveStats.vendeurs,     suffix: '+',  label: 'Vendeurs'     },
              { value: liveStats.acheteurs,    suffix: '+',  label: 'Acheteurs'    },
              { value: liveStats.satisfaction, suffix: '%',  label: 'Satisfaction' },
            ].map(({ value, suffix, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#f0c040', fontWeight: '900', fontSize: '1.4rem' }}>
                  <CountUp to={value} suffix={suffix} />
                </p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Panneau droit — formulaire */}
      <div style={{ flex: 1, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', overflowY: 'auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: '420px' }}>

          {/* Logo mobile */}
          <div className="d-flex d-lg-none flex-column align-items-center" style={{ marginBottom: '1.4rem' }}>
            <img src={logo} alt="AgroSaaNuu" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
            <span style={{ fontWeight: '900', color: '#1a2e10', marginTop: '6px' }}>Agro<span style={{ color: '#1a5c2a' }}>SaaNuu</span></span>
          </div>

          <div style={{ background: 'white', borderRadius: '24px', padding: '2.4rem 2.2rem', boxShadow: '0 4px 32px rgba(0,0,0,0.09)', border: '1px solid #e5e7eb' }}>

            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1a2e10', marginBottom: '0.3rem' }}>Bon retour</h2>
            <p style={{ fontSize: '0.87rem', color: '#6b7280', marginBottom: '1.2rem' }}>Connectez-vous à votre compte</p>

            {/* Sélecteur de mode de connexion */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.4rem', background: '#f3f4f6', borderRadius: '12px', padding: '4px' }}>
              {[
                { id: 'password', label: 'Mot de passe' },
                { id: 'sms',      label: 'Code SMS' },
              ].map(m => (
                <button key={m.id} type="button"
                  onClick={() => { setLoginMode(m.id); setSmsStep('phone'); clearError(); }}
                  style={{
                    flex: 1, padding: '0.55rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: '700',
                    background: loginMode === m.id ? 'white' : 'transparent',
                    color: loginMode === m.id ? GREEN : '#6b7280',
                    boxShadow: loginMode === m.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s',
                  }}>
                  {m.label}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: '#dc2626' }}>
                  <AlertCircle size={15} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            {loginMode === 'password' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={FW}>
                <label style={LB}>Email ou numéro de téléphone</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="#9ca3af" style={IL} />
                  <input type="text" value={loginId}
                    onChange={e => { setLoginId(e.target.value); clearError(); }}
                    onFocus={() => setFocused('loginId')} onBlur={() => setFocused('')}
                    placeholder="votre@email.com ou 0700000000"
                    style={inp('loginId')} autoComplete="username" autoFocus />
                </div>
              </div>

              <div style={FW}>
                <label style={LB}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#9ca3af" style={IL} />
                  <input type={showLoginPwd ? 'text' : 'password'} value={loginPwd}
                    onChange={e => { setLoginPwd(e.target.value); clearError(); }}
                    onFocus={() => setFocused('loginPwd')} onBlur={() => setFocused('')}
                    placeholder="Votre mot de passe"
                    style={{ ...inp('loginPwd'), paddingRight: '3rem' }} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowLoginPwd(v => !v)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    {showLoginPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: '-0.4rem' }}>
                <Link to="/auth/forgot-password" style={{ fontSize: '0.83rem', color: GREEN, textDecoration: 'none', fontWeight: '600' }}>
                  Mot de passe oublié ?
                </Link>
              </div>

              <motion.button type="submit"
                style={{ ...btnPrimary, opacity: loading ? 0.75 : 1 }}
                disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                <AnimatePresence mode="wait" initial={false}>
                  {loading ? (
                    <motion.span key="l" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div>
                      Connexion…
                    </motion.span>
                  ) : (
                    <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      Se connecter
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>
            )}

            {loginMode === 'sms' && smsStep === 'phone' && (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={FW}>
                  <label style={LB}>Numéro de téléphone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} color="#9ca3af" style={IL} />
                    <input type="text" inputMode="numeric" maxLength={10} value={smsPhone}
                      onChange={e => { setSmsPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); clearError(); }}
                      onFocus={() => setFocused('smsPhone')} onBlur={() => setFocused('')}
                      placeholder="0700000000"
                      style={inp('smsPhone')} autoComplete="tel" autoFocus />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '3px', display: 'block' }}>{smsPhone.length}/10 chiffres</span>
                </div>

                <motion.button type="submit"
                  style={{ ...btnPrimary, opacity: (loading || smsPhone.length !== 10) ? 0.65 : 1 }}
                  disabled={loading || smsPhone.length !== 10} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {loading
                    ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div> Envoi du code…</>
                    : 'Envoyer le code'
                  }
                </motion.button>
              </form>
            )}

            {loginMode === 'sms' && smsStep === 'otp' && (
              <form onSubmit={handleVerifyOtpLogin}>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
                  Code envoyé au <strong style={{ color: '#1a2e10' }}>{smsPhone}</strong>
                </p>

                {devOtp && (
                  <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: '10px', padding: '0.6rem 1rem', marginBottom: '1rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#92400e', display: 'block', marginBottom: '2px' }}>Code (serveur local)</span>
                    <strong style={{ fontSize: '1.3rem', letterSpacing: '0.2em', color: '#713f12' }}>{devOtp}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.2rem' }}>
                  {otp.map((d, i) => (
                    <input key={i} id={`login-otp-${i}`} type="text" inputMode="numeric" maxLength="1" value={d}
                      onChange={e => {
                        if (!/^\d?$/.test(e.target.value)) return;
                        const next = [...otp]; next[i] = e.target.value; setOtp(next);
                        if (e.target.value && i < 5) document.getElementById(`login-otp-${i + 1}`)?.focus();
                      }}
                      onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`login-otp-${i - 1}`)?.focus(); }}
                      autoFocus={i === 0}
                      style={{ width: '46px', height: '52px', fontSize: '1.3rem', fontWeight: '800', textAlign: 'center', border: `2px solid ${d ? GREEN : '#e5e7eb'}`, borderRadius: '10px', outline: 'none', color: '#1a2e10', background: d ? '#f0fdf4' : '#fafafa' }}
                    />
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.2rem', minHeight: '20px' }}>
                  {timer > 0
                    ? <span style={{ fontSize: '0.83rem', color: '#6b7280' }}>Expire dans <strong style={{ color: GREEN }}>{fmtTimer(timer)}</strong></span>
                    : <button type="button" onClick={handleResendOtp} style={{ background: 'none', border: 'none', color: GREEN, cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', textDecoration: 'underline' }}>Renvoyer le code</button>
                  }
                </div>

                <motion.button type="submit"
                  style={{ ...btnPrimary, opacity: (loading || otp.join('').length !== 6) ? 0.65 : 1 }}
                  disabled={loading || otp.join('').length !== 6} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {loading
                    ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div> Connexion…</>
                    : <><Check size={16} /> Se connecter</>
                  }
                </motion.button>

                <p style={{ textAlign: 'center', fontSize: '0.83rem', color: '#9ca3af', marginTop: '1rem', marginBottom: 0 }}>
                  <button type="button" onClick={() => { setSmsStep('phone'); clearError(); }}
                    style={{ background: 'none', border: 'none', color: GREEN, cursor: 'pointer', fontWeight: '600', fontSize: '0.83rem' }}>
                    ← Modifier le numéro
                  </button>
                </p>
              </form>
            )}

            <p style={{ textAlign: 'center', fontSize: '0.84rem', color: '#6b7280', margin: '1rem 0 0' }}>
              Pas encore de compte ?{' '}
              <Link to="/auth/register" style={{ color: GREEN, fontWeight: '700', textDecoration: 'none' }}>
                S'inscrire gratuitement
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
