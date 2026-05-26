import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin,
  Edit3, Save, X, Camera, Shield,
  Truck, Package, Star, TrendingUp,
  CheckCircle, Eye, EyeOff, Lock,
  AlertCircle, Loader, Clock, Navigation,
  Plus, Trash2, ToggleLeft, ToggleRight,
  Bell, Award, FileText
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';

// ===== MOCK DATA =====
const transporteurInitial = {
  prenom:      'Sèna',
  nom:         'Bello',
  email:       'sena.bello@email.com',
  telephone:   '+229 03 72 XX XX',
  ville:       'Cotonou',
  adresse:     'Quartier Akpakpa, Cotonou',
  bio:         'Transporteur professionnel avec 5 ans d\'expérience dans le transport de céréales au Bénin.',
  avatar:      null,
  dateInscription: 'Février 2024',
  disponible:  true,
};

const stats = [
  { label: 'Missions totales', value: '234',         icon: Navigation, color: '#d97706', bg: '#fffbeb' },
  { label: 'En cours',        value: '2',            icon: Truck,      color: '#2563eb', bg: '#eff6ff' },
  { label: 'Note moyenne',    value: '4.8 ⭐',       icon: Star,       color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Revenus totaux',  value: '1.8M FCFA',   icon: TrendingUp, color: '#1a5c2a', bg: '#f0fdf4' },
];

const vehiculesInitial = [
  {
    id:        1,
    nom:       'Camion 10t',
    immat:     'BJ-1234-AB',
    annee:     2018,
    statut:    'Disponible',
    assurance: '31 Déc 2026',
    visite:    '15 Juin 2026',
  },
  {
    id:        2,
    nom:       'Camion 5t',
    immat:     'BJ-5678-CD',
    annee:     2020,
    statut:    'En mission',
    assurance: '28 Fév 2027',
    visite:    '20 Mar 2026',
  },
];

const zonesDisponibles = [
  'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi',
  'Natitingou', 'Djougou', 'Kandi', 'Ouidah', 'Bohicon',
  'Nikki', 'Banikoara', 'Malanville',
];

const avisClients = [
  { id: 1, nom: 'Moussa K.', note: 5,   commentaire: 'Livraison rapide et soignée, je recommande !',   date: 'Il y a 2 jours'   },
  { id: 2, nom: 'Kofi A.',   note: 4,   commentaire: 'Très professionnel, camion bien entretenu.',      date: 'Il y a 1 semaine'  },
  { id: 3, nom: 'Sèna B.',   note: 5,   commentaire: 'Ponctuel et sérieux. Reviendrai.',                date: 'Il y a 2 semaines' },
];

const notificationsInitial = [
  { id: 'mission',   label: 'Nouvelles missions',       desc: 'Être notifié des nouvelles demandes de transport', active: true  },
  { id: 'paiement',  label: 'Paiements reçus',          desc: 'Confirmation de paiement après livraison',          active: true  },
  { id: 'document',  label: 'Documents à renouveler',   desc: 'Alertes avant expiration assurance/visite',         active: true  },
  { id: 'promo',     label: 'Offres et promotions',     desc: 'Réductions et offres spéciales AgroConnect',        active: false },
];

const villes = [
  'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi',
  'Natitingou', 'Djougou', 'Kandi', 'Ouidah',
];

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

export default function TransporterProfile() {
  const [transporteur,  setTransporteur]  = useState(transporteurInitial);
  const [editing,       setEditing]       = useState(false);
  const [formData,      setFormData]      = useState(transporteurInitial);
  const [saving,        setSaving]        = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [activeTab,     setActiveTab]     = useState('infos');
  const [disponible,    setDisponible]    = useState(transporteurInitial.disponible);
  const [vehicules,     setVehicules]     = useState(vehiculesInitial);
  const [zonesActives,  setZonesActives]  = useState(['Cotonou', 'Porto-Novo', 'Parakou']);
  const [showPwd,       setShowPwd]       = useState(false);
  const [showNewPwd,    setShowNewPwd]    = useState(false);
  const [pwdForm,       setPwdForm]       = useState({ actuel: '', nouveau: '', confirmer: '' });
  const [pwdLoading,    setPwdLoading]    = useState(false);
  const [pwdSuccess,    setPwdSuccess]    = useState(false);
  const [pwdError,      setPwdError]      = useState('');
  const [notifs,        setNotifs]        = useState(notificationsInitial);

  const handleChange    = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePwdChange = (e) => { setPwdForm({ ...pwdForm, [e.target.name]: e.target.value }); setPwdError(''); };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setTransporteur(formData);
      setSaving(false);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  const handleCancel = () => { setFormData(transporteur); setEditing(false); };

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

  const toggleZone = (zone) => {
    setZonesActives((prev) =>
      prev.includes(zone)
        ? prev.filter((z) => z !== zone)
        : [...prev, zone]
    );
  };

  const toggleNotif = (id) => {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, active: !n.active } : n));
  };

  const supprimerVehicule = (id) => {
    setVehicules((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <DashboardLayout role="transporter">
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
                  {transporteur.prenom[0]}{transporteur.nom[0]}
                </span>
              </div>
              <motion.button style={styles.cameraBtn} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Camera size={14} color="white" />
              </motion.button>
            </div>

            {/* INFOS */}
            <div style={styles.heroInfos}>
              <div style={styles.nomWrap}>
                <h1 style={styles.heroNom}>{transporteur.prenom} {transporteur.nom}</h1>
                <span style={styles.roleBadge}>🚚 Transporteur</span>
                <span style={{
                  ...styles.dispoBadge,
                  background: disponible ? '#f0c040' : 'rgba(255,255,255,0.2)',
                  color:      disponible ? '#1a2e10' : 'rgba(255,255,255,0.8)',
                }}>
                  {disponible ? '🟢 Disponible' : '🔴 Indisponible'}
                </span>
              </div>
              <div style={styles.heroMeta}>
                <span><MapPin size={14} /> {transporteur.ville}</span>
                <span><Truck size={14} /> {vehicules.length} véhicule(s)</span>
                <span>Membre depuis {transporteur.dateInscription}</span>
              </div>
              <p style={styles.heroBio}>{transporteur.bio}</p>
            </div>

            {/* ACTIONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
              {/* TOGGLE DISPO */}
              <motion.div
                style={{
                  ...styles.dispoToggle,
                  background: disponible ? 'rgba(240,192,64,0.2)' : 'rgba(255,255,255,0.1)',
                  borderColor: disponible ? '#f0c040' : 'rgba(255,255,255,0.3)',
                }}
                onClick={() => setDisponible(!disponible)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {disponible
                  ? <ToggleRight size={22} color="#f0c040" />
                  : <ToggleLeft  size={22} color="rgba(255,255,255,0.5)" />
                }
                <span style={{ color: disponible ? '#f0c040' : 'rgba(255,255,255,0.7)', fontSize: '0.82rem', fontWeight: '700' }}>
                  {disponible ? 'Disponible' : 'Indisponible'}
                </span>
              </motion.div>

              {/* ÉDITER */}
              {!editing ? (
                <motion.button style={styles.btnEditer} onClick={() => setEditing(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Edit3 size={15} /> Modifier
                </motion.button>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <motion.button style={styles.btnAnnuler} onClick={handleCancel} whileHover={{ scale: 1.03 }}>
                    <X size={14} />
                  </motion.button>
                  <motion.button
                    style={{ ...styles.btnSauvegarder, opacity: saving ? 0.8 : 1 }}
                    onClick={handleSave}
                    disabled={saving}
                    whileHover={{ scale: saving ? 1 : 1.03 }}
                  >
                    {saving
                      ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader size={14} /></motion.div>
                      : <><Save size={14} /> Sauvegarder</>
                    }
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* TOAST SUCCÈS */}
          <AnimatePresence>
            {success && (
              <motion.div style={styles.successToast} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CheckCircle size={16} color="#16a34a" /> Profil mis à jour !
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
            { id: 'infos',    label: '👤 Informations'  },
            { id: 'vehicules',label: '🚚 Mes véhicules'  },
            { id: 'zones',    label: '📍 Zones'          },
            { id: 'avis',     label: '⭐ Avis clients'   },
            { id: 'securite', label: '🔒 Sécurité'       },
            { id: 'notifs',   label: '🔔 Notifications'  },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              style={{
                ...styles.tab,
                background:  activeTab === tab.id ? '#d97706' : 'white',
                color:       activeTab === tab.id ? 'white'   : '#374151',
                borderColor: activeTab === tab.id ? '#d97706' : '#e5e7eb',
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
            <motion.div key="infos" style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 style={styles.cardTitle}>
                <User size={18} color="#d97706" /> Informations personnelles
              </h3>
              <div className="row g-3">
                {[
                  { name: 'prenom',    label: 'Prénom',    type: 'text'  },
                  { name: 'nom',       label: 'Nom',       type: 'text'  },
                  { name: 'email',     label: 'Email',     type: 'email' },
                  { name: 'telephone', label: 'Téléphone', type: 'tel'   },
                  { name: 'adresse',   label: 'Adresse',   type: 'text'  },
                ].map((f) => (
                  <div key={f.name} className="col-12 col-md-6">
                    <div style={styles.fieldWrap}>
                      <label style={styles.label}>{f.label}</label>
                      {editing
                        ? <input name={f.name} type={f.type} value={formData[f.name]} onChange={handleChange} style={styles.input} />
                        : <div style={styles.fieldValue}>{transporteur[f.name]}</div>
                      }
                    </div>
                  </div>
                ))}

                {/* VILLE */}
                <div className="col-12 col-md-6">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}><MapPin size={13} /> Ville</label>
                    {editing
                      ? <select name="ville" value={formData.ville} onChange={handleChange} style={styles.select}>
                          {villes.map((v) => <option key={v}>{v}</option>)}
                        </select>
                      : <div style={styles.fieldValue}>{transporteur.ville}</div>
                    }
                  </div>
                </div>

                {/* BIO */}
                <div className="col-12">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>Bio</label>
                    {editing
                      ? <textarea name="bio" value={formData.bio} onChange={handleChange} style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} rows={3} />
                      : <div style={{ ...styles.fieldValue, lineHeight: 1.6 }}>{transporteur.bio}</div>
                    }
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== TAB VÉHICULES ===== */}
          {activeTab === 'vehicules' && (
            <motion.div key="vehicules" style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={styles.cardHeaderRow}>
                <h3 style={styles.cardTitle}>
                  <Truck size={18} color="#d97706" /> Mes véhicules
                </h3>
                <motion.button style={styles.btnAjouter} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Plus size={14} /> Ajouter
                </motion.button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {vehicules.map((v, i) => (
                  <motion.div
                    key={v.id}
                    style={styles.vehiculeCard}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ x: 4 }}
                  >
                    {/* ICÔNE */}
                    <div style={styles.vehiculeIcon}>
                      <Truck size={24} color="#d97706" />
                    </div>

                    {/* INFOS */}
                    <div style={{ flex: 1 }}>
                      <div style={styles.vehiculeNom}>{v.nom}</div>
                      <div style={styles.vehiculeImmat}>{v.immat} • {v.annee}</div>
                      <div style={styles.vehiculeDocs}>
                        <span style={styles.docItem}>
                          <FileText size={11} /> Assurance : {v.assurance}
                        </span>
                        <span style={styles.docItem}>
                          <CheckCircle size={11} /> Visite : {v.visite}
                        </span>
                      </div>
                    </div>

                    {/* STATUT + ACTIONS */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span style={{
                        ...styles.statutBadge,
                        background: v.statut === 'Disponible' ? '#dcfce7' : '#dbeafe',
                        color:      v.statut === 'Disponible' ? '#16a34a' : '#2563eb',
                      }}>
                        {v.statut === 'Disponible' ? <CheckCircle size={11} /> : <Navigation size={11} />}
                        {v.statut}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <motion.button style={styles.vehiculeEditBtn} whileHover={{ scale: 1.1 }}>
                          <Edit3 size={13} color="#6b7280" />
                        </motion.button>
                        <motion.button
                          style={{ ...styles.vehiculeEditBtn, background: '#fef2f2' }}
                          onClick={() => supprimerVehicule(v.id)}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Trash2 size={13} color="#dc2626" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {vehicules.length === 0 && (
                <div style={styles.emptyVehicules}>
                  <Truck size={40} color="#e5e7eb" />
                  <p style={{ color: '#9ca3af', marginTop: '0.8rem' }}>Aucun véhicule enregistré</p>
                </div>
              )}

            </motion.div>
          )}

          {/* ===== TAB ZONES ===== */}
          {activeTab === 'zones' && (
            <motion.div key="zones" style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 style={styles.cardTitle}>
                <MapPin size={18} color="#d97706" /> Zones d'intervention
              </h3>
              <p style={styles.zonesDesc}>
                Sélectionnez les villes où vous êtes disponible pour effectuer des livraisons.
              </p>

              <div style={styles.zonesGrid}>
                {zonesDisponibles.map((zone) => {
                  const active = zonesActives.includes(zone);
                  return (
                    <motion.button
                      key={zone}
                      style={{
                        ...styles.zoneBtn,
                        background:  active ? '#d97706' : 'white',
                        color:       active ? 'white'   : '#374151',
                        borderColor: active ? '#d97706' : '#e5e7eb',
                      }}
                      onClick={() => toggleZone(zone)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <MapPin size={13} />
                      {zone}
                      {active && <CheckCircle size={13} />}
                    </motion.button>
                  );
                })}
              </div>

              <div style={styles.zonesResume}>
                <Shield size={14} color="#d97706" />
                <span>
                  {zonesActives.length} zone(s) sélectionnée(s) : {zonesActives.join(', ')}
                </span>
              </div>

              <motion.button
                style={styles.btnSauvegarderZones}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save size={15} /> Sauvegarder mes zones
              </motion.button>
            </motion.div>
          )}

          {/* ===== TAB AVIS ===== */}
          {activeTab === 'avis' && (
            <motion.div key="avis" style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={styles.avisHeader}>
                <h3 style={styles.cardTitle}>
                  <Star size={18} color="#f0c040" fill="#f0c040" /> Avis de mes clients
                </h3>
                <div style={styles.noteMoyenneWrap}>
                  <span style={styles.noteMoyenne}>4.8</span>
                  <div>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[1,2,3,4,5].map((n) => (
                        <Star key={n} size={16} color="#f0c040" fill={n <= 4 ? '#f0c040' : 'transparent'} />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {avisClients.length} avis
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {avisClients.map((avis, i) => (
                  <motion.div
                    key={avis.id}
                    style={styles.avisCard}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div style={styles.avisTop}>
                      <div style={styles.avisAvatar}>{avis.nom[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.avisNom}>{avis.nom}</div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1,2,3,4,5].map((n) => (
                            <Star key={n} size={13} color="#f0c040" fill={n <= avis.note ? '#f0c040' : 'transparent'} />
                          ))}
                        </div>
                      </div>
                      <span style={styles.avisDate}>{avis.date}</span>
                    </div>
                    <p style={styles.avisCommentaire}>"{avis.commentaire}"</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ===== TAB SÉCURITÉ ===== */}
          {activeTab === 'securite' && (
            <motion.div key="securite" style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 style={styles.cardTitle}>
                <Lock size={18} color="#d97706" /> Changer le mot de passe
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
            <motion.div key="notifs" style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 style={styles.cardTitle}>
                <Bell size={18} color="#d97706" /> Préférences de notifications
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                        ? <ToggleRight size={36} color="#d97706" />
                        : <ToggleLeft  size={36} color="#9ca3af" />
                      }
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              <div style={{ ...styles.notifInfo, background: '#fffbeb', color: '#d97706' }}>
                <Shield size={14} color="#d97706" />
                <span>Préférences sauvegardées automatiquement.</span>
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
  profileHero:   { background: 'linear-gradient(135deg, #78350f 0%, #d97706 100%)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' },
  heroDecoBg:    { position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' },
  heroContent:   { display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 },
  avatarWrap:    { position: 'relative', flexShrink: 0 },
  avatar:        { width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.3)' },
  avatarInitiale:{ fontSize: '1.8rem', fontWeight: '900', color: 'white' },
  cameraBtn:     { position: 'absolute', bottom: '0', right: '0', background: '#d97706', border: '2px solid white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  heroInfos:     { flex: 1, minWidth: '200px' },
  nomWrap:       { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' },
  heroNom:       { color: 'white', fontWeight: '900', fontSize: '1.4rem', margin: 0 },
  roleBadge:     { background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.78rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' },
  dispoBadge:    { fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' },
  heroMeta:      { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginBottom: '10px' },
  heroBio:       { color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 },
  dispoToggle:   { display: 'flex', alignItems: 'center', gap: '6px', border: '1.5px solid', borderRadius: '10px', padding: '0.4rem 0.8rem', cursor: 'pointer' },
  btnEditer:     { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '12px', padding: '0.6rem 1.2rem', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' },
  btnAnnuler:    { display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', padding: '0.55rem', fontWeight: '600', cursor: 'pointer' },
  btnSauvegarder:{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0c040', color: '#1a2e10', border: 'none', borderRadius: '10px', padding: '0.55rem 1rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' },
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
  card:          { background: 'white', borderRadius: '16px', padding: '1.8rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  cardTitle:     { fontSize: '1.05rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  cardHeaderRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' },

  // CHAMPS
  fieldWrap:  { display: 'flex', flexDirection: 'column', gap: '5px' },
  label:      { fontSize: '0.82rem', fontWeight: '600', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' },
  input:      { width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', fontFamily: 'inherit' },
  select:     { width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', cursor: 'pointer' },
  fieldValue: { fontSize: '0.92rem', fontWeight: '500', color: '#1a2e10', padding: '0.7rem 0', borderBottom: '1px solid #f5f5f5' },

  // VÉHICULES
  btnAjouter:     { display: 'flex', alignItems: 'center', gap: '5px', background: '#fffbeb', color: '#d97706', border: '1.5px solid #fcd34d', borderRadius: '10px', padding: '0.5rem 1rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' },
  vehiculeCard:   { display: 'flex', alignItems: 'center', gap: '14px', padding: '1rem', borderRadius: '14px', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s' },
  vehiculeIcon:   { width: '52px', height: '52px', borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  vehiculeNom:    { fontWeight: '700', fontSize: '0.92rem', color: '#1a2e10', marginBottom: '2px' },
  vehiculeImmat:  { fontSize: '0.78rem', color: '#6b7280', marginBottom: '4px' },
  vehiculeDocs:   { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  docItem:        { display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#6b7280' },
  statutBadge:    { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700' },
  vehiculeEditBtn:{ background: '#f4f6f4', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' },
  emptyVehicules: { textAlign: 'center', padding: '3rem 1rem' },

  // ZONES
  zonesDesc:     { fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.2rem' },
  zonesGrid:     { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.2rem' },
  zoneBtn:       { display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem', borderRadius: '20px', border: '1.5px solid', fontSize: '0.83rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: 'none' },
  zonesResume:   { display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#fffbeb', borderRadius: '10px', padding: '0.8rem', fontSize: '0.82rem', color: '#d97706', fontWeight: '500', marginBottom: '1rem', border: '1px solid #fcd34d' },
  btnSauvegarderZones:{ display: 'flex', alignItems: 'center', gap: '6px', background: '#d97706', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem 1.5rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(217,119,6,0.3)' },

  // AVIS
  avisHeader:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  noteMoyenneWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  noteMoyenne:     { fontSize: '2.5rem', fontWeight: '900', color: '#1a2e10' },
  avisCard:        { background: '#fafafa', borderRadius: '14px', padding: '1.1rem', border: '1px solid #f0f0f0' },
  avisTop:         { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.7rem' },
  avisAvatar:      { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #d97706, #fbbf24)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.88rem', flexShrink: 0 },
  avisNom:         { fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10', marginBottom: '2px' },
  avisDate:        { fontSize: '0.75rem', color: '#9ca3af', marginLeft: 'auto' },
  avisCommentaire: { fontSize: '0.87rem', color: '#374151', fontStyle: 'italic', lineHeight: 1.55, margin: 0 },

  // MOT DE PASSE
  pwdWrap:     { position: 'relative' },
  eyeBtn:      { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' },
  strengthBar: { display: 'flex', gap: '4px', marginBottom: '4px' },
  strengthSeg: { flex: 1, height: '4px', borderRadius: '4px', transition: 'background 0.3s' },
  btnPwd:      { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#d97706', color: 'white', border: 'none', borderRadius: '12px', padding: '0.85rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(217,119,6,0.3)' },

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
  notifInfo:  { display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '10px', padding: '0.7rem 1rem', marginTop: '1rem', fontSize: '0.78rem', fontWeight: '500' },
};