import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Building,
  Edit3, Save, X, Camera, Shield,
  Star, Package, ShoppingBag, TrendingUp,
  CheckCircle, Eye, EyeOff, Lock,
  AlertCircle, Loader
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';

// ===== MOCK DATA =====
const vendeurInitial = {
  prenom:      'Moussa',
  nom:         'Koné',
  email:       'moussa.kone@email.com',
  telephone:   '+229 01 97 XX XX XX',
  ville:       'Cotonou',
  association: 'Coopérative AgriSud Bénin',
  cip:         'BJ12345678',
  bio:         'Producteur de céréales depuis 8 ans, spécialisé dans le maïs et le soja. Membre fondateur de la coopérative AgriSud.',
  avatar:      null,
  verifie:     true,
  dateInscription: 'Janvier 2024',
};

const stats = [
  { label: 'Produits actifs',  value: '8',            icon: Package,    color: '#d97706', bg: '#fffbeb' },
  { label: 'Commandes reçues', value: '124',           icon: ShoppingBag,color: '#2563eb', bg: '#eff6ff' },
  { label: 'Note moyenne',     value: '4.9 ⭐',        icon: Star,       color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Revenus totaux',   value: '2.4M FCFA',    icon: TrendingUp, color: '#1a5c2a', bg: '#f0fdf4' },
];

const villes = [
  'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi',
  'Djougou', 'Bohicon', 'Kandi', 'Natitingou',
  'Ouidah', 'Abomey', 'Nikki', 'Banikoara',
];

const avisClients = [
  { id: 1, nom: 'Kofi A.',  note: 5,   commentaire: 'Excellent vendeur, livraison rapide !',    date: 'Il y a 2 jours'   },
  { id: 2, nom: 'Sèna B.',  note: 4,   commentaire: 'Bonne qualité de maïs, je recommande.',   date: 'Il y a 1 semaine'  },
  { id: 3, nom: 'Yao D.',   note: 5,   commentaire: 'Très professionnel et ponctuel.',          date: 'Il y a 2 semaines' },
];

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

export default function SellerProfile() {
  const [vendeur,       setVendeur]       = useState(vendeurInitial);
  const [editing,       setEditing]       = useState(false);
  const [formData,      setFormData]      = useState(vendeurInitial);
  const [loading,       setSaving]        = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [activeTab,     setActiveTab]     = useState('infos');
  const [showPwd,       setShowPwd]       = useState(false);
  const [showNewPwd,    setShowNewPwd]    = useState(false);
  const [pwdForm,       setPwdForm]       = useState({ actuel: '', nouveau: '', confirmer: '' });
  const [pwdLoading,    setPwdLoading]    = useState(false);
  const [pwdSuccess,    setPwdSuccess]    = useState(false);
  const [pwdError,      setPwdError]      = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setVendeur(formData);
      setSaving(false);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  const handleCancel = () => {
    setFormData(vendeur);
    setEditing(false);
  };

  const handlePwdChange = (e) => {
    setPwdForm({ ...pwdForm, [e.target.name]: e.target.value });
    setPwdError('');
  };

  const handlePwdSave = () => {
    if (!pwdForm.actuel)    { setPwdError('Entrez votre mot de passe actuel.'); return; }
    if (!pwdForm.nouveau)   { setPwdError('Entrez un nouveau mot de passe.');   return; }
    if (pwdForm.nouveau.length < 8) { setPwdError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (pwdForm.nouveau !== pwdForm.confirmer) { setPwdError('Les mots de passe ne correspondent pas.'); return; }
    setPwdLoading(true);
    setTimeout(() => {
      setPwdLoading(false);
      setPwdSuccess(true);
      setPwdForm({ actuel: '', nouveau: '', confirmer: '' });
      setTimeout(() => setPwdSuccess(false), 3000);
    }, 1500);
  };

  return (
    <DashboardLayout role="seller">
      <div>

        {/* ===== EN-TÊTE PROFIL ===== */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          style={styles.profileHero}
        >
          {/* FOND DÉCO */}
          <div style={styles.heroDecoBg} />

          <div style={styles.heroContent}>
            {/* AVATAR */}
            <div style={styles.avatarWrap}>
              <div style={styles.avatar}>
                {vendeur.avatar
                  ? <img src={vendeur.avatar} alt="avatar" style={styles.avatarImg} />
                  : <span style={styles.avatarInitiale}>
                      {vendeur.prenom[0]}{vendeur.nom[0]}
                    </span>
                }
              </div>
              <motion.button
                style={styles.cameraBtn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Camera size={14} color="white" />
              </motion.button>
            </div>

            {/* INFOS PRINCIPALES */}
            <div style={styles.heroInfos}>
              <div style={styles.nomWrap}>
                <h1 style={styles.heroNom}>{vendeur.prenom} {vendeur.nom}</h1>
                {vendeur.verifie && (
                  <span style={styles.verifiBadge}>
                    <Shield size={12} /> Vérifié
                  </span>
                )}
              </div>
              <div style={styles.heroMeta}>
                <span><Building size={14} /> {vendeur.association}</span>
                <span><MapPin size={14} /> {vendeur.ville}</span>
                <span>Membre depuis {vendeur.dateInscription}</span>
              </div>
              <p style={styles.heroBio}>{vendeur.bio}</p>
            </div>

            {/* BOUTON ÉDITER */}
            {!editing ? (
              <motion.button
                style={styles.btnEditer}
                onClick={() => setEditing(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Edit3 size={15} /> Modifier le profil
              </motion.button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button style={styles.btnAnnuler} onClick={handleCancel} whileHover={{ scale: 1.03 }}>
                  <X size={15} /> Annuler
                </motion.button>
                <motion.button
                  style={{ ...styles.btnSauvegarder, opacity: loading ? 0.8 : 1 }}
                  onClick={handleSave}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.03 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                >
                  {loading
                    ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader size={15} /></motion.div>
                    : <><Save size={15} /> Sauvegarder</>
                  }
                </motion.button>
              </div>
            )}
          </div>

          {/* MESSAGE SUCCÈS */}
          <AnimatePresence>
            {success && (
              <motion.div
                style={styles.successToast}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <CheckCircle size={16} color="#16a34a" />
                Profil mis à jour avec succès !
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
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: i * 0.08 }}
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
            { id: 'infos',    label: '👤 Informations'   },
            { id: 'securite', label: '🔒 Sécurité'       },
            { id: 'avis',     label: '⭐ Avis clients'    },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              style={{
                ...styles.tab,
                background:   activeTab === tab.id ? '#1a5c2a' : 'white',
                color:        activeTab === tab.id ? 'white'   : '#374151',
                borderColor:  activeTab === tab.id ? '#1a5c2a' : '#e5e7eb',
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
                <User size={18} color="#1a5c2a" /> Informations personnelles
              </h3>

              <div className="row g-3">

                {/* PRÉNOM */}
                <div className="col-12 col-md-6">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>Prénom</label>
                    {editing ? (
                      <input name="prenom" value={formData.prenom} onChange={handleChange} style={styles.input} />
                    ) : (
                      <div style={styles.fieldValue}>{vendeur.prenom}</div>
                    )}
                  </div>
                </div>

                {/* NOM */}
                <div className="col-12 col-md-6">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>Nom</label>
                    {editing ? (
                      <input name="nom" value={formData.nom} onChange={handleChange} style={styles.input} />
                    ) : (
                      <div style={styles.fieldValue}>{vendeur.nom}</div>
                    )}
                  </div>
                </div>

                {/* EMAIL */}
                <div className="col-12 col-md-6">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}><Mail size={13} /> Email</label>
                    {editing ? (
                      <input name="email" type="email" value={formData.email} onChange={handleChange} style={styles.input} />
                    ) : (
                      <div style={styles.fieldValue}>{vendeur.email}</div>
                    )}
                  </div>
                </div>

                {/* TÉLÉPHONE */}
                <div className="col-12 col-md-6">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}><Phone size={13} /> Téléphone</label>
                    {editing ? (
                      <input name="telephone" value={formData.telephone} onChange={handleChange} style={styles.input} />
                    ) : (
                      <div style={styles.fieldValue}>{vendeur.telephone}</div>
                    )}
                  </div>
                </div>

                {/* VILLE */}
                <div className="col-12 col-md-6">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}><MapPin size={13} /> Ville</label>
                    {editing ? (
                      <select name="ville" value={formData.ville} onChange={handleChange} style={styles.select}>
                        {villes.map((v) => <option key={v}>{v}</option>)}
                      </select>
                    ) : (
                      <div style={styles.fieldValue}>{vendeur.ville}</div>
                    )}
                  </div>
                </div>

                {/* ASSOCIATION */}
                <div className="col-12 col-md-6">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}><Building size={13} /> Association / Coopérative</label>
                    {editing ? (
                      <input name="association" value={formData.association} onChange={handleChange} style={styles.input} />
                    ) : (
                      <div style={styles.fieldValue}>{vendeur.association}</div>
                    )}
                  </div>
                </div>

                {/* CIP */}
                <div className="col-12 col-md-6">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>Numéro CIP</label>
                    <div style={styles.fieldValue}>
                      {vendeur.cip}
                      <span style={styles.cipBadge}>
                        <Shield size={11} /> Vérifié
                      </span>
                    </div>
                  </div>
                </div>

                {/* BIO */}
                <div className="col-12">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>Bio / Description</label>
                    {editing ? (
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        style={{ ...styles.input, minHeight: '90px', resize: 'vertical' }}
                        rows={3}
                      />
                    ) : (
                      <div style={{ ...styles.fieldValue, lineHeight: 1.6 }}>{vendeur.bio}</div>
                    )}
                  </div>
                </div>

              </div>
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
                <Lock size={18} color="#1a5c2a" /> Changer le mot de passe
              </h3>

              <AnimatePresence>
                {pwdError && (
                  <motion.div style={styles.errorBox} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <AlertCircle size={15} /> {pwdError}
                  </motion.div>
                )}
                {pwdSuccess && (
                  <motion.div style={styles.successBox} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <CheckCircle size={15} /> Mot de passe modifié avec succès !
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* MOT DE PASSE ACTUEL */}
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Mot de passe actuel *</label>
                  <div style={styles.pwdWrap}>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      name="actuel"
                      value={pwdForm.actuel}
                      onChange={handlePwdChange}
                      placeholder="••••••••"
                      style={{ ...styles.input, paddingRight: '3rem' }}
                    />
                    <button style={styles.eyeBtn} onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                    </button>
                  </div>
                </div>

                {/* NOUVEAU MOT DE PASSE */}
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Nouveau mot de passe *</label>
                  <div style={styles.pwdWrap}>
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      name="nouveau"
                      value={pwdForm.nouveau}
                      onChange={handlePwdChange}
                      placeholder="Minimum 8 caractères"
                      style={{ ...styles.input, paddingRight: '3rem' }}
                    />
                    <button style={styles.eyeBtn} onClick={() => setShowNewPwd(!showNewPwd)}>
                      {showNewPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                    </button>
                  </div>

                  {/* FORCE MOT DE PASSE */}
                  {pwdForm.nouveau && (
                    <div style={{ marginTop: '6px' }}>
                      <div style={styles.strengthBar}>
                        {[1,2,3,4].map((n) => (
                          <div key={n} style={{
                            ...styles.strengthSeg,
                            background: pwdForm.nouveau.length >= n * 2
                              ? n <= 1 ? '#ef4444' : n <= 2 ? '#f97316' : n <= 3 ? '#eab308' : '#22c55e'
                              : '#e5e7eb',
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {pwdForm.nouveau.length < 4 ? '🔴 Très faible'
                          : pwdForm.nouveau.length < 6 ? '🟠 Faible'
                          : pwdForm.nouveau.length < 8 ? '🟡 Moyen'
                          : '🟢 Fort'}
                      </span>
                    </div>
                  )}
                </div>

                {/* CONFIRMER */}
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Confirmer le nouveau mot de passe *</label>
                  <input
                    type="password"
                    name="confirmer"
                    value={pwdForm.confirmer}
                    onChange={handlePwdChange}
                    placeholder="Répétez le mot de passe"
                    style={{
                      ...styles.input,
                      borderColor: pwdForm.confirmer && pwdForm.confirmer !== pwdForm.nouveau ? '#ef4444' : '#e5e7eb',
                    }}
                  />
                  {pwdForm.confirmer && pwdForm.confirmer !== pwdForm.nouveau && (
                    <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>❌ Les mots de passe ne correspondent pas</span>
                  )}
                  {pwdForm.confirmer && pwdForm.confirmer === pwdForm.nouveau && (
                    <span style={{ fontSize: '0.78rem', color: '#22c55e' }}>✅ Les mots de passe correspondent</span>
                  )}
                </div>

                <motion.button
                  style={{ ...styles.btnSauvegarder, opacity: pwdLoading ? 0.8 : 1 }}
                  onClick={handlePwdSave}
                  disabled={pwdLoading}
                  whileHover={{ scale: pwdLoading ? 1 : 1.02 }}
                  whileTap={{ scale: pwdLoading ? 1 : 0.98 }}
                >
                  {pwdLoading
                    ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div>
                    : <><Lock size={15} /> Mettre à jour le mot de passe</>
                  }
                </motion.button>

              </div>

              {/* COMPTE */}
              <div style={styles.dangerZone}>
                <h4 style={styles.dangerTitle}>⚠️ Zone de danger</h4>
                <p style={styles.dangerDesc}>
                  La suppression de votre compte est irréversible. Toutes vos données seront effacées.
                </p>
                <motion.button
                  style={styles.btnSupprimer}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Supprimer mon compte
                </motion.button>
              </div>

            </motion.div>
          )}

          {/* ===== TAB AVIS ===== */}
          {activeTab === 'avis' && (
            <motion.div
              key="avis"
              style={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div style={styles.avisHeader}>
                <h3 style={styles.cardTitle}>
                  <Star size={18} color="#f0c040" fill="#f0c040" /> Avis de mes clients
                </h3>
                <div style={styles.noteMoyenneWrap}>
                  <span style={styles.noteMoyenne}>4.9</span>
                  <div>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[1,2,3,4,5].map((n) => (
                        <Star key={n} size={16} color="#f0c040" fill="#f0c040" />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Basé sur {avisClients.length} avis
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
                      <div style={styles.avisAvatar}>
                        {avis.nom[0]}
                      </div>
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

        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}

// ===== STYLES =====
const styles = {
  // HERO
  profileHero:  { background: 'linear-gradient(135deg, #0d2b14 0%, #1a5c2a 100%)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' },
  heroDecoBg:   { position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', pointerEvents: 'none' },
  heroContent:  { display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 },
  avatarWrap:   { position: 'relative', flexShrink: 0 },
  avatar:       { width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #f0c040, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.3)', overflow: 'hidden' },
  avatarImg:    { width: '100%', height: '100%', objectFit: 'cover' },
  avatarInitiale:{ fontSize: '1.8rem', fontWeight: '900', color: 'white' },
  cameraBtn:    { position: 'absolute', bottom: '0', right: '0', background: '#1a5c2a', border: '2px solid white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  heroInfos:    { flex: 1, minWidth: '200px' },
  nomWrap:      { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' },
  heroNom:      { color: 'white', fontWeight: '900', fontSize: '1.4rem', margin: 0 },
  verifiBadge:  { display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0c040', color: '#1a2e10', fontSize: '0.72rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' },
  heroMeta:     { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginBottom: '10px' },
  heroBio:      { color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 },
  btnEditer:    { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '12px', padding: '0.6rem 1.2rem', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', backdropFilter: 'blur(4px)', flexShrink: 0 },
  btnAnnuler:   { display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', padding: '0.55rem 1rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 },
  btnSauvegarder:{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0c040', color: '#1a2e10', border: 'none', borderRadius: '10px', padding: '0.55rem 1.2rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 },
  successToast: { display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', color: '#16a34a', borderRadius: '10px', padding: '0.7rem 1rem', marginTop: '1rem', fontSize: '0.85rem', fontWeight: '600', position: 'relative', zIndex: 1 },

  // STATS
  statCard:  { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', textAlign: 'center' },
  statIcon:  { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' },
  statValue: { fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', marginBottom: '3px' },
  statLabel: { fontSize: '0.78rem', color: '#6b7280' },

  // TABS
  tabs: { display: 'flex', gap: '8px', marginBottom: '1.2rem', flexWrap: 'wrap' },
  tab:  { padding: '0.5rem 1.2rem', borderRadius: '20px', border: '1.5px solid', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: 'none' },

  // CARD
  card:      { background: 'white', borderRadius: '16px', padding: '1.8rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: '1.05rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' },

  // CHAMPS
  fieldWrap:  { display: 'flex', flexDirection: 'column', gap: '5px' },
  label:      { fontSize: '0.82rem', fontWeight: '600', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' },
  input:      { width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', fontFamily: 'inherit', transition: 'border-color 0.2s' },
  select:     { width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', cursor: 'pointer' },
  fieldValue: { fontSize: '0.92rem', fontWeight: '500', color: '#1a2e10', padding: '0.7rem 0', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f5f5f5' },
  cipBadge:   { display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#f0fdf4', color: '#1a5c2a', fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' },

  // MOT DE PASSE
  pwdWrap:      { position: 'relative' },
  eyeBtn:       { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  strengthBar:  { display: 'flex', gap: '4px', marginBottom: '4px' },
  strengthSeg:  { flex: 1, height: '4px', borderRadius: '4px', transition: 'background 0.3s' },

  // MESSAGES
  errorBox:  { display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#dc2626' },
  successBox:{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#16a34a' },

  // DANGER ZONE
  dangerZone:   { marginTop: '2rem', background: '#fef2f2', borderRadius: '14px', padding: '1.2rem', border: '1px solid #fecaca' },
  dangerTitle:  { fontSize: '0.95rem', fontWeight: '800', color: '#dc2626', marginBottom: '0.4rem' },
  dangerDesc:   { fontSize: '0.82rem', color: '#6b7280', marginBottom: '1rem' },
  btnSupprimer: { display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '0.6rem 1.2rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' },

  // AVIS
  avisHeader:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  noteMoyenneWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  noteMoyenne:     { fontSize: '2.5rem', fontWeight: '900', color: '#1a2e10' },
  avisCard:        { background: '#fafafa', borderRadius: '14px', padding: '1.1rem', border: '1px solid #f0f0f0' },
  avisTop:         { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.7rem' },
  avisAvatar:      { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a5c2a, #4db86a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.88rem', flexShrink: 0 },
  avisNom:         { fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10', marginBottom: '2px' },
  avisDate:        { fontSize: '0.75rem', color: '#9ca3af', marginLeft: 'auto' },
  avisCommentaire: { fontSize: '0.87rem', color: '#374151', fontStyle: 'italic', lineHeight: 1.55, margin: 0 },
};