import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthService from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import {
  Eye, EyeOff, AlertCircle, Loader,
  User, Mail, Phone, Lock, MapPin, Building,
  ChevronRight, ChevronLeft, Check, X, ShoppingCart,
  Truck, Store, ArrowLeft,
} from 'lucide-react';
import logo from '../../assets/images/logo.jpeg';

// ===== VILLES =====
const villes = [
  'Cotonou','Porto-Novo','Parakou','Abomey-Calavi','Djougou',
  'Bohicon','Kandi','Lokossa','Ouidah','Natitingou',
  'Abomey','Nikki','Banikoara','Malanville','Savè','Bembèrèkè','Kalalé',
];

const etapes = ['Rôle', 'Infos personnelles', 'Sécurité', 'Confirmation'];

const normalizeRole = (role) => ({ ACHETEUR: 'BUYER', VENDEUR: 'SELLER', TRANSPORTEUR: 'TRANSPORTER' }[role] || role || '');

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1, transition: { duration: 0.4 } },
};

const roles = [
  { id: 'BUYER',       icon: ShoppingCart, titre: 'Acheteur',    desc: 'Achetez des céréales directement auprès des producteurs', color: '#2563eb', bg: '#eff6ff' },
  { id: 'SELLER',      icon: Store,        titre: 'Vendeur',     desc: "Vendez vos céréales à des milliers d'acheteurs au Bénin", color: '#1a5c2a', bg: '#f0fdf4' },
  { id: 'TRANSPORTER', icon: Truck,        titre: 'Transporteur', desc: 'Proposez vos services de transport agricole',            color: '#d97706', bg: '#fffbeb' },
];

// ===== COMPOSANT FIELD =====
function Field({ icon, label, name, value, onChange, placeholder, type = 'text', error }) {
  return (
    <div style={S.fieldWrap}>
      <label style={S.label}>{label}</label>
      <div style={S.inputWrap}>
        <span style={S.fieldIcon}>{icon}</span>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ ...S.input, paddingLeft: '2.5rem', borderColor: error ? '#ef4444' : '#e5e7eb' }}
        />
      </div>
      {error && <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '4px' }}>{error}</span>}
    </div>
  );
}

// ===== COMPOSANT PRINCIPAL =====
export default function Register() {
  const [searchParams]        = useSearchParams();
  const navigate              = useNavigate();
  const { updateUser }        = useAuth();
  const initialRole           = normalizeRole(searchParams.get('role'));
  const [etape, setEtape]     = useState(initialRole ? 1 : 0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cipError, setCipError]   = useState('');

  const [form, setForm] = useState({
    role: initialRole, prenom: '', nom: '', email: '', telephone: '',
    cip: '', ville: '', association: '', password: '', confirm: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
    if (name === 'cip') {
      if (!/^\d*$/.test(value))                                   setCipError('Le CIP ne doit contenir que des chiffres.');
      else if (value.length > 0 && (value.length < 8 || value.length > 12)) setCipError('Le CIP doit contenir entre 8 et 12 chiffres.');
      else                                                        setCipError('');
    }
  };

  const validerEtape = () => {
    if (etape === 0 && !form.role) { setError('Veuillez choisir un rôle.'); return false; }
    if (etape === 1) {
      if (!form.prenom || !form.nom || !form.email || !form.telephone || !form.cip) {
        setError('Veuillez remplir tous les champs obligatoires.'); return false;
      }
      if (cipError)                                     { setError(cipError); return false; }
      if (form.role === 'SELLER' && (!form.ville || !form.association)) {
        setError('Veuillez remplir les champs vendeur.'); return false;
      }
    }
    if (etape === 2) {
      if (!form.password || !form.confirm)              { setError('Veuillez remplir les champs mot de passe.'); return false; }
      if (form.password.length < 8)                    { setError('Le mot de passe doit contenir au moins 8 caractères.'); return false; }
      if (form.password !== form.confirm)              { setError('Les mots de passe ne correspondent pas.'); return false; }
    }
    setError('');
    return true;
  };

  const suivant   = () => { if (validerEtape()) setEtape((p) => p + 1); };
  const precedent = () => { setError(''); setEtape((p) => p - 1); };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validerEtape()) return;
    try {
      setLoading(true);
      setError('');
      const data = await AuthService.inscription({
        email: form.email, telephone: form.telephone, prenom: form.prenom,
        nom: form.nom, cip: form.cip, role: form.role,
        ville: form.ville, adresse: form.ville,
        association: form.association, password: form.password,
        password_confirm: form.confirm,
      });
      localStorage.setItem('access_token',  data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      localStorage.setItem('user',          JSON.stringify(data.user));
      updateUser(data.user);
      const dest = form.role === 'BUYER' ? '/buyer/dashboard'
                 : form.role === 'SELLER' ? '/seller/dashboard'
                 : form.role === 'TRANSPORTER' ? '/transporter/dashboard' : '/';
      navigate(dest, { replace: true });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      setError(apiErrors ? Object.values(apiErrors).flat().join(' ') : err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>


      {/* ── CARTE ── */}
      <div style={S.cardWrap} className="container">
        <motion.div
          style={S.card}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          transition={{ duration: 0.4 }}
        >

          {/* Bouton retour */}
          <motion.button
            onClick={() => navigate(-1)}
            style={{ position: 'absolute', top: '1.2rem', left: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px', background: '#f4f4f2', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', color: '#374151' }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <ArrowLeft size={15} color="#374151" />
            Retour
          </motion.button>

          {/* Logo */}
          <div style={S.logoWrap}>
            <img src={logo} alt="AgroSaaNuu" style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '10px' }} />
            <span style={S.logoText}>Agro<span style={{ color: '#f0c040' }}>SaaNuu</span></span>
          </div>

          <h2 style={S.title}>Créer un compte</h2>
          <p style={S.subtitle}>Rejoignez la plateforme agricole du Bénin</p>

          {/* ── STEPPER ── */}
          <div style={S.stepper} className="mb-4">
            {etapes.map((label, i) => (
              <div key={i} style={S.stepItem}>
                <motion.div
                  style={{
                    ...S.stepCircle,
                    background: i < etape ? '#1a5c2a' : i === etape ? '#f0c040' : '#e5e7eb',
                    color:      i < etape ? 'white'   : i === etape ? '#1a2e10' : '#9ca3af',
                  }}
                  animate={{ scale: i === etape ? 1.15 : 1 }}
                >
                  {i < etape ? <Check size={14} /> : <span style={{ fontSize: '12px', fontWeight: '700' }}>{i + 1}</span>}
                </motion.div>
                <span style={{ ...S.stepLabel, color: i === etape ? '#1a2e10' : '#9ca3af', fontWeight: i === etape ? '700' : '400' }}>
                  {label}
                </span>
                {i < etapes.length - 1 && (
                  <div style={{ ...S.stepLine, background: i < etape ? '#1a5c2a' : '#e5e7eb' }} />
                )}
              </div>
            ))}
          </div>

          {/* ── ERREUR ── */}
          <AnimatePresence>
            {error && (
              <motion.div style={S.errorBox} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── ÉTAPES ── */}
          <AnimatePresence mode="wait">

            {/* ÉTAPE 0 — RÔLE */}
            {etape === 0 && (
              <motion.div key="etape0" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }}>
                <p style={S.stepTitle}>Quel est votre rôle ?</p>
                <div className="row g-3">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    return (
                      <div key={r.id} className="col-12 col-md-4">
                        <motion.div
                          style={{ ...S.roleCard, background: form.role === r.id ? r.bg : 'white', borderColor: form.role === r.id ? r.color : '#e5e7eb', boxShadow: form.role === r.id ? `0 0 0 3px ${r.color}40, 0 8px 24px ${r.color}25` : 'none' }}
                          onClick={() => { setForm({ ...form, role: r.id }); setError(''); setEtape(1); }}
                          whileHover={{
                            y: -6,
                            borderColor: r.color,
                            boxShadow: `0 0 0 3px ${r.color}35, 0 0 28px ${r.color}30, 0 8px 32px rgba(0,0,0,0.10)`,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <div style={{ ...S.roleIcon, background: r.bg }}>
                            <Icon size={32} color={r.color} />
                          </div>
                          <h3 style={{ ...S.roleTitle, color: r.color }}>{r.titre}</h3>
                          <p style={S.roleDesc}>{r.desc}</p>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 1 — INFOS PERSONNELLES */}
            {etape === 1 && (
              <motion.div key="etape1" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }}>
                <p style={S.stepTitle}>Vos informations personnelles</p>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <Field icon={<User size={16} color="#9ca3af" />} label="Prénom *" name="prenom" value={form.prenom} onChange={handleChange} placeholder="Votre prénom" />
                  </div>
                  <div className="col-12 col-md-6">
                    <Field icon={<User size={16} color="#9ca3af" />} label="Nom *" name="nom" value={form.nom} onChange={handleChange} placeholder="Votre nom" />
                  </div>
                  <div className="col-12 col-md-6">
                    <Field icon={<Mail size={16} color="#9ca3af" />} label="Email *" name="email" type="email" value={form.email} onChange={handleChange} placeholder="votre@email.com" />
                  </div>
                  <div className="col-12 col-md-6">
                    <Field icon={<Phone size={16} color="#9ca3af" />} label="Téléphone *" name="telephone" value={form.telephone} onChange={handleChange} placeholder="+229 XX XX XX XX" />
                  </div>
                  <div className="col-12">
                    <Field icon={<User size={16} color="#9ca3af" />} label="Numéro CIP *" name="cip" value={form.cip} onChange={handleChange} placeholder="8 à 12 chiffres" error={cipError} />
                  </div>
                  {form.role === 'SELLER' && (
                    <>
                      <div className="col-12 col-md-6">
                        <Field icon={<Building size={16} color="#9ca3af" />} label="Nom de l'association *" name="association" value={form.association} onChange={handleChange} placeholder="Nom de votre coopérative" />
                      </div>
                      <div className="col-12 col-md-6">
                        <div style={S.fieldWrap}>
                          <label style={S.label}><MapPin size={14} /> Ville *</label>
                          <select name="ville" value={form.ville} onChange={handleChange} style={S.select}>
                            <option value="">Sélectionnez une ville</option>
                            {villes.map((v) => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 2 — MOT DE PASSE */}
            {etape === 2 && (
              <motion.div key="etape2" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }}>
                <p style={S.stepTitle}>Sécurisez votre compte</p>
                <div className="row g-3">
                  <div className="col-12">
                    <div style={S.fieldWrap}>
                      <label style={S.label}>Mot de passe *</label>
                      <div style={S.inputWrap}>
                        <Lock size={16} color="#9ca3af" style={S.fieldIcon} />
                        <input
                          type={showPwd ? 'text' : 'password'} name="password" value={form.password}
                          onChange={handleChange} placeholder="Minimum 8 caractères"
                          style={{ ...S.input, paddingLeft: '2.5rem', paddingRight: '3rem' }}
                        />
                        <button type="button" onClick={() => setShowPwd(!showPwd)} style={S.eyeBtn}>
                          {showPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                        </button>
                      </div>
                      {form.password && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={S.strengthBar}>
                            {[1,2,3,4].map((n) => (
                              <div key={n} style={{ ...S.strengthSegment, background: form.password.length >= n * 2 ? (n <= 1 ? '#ef4444' : n <= 2 ? '#f97316' : n <= 3 ? '#eab308' : '#22c55e') : '#e5e7eb' }} />
                            ))}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {form.password.length < 4 ? '🔴 Très faible' : form.password.length < 6 ? '🟠 Faible' : form.password.length < 8 ? '🟡 Moyen' : '🟢 Fort'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div style={S.fieldWrap}>
                      <label style={S.label}>Confirmer le mot de passe *</label>
                      <div style={S.inputWrap}>
                        <Lock size={16} color="#9ca3af" style={S.fieldIcon} />
                        <input
                          type={showConfirm ? 'text' : 'password'} name="confirm" value={form.confirm}
                          onChange={handleChange} placeholder="Répétez le mot de passe"
                          style={{ ...S.input, paddingLeft: '2.5rem', paddingRight: '3rem', borderColor: form.confirm && form.confirm !== form.password ? '#ef4444' : '#e5e7eb' }}
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={S.eyeBtn}>
                          {showConfirm ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                        </button>
                      </div>
                      {form.confirm && form.confirm !== form.password && <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '4px' }}>❌ Les mots de passe ne correspondent pas</span>}
                      {form.confirm && form.confirm === form.password && <span style={{ fontSize: '0.78rem', color: '#22c55e', marginTop: '4px' }}>✅ Les mots de passe correspondent</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 3 — CONFIRMATION */}
            {etape === 3 && (
              <motion.div key="etape3" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }}>
                <div style={S.confirmWrap}>
                  <motion.div style={S.confirmIcon} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}>
                    <Check size={40} color="white" />
                  </motion.div>
                  <h3 style={S.confirmTitle}>Tout est prêt !</h3>
                  <p style={S.confirmDesc}>Vérifiez vos informations avant de valider.</p>
                  <div style={S.recap} className="text-start">
                    {[
                      { label: 'Rôle',      value: form.role  },
                      { label: 'Prénom',    value: form.prenom },
                      { label: 'Nom',       value: form.nom    },
                      { label: 'Email',     value: form.email  },
                      { label: 'Téléphone', value: form.telephone },
                      { label: 'CIP',       value: form.cip    },
                      form.role === 'SELLER' && { label: 'Association', value: form.association },
                      form.role === 'SELLER' && { label: 'Ville',       value: form.ville       },
                    ].filter(Boolean).map((item, i) => (
                      <div key={i} style={S.recapRow}>
                        <span style={S.recapLabel}>{item.label}</span>
                        <span style={S.recapValue}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* ── NAVIGATION ── */}
          <div style={S.navBtns} className="mt-4">
            {etape > 0 && (
              <motion.button type="button" onClick={precedent} style={S.btnPrecedent} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <ChevronLeft size={18} /> Précédent
              </motion.button>
            )}
            {etape > 0 && etape < etapes.length - 1 ? (
              <motion.button type="button" onClick={suivant} style={S.btnSuivant} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                Suivant <ChevronRight size={18} />
              </motion.button>
            ) : etape === etapes.length - 1 ? (
              <motion.button type="button" onClick={handleSubmit} style={{ ...S.btnSuivant, background: '#1a5c2a' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} disabled={loading}>
                {loading
                  ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader size={18} /></motion.div>
                  : <><Check size={18} /> Créer mon compte</>
                }
              </motion.button>
            ) : null}
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.87rem', color: '#6b7280', marginTop: '1.2rem', marginBottom: 0 }}>
            Déjà un compte ?{' '}
            <Link to="/auth/login" style={{ ...S.loginLink, whiteSpace: 'nowrap' }}>
              Se connecter
            </Link>
          </p>

        </motion.div>
      </div>

    </div>
  );
}

// ===== STYLES =====
const S = {
  page:    { minHeight: '100vh', background: '#d6d1c4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' },
  bgScene: {},

  cardWrap: { width: '100%', maxWidth: '680px', padding: '1rem' },
  card:     { background: 'white', borderRadius: '20px', padding: '2.2rem 2rem', boxShadow: '0 2px 24px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', position: 'relative' },
  closeBtn: { position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center' },

  logoWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '0.8rem' },
  logoIcon: { background: '#f0c040', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: '1.5rem', fontWeight: '900', color: '#1a2e10', letterSpacing: '-0.03em' },

  title:    { textAlign: 'center', fontSize: '1.5rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.2rem' },
  subtitle: { textAlign: 'center', fontSize: '0.87rem', color: '#6b7280', marginBottom: '1.2rem' },

  stepper:    { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stepItem:   { display: 'flex', alignItems: 'center', gap: '6px' },
  stepCircle: { width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s' },
  stepLabel:  { fontSize: '0.75rem', whiteSpace: 'nowrap', transition: 'all 0.3s' },
  stepLine:   { width: '30px', height: '2px', transition: 'background 0.3s' },

  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#dc2626' },

  stepTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#374151', marginBottom: '1rem', textAlign: 'center' },

  roleCard:  { border: '2px solid #e5e7eb', borderRadius: '16px', padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', height: '100%' },
  roleIcon:  { width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' },
  roleTitle: { fontSize: '1rem', fontWeight: '700', marginBottom: '0.4rem' },
  roleDesc:  { fontSize: '0.78rem', color: '#6b7280', margin: 0, lineHeight: 1.4 },

  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label:     { fontSize: '0.85rem', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '5px' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  fieldIcon: { position: 'absolute', left: '12px', pointerEvents: 'none', display: 'flex' },
  input:     { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa' },
  select:    { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', cursor: 'pointer' },
  eyeBtn:    { position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' },

  strengthBar:     { display: 'flex', gap: '4px', marginBottom: '4px' },
  strengthSegment: { flex: 1, height: '4px', borderRadius: '4px', transition: 'background 0.3s' },

  confirmWrap:  { textAlign: 'center' },
  confirmIcon:  { width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a5c2a, #4db86a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' },
  confirmTitle: { fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.5rem' },
  confirmDesc:  { fontSize: '0.88rem', color: '#6b7280', marginBottom: '1.2rem' },
  recap:        { background: '#f9fafb', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb' },
  recapRow:     { display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6' },
  recapLabel:   { fontSize: '0.82rem', color: '#6b7280', fontWeight: '500' },
  recapValue:   { fontSize: '0.82rem', color: '#1a2e10', fontWeight: '700' },

  navBtns:      { display: 'flex', gap: '12px', justifyContent: 'center' },
  btnPrecedent: { display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '0.75rem 1.5rem', fontSize: '0.92rem', fontWeight: '600', color: '#374151', cursor: 'pointer' },
  btnSuivant:   { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0c040', border: 'none', borderRadius: '12px', padding: '0.75rem 1.8rem', fontSize: '0.92rem', fontWeight: '700', color: '#1a2e10', cursor: 'pointer', boxShadow: '0 4px 16px rgba(240,192,64,0.4)' },

  loginLink: { color: '#2563eb', fontWeight: '700', textDecoration: 'none' },
};
