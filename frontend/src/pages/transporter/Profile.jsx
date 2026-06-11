import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Phone, Mail,
  Edit3, Save, X, Camera, Shield,
  Truck, Star, TrendingUp, Navigation,
  CheckCircle, Eye, EyeOff, Lock,
  AlertCircle, Loader,
  Plus, Trash2, ToggleLeft, ToggleRight,
  Bell, FileText, MapPinned, AlertTriangle, XCircle,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';
import TransportService from '../../services/transport.service';

const ORANGE = '#d97706';

const VILLES = [
  'Cotonou','Porto-Novo','Abomey-Calavi','Ouidah','Bohicon',
  'Abomey','Lokossa','Parakou','Natitingou','Djougou',
  'Kandi','Nikki','Banikoara','Malanville','Savè',
];

const ZONES_DISPO = [
  'Cotonou','Porto-Novo','Parakou','Abomey-Calavi',
  'Natitingou','Djougou','Kandi','Ouidah','Bohicon',
  'Nikki','Banikoara','Malanville',
];

const TYPE_LABELS = {
  PICKUP:     'Pick-up',
  CAMION_5T:  'Camion 5t',
  CAMION_8T:  'Camion 8t',
  CAMION_10T: 'Camion 10t',
  CAMION_15T: 'Camion 15t',
};

const fadeUp = { hidden: { y: 30, opacity: 0 }, show: { y: 0, opacity: 1 } };

const isActif = s => ['ACCEPTEE','EN_COURS','accepted','in_transit'].includes(s);
const isTermine = s => ['TERMINEE','completed'].includes(s);

export default function TransporterProfile() {
  const { user, chargerUtilisateur } = useAuth();

  // ─── Profil ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({ prenom: '', nom: '', telephone: '', adresse: '', ville: '', bio: '' });
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [errProfil, setErrProfil] = useState('');

  // ─── Véhicules ───────────────────────────────────────────────────────────
  const [vehicules,   setVehicules]   = useState([]);
  const [chargVehs,   setChargVehs]   = useState(true);

  // ─── Missions (stats) ─────────────────────────────────────────────────────
  const [missions, setMissions] = useState([]);

  // ─── Disponibilité ───────────────────────────────────────────────────────
  const [disponible, setDisponible] = useState(false);

  // ─── Zones ───────────────────────────────────────────────────────────────
  const [zonesActives,  setZonesActives]  = useState([]);
  const [savingZones,   setSavingZones]   = useState(false);

  // ─── Mot de passe ─────────────────────────────────────────────────────────
  const [activeTab,  setActiveTab]  = useState('infos');
  const [showPwd,    setShowPwd]    = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdForm,    setPwdForm]    = useState({ actuel: '', nouveau: '', confirmer: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError,   setPwdError]   = useState('');

  // ─── Chargement initial ───────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      const init = {
        prenom:    user.prenom    || '',
        nom:       user.nom       || '',
        telephone: user.telephone || '',
        adresse:   user.adresse   || '',
        ville:     user.ville     || '',
        bio:       user.bio       || '',
      };
      setFormData(init);
    }
    chargerDonnees();
  }, [user]);

  const chargerDonnees = async () => {
    try {
      setChargVehs(true);
      const [vehs, msns, dispo] = await Promise.all([
        TransportService.getMyVehicles().catch(() => []),
        TransportService.getMyMissions().catch(() => ({ results: [] })),
        TransportService.getAvailability().catch(() => ({ est_disponible: false })),
      ]);
      setVehicules(Array.isArray(vehs) ? vehs : vehs.results || []);
      setMissions(msns.results || []);
      setDisponible(dispo.est_disponible ?? false);
    } finally {
      setChargVehs(false);
    }
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const totalMissions = missions.length;
  const enCours       = missions.filter(m => isActif(m.status)).length;
  const terminees     = missions.filter(m => isTermine(m.status)).length;
  const revenusTotaux = missions
    .filter(m => isTermine(m.status))
    .reduce((s, m) => s + (Number(m.tarif) || Number(m.cout) || Number(m.montant) || 0), 0);

  const statsData = [
    { label: 'Missions totales', value: totalMissions, icon: Navigation, color: ORANGE,    bg: '#fffbeb' },
    { label: 'En cours',        value: enCours,        icon: Truck,      color: '#2563eb', bg: '#eff6ff' },
    { label: 'Livrées',         value: terminees,      icon: CheckCircle,color: '#1a5c2a', bg: '#f0fdf4' },
    {
      label: 'Revenus totaux',
      value: revenusTotaux > 0 ? `${Math.round(revenusTotaux / 1000)}k FCFA` : '—',
      icon: TrendingUp, color: '#7c3aed', bg: '#f5f3ff',
    },
  ];

  // ─── Sauvegarder profil ───────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setErrProfil('');
    try {
      await AuthService.modifierProfil({
        prenom:    formData.prenom,
        nom:       formData.nom,
        adresse:   formData.adresse,
        ville:     formData.ville,
        bio:       formData.bio,
      });
      await chargerUtilisateur();
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setErrProfil(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ prenom: user?.prenom || '', nom: user?.nom || '', telephone: user?.telephone || '', adresse: user?.adresse || '', ville: user?.ville || '', bio: user?.bio || '' });
    setEditing(false);
    setErrProfil('');
  };

  // ─── Toggle disponibilité ─────────────────────────────────────────────────
  const handleToggleDispo = async () => {
    const newVal = !disponible;
    setDisponible(newVal);
    try { await TransportService.setAvailability(newVal); }
    catch { setDisponible(!newVal); }
  };

  // ─── Zones ────────────────────────────────────────────────────────────────
  const toggleZone = z => setZonesActives(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z]);

  const handleSaveZones = async () => {
    setSavingZones(true);
    try {
      await AuthService.updateTransporterProfile({ zones: zonesActives });
    } catch {}
    finally { setSavingZones(false); }
  };

  // ─── Changer mot de passe ─────────────────────────────────────────────────
  const handlePwdChange = (e) => { setPwdForm({ ...pwdForm, [e.target.name]: e.target.value }); setPwdError(''); };

  const handlePwdSave = async () => {
    if (!pwdForm.actuel)  { setPwdError('Entrez votre mot de passe actuel.'); return; }
    if (!pwdForm.nouveau || pwdForm.nouveau.length < 8) { setPwdError('Minimum 8 caractères.'); return; }
    if (pwdForm.nouveau !== pwdForm.confirmer) { setPwdError('Les mots de passe ne correspondent pas.'); return; }
    setPwdLoading(true); setPwdError('');
    try {
      await AuthService.changerMotDePasse({ actuel: pwdForm.actuel, nouveau: pwdForm.nouveau });
      setPwdSuccess(true);
      setPwdForm({ actuel: '', nouveau: '', confirmer: '' });
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Mot de passe actuel incorrect.');
    } finally {
      setPwdLoading(false);
    }
  };

  // ─── Supprimer véhicule ───────────────────────────────────────────────────
  const handleSupprimerVehicule = async (id) => {
    if (!window.confirm('Supprimer ce véhicule ?')) return;
    try {
      await TransportService.deleteVehicle(id);
      setVehicules(prev => prev.filter(v => v.id !== id));
    } catch {}
  };

  const nom   = user?.nom_complet || `${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Transporteur';
  const initiales = nom.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const dateInscription = user?.date_joined ? new Date(user.date_joined).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '—';

  return (
    <DashboardLayout role="transporter">
      <div>

        {/* ===== HERO ===== */}
        <motion.div variants={fadeUp} initial="hidden" animate="show"
          style={{ background: `linear-gradient(135deg, #78350f 0%, ${ORANGE} 100%)`, borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>

            {/* AVATAR */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.3)' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white' }}>{initiales}</span>
              </div>
            </div>

            {/* INFOS */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h1 style={{ color: 'white', fontWeight: '900', fontSize: '1.4rem', margin: 0 }}>{nom}</h1>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.78rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Truck size={12} /> Transporteur</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: disponible ? '#f0c040' : 'rgba(255,255,255,0.2)', color: disponible ? '#1a2e10' : 'rgba(255,255,255,0.8)' }}>
                  {disponible ? 'Disponible' : 'Indisponible'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginBottom: '10px' }}>
                {user?.telephone && <span><Phone size={13} /> {user.telephone}</span>}
                {user?.ville     && <span><MapPin size={13} /> {user.ville}</span>}
                <span><Truck size={13} /> {vehicules.length} véhicule(s)</span>
                <span>Membre depuis {dateInscription}</span>
              </div>
              {user?.bio && <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{user.bio}</p>}
            </div>

            {/* ACTIONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
              <motion.div
                style={{ display: 'flex', alignItems: 'center', gap: '6px', border: `1.5px solid ${disponible ? '#f0c040' : 'rgba(255,255,255,0.3)'}`, borderRadius: '10px', padding: '0.4rem 0.8rem', cursor: 'pointer', background: disponible ? 'rgba(240,192,64,0.2)' : 'rgba(255,255,255,0.1)' }}
                onClick={handleToggleDispo}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              >
                {disponible ? <ToggleRight size={22} color="#f0c040" /> : <ToggleLeft size={22} color="rgba(255,255,255,0.5)" />}
                <span style={{ color: disponible ? '#f0c040' : 'rgba(255,255,255,0.7)', fontSize: '0.82rem', fontWeight: '700' }}>
                  {disponible ? 'Disponible' : 'Indisponible'}
                </span>
              </motion.div>

              {!editing ? (
                <motion.button
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '12px', padding: '0.6rem 1.2rem', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}
                  onClick={() => setEditing(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                >
                  <Edit3 size={15} /><span> Modifier</span>
                </motion.button>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <motion.button style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', padding: '0.55rem', cursor: 'pointer' }} onClick={handleCancel} whileHover={{ scale: 1.03 }}>
                    <X size={14} />
                  </motion.button>
                  <motion.button
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0c040', color: '#1a2e10', border: 'none', borderRadius: '10px', padding: '0.55rem 1rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', opacity: saving ? 0.8 : 1 }}
                    onClick={handleSave} disabled={saving} whileHover={{ scale: saving ? 1 : 1.03 }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {saving ? (
                        <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader size={14} /></motion.div>
                        </motion.span>
                      ) : (
                        <motion.span key="idle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                          <Save size={14} /><span> Sauvegarder</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {saved && (
              <motion.div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', color: '#16a34a', borderRadius: '10px', padding: '0.7rem 1rem', marginTop: '1rem', fontSize: '0.85rem', fontWeight: '600', position: 'relative', zIndex: 1 }}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                <CheckCircle size={16} /> Profil mis à jour !
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ===== STATS ===== */}
        <div className="row g-3 mb-4">
          {statsData.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} className="col-6 col-lg-3" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: i * 0.08 }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', textAlign: 'center' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' }}>
                    <Icon size={20} color={s.color} />
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', marginBottom: '3px' }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{s.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ===== ONGLETS ===== */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          {[
            { id: 'infos',     Icon: User,     label: 'Informations' },
            { id: 'vehicules', Icon: Truck,    label: 'Véhicules'     },
            { id: 'zones',     Icon: MapPinned,label: 'Zones'          },
            { id: 'securite',  Icon: Lock,     label: 'Sécurité'       },
          ].map(tab => (
            <motion.button
              key={tab.id}
              style={{ padding: '0.5rem 1.1rem', borderRadius: '20px', border: '1.5px solid', fontSize: '0.83rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === tab.id ? ORANGE : 'white', color: activeTab === tab.id ? 'white' : '#374151', borderColor: activeTab === tab.id ? ORANGE : '#e5e7eb', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.97 }}
            >
              <tab.Icon size={14} /> {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── TAB INFOS ── */}
          {activeTab === 'infos' && (
            <motion.div key="infos" style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 style={styles.cardTitle}><User size={18} color={ORANGE} /> Informations personnelles</h3>

              {errProfil && (
                <div style={{ display: 'flex', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: '#dc2626', alignItems: 'center' }}>
                  <AlertCircle size={15} /> {errProfil}
                </div>
              )}

              <div className="row g-3">
                {[
                  { name: 'prenom',    label: 'Prénom',    type: 'text' },
                  { name: 'nom',       label: 'Nom',       type: 'text' },
                  { name: 'telephone', label: 'Téléphone', type: 'tel', readonly: true },
                  { name: 'adresse',   label: 'Adresse',   type: 'text' },
                ].map(f => (
                  <div key={f.name} className="col-12 col-md-6">
                    <div style={styles.fieldWrap}>
                      <label style={styles.label}>{f.label}</label>
                      {editing && !f.readonly
                        ? <input name={f.name} type={f.type} value={formData[f.name]} onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} style={styles.input} />
                        : <div style={styles.fieldValue}>{formData[f.name] || '—'}</div>
                      }
                    </div>
                  </div>
                ))}

                <div className="col-12 col-md-6">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}><MapPin size={13} /> Ville</label>
                    {editing
                      ? <select name="ville" value={formData.ville} onChange={e => setFormData({ ...formData, ville: e.target.value })} style={styles.select}>
                          <option value="">Sélectionner</option>
                          {VILLES.map(v => <option key={v}>{v}</option>)}
                        </select>
                      : <div style={styles.fieldValue}>{formData.ville || '—'}</div>
                    }
                  </div>
                </div>

                <div className="col-12">
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>Bio</label>
                    {editing
                      ? <textarea name="bio" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} rows={3} />
                      : <div style={{ ...styles.fieldValue, lineHeight: 1.6 }}>{formData.bio || '—'}</div>
                    }
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TAB VÉHICULES ── */}
          {activeTab === 'vehicules' && (
            <motion.div key="vehicules" style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={styles.cardTitle}><Truck size={18} color={ORANGE} /> Mes véhicules</h3>
                <motion.a
                  href="/transporter/enregistrer-vehicule"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fffbeb', color: ORANGE, border: `1.5px solid #fcd34d`, borderRadius: '10px', padding: '0.5rem 1rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'none' }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                >
                  <Plus size={14} /><span> Ajouter</span>
                </motion.a>
              </div>

              {chargVehs ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <Loader size={24} color={ORANGE} />
                </div>
              ) : vehicules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Truck size={40} color="#e5e7eb" />
                  <p style={{ color: '#9ca3af', marginTop: '0.8rem', fontSize: '0.88rem' }}>Aucun véhicule enregistré</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {vehicules.map((v, i) => (
                    <motion.div key={v.id} style={styles.vehiculeCard} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ x: 4 }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid #fde68a` }}>
                        <Truck size={24} color={ORANGE} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#1a2e10', marginBottom: '2px' }}>
                          {TYPE_LABELS[v.type] || v.type || 'Véhicule'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '4px' }}>
                          {v.immatriculation || '—'} {v.annee ? `• ${v.annee}` : ''}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {v.assurance_expiry && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#6b7280' }}>
                              <FileText size={11} /> Assurance : {new Date(v.assurance_expiry).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                          {v.visite_expiry && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#6b7280' }}>
                              <CheckCircle size={11} /> Visite : {new Date(v.visite_expiry).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700', background: v.est_disponible ? '#dcfce7' : '#dbeafe', color: v.est_disponible ? '#16a34a' : '#2563eb' }}>
                          {v.est_disponible ? <CheckCircle size={11} /> : <Navigation size={11} />}
                          {v.est_disponible ? 'Disponible' : 'En mission'}
                        </span>
                        <motion.button style={{ background: '#fef2f2', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }} onClick={() => handleSupprimerVehicule(v.id)} whileHover={{ scale: 1.1 }}>
                          <Trash2 size={13} color="#dc2626" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── TAB ZONES ── */}
          {activeTab === 'zones' && (
            <motion.div key="zones" style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 style={styles.cardTitle}><MapPin size={18} color={ORANGE} /> Zones d'intervention</h3>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.2rem' }}>
                Sélectionnez les villes où vous êtes disponible pour des livraisons.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.2rem' }}>
                {ZONES_DISPO.map(zone => {
                  const actif = zonesActives.includes(zone);
                  return (
                    <motion.button key={zone}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem', borderRadius: '20px', border: `1.5px solid ${actif ? ORANGE : '#e5e7eb'}`, background: actif ? ORANGE : 'white', color: actif ? 'white' : '#374151', fontSize: '0.83rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => toggleZone(zone)} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                    >
                      <MapPin size={13} /> {zone} {actif && <CheckCircle size={13} />}
                    </motion.button>
                  );
                })}
              </div>
              {zonesActives.length > 0 && (
                <div style={{ background: '#fffbeb', borderRadius: '10px', padding: '0.8rem', fontSize: '0.82rem', color: ORANGE, marginBottom: '1rem', border: `1px solid #fcd34d`, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Shield size={14} color={ORANGE} />
                  <span>{zonesActives.length} zone(s) : {zonesActives.join(', ')}</span>
                </div>
              )}
              <motion.button
                onClick={handleSaveZones} disabled={savingZones}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: ORANGE, color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem 1.5rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(217,119,6,0.3)' }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {savingZones ? (
                    <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={14} /></motion.div>
                      <span> Sauvegarde…</span>
                    </motion.span>
                  ) : (
                    <motion.span key="idle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Save size={15} /><span> Sauvegarder mes zones</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          )}

          {/* ── TAB SÉCURITÉ ── */}
          {activeTab === 'securite' && (
            <motion.div key="securite" style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 style={styles.cardTitle}><Lock size={18} color={ORANGE} /> Changer le mot de passe</h3>

              <AnimatePresence>
                {pwdError   && <motion.div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#dc2626' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AlertCircle size={15} /> {pwdError}</motion.div>}
                {pwdSuccess && <motion.div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#16a34a' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CheckCircle size={15} /> Mot de passe modifié !</motion.div>}
              </AnimatePresence>

              <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Mot de passe actuel *</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPwd ? 'text' : 'password'} name="actuel" value={pwdForm.actuel} onChange={handlePwdChange} placeholder="••••••••" style={{ ...styles.input, paddingRight: '3rem' }} />
                    <button style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }} onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                    </button>
                  </div>
                </div>

                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Nouveau mot de passe *</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showNewPwd ? 'text' : 'password'} name="nouveau" value={pwdForm.nouveau} onChange={handlePwdChange} placeholder="Minimum 8 caractères" style={{ ...styles.input, paddingRight: '3rem' }} />
                    <button style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }} onClick={() => setShowNewPwd(!showNewPwd)}>
                      {showNewPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                    </button>
                  </div>
                  {pwdForm.nouveau && (
                    <div>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px', marginTop: '6px' }}>
                        {[1,2,3,4].map(n => (
                          <div key={n} style={{ flex: 1, height: '4px', borderRadius: '4px', transition: 'background 0.3s', background: pwdForm.nouveau.length >= n * 2 ? n <= 1 ? '#ef4444' : n <= 2 ? '#f97316' : n <= 3 ? '#eab308' : '#22c55e' : '#e5e7eb' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {pwdForm.nouveau.length < 4 ? 'Très faible' : pwdForm.nouveau.length < 6 ? 'Faible' : pwdForm.nouveau.length < 8 ? 'Moyen' : 'Fort'}
                      </span>
                    </div>
                  )}
                </div>

                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Confirmer *</label>
                  <input type="password" name="confirmer" value={pwdForm.confirmer} onChange={handlePwdChange} placeholder="Répétez le mot de passe" style={{ ...styles.input, borderColor: pwdForm.confirmer && pwdForm.confirmer !== pwdForm.nouveau ? '#ef4444' : '#e5e7eb' }} />
                  {pwdForm.confirmer && pwdForm.confirmer !== pwdForm.nouveau && <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><XCircle size={13} color="#ef4444" /> Ne correspond pas</span>}
                  {pwdForm.confirmer && pwdForm.confirmer === pwdForm.nouveau && <span style={{ fontSize: '0.78rem', color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><CheckCircle size={13} color="#22c55e" /> Correspond</span>}
                </div>

                <motion.button
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: ORANGE, color: 'white', border: 'none', borderRadius: '12px', padding: '0.85rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(217,119,6,0.3)', opacity: pwdLoading ? 0.8 : 1 }}
                  onClick={handlePwdSave} disabled={pwdLoading}
                  whileHover={{ scale: pwdLoading ? 1 : 1.02 }} whileTap={{ scale: pwdLoading ? 1 : 0.98 }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {pwdLoading ? (
                      <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div>
                      </motion.span>
                    ) : (
                      <motion.span key="idle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <Lock size={15} /><span> Mettre à jour</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

const styles = {
  card:       { background: 'white', borderRadius: '16px', padding: '1.8rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  cardTitle:  { fontSize: '1.05rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1.2rem' },
  fieldWrap:  { display: 'flex', flexDirection: 'column', gap: '5px' },
  label:      { fontSize: '0.82rem', fontWeight: '600', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' },
  input:      { width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', fontFamily: 'inherit', boxSizing: 'border-box' },
  select:     { width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', cursor: 'pointer', boxSizing: 'border-box' },
  fieldValue: { fontSize: '0.92rem', fontWeight: '500', color: '#1a2e10', padding: '0.7rem 0', borderBottom: '1px solid #f5f5f5' },
  vehiculeCard:{ display: 'flex', alignItems: 'center', gap: '14px', padding: '1rem', borderRadius: '14px', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s' },
};
