import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';
import {
  Phone, Mail, Eye, EyeOff, AlertCircle,
  Check, ShoppingCart, Store, Truck, Lock, Loader, User,
  XCircle, CheckCircle,
} from 'lucide-react';

const GREEN = '#1a5c2a';
const BG    = '#f2ede4';

const ROLES = [
  { id: 'BUYER',       Icon: ShoppingCart, label: 'Acheteur',     desc: 'Achetez des céréales',          color: GREEN,     bg: '#f0fdf4' },
  { id: 'SELLER',      Icon: Store,        label: 'Vendeur',      desc: 'Vendez vos produits agricoles', color: '#b8860b', bg: '#fffdf0' },
  { id: 'TRANSPORTER', Icon: Truck,        label: 'Transporteur', desc: 'Proposez vos services',         color: '#d97706', bg: '#fffbeb' },
];

export default function Register() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [role,       setRole]       = useState('');
  const [nomComplet, setNomComplet] = useState('');
  const [phone,      setPhone]      = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [email,      setEmail]      = useState('');
  const [pwd,        setPwd]        = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [focused,    setFocused]    = useState('');

  const clearError = () => setError('');

  const handlePhoneChange = e => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    clearError();
    if (digits.length > 0 && digits.length < 10) setPhoneError('Le numéro doit contenir exactement 10 chiffres.');
    else setPhoneError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!role)           return setError('Choisissez votre rôle à gauche');
    if (!nomComplet.trim()) return setError('Le nom complet est requis');
    if (phone.length !== 10) return setError('Le numéro de téléphone doit contenir exactement 10 chiffres.');
    if (!email.trim())   return setError("L'adresse email est requise");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Adresse email invalide');
    if (!pwd.trim())     return setError('Le mot de passe est obligatoire');
    if (pwd.length < 8)  return setError('Mot de passe : 8 caractères minimum');
    if (pwd !== pwdConfirm) return setError('Les mots de passe ne correspondent pas');
    setLoading(true); clearError();
    try {
      const res = await AuthService.registerPhone({
        phone: phone.replace(/\s/g, ''), role,
        nom_complet: nomComplet.trim(), email: email.trim(), password: pwd,
      });
      const u = res.user;
      if (!u?.role) throw new Error('Données utilisateur invalides');
      updateUser(u);
      navigate(`/${u.role.toLowerCase()}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du compte");
    } finally { setLoading(false); }
  };

  const inp = name => ({
    width: '100%', padding: '0.82rem 1rem 0.82rem 2.6rem',
    border: `2px solid ${focused === name ? GREEN : '#e5e7eb'}`,
    borderRadius: '12px', fontSize: '0.93rem', outline: 'none',
    color: '#1a2e10', background: focused === name ? '#fafff9' : '#fafafa',
    transition: 'all 0.2s',
    boxShadow: focused === name ? `0 0 0 3px ${GREEN}12` : 'none',
    boxSizing: 'border-box',
  });

  const IL  = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' };
  const LB  = { display: 'block', fontSize: '0.87rem', fontWeight: '600', color: '#374151', marginBottom: '7px' };
  const FW  = { marginBottom: '1rem' };

  const btnPrimary = {
    width: '100%', padding: '0.88rem',
    background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`,
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '0.97rem', fontWeight: '700', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    boxShadow: '0 4px 20px rgba(26,92,42,0.26)',
  };

  const roleInfo = ROLES.find(r => r.id === role);

  // ── Layout deux panneaux : empilés sur mobile, côte à côte à partir de lg ──
  return (
    <div className="d-flex flex-column flex-lg-row" style={{ minHeight: '100vh' }}>
      <style>{`
        @media (min-width: 992px) {
          .register-left-panel { flex: 0 0 38%; }
        }
      `}</style>

      {/* ── Panneau gauche : sélecteur de rôle ── */}
      <div className="register-left-panel px-4 px-lg-5 py-4 py-lg-5" style={{ background: BG, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid #e5e7eb' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>

          <h2 style={{ fontSize: '1.7rem', fontWeight: '900', color: '#1a2e10', marginBottom: '0.35rem' }}>Créer un compte</h2>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.8rem' }}>
            Quel est votre rôle sur la plateforme ?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ROLES.map(({ id, Icon, label, desc, color, bg }) => (
              <motion.button key={id}
                onClick={() => { setRole(id); clearError(); }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '1rem 1.2rem',
                  border: `2px solid ${role === id ? color : '#e5e7eb'}`,
                  borderRadius: '16px',
                  background: role === id ? bg : 'white',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  boxShadow: role === id ? `0 0 0 3px ${color}22, 0 4px 16px ${color}18` : '0 1px 4px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1.5px solid ${color}30` }}>
                  <Icon size={22} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: '700', color: '#1a2e10', fontSize: '0.97rem' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>{desc}</p>
                </div>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${role === id ? color : '#d1d5db'}`,
                  background: role === id ? color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                }}>
                  {role === id && <Check size={12} color="white" strokeWidth={3} />}
                </div>
              </motion.button>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.87rem', color: '#9ca3af', margin: '1.6rem 0 0' }}>
            Déjà inscrit ?{' '}
            <Link to="/auth/login" style={{ color: GREEN, fontWeight: '700', textDecoration: 'none' }}>Connexion</Link>
          </p>

        </motion.div>
      </div>

      {/* ── Panneau droit : formulaire ── */}
      <div className="px-3 px-lg-5 py-4 py-lg-5" style={{ flex: 1, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>

          <AnimatePresence mode="wait">
            {!role ? (
              <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
                  <User size={36} color="#d1d5db" />
                </div>
                <p style={{ fontWeight: '700', color: '#9ca3af', fontSize: '1rem', marginBottom: '0.4rem' }}>Choisissez votre rôle</p>
                <p style={{ fontSize: '0.87rem', color: '#d1d5db' }}>Le formulaire d'inscription apparaîtra ici</p>
              </motion.div>
            ) : (
              <motion.form key={`form-${role}`}
                initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
              >
                {/* En-tête rôle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.8rem', paddingBottom: '1.2rem', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: roleInfo?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${roleInfo?.color}30`, flexShrink: 0 }}>
                    {roleInfo && <roleInfo.Icon size={22} color={roleInfo.color} />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#1a2e10' }}>
                      Inscription {roleInfo?.label}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b7280' }}>Remplissez vos informations</p>
                  </div>
                </div>

                {/* Erreur */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1.2rem', fontSize: '0.85rem', color: '#dc2626' }}>
                      <AlertCircle size={15} /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

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
                    <input type="text" inputMode="numeric" maxLength={10} value={phone}
                      onChange={handlePhoneChange}
                      onFocus={() => setFocused('tel')} onBlur={() => setFocused('')}
                      placeholder="Entrez un numéro de téléphone"
                      style={{ ...inp('tel'), borderColor: phoneError ? '#ef4444' : focused === 'tel' ? GREEN : '#e5e7eb' }} />
                  </div>
                  {phoneError
                    ? <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>{phoneError}</span>
                    : <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '3px', display: 'block' }}>{phone.length}/10 chiffres</span>
                  }
                </div>

                {/* Email */}
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

                {/* Confirmer mot de passe */}
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
                  {pwdConfirm && pwdConfirm === pwd && pwd.length > 0 && <span style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={13} /> Correspondent</span>}
                </div>

                {/* Bouton soumettre */}
                <motion.button type="submit" style={{ ...btnPrimary, marginTop: '0.4rem', opacity: loading ? 0.75 : 1 }}
                  disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                  {loading
                    ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div> Création du compte…</>
                    : <><Check size={15} /> S'inscrire</>
                  }
                </motion.button>

              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
