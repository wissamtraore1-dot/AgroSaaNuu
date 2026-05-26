import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../../Components/layout/Footer';
import {
  Wheat, Eye, EyeOff, AlertCircle, Loader,
  User, Mail, Phone, Lock, MapPin, Building,
  ChevronRight, ChevronLeft, Check, X, ShoppingCart,
  Truck,
  Store,
  ShieldCheck,
} from 'lucide-react';

// ===== VILLES DU BÉNIN =====
const villes = [
  'Cotonou','Porto-Novo','Parakou','Abomey-Calavi','Djougou',
  'Bohicon','Kandi','Lokossa','Ouidah','Natitingou',
  'Abomey','Nikki','Banikoara','Malanville','Savè','Gogounou',"N'Dali",'Nikki','Bembèrèkè','Kalalé','Sinandé','Tcchaourou','Glazoué','Dassa-Zoumé','Bantè','Savalou','kétou',
];

// ===== ÉTAPES =====
const etapes = ['Rôle', 'Infos personnelles', 'Sécurité', 'Confirmation'];

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1, transition: { duration: 0.4 } },
};

export default function Register() {
  const [searchParams]        = useSearchParams();
  const navigate              = useNavigate();
  const [etape, setEtape]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    role:        searchParams.get('role') || '',
    prenom:      '',
    nom:         '',
    email:       '',
    telephone:   '',
    cip:         '',
    ville:       '',
    association: '',
    password:    '',
    confirm:     '',
    verificationMethod: 'email',
  });

  const [cipError, setCipError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');

    if (name === 'cip') {
      if (!/^\d*$/.test(value)) {
        setCipError('Le CIP ne doit contenir que des chiffres.');
      } else if (value.length > 0 && (value.length < 8 || value.length > 12)) {
        setCipError('Le CIP doit contenir entre 8 et 12 chiffres.');
      } else {
        setCipError('');
      }
    }
  };

  const validerEtape = () => {
    if (etape === 0 && !form.role) {
      setError('Veuillez choisir un rôle.');
      return false;
    }
    if (etape === 1) {
      if (!form.prenom || !form.nom || !form.email || !form.telephone || !form.cip) {
        setError('Veuillez remplir tous les champs obligatoires.');
        return false;
      }
      if (cipError) { setError(cipError); return false; }
      if (form.role === 'VENDEUR' && (!form.ville || !form.association)) {
        setError('Veuillez remplir les champs vendeur.');
        return false;
      }
    }
    if (etape === 2) {
      if (!form.password || !form.confirm) {
        setError('Veuillez remplir les champs mot de passe.');
        return false;
      }
      if (form.password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères.');
        return false;
      }
      if (form.password !== form.confirm) {
        setError('Les mots de passe ne correspondent pas.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const suivant = () => {
    if (validerEtape()) setEtape((p) => p + 1);
  };

  const precedent = () => {
    setError('');
    setEtape((p) => p - 1);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validerEtape()) return;

  try {
    setLoading(true);
    setError('');

    // ===== SIMULATION REGISTER =====
    // Remplace ceci plus tard par ton API Django
    const fakeUser = {
      prenom: form.prenom,
      nom: form.nom,
      email: form.email,
      role: form.role,
    };

    // Sauvegarde utilisateur
    localStorage.setItem('user', JSON.stringify(fakeUser));

    // ===== REDIRECTION PAR ROLE =====
    switch (form.role) {

      case 'ACHETEUR':
        navigate('/buyer');
        break;

      case 'VENDEUR':
        navigate('/seller');
        break;

      case 'TRANSPORTEUR':
        navigate('/transporter');
        break;

      default:
        navigate('/');
    }

  } catch (err) {
    console.error(err);
    setError("Une erreur est survenue.");
  } finally {
    setLoading(false);
  }
};

  const roles = [
    {
      id: 'ACHETEUR',
      icon: ShoppingCart,
      titre: 'Acheteur',
      desc: 'Achetez des céréales directement auprès des producteurs',
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
    },
    {
      id: 'VENDEUR',
      icon: Store,
      titre: 'Vendeur',
      desc: 'Vendez vos céréales à des milliers d\'acheteurs au Bénin',
      color: '#1a5c2a',
      bg: '#f0fdf4',
      border: '#bbf7d0',
    },
    {
      id: 'TRANSPORTEUR',
      icon: Truck,
      titre: 'Transporteur',
      desc: 'Proposez vos services de transport agricole',
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
    },
  ];

  return (
    <>
      <div style={styles.page}>
      {/* FOND */}
      <div style={styles.bgScene}>
        <div style={styles.sky} />
        <div style={styles.sun} />
        <div style={styles.hill1} />
        <div style={styles.hill2} />
        <div style={styles.field} />
        <div style={styles.star}>✦</div>
      </div>

      {/* CARTE */}
      <div style={styles.cardWrap} className="container">
        <motion.div
          style={styles.card}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >

          {/* BOUTON FERMER */}
          <motion.button
            style={styles.closeBtn}
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={18} color="#6b7280" />
          </motion.button>

          {/* LOGO */}
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}>
              <Wheat size={24} color="#1a5c2a" />
            </div>
            <span style={styles.logoText}>
              Agro<span style={{ color: '#f0c040' }}>SaaNuu</span>
            </span>
          </div>

          <h2 style={styles.title}>Créer un compte</h2>
          <p style={styles.subtitle}>Rejoignez la plateforme agricole du Bénin</p>

          {/* STEPPER */}
          <div style={styles.stepper} className="mb-4">
            {etapes.map((e, i) => (
              <div key={i} style={styles.stepItem}>
                {/* CERCLE */}
                <motion.div
                  style={{
                    ...styles.stepCircle,
                    background: i < etape ? '#1a5c2a'
                      : i === etape ? '#f0c040' : '#e5e7eb',
                    color: i <= etape ? (i < etape ? 'white' : '#1a2e10') : '#9ca3af',
                  }}
                  animate={{ scale: i === etape ? 1.15 : 1 }}
                >
                  {i < etape
                    ? <Check size={14} />
                    : <span style={{ fontSize: '12px', fontWeight: '700' }}>{i + 1}</span>
                  }
                </motion.div>

                {/* LABEL */}
                <span style={{
                  ...styles.stepLabel,
                  color: i === etape ? '#1a2e10' : '#9ca3af',
                  fontWeight: i === etape ? '700' : '400',
                }}>
                  {e}
                </span>

                {/* LIGNE */}
                {i < etapes.length - 1 && (
                  <div style={{
                    ...styles.stepLine,
                    background: i < etape ? '#1a5c2a' : '#e5e7eb',
                  }} />
                )}
              </div>
            ))}
          </div>

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

          {/* ========================
              ÉTAPE 0 — CHOIX DU RÔLE
          ======================== */}
          <AnimatePresence mode="wait">

            {etape === 0 && (
              <motion.div
                key="etape0"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -20 }}
              >
                <p style={styles.stepTitle}>Quel est votre rôle ?</p>
                <div className="row g-3">
                     {roles.map((r) => {
                        const Icon = r.icon;
      
                        return (
                          <div
                            key={r.id}
                            className="col-12 col-md-4"
                          >
                            <motion.div
                              style={{
                                ...styles.roleCard,
                                background:
                                  form.role === r.id
                                    ? r.bg
                                    : 'white',
                                borderColor:
                                  form.role === r.id
                                    ? r.color
                                    : '#e5e7eb',
                              }}
                              onClick={() =>
                                setForm({
                                  ...form,
                                  role: r.id,
                                })
                              }
                              whileHover={{
                                y: -4,
                              }}
                            >
                              <div
                                style={{
                                  ...styles.roleIcon,
                                  background: r.bg,
                                }}
                              >
                                <Icon
                                  size={32}
                                  color={r.color}
                                />
                              </div>
      
                              <h3
                                style={{
                                  ...styles.roleTitle,
                                  color: r.color,
                                }}
                              >
                                {r.titre}
                              </h3>
      
                              <p style={styles.roleDesc}>
                                {r.desc}
                              </p>
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
            {/* ========================
                ÉTAPE 1 — INFOS PERSO
            ======================== */}
            {etape === 1 && (
              <motion.div
                key="etape1"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -20 }}
              >
                <p style={styles.stepTitle}>Vos informations personnelles</p>
                <div className="row g-3">

                  {/* PRÉNOM */}
                  <div className="col-12 col-md-6">
                    <Field
                      icon={<User size={16} color="#9ca3af" />}
                      label="Prénom *"
                      name="prenom"
                      value={form.prenom}
                      onChange={handleChange}
                      placeholder="Votre prénom"
                    />
                  </div>

                  {/* NOM */}
                  <div className="col-12 col-md-6">
                    <Field
                      icon={<User size={16} color="#9ca3af" />}
                      label="Nom *"
                      name="nom"
                      value={form.nom}
                      onChange={handleChange}
                      placeholder="Votre nom"
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="col-12 col-md-6">
                    <Field
                      icon={<Mail size={16} color="#9ca3af" />}
                      label="Email *"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                    />
                  </div>

                  {/* TÉLÉPHONE */}
                  <div className="col-12 col-md-6">
                    <Field
                      icon={<Phone size={16} color="#9ca3af" />}
                      label="Téléphone *"
                      name="telephone"
                      value={form.telephone}
                      onChange={handleChange}
                      placeholder="+229 XX XX XX XX"
                    />
                  </div>

                  {/* CIP */}
                  <div className="col-12">
                    <Field
                      icon={<User size={16} color="#9ca3af" />}
                      label="Numéro CIP *"
                      name="cip"
                      value={form.cip}
                      onChange={handleChange}
                      placeholder="8 à 12 chiffres"
                      error={cipError}
                    />
                  </div>

                  {/* CHAMPS VENDEUR */}
                  {form.role === 'VENDEUR' && (
                    <>
                      <div className="col-12 col-md-6">
                        <Field
                          icon={<Building size={16} color="#9ca3af" />}
                          label="Nom de l'association *"
                          name="association"
                          value={form.association}
                          onChange={handleChange}
                          placeholder="Nom de votre coopérative"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <div style={styles.fieldWrap}>
                          <label style={styles.label}>
                            <MapPin size={14} /> Ville *
                          </label>
                          <select
                            name="ville"
                            value={form.ville}
                            onChange={handleChange}
                            style={styles.select}
                          >
                            <option value="">Sélectionnez une ville</option>
                            {villes.map((v) => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                </div>
              </motion.div>
            )}

            {/* ========================
                ÉTAPE 2 — SÉCURITÉ
            ======================== */}
            {etape === 2 && (
              <motion.div
                key="etape2"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -20 }}
              >
                <p style={styles.stepTitle}>Sécurisez votre compte</p>
                <div className="row g-3">

                  <div className="col-12">
                    <div style={styles.fieldWrap}>
                      <label style={styles.label}>Mot de passe *</label>
                      <div style={styles.inputWrap}>
                        <Lock size={16} color="#9ca3af" style={styles.fieldIcon} />
                        <input
                          type={showPwd ? 'text' : 'password'}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Minimum 8 caractères"
                          style={{ ...styles.input, paddingLeft: '2.5rem', paddingRight: '3rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(!showPwd)}
                          style={styles.eyeBtn}
                        >
                          {showPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                        </button>
                      </div>

                      {/* INDICATEUR FORCE */}
                      {form.password && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={styles.strengthBar}>
                            {[1,2,3,4].map((n) => (
                              <div
                                key={n}
                                style={{
                                  ...styles.strengthSegment,
                                  background: form.password.length >= n * 2
                                    ? n <= 1 ? '#ef4444'
                                    : n <= 2 ? '#f97316'
                                    : n <= 3 ? '#eab308'
                                    : '#22c55e'
                                    : '#e5e7eb',
                                }}
                              />
                            ))}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {form.password.length < 4 ? '🔴 Très faible'
                              : form.password.length < 6 ? '🟠 Faible'
                              : form.password.length < 8 ? '🟡 Moyen'
                              : '🟢 Fort'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <div style={styles.fieldWrap}>
                      <label style={styles.label}>Confirmer le mot de passe *</label>
                      <div style={styles.inputWrap}>
                        <Lock size={16} color="#9ca3af" style={styles.fieldIcon} />
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          name="confirm"
                          value={form.confirm}
                          onChange={handleChange}
                          placeholder="Répétez le mot de passe"
                          style={{
                            ...styles.input,
                            paddingLeft: '2.5rem',
                            paddingRight: '3rem',
                            borderColor: form.confirm && form.confirm !== form.password
                              ? '#ef4444' : '#e5e7eb',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          style={styles.eyeBtn}
                        >
                          {showConfirm ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                        </button>
                      </div>
                      {form.confirm && form.confirm !== form.password && (
                        <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '4px' }}>
                          ❌ Les mots de passe ne correspondent pas
                        </span>
                      )}
                      {form.confirm && form.confirm === form.password && (
                        <span style={{ fontSize: '0.78rem', color: '#22c55e', marginTop: '4px' }}>
                          ✅ Les mots de passe correspondent
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* ========================
                ÉTAPE 3 — CONFIRMATION
            ======================== */}
            {etape === 3 && (
              <motion.div
                key="etape3"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -20 }}
              >
                <div style={styles.confirmWrap}>
                  <motion.div
                    style={styles.confirmIcon}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  >
                    <Check size={40} color="white" />
                  </motion.div>
                  <h3 style={styles.confirmTitle}>Tout est prêt !</h3>
                  <p style={styles.confirmDesc}>
                    Vérifiez vos informations avant de valider votre inscription.
                  </p>

                  {/* RÉCAP */}
                  <div style={styles.recap} className="text-start">
                    {[
                      { label: 'Rôle',      value: form.role },
                      { label: 'Prénom',    value: form.prenom },
                      { label: 'Nom',       value: form.nom },
                      { label: 'Email',     value: form.email },
                      { label: 'Téléphone', value: form.telephone },
                      { label: 'CIP',       value: form.cip },
                      form.role === 'VENDEUR' && { label: 'Association', value: form.association },
                      form.role === 'VENDEUR' && { label: 'Ville',       value: form.ville },
                    ].filter(Boolean).map((item, i) => (
                      <div key={i} style={styles.recapRow}>
                        <span style={styles.recapLabel}>{item.label}</span>
                        <span style={styles.recapValue}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* ========================
              NAVIGATION ÉTAPES
          ======================== */}
          <div style={styles.navBtns} className="mt-4">

            {etape > 0 && (
              <motion.button
                type="button"
                onClick={precedent}
                style={styles.btnPrecedent}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <ChevronLeft size={18} />
                Précédent
              </motion.button>
            )}

            {etape < etapes.length - 1 ? (
              <motion.button
                type="button"
                onClick={suivant}
                style={styles.btnSuivant}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Suivant
                <ChevronRight size={18} />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={handleSubmit}
                style={{ ...styles.btnSuivant, background: '#1a5c2a' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader size={18} />
                  </motion.div>
                ) : (
                  <>
                    <Check size={18} />
                    Créer mon compte
                  </>
                )}
              </motion.button>
            )}

          </div>

          {/* LIEN CONNEXION */}
          <p style={{ ...styles.subtitle, marginTop: '1.2rem' }}>
            Déjà un compte ?{' '}
            <Link to="/auth/login" style={styles.loginLink}>
              Se connecter
            </Link>
          </p>

        </motion.div>
        </div>
    </div>

    <Footer />
  </>
);
}

// ===== COMPOSANT FIELD =====
function Field({ icon, label, name, value, onChange, placeholder, type = 'text', error }) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <div style={styles.inputWrap}>
        <span style={styles.fieldIcon}>{icon}</span>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            ...styles.input,
            paddingLeft: '2.5rem',
            borderColor: error ? '#ef4444' : '#e5e7eb',
          }}
        />
      </div>
      {error && (
        <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '4px' }}>
          {error}
        </span>
      )}
     </div>
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
    padding: '2rem 0',
  },
  bgScene: { position: 'absolute', inset: 0, zIndex: 0 },
  sky:   { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #a8d8f0 0%, #c8e8f8 50%, #d4efc0 100%)' },
  sun:   { position: 'absolute', top: '8%', right: '15%', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, #fff9c4 0%, #fdd835 60%, #f9a825 100%)', boxShadow: '0 0 40px rgba(253,216,53,0.6)' },
  hill1: { position: 'absolute', bottom: '15%', left: '-5%', width: '45%', height: '200px', borderRadius: '50% 80% 0 0', background: 'linear-gradient(180deg, #6ab04c 0%, #4a8c2a 100%)' },
  hill2: { position: 'absolute', bottom: '15%', right: '-5%', width: '50%', height: '180px', borderRadius: '80% 50% 0 0', background: 'linear-gradient(180deg, #7ec850 0%, #5a9e34 100%)' },
  field: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '18%', background: 'linear-gradient(180deg, #8bc34a 0%, #6a9e30 100%)' },
  star:  { position: 'absolute', bottom: '5%', right: '5%', fontSize: '2.5rem', color: 'rgba(255,255,255,0.9)' },

  cardWrap: { position: 'relative', zIndex: 1, width: '100%', maxWidth: '680px', padding: '1rem' },
  card: { background: 'white', borderRadius: '24px', padding: '2.2rem 2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.18)', position: 'relative' },

  closeBtn: { position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center' },

  logoWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '0.8rem' },
  logoIcon: { background: '#f0c040', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: '1.5rem', fontWeight: '900', color: '#1a2e10', letterSpacing: '-0.03em' },

  title:    { textAlign: 'center', fontSize: '1.5rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.2rem' },
  subtitle: { textAlign: 'center', fontSize: '0.87rem', color: '#6b7280', marginBottom: '1.2rem' },

  // STEPPER
  stepper:     { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0' },
  stepItem:    { display: 'flex', alignItems: 'center', gap: '6px' },
  stepCircle:  { width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s' },
  stepLabel:   { fontSize: '0.75rem', whiteSpace: 'nowrap', transition: 'all 0.3s' },
  stepLine:    { width: '30px', height: '2px', transition: 'background 0.3s' },

  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#dc2626' },

  stepTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#374151', marginBottom: '1rem', textAlign: 'center' },

  // RÔLES
  roleCard:  { border: '2px solid #e5e7eb', borderRadius: '16px', padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', height: '100%' },
  roleCheck: { position: 'absolute', top: '10px', right: '10px', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  roleTitle: { fontSize: '1rem', fontWeight: '700', marginBottom: '0.4rem' },
  roleDesc:  { fontSize: '0.78rem', color: '#6b7280', margin: 0, lineHeight: 1.4 },

  // FIELDS
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label:     { fontSize: '0.85rem', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '5px' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  fieldIcon: { position: 'absolute', left: '12px', pointerEvents: 'none', display: 'flex' },
  input:     { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', transition: 'border-color 0.2s' },
  select:    { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', cursor: 'pointer' },
  eyeBtn:    { position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' },

  // FORCE MDP
  strengthBar:    { display: 'flex', gap: '4px', marginBottom: '4px' },
  strengthSegment: { flex: 1, height: '4px', borderRadius: '4px', transition: 'background 0.3s' },

  // CONFIRMATION
  confirmWrap:  { textAlign: 'center' },
  confirmIcon:  { width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a5c2a, #4db86a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' },
  confirmTitle: { fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.5rem' },
  confirmDesc:  { fontSize: '0.88rem', color: '#6b7280', marginBottom: '1.2rem' },
  recap:        { background: '#f9fafb', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb' },
  recapRow:     { display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6' },
  recapLabel:   { fontSize: '0.82rem', color: '#6b7280', fontWeight: '500' },
  recapValue:   { fontSize: '0.82rem', color: '#1a2e10', fontWeight: '700' },

  // NAVIGATION
  navBtns:      { display: 'flex', gap: '12px', justifyContent: 'center' },
  btnPrecedent: { display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '0.75rem 1.5rem', fontSize: '0.92rem', fontWeight: '600', color: '#374151', cursor: 'pointer' },
  btnSuivant:   { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0c040', border: 'none', borderRadius: '12px', padding: '0.75rem 1.8rem', fontSize: '0.92rem', fontWeight: '700', color: '#1a2e10', cursor: 'pointer', boxShadow: '0 4px 16px rgba(240,192,64,0.4)' },

  loginLink: { color: '#2563eb', fontWeight: '700', textDecoration: 'none' },
};