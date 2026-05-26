import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin,
  Edit3, Save, X, Camera, Shield,
  ShoppingBag, Package, Heart, TrendingUp,
  CheckCircle, Eye, EyeOff, Lock,
  AlertCircle, Loader, Star, Clock,
  CreditCard, Smartphone, Building,
  Bell, ToggleLeft, ToggleRight
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';

// ===== MOCK DATA =====
const acheteurInitial = {
  prenom:    'Kofi',
  nom:       'Amegah',
  email:     'kofi.amegah@email.com',
  telephone: '+229 02 85 XX XX',
  ville:     'Cotonou',
  adresse:   'Quartier Cadjèhoun, Rue 12',
  bio:       'Acheteur de céréales pour ma chaîne de distribution alimentaire au Bénin.',
  avatar:    null,
  dateInscription: 'Mars 2024',
};

const stats = [
  { label: 'Commandes totales', value: '18',          icon: ShoppingBag, color: '#2563eb', bg: '#eff6ff' },
  { label: 'En cours',         value: '4',            icon: Clock,       color: '#d97706', bg: '#fffbeb' },
  { label: 'Produits favoris', value: '12',           icon: Heart,       color: '#dc2626', bg: '#fef2f2' },
  { label: 'Total dépensé',    value: '840K FCFA',    icon: TrendingUp,  color: '#1a5c2a', bg: '#f0fdf4' },
];

const commandesRecentes = [
  { id: '#CMD001', produit: 'Maïs 2t',  vendeur: 'Moussa K.', montant: '120 000', statut: 'Livré',      date: "Aujourd'hui" },
  { id: '#CMD002', produit: 'Riz 3t',   vendeur: 'Kofi A.',   montant: '180 000', statut: 'En cours',   date: 'Hier'        },
  { id: '#CMD003', produit: 'Soja 1t',  vendeur: 'Sèna B.',   montant: '67 000',  statut: 'En attente', date: '3 jours'     },
];

const modesPaiement = [
  { id: 'mtn',  label: 'MTN Mobile Money',  icon: Smartphone, color: '#f59e0b', bg: '#fffbeb', numero: '+229 01 XX XX XX', defaut: true  },
  { id: 'moov', label: 'Moov Money',        icon: Smartphone, color: '#2563eb', bg: '#eff6ff', numero: '+229 02 XX XX XX', defaut: false },
  { id: 'bank', label: 'Virement bancaire', icon: Building,   color: '#1a5c2a', bg: '#f0fdf4', numero: 'BJ XX XXXX XXXX', defaut: false },
];

const notifications = [
  { id: 'commande',   label: 'Nouvelles commandes',       desc: 'Être notifié quand une commande est confirmée',    active: true  },
  { id: 'livraison',  label: 'Mises à jour de livraison', desc: 'Suivre l\'état de vos livraisons en temps réel',  active: true  },
  { id: 'prix',       label: 'Alertes prix',              desc: 'Recevoir les variations de prix du marché',        active: false },
  { id: 'promo',      label: 'Promotions',                desc: 'Offres spéciales et réductions',                   active: false },
  { id: 'newsletter', label: 'Newsletter AgroSaaNuu',    desc: 'Actualités et conseils agricoles hebdomadaires',   active: true  },
];

const villes = [
  'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi',
  'Djougou', 'Bohicon', 'Kandi', 'Natitingou', 'Ouidah',
];

const statutStyle = {
  'Livré':      { bg: '#dcfce7', color: '#16a34a' },
  'En cours':   { bg: '#dbeafe', color: '#2563eb' },
  'En attente': { bg: '#fef3c7', color: '#d97706' },
};

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

export default function BuyerProfile() {
  const [acheteur,     setAcheteur]     = useState(acheteurInitial);
  const [editing,      setEditing]      = useState(false);
  const [formData,     setFormData]     = useState(acheteurInitial);
  const [saving,       setSaving]       = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [activeTab,    setActiveTab]    = useState('infos');
  const [showPwd,      setShowPwd]      = useState(false);
  const [showNewPwd,   setShowNewPwd]   = useState(false);
  const [pwdForm,      setPwdForm]      = useState({ actuel: '', nouveau: '', confirmer: '' });
  const [pwdLoading,   setPwdLoading]   = useState(false);
  const [pwdSuccess,   setPwdSuccess]   = useState(false);
  const [pwdError,     setPwdError]     = useState('');
  const [notifs,       setNotifs]       = useState(notifications);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setAcheteur(formData);
      setSaving(false);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  const handleCancel = () => { setFormData(acheteur); setEditing(false); };

  const handlePwdChange = (e) => { setPwdForm({ ...pwdForm, [e.target.name]: e.target.value }); setPwdError(''); };

  const handlePwdSave = () => {
    if (!pwdForm.actuel)  { setPwdError('Entrez votre mot de passe actuel.'); return; }
    if (!pwdForm.nouveau) { setPwdError('Entrez un nouveau mot de passe.');   return; }
    if (pwdForm.nouveau.length < 8) { setPwdError('Minimum 8 caractères.'); return; }
    if (pwdForm.nouveau !== pwdForm.confirmer) { setPwdError('Les mots de passe ne correspondent pas.'); return; }
    setPwdLoading(true);
    setTimeout(() => {
      setPwdLoading(false);
      setPwdSuccess(true);
      setPwdForm({ actuel: '', nouveau: '', confirmer: '' });
      setTimeout(() => setPwdSuccess(false), 3000);
    }, 1500);
  };

  const toggleNotif = (id) => {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, active: !n.active } : n));
  };

  return (
    <DashboardLayout role="buyer">
      <div>

        {/* ===== HERO PROFIL ===== */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          style={styles.profileHero}
        >
          <div style={styles.heroDecoBg} />

          <div style={styles.heroContent}>
            {/* AVATAR */}
            <div style={styles.avatarWrap}>
              <div style={styles.avatar}>
                <span style={styles.avatarInitiale}>
                  {acheteur.prenom[0]}{acheteur.nom[0]}
                </span>
              </div>
              <motion.button style={styles.cameraBtn} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Camera size={14} color="white" />
              </motion.button>
            </div>

            {/* INFOS */}
            <div style={styles.heroInfos}>
              <div style={styles.nomWrap}>
                <h1 style={styles.heroNom}>{acheteur.prenom} {acheteur.nom}</h1>
                <span style={styles.roleBadge}>🛒 Acheteur</span>
              </div>
              <div style={styles.heroMeta}>
                <span><MapPin size={14} /> {acheteur.ville}</span>
                <span><Mail size={14} /> {acheteur.email}</span>
                <span>Membre depuis {acheteur.dateInscription}</span>
              </div>
              <p style={styles.heroBio}>{acheteur.bio}</p>
            </div>

            {/* BOUTONS */}
            {!editing ? (
              <motion.button
                style={styles.btnEditer}
                onClick={() => setEditing(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Edit3 size={15} /> Modifier
              </motion.button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <motion.button style={styles.btnAnnuler} onClick={handleCancel} whileHover={{ scale: 1.03 }}>
                  <X size={15} /> Annuler
                </motion.button>
                <motion.button
                  style={{ ...styles.btnSauvegarder, opacity: saving ? 0.8 : 1 }}
                  onClick={handleSave}
                  disabled={saving}
                  whileHover={{ scale: saving ? 1 : 1.03 }}
                >
                  {saving
                    ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader size={15} /></motion.div>
                    : <><Save size={15} /> Sauvegarder</>
                  }
                </motion.button>
              </div>
            )}
          </div>

          {/* TOAST SUCCÈS */}
          <AnimatePresence>
            {success && (
              <motion.div style={styles.successToast} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CheckCircle size={16} color="#16a34a" /> Profil mis à jour avec succès !
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ===== STATS ===== */}
        <div className="row g-3 mb-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                className="col-6 col-lg-3"
                variants={fadeUp} initial="hidden" animate="show" transition={{ delay: i * 0.08 }}
              >
                <div style={styles.statCard}>
                  <div style={{ ...styles.statIcon, background: s.bg }}>
                    <Icon size={20} color={s.color} />
                  </div>
                  <div style={styles.statValue}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ===== TABS ===== */}
        <div style={styles.tabs}>
          {[
            { id: 'infos',     label: '👤 Informations'     },
            { id: 'commandes', label: '📦 Commandes récentes'},
            { id: 'paiement',  label: '💳 Paiement'         },
            { id: 'securite',  label: '🔒 Sécurité'         },
            { id: 'notifs',    label: '🔔 Notifications'     },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              style={{
                ...styles.tab,
                background:  activeTab === tab.id ? '#2563eb' : 'white',
                color:       activeTab === tab.id ? 'white'   : '#374151',
                borderColor: activeTab === tab.id ? '#2563eb' : '#e5e7eb',
              }}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.97 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ===== TAB INFOS ===== */}
          {activeTab === 'infos' && (
            <motion.div
              key="infos"
              style={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h3 style={styles.cardTitle}>
                <User size={18} color="#2563eb" /> Informations personnelles
              </h3>

              <div className="row g-3">
                {/* PRÉNOM */}
                <div className="col-12 col-md-6">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>Prénom</label>
                    {editing
                      ? <input name="prenom" value={formData.prenom} onChange={handleChange} style={styles.input} />
                      : <div style={styles.fieldValue}>{acheteur.prenom}</div>
                    }
                  </div>
                </div>

                {/* NOM */}
                <div className="col-12 col-md-6">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>Nom</label>
                    {editing
                      ? <input name="nom" value={formData.nom} onChange={handleChange} style={styles.input} />
                      : <div style={styles.fieldValue}>{acheteur.nom}</div>
                    }
                  </div>
                </div>

                {/* EMAIL */}
                <div className="col-12 col-md-6">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}><Mail size={13} /> Email</label>
                    {editing
                      ? <input name="email" type="email" value={formData.email} onChange={handleChange} style={styles.input} />
                      : <div style={styles.fieldValue}>{acheteur.email}</div>
                    }
                  </div>
                </div>

                {/* TÉLÉPHONE */}
                <div className="col-12 col-md-6">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}><Phone size={13} /> Téléphone</label>
                    {editing
                      ? <input name="telephone" value={formData.telephone} onChange={handleChange} style={styles.input} />
                      : <div style={styles.fieldValue}>{acheteur.telephone}</div>
                    }
                  </div>
                </div>

                {/* VILLE */}
                <div className="col-12 col-md-6">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}><MapPin size={13} /> Ville</label>
                    {editing
                      ? <select name="ville" value={formData.ville} onChange={handleChange} style={styles.select}>
                          {villes.map((v) => <option key={v}>{v}</option>)}
                        </select>
                      : <div style={styles.fieldValue}>{acheteur.ville}</div>
                    }
                  </div>
                </div>

                {/* ADRESSE */}
                <div className="col-12 col-md-6">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}><MapPin size={13} /> Adresse</label>
                    {editing
                      ? <input name="adresse" value={formData.adresse} onChange={handleChange} style={styles.input} />
                      : <div style={styles.fieldValue}>{acheteur.adresse}</div>
                    }
                  </div>
                </div>

                {/* BIO */}
                <div className="col-12">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>Bio</label>
                    {editing
                      ? <textarea name="bio" value={formData.bio} onChange={handleChange} style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} rows={3} />
                      : <div style={{ ...styles.fieldValue, lineHeight: 1.6 }}>{acheteur.bio}</div>
                    }
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== TAB COMMANDES ===== */}
          {activeTab === 'commandes' && (
            <motion.div
              key="commandes"
              style={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h3 style={styles.cardTitle}>
                <Package size={18} color="#2563eb" /> Commandes récentes
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['ID', 'Produit', 'Vendeur', 'Montant', 'Statut', 'Date'].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {commandesRecentes.map((c, i) => (
                      <motion.tr
                        key={i}
                        style={styles.tr}
                        whileHover={{ background: '#f9fafb' }}
                      >
                        <td style={styles.td}>
                          <span style={styles.cmdId}>{c.id}</span>
                        </td>
                        <td style={styles.td}>{c.produit}</td>
                        <td style={styles.td}>{c.vendeur}</td>
                        <td style={styles.td}>
                          <strong style={{ color: '#2563eb' }}>{c.montant} FCFA</strong>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: statutStyle[c.statut].bg,
                            color:      statutStyle[c.statut].color,
                          }}>
                            {c.statut}
                          </span>
                        </td>
                        <td style={{ ...styles.td, color: '#6b7280', fontSize: '0.8rem' }}>
                          {c.date}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ===== TAB PAIEMENT ===== */}
          {activeTab === 'paiement' && (
            <motion.div
              key="paiement"
              style={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h3 style={styles.cardTitle}>
                <CreditCard size={18} color="#2563eb" /> Mes moyens de paiement
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                {modesPaiement.map((m) => {
                  const Icon = m.icon;
                  return (
                    <motion.div
                      key={m.id}
                      style={{
                        ...styles.modeCard,
                        borderColor: m.defaut ? '#2563eb' : '#e5e7eb',
                        background:  m.defaut ? '#eff6ff' : 'white',
                      }}
                      whileHover={{ y: -2 }}
                    >
                      <div style={{ ...styles.modeIcon, background: m.bg }}>
                        <Icon size={20} color={m.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.modeLabel}>{m.label}</div>
                        <div style={styles.modeNumero}>{m.numero}</div>
                      </div>
                      {m.defaut && (
                        <span style={styles.defautBadge}>Par défaut</span>
                      )}
                      <motion.button
                        style={styles.modeEditBtn}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Edit3 size={14} />
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>

              <motion.button
                style={styles.btnAjouterMode}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                + Ajouter un moyen de paiement
              </motion.button>
            </motion.div>
          )}

          {/* ===== TAB SÉCURITÉ ===== */}
          {activeTab === 'securite' && (
            <motion.div
              key="securite"
              style={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h3 style={styles.cardTitle}>
                <Lock size={18} color="#2563eb" /> Changer le mot de passe
              </h3>

              <AnimatePresence>
                {pwdError   && <motion.div style={styles.errorBox}   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AlertCircle size={15} /> {pwdError}</motion.div>}
                {pwdSuccess && <motion.div style={styles.successBox} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CheckCircle size={15} /> Mot de passe modifié !</motion.div>}
              </AnimatePresence>

              <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* ACTUEL */}
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Mot de passe actuel *</label>
                  <div style={styles.pwdWrap}>
                    <input type={showPwd ? 'text' : 'password'} name="actuel" value={pwdForm.actuel} onChange={handlePwdChange} placeholder="••••••••" style={{ ...styles.input, paddingRight: '3rem' }} />
                    <button style={styles.eyeBtn} onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                    </button>
                  </div>
                </div>

                {/* NOUVEAU */}
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Nouveau mot de passe *</label>
                  <div style={styles.pwdWrap}>
                    <input type={showNewPwd ? 'text' : 'password'} name="nouveau" value={pwdForm.nouveau} onChange={handlePwdChange} placeholder="Minimum 8 caractères" style={{ ...styles.input, paddingRight: '3rem' }} />
                    <button style={styles.eyeBtn} onClick={() => setShowNewPwd(!showNewPwd)}>
                      {showNewPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                    </button>
                  </div>
                  {pwdForm.nouveau && (
                    <div style={{ marginTop: '6px' }}>
                      <div style={styles.strengthBar}>
                        {[1,2,3,4].map((n) => (
                          <div key={n} style={{ ...styles.strengthSeg, background: pwdForm.nouveau.length >= n * 2 ? n <= 1 ? '#ef4444' : n <= 2 ? '#f97316' : n <= 3 ? '#eab308' : '#22c55e' : '#e5e7eb' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {pwdForm.nouveau.length < 4 ? '🔴 Très faible' : pwdForm.nouveau.length < 6 ? '🟠 Faible' : pwdForm.nouveau.length < 8 ? '🟡 Moyen' : '🟢 Fort'}
                      </span>
                    </div>
                  )}
                </div>

                {/* CONFIRMER */}
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Confirmer *</label>
                  <input type="password" name="confirmer" value={pwdForm.confirmer} onChange={handlePwdChange} placeholder="Répétez le mot de passe" style={{ ...styles.input, borderColor: pwdForm.confirmer && pwdForm.confirmer !== pwdForm.nouveau ? '#ef4444' : '#e5e7eb' }} />
                  {pwdForm.confirmer && pwdForm.confirmer !== pwdForm.nouveau && <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>❌ Ne correspond pas</span>}
                  {pwdForm.confirmer && pwdForm.confirmer === pwdForm.nouveau && <span style={{ fontSize: '0.78rem', color: '#22c55e' }}>✅ Correspond</span>}
                </div>

                <motion.button
                  style={{ ...styles.btnPwd, opacity: pwdLoading ? 0.8 : 1 }}
                  onClick={handlePwdSave}
                  disabled={pwdLoading}
                  whileHover={{ scale: pwdLoading ? 1 : 1.02 }}
                  whileTap={{ scale: pwdLoading ? 1 : 0.98 }}
                >
                  {pwdLoading
                    ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div>
                    : <><Lock size={15} /> Mettre à jour</>
                  }
                </motion.button>

              </div>

              {/* DANGER */}
              <div style={styles.dangerZone}>
                <h4 style={styles.dangerTitle}>⚠️ Zone de danger</h4>
                <p style={styles.dangerDesc}>La suppression est irréversible.</p>
                <motion.button style={styles.btnSupprimer} whileHover={{ scale: 1.02 }}>
                  Supprimer mon compte
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ===== TAB NOTIFICATIONS ===== */}
          {activeTab === 'notifs' && (
            <motion.div
              key="notifs"
              style={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h3 style={styles.cardTitle}>
                <Bell size={18} color="#2563eb" /> Préférences de notifications
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {notifs.map((n, i) => (
                  <motion.div
                    key={n.id}
                    style={{
                      ...styles.notifItem,
                      borderBottom: i < notifs.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}
                    whileHover={{ background: '#f9fafb' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={styles.notifLabel}>{n.label}</div>
                      <div style={styles.notifDesc}>{n.desc}</div>
                    </div>
                    <motion.button
                      style={styles.toggleBtn}
                      onClick={() => toggleNotif(n.id)}
                      whileTap={{ scale: 0.95 }}
                    >
                      {n.active
                        ? <ToggleRight size={36} color="#2563eb" />
                        : <ToggleLeft  size={36} color="#9ca3af" />
                      }
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              <div style={styles.notifInfo}>
                <Shield size={14} color="#2563eb" />
                <span>Vos préférences sont sauvegardées automatiquement.</span>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}

// ===== STYLES =====
const styles = {
  // HERO
  profileHero:   { background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' },
  heroDecoBg:    { position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' },
  heroContent:   { display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 },
  avatarWrap:    { position: 'relative', flexShrink: 0 },
  avatar:        { width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #60a5fa, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.3)', overflow: 'hidden' },
  avatarInitiale:{ fontSize: '1.8rem', fontWeight: '900', color: 'white' },
  cameraBtn:     { position: 'absolute', bottom: '0', right: '0', background: '#2563eb', border: '2px solid white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  heroInfos:     { flex: 1, minWidth: '200px' },
  nomWrap:       { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' },
  heroNom:       { color: 'white', fontWeight: '900', fontSize: '1.4rem', margin: 0 },
  roleBadge:     { background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.78rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' },
  heroMeta:      { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginBottom: '10px' },
  heroBio:       { color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 },
  btnEditer:     { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '12px', padding: '0.6rem 1.2rem', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', backdropFilter: 'blur(4px)', flexShrink: 0 },
  btnAnnuler:    { display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', padding: '0.55rem 1rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 },
  btnSauvegarder:{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0c040', color: '#1a2e10', border: 'none', borderRadius: '10px', padding: '0.55rem 1.2rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 },
  successToast:  { display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', color: '#16a34a', borderRadius: '10px', padding: '0.7rem 1rem', marginTop: '1rem', fontSize: '0.85rem', fontWeight: '600', position: 'relative', zIndex: 1 },

  // STATS
  statCard:  { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', textAlign: 'center' },
  statIcon:  { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' },
  statValue: { fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', marginBottom: '3px' },
  statLabel: { fontSize: '0.78rem', color: '#6b7280' },

  // TABS
  tabs: { display: 'flex', gap: '8px', marginBottom: '1.2rem', flexWrap: 'wrap' },
  tab:  { padding: '0.5rem 1.1rem', borderRadius: '20px', border: '1.5px solid', fontSize: '0.83rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: 'none', whiteSpace: 'nowrap' },

  // CARD
  card:      { background: 'white', borderRadius: '16px', padding: '1.8rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: '1.05rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' },

  // CHAMPS
  fieldWrap:  { display: 'flex', flexDirection: 'column', gap: '5px' },
  label:      { fontSize: '0.82rem', fontWeight: '600', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' },
  input:      { width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', fontFamily: 'inherit' },
  select:     { width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', cursor: 'pointer' },
  fieldValue: { fontSize: '0.92rem', fontWeight: '500', color: '#1a2e10', padding: '0.7rem 0', borderBottom: '1px solid #f5f5f5' },

  // TABLEAU COMMANDES
  table:  { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th:     { padding: '0.65rem 0.8rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.78rem', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' },
  tr:     { borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s' },
  td:     { padding: '0.75rem 0.8rem', color: '#374151', whiteSpace: 'nowrap' },
  cmdId:  { fontWeight: '700', color: '#2563eb', fontSize: '0.82rem' },
  badge:  { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' },

  // PAIEMENT
  modeCard:     { display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', borderRadius: '14px', border: '2px solid', cursor: 'pointer', transition: 'all 0.2s' },
  modeIcon:     { width: '46px', height: '46px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  modeLabel:    { fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10', marginBottom: '2px' },
  modeNumero:   { fontSize: '0.78rem', color: '#6b7280' },
  defautBadge:  { background: '#dbeafe', color: '#2563eb', fontSize: '0.72rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap' },
  modeEditBtn:  { background: '#f4f6f4', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', color: '#6b7280' },
  btnAjouterMode:{ background: '#eff6ff', color: '#2563eb', border: '2px dashed #93c5fd', borderRadius: '12px', padding: '0.8rem', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', width: '100%' },

  // MOT DE PASSE
  pwdWrap:      { position: 'relative' },
  eyeBtn:       { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' },
  strengthBar:  { display: 'flex', gap: '4px', marginBottom: '4px' },
  strengthSeg:  { flex: 1, height: '4px', borderRadius: '4px', transition: 'background 0.3s' },
  btnPwd:       { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', padding: '0.85rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' },

  // MESSAGES
  errorBox:  { display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#dc2626' },
  successBox:{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#16a34a' },

  // DANGER
  dangerZone:   { marginTop: '2rem', background: '#fef2f2', borderRadius: '14px', padding: '1.2rem', border: '1px solid #fecaca' },
  dangerTitle:  { fontSize: '0.95rem', fontWeight: '800', color: '#dc2626', marginBottom: '0.4rem' },
  dangerDesc:   { fontSize: '0.82rem', color: '#6b7280', marginBottom: '1rem' },
  btnSupprimer: { display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '0.6rem 1.2rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' },

  // NOTIFICATIONS
  notifItem:  { display: 'flex', alignItems: 'center', gap: '16px', padding: '1rem 0.5rem', borderRadius: '8px', transition: 'background 0.15s', cursor: 'pointer' },
  notifLabel: { fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10', marginBottom: '2px' },
  notifDesc:  { fontSize: '0.78rem', color: '#6b7280' },
  toggleBtn:  { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexShrink: 0, padding: '2px' },
  notifInfo:  { display: 'flex', alignItems: 'center', gap: '8px', background: '#eff6ff', borderRadius: '10px', padding: '0.7rem 1rem', marginTop: '1rem', fontSize: '0.78rem', color: '#2563eb', fontWeight: '500' },
};