import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';
import {
  Phone, Mail, Eye, EyeOff, AlertCircle,
  Check, ShoppingCart, Store, Truck, Lock, Loader, User,
  XCircle, CheckCircle, ArrowLeft,
} from 'lucide-react';
import logo from '../../assets/images/logo.jpeg';

const GREEN  = '#1a5c2a';
const GOLD   = '#f0c040';
const BG     = '#f2ede4';

const ROLES = [
  { id: 'BUYER',       Icon: ShoppingCart, label: 'Acheteur',     color: GREEN,     bg: '#f0fdf4', desc: 'Achetez des céréales directement auprès des producteurs'   },
  { id: 'SELLER',      Icon: Store,        label: 'Vendeur',      color: '#b8860b', bg: '#fffdf0', desc: "Vendez vos céréales à des milliers d'acheteurs au Bénin"    },
  { id: 'TRANSPORTER', Icon: Truck,        label: 'Transporteur', color: '#d97706', bg: '#fffbeb', desc: 'Proposez vos services de transport agricole'                 },
];

const STEPS = [
  { n: 1, label: 'Rôle'              },
  { n: 2, label: 'Infos personnelles'},
  { n: 3, label: 'Sécurité'          },
  { n: 4, label: 'Confirmation'      },
];

const slide = {
  initial: { x: 24, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.25 } },
  exit:    { x: -24, opacity: 0, transition: { duration: 0.18 } },
};

// ── Indicateur d'étapes ──────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1.6rem 0 2rem' }}>
      {STEPS.map((s, i) => {
        const done   = current > s.n;
        const active = current === s.n;
        return (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width:           '32px', height: '32px', borderRadius: '50%',
                background:      done ? GREEN : active ? GOLD : '#e5e7eb',
                color:           done || active ? (active ? '#1a2e10' : 'white') : '#9ca3af',
                display:         'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight:      '800', fontSize: '0.82rem',
                transition:      'all 0.3s',
                boxShadow:       active ? `0 0 0 4px ${GOLD}44` : 'none',
              }}>
                {done ? <Check size={14} strokeWidth={3} /> : s.n}
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: active ? '700' : '500', color: active ? '#1a2e10' : '#9ca3af', whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: '48px', height: '2px', background: current > s.n ? GREEN : '#e5e7eb', margin: '0 4px 18px', transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [step,       setStep]       = useState(1);
  const [role,       setRole]       = useState('');
  const [nomComplet, setNomComplet] = useState('');
  const [phone,      setPhone]      = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [email,      setEmail]      = useState('');
  const [pwd,        setPwd]        = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [otp,        setOtp]        = useState(Array(6).fill(''));
  const [timer,      setTimer]      = useState(0);
  const [devOtp,     setDevOtp]     = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [focused,    setFocused]    = useState('');

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const fmtTimer   = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const clearError = () => setError('');

  const handlePhoneChange = e => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    clearError();
    if (digits.length > 0 && digits.length < 10) setPhoneError('Le numéro doit contenir exactement 10 chiffres.');
    else setPhoneError('');
  };

  const handleBack = () => {
    clearError();
    if (step === 1) navigate(-1);
    else setStep(s => s - 1);
  };

  // Étape 2 → 3
  const handleNextInfos = e => {
    e.preventDefault();
    if (!nomComplet.trim())  return setError('Le nom complet est requis');
    if (phone.length !== 10) return setError('Le numéro doit contenir exactement 10 chiffres');
    if (!email.trim())       return setError("L'adresse email est requise");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Adresse email invalide');
    clearError();
    setStep(3);
  };

  // Étape 3 → 4 : envoi OTP
  const handleNextSecurite = async e => {
    e.preventDefault();
    if (!pwd.trim())        return setError('Le mot de passe est obligatoire');
    if (pwd.length < 8)     return setError('Mot de passe : 8 caractères minimum');
    if (pwd !== pwdConfirm) return setError('Les mots de passe ne correspondent pas');
    setLoading(true); clearError();
    try {
      const cleaned = phone.replace(/\s/g, '');
      const res = await AuthService.requestOTP(cleaned);
      if (res.existing) return setError('Ce numéro est déjà enregistré. Connectez-vous.');
      setTimer(300);
      if (res.code_dev) { setDevOtp(res.code_dev); setOtp(res.code_dev.split('')); }
      else              { setDevOtp(''); setOtp(Array(6).fill('')); }
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi du SMS");
    } finally { setLoading(false); }
  };

  // Étape 4 : vérification OTP
  const handleVerifyOTP = async e => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return setError('Entrez les 6 chiffres');
    setLoading(true); clearError();
    try {
      const res = await AuthService.verifyOTPAndRegister({
        phone: phone.replace(/\s/g, ''), code, role,
        nom_complet: nomComplet.trim(), email: email.trim(), password: pwd,
      });
      const u = res.user;
      if (!u?.role) throw new Error('Données utilisateur invalides');
      updateUser(u);
      navigate(`/${u.role.toLowerCase()}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide ou expiré');
      if (err.response?.data?.message?.includes('expiré')) setStep(1);
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    clearError();
    try {
      const res = await AuthService.resendOTP(phone.replace(/\s/g, ''));
      setTimer(300);
      if (res.code_dev) { setDevOtp(res.code_dev); setOtp(res.code_dev.split('')); }
      else              { setDevOtp(''); setOtp(Array(6).fill('')); }
    } catch { setError('Impossible de renvoyer le code'); }
  };

  const inp = name => ({
    width: '100%', padding: '0.82rem 1rem 0.82rem 2.6rem',
    border: `2px solid ${focused === name ? GREEN : '#e5e7eb'}`,
    borderRadius: '12px', fontSize: '0.93rem', outline: 'none',
    color: '#1a2e10', background: focused === name ? '#fafff9' : 'white',
    transition: 'all 0.2s',
    boxShadow: focused === name ? `0 0 0 3px ${GREEN}12` : 'none',
    boxSizing: 'border-box',
  });

  const IL = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' };
  const LB = { display: 'block', fontSize: '0.87rem', fontWeight: '600', color: '#374151', marginBottom: '7px' };
  const FW = { marginBottom: '1rem' };

  const roleInfo = ROLES.find(r => r.id === role);

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ width: '100%', maxWidth: '680px', background: 'white', borderRadius: '24px', padding: '2.5rem 2.5rem 2rem', boxShadow: '0 8px 48px rgba(0,0,0,0.10)', border: '1px solid #f0f0f0', position: 'relative' }}
      >

        {/* Bouton retour */}
        <button
          onClick={handleBack}
          style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px', background: '#f3f4f6', border: 'none', borderRadius: '20px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.87rem', fontWeight: '600', color: '#374151' }}
        >
          <ArrowLeft size={15} /> Retour
        </button>

        {/* Logo + Titre */}
        <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
          <img src={logo} alt="logo" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: `2px solid ${GREEN}30`, marginBottom: '0.7rem' }} />
          <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#1a2e10', lineHeight: 1.2 }}>
            Agro<span style={{ color: GREEN }}>SaaNuu</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1a2e10', margin: '1rem 0 0.3rem' }}>Créer un compte</h2>
          <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: 0 }}>Rejoignez la plateforme agricole du Bénin</p>
        </div>

        {/* Stepper */}
        <StepIndicator current={step} />

        {/* Message d'erreur */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.2rem', fontSize: '0.85rem', color: '#dc2626' }}>
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenu des étapes */}
        <AnimatePresence mode="wait">

          {/* ── Étape 1 : Rôle ── */}
          {step === 1 && (
            <motion.div key="step1" {...slide}>
              <p style={{ textAlign: 'center', fontWeight: '700', fontSize: '1rem', color: '#1a2e10', marginBottom: '1.2rem' }}>
                Quel est votre rôle ?
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '1.6rem' }}>
                {ROLES.map(({ id, Icon, label, color, bg, desc }) => (
                  <motion.button
                    key={id}
                    onClick={() => { setRole(id); clearError(); }}
                    whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                      padding: '1.4rem 1rem', border: `2px solid ${role === id ? color : '#e5e7eb'}`,
                      borderRadius: '18px', background: role === id ? bg : 'white',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                      boxShadow: role === id ? `0 0 0 3px ${color}22, 0 6px 20px ${color}18` : '0 1px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${color}30` }}>
                      <Icon size={26} color={color} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '800', color: role === id ? color : '#1a2e10', fontSize: '0.97rem' }}>{label}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.4 }}>{desc}</p>
                    </div>
                    {role === id && (
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={12} color="white" strokeWidth={3} />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
              <motion.button
                onClick={() => { if (!role) return setError('Choisissez votre rôle'); clearError(); setStep(2); }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ width: '100%', padding: '0.9rem', background: role ? `linear-gradient(135deg, ${GREEN}, #2d8c47)` : '#e5e7eb', color: role ? 'white' : '#9ca3af', border: 'none', borderRadius: '14px', fontSize: '0.97rem', fontWeight: '700', cursor: role ? 'pointer' : 'default', transition: 'all 0.2s' }}
              >
                Continuer
              </motion.button>
            </motion.div>
          )}

          {/* ── Étape 2 : Infos personnelles ── */}
          {step === 2 && (
            <motion.form key="step2" {...slide} onSubmit={handleNextInfos}>
              {/* Rôle sélectionné */}
              {roleInfo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: roleInfo.bg, border: `1.5px solid ${roleInfo.color}30`, borderRadius: '12px', padding: '0.7rem 1rem', marginBottom: '1.4rem' }}>
                  <roleInfo.Icon size={18} color={roleInfo.color} />
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: roleInfo.color }}>Inscription {roleInfo.label}</span>
                </div>
              )}
              <div style={FW}>
                <label style={LB}>Nom complet *</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="#9ca3af" style={IL} />
                  <input type="text" value={nomComplet} onChange={e => { setNomComplet(e.target.value); clearError(); }}
                    onFocus={() => setFocused('nom')} onBlur={() => setFocused('')}
                    placeholder="Prénom et Nom" style={inp('nom')} />
                </div>
              </div>
              <div style={FW}>
                <label style={LB}>Numéro de téléphone *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} color="#9ca3af" style={IL} />
                  <input type="text" inputMode="numeric" maxLength={10} value={phone}
                    onChange={handlePhoneChange}
                    onFocus={() => setFocused('tel')} onBlur={() => setFocused('')}
                    placeholder="Entrez votre numéro"
                    style={{ ...inp('tel'), borderColor: phoneError ? '#ef4444' : focused === 'tel' ? GREEN : '#e5e7eb' }} />
                </div>
                {phoneError
                  ? <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>{phoneError}</span>
                  : <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '3px', display: 'block' }}>{phone.length}/10 chiffres</span>
                }
              </div>
              <div style={FW}>
                <label style={LB}>Adresse email *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="#9ca3af" style={IL} />
                  <input type="email" value={email}
                    onChange={e => { setEmail(e.target.value); clearError(); }}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    placeholder="votre@email.com" style={inp('email')} autoComplete="email" />
                </div>
                {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={13} /> Format invalide</span>
                )}
                {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={13} /> Email valide</span>
                )}
              </div>
              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ width: '100%', padding: '0.9rem', background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '14px', fontSize: '0.97rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 20px rgba(26,92,42,0.24)' }}>
                Continuer
              </motion.button>
            </motion.form>
          )}

          {/* ── Étape 3 : Sécurité ── */}
          {step === 3 && (
            <motion.form key="step3" {...slide} onSubmit={handleNextSecurite}>
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
                {pwd && pwd.length < 8 && (
                  <span style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '3px', display: 'block' }}>Minimum 8 caractères ({pwd.length}/8)</span>
                )}
              </div>
              <div style={FW}>
                <label style={LB}>Confirmer le mot de passe *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#9ca3af" style={IL} />
                  <input type={showPwd ? 'text' : 'password'} value={pwdConfirm}
                    onChange={e => { setPwdConfirm(e.target.value); clearError(); }}
                    onFocus={() => setFocused('pwdc')} onBlur={() => setFocused('')}
                    placeholder="Répétez le mot de passe"
                    style={{ ...inp('pwdc'), borderColor: pwdConfirm && pwdConfirm !== pwd ? '#ef4444' : focused === 'pwdc' ? GREEN : '#e5e7eb' }} />
                </div>
                {pwdConfirm && pwdConfirm !== pwd && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={13} /> Ne correspondent pas</span>}
                {pwdConfirm && pwdConfirm === pwd && pwd.length >= 8 && <span style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={13} /> Correspondent</span>}
              </div>
              <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                style={{ width: '100%', padding: '0.9rem', background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '14px', fontSize: '0.97rem', fontWeight: '700', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(26,92,42,0.24)' }}>
                {loading
                  ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div> Envoi du code SMS…</>
                  : <><Check size={15} /> Recevoir le code SMS</>
                }
              </motion.button>
            </motion.form>
          )}

          {/* ── Étape 4 : Confirmation OTP ── */}
          {step === 4 && (
            <motion.form key="step4" {...slide} onSubmit={handleVerifyOTP}>
              <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f0fdf4', border: `2px solid ${GREEN}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' }}>
                  <Phone size={24} color={GREEN} />
                </div>
                <p style={{ fontSize: '0.9rem', color: '#374151', margin: 0 }}>
                  Code envoyé au <strong style={{ color: '#1a2e10' }}>{phone}</strong>
                </p>
              </div>

              {devOtp && (
                <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: '10px', padding: '0.6rem 1rem', marginBottom: '1rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#92400e', display: 'block', marginBottom: '2px' }}>Code (serveur local)</span>
                  <strong style={{ fontSize: '1.3rem', letterSpacing: '0.2em', color: '#713f12' }}>{devOtp}</strong>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '1.2rem' }}>
                {otp.map((d, i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength="1" value={d}
                    onChange={e => {
                      if (!/^\d?$/.test(e.target.value)) return;
                      const next = [...otp]; next[i] = e.target.value; setOtp(next);
                      if (e.target.value && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
                    }}
                    onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`otp-${i - 1}`)?.focus(); }}
                    autoFocus={i === 0}
                    style={{ width: '52px', height: '58px', fontSize: '1.5rem', fontWeight: '800', textAlign: 'center', border: `2px solid ${d ? GREEN : '#e5e7eb'}`, borderRadius: '12px', outline: 'none', color: '#1a2e10', background: d ? '#f0fdf4' : '#fafafa', transition: 'all 0.15s' }}
                  />
                ))}
              </div>

              <div style={{ textAlign: 'center', marginBottom: '1.2rem', minHeight: '22px' }}>
                {timer > 0
                  ? <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Expire dans <strong style={{ color: GREEN }}>{fmtTimer(timer)}</strong></span>
                  : <button type="button" onClick={handleResend} style={{ background: 'none', border: 'none', color: GREEN, cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', textDecoration: 'underline' }}>Renvoyer le code</button>
                }
              </div>

              <motion.button type="submit" disabled={loading || otp.join('').length !== 6}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ width: '100%', padding: '0.9rem', background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '14px', fontSize: '0.97rem', fontWeight: '700', cursor: (loading || otp.join('').length !== 6) ? 'default' : 'pointer', opacity: (loading || otp.join('').length !== 6) ? 0.65 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(26,92,42,0.24)' }}>
                {loading
                  ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div> Création du compte…</>
                  : <><Check size={15} /> Créer mon compte</>
                }
              </motion.button>
            </motion.form>
          )}

        </AnimatePresence>

        {/* Lien connexion */}
        <p style={{ textAlign: 'center', fontSize: '0.87rem', color: '#9ca3af', marginTop: '1.6rem', marginBottom: 0 }}>
          Déjà un compte ?{' '}
          <Link to="/auth/login" style={{ color: GREEN, fontWeight: '700', textDecoration: 'none' }}>Se connecter</Link>
        </p>

      </motion.div>
    </div>
  );
}
