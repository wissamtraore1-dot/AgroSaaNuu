import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin,
  Edit3, Save, X, Camera,
  ShoppingBag, TrendingUp, CheckCircle, Clock,
  Eye, EyeOff, Lock, AlertCircle, Loader,
  Bell, Navigation, Package,
  XCircle,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';
import OrderService from '../../services/order.service';

const BLEU   = '#1a5c2a';
const fadeUp = { hidden: { y: 30, opacity: 0 }, show: { y: 0, opacity: 1 } };

const VILLES = [
  'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi',
  'Djougou', 'Bohicon', 'Kandi', 'Natitingou',
  'Ouidah', 'Abomey', 'Nikki', 'Banikoara',
];

const STATUT_CONFIG = {
  PAIEMENT_EN_ATTENTE: { label: 'Paiement en attente', bg: '#fef3c7', color: '#d97706', icon: Clock       },
  PAIEMENT_RECU:       { label: 'Paiement sécurisé',   bg: '#dbeafe', color: '#2563eb', icon: CheckCircle },
  EN_PREPARATION:      { label: 'En préparation',       bg: '#ede9fe', color: '#7c3aed', icon: ShoppingBag },
  EN_LIVRAISON:        { label: 'En livraison',         bg: '#dbeafe', color: '#2563eb', icon: Navigation  },
  LIVREE:              { label: 'Livrée',               bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  CONFIRMEE_RECEPTION: { label: 'Réception confirmée',  bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  PAIEMENT_LIBERE:     { label: 'Clôturée',             bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  ANNULEE:             { label: 'Annulée',              bg: '#fee2e2', color: '#dc2626', icon: X           },
};

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

export default function BuyerProfile() {
  const navigate  = useNavigate();
  const { user, chargerUtilisateur } = useAuth();

  const [editing,    setEditing]    = useState(false);
  const [formData,   setFormData]   = useState({});
  const [saving,     setSaving]     = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab,  setActiveTab]  = useState('infos');

  const [showPwd,    setShowPwd]    = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdForm,    setPwdForm]    = useState({ actuel: '', nouveau: '', confirmer: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError,   setPwdError]   = useState('');

  const [commandes,  setCommandes]  = useState([]);
  const [loadCmds,   setLoadCmds]   = useState(false);
  const [stats,      setStats]      = useState({ total: 0, enCours: 0, livrees: 0, depenses: 0 });
  const [loadStats,  setLoadStats]  = useState(true);

  const photoInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError,     setPhotoError]     = useState('');

  const [notifs, setNotifs] = useState({
    commandeConfirmee: true,
    commandeExpediee:  true,
    commandeLivree:    true,
    offresSpeciales:   false,
    newsletter:        false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        prenom:    user.prenom    || user.first_name || '',
        nom:       user.nom       || user.last_name  || '',
        email:     user.email                        || '',
        telephone: user.telephone                    || '',
        ville:     user.ville                        || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const chargerStats = async () => {
      try {
        const data     = await OrderService.getBuyerOrders({ page: 1 });
        const liste    = data.results || data || [];
        const enCours  = liste.filter(c => ['EN_PREPARATION','EN_LIVRAISON','PAIEMENT_RECU'].includes(c.status)).length;
        const livrees  = liste.filter(c => ['LIVREE','CONFIRMEE_RECEPTION','PAIEMENT_LIBERE'].includes(c.status)).length;
        const depenses = liste.reduce((acc, c) => acc + Number(c.total || 0), 0);
        setStats({ total: data.count ?? liste.length, enCours, livrees, depenses });
      } finally {
        setLoadStats(false);
      }
    };
    chargerStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'commandes' && commandes.length === 0) {
      const chargerCommandes = async () => {
        setLoadCmds(true);
        try {
          const data = await OrderService.getBuyerOrders();
          setCommandes(data.results || data || []);
        } finally {
          setLoadCmds(false);
        }
      };
      chargerCommandes();
    }
  }, [activeTab]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleCancel = () => {
    setFormData({ prenom: user?.prenom || '', nom: user?.nom || '', email: user?.email || '', telephone: user?.telephone || '', ville: user?.ville || '' });
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await AuthService.modifierProfil(formData);
      await chargerUtilisateur();
      setEditing(false);
      setSuccessMsg('Profil mis à jour avec succès !');
      setTimeout(() => setSuccessMsg(''), 3500);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Sélectionnez une image valide (JPG, PNG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('L\'image ne doit pas dépasser 5 MB.');
      return;
    }

    setPhotoError('');
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      await AuthService.modifierProfil(fd);
      await chargerUtilisateur();
      setSuccessMsg('Photo de profil mise à jour !');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch {
      setPhotoError('Impossible de mettre à jour la photo. Réessayez.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePwdChange = (e) => { setPwdForm(prev => ({ ...prev, [e.target.name]: e.target.value })); setPwdError(''); };

  const handlePwdSave = async () => {
    if (!pwdForm.actuel)  { setPwdError('Entrez votre mot de passe actuel.'); return; }
    if (!pwdForm.nouveau) { setPwdError('Entrez un nouveau mot de passe.'); return; }
    if (pwdForm.nouveau.length < 8) { setPwdError('Minimum 8 caractères.'); return; }
    if (pwdForm.nouveau !== pwdForm.confirmer) { setPwdError('Les mots de passe ne correspondent pas.'); return; }
    setPwdLoading(true);
    try {
      await AuthService.changerMotDePasse({ actuel: pwdForm.actuel, nouveau: pwdForm.nouveau });
      setPwdSuccess(true);
      setPwdForm({ actuel: '', nouveau: '', confirmer: '' });
      setTimeout(() => setPwdSuccess(false), 3500);
    } catch (err) {
      setPwdError(err.response?.data?.detail || 'Erreur lors du changement de mot de passe.');
    } finally {
      setPwdLoading(false);
    }
  };

  const prenom = user?.prenom || user?.first_name || '—';
  const nom    = user?.nom    || user?.last_name  || '';

  return (
    <DashboardLayout role="buyer">
      <div>

        {/* HERO */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={S.hero}>
          <div style={S.heroDeco} />
          <div style={S.heroContent}>

            <div style={S.avatarWrap}>
              <div style={S.avatar}>
                {user?.photo
                  ? <img src={user.photo} alt="Photo de profil" style={S.avatarImg} />
                  : <span style={S.avatarInitiale}>{prenom[0]}{nom[0]}</span>
                }
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />
              <motion.button
                style={{ ...S.cameraBtn, opacity: uploadingPhoto ? 0.7 : 1, cursor: uploadingPhoto ? 'not-allowed' : 'pointer' }}
                onClick={() => !uploadingPhoto && photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                whileHover={{ scale: uploadingPhoto ? 1 : 1.1 }}
              >
                {uploadingPhoto
                  ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={14} color="white" /></motion.div>
                  : <Camera size={14} color="white" />
                }
              </motion.button>
              {photoError && <div style={S.photoErrorBubble}>{photoError}</div>}
            </div>

            <div style={S.heroInfos}>
              <h1 style={S.heroNom}>{prenom} {nom}</h1>
              <div style={S.heroMeta}>
                {user?.ville     && <span><MapPin size={14} /> {user.ville}</span>}
                {user?.email     && <span><Mail size={14} /> {user.email}</span>}
                {user?.telephone && <span><Phone size={14} /> {user.telephone}</span>}
              </div>
            </div>

            {!editing ? (
              <motion.button style={S.btnEditer} onClick={() => setEditing(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Edit3 size={15} /><span> Modifier</span>
              </motion.button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button style={S.btnAnnuler} onClick={handleCancel} whileHover={{ scale: 1.03 }}>
                  <X size={15} /><span> Annuler</span>
                </motion.button>
                <motion.button style={{ ...S.btnSave, opacity: saving ? 0.8 : 1 }} onClick={handleSave} disabled={saving} whileHover={{ scale: saving ? 1 : 1.03 }}>
                  <AnimatePresence mode="wait" initial={false}>
                    {saving ? (
                      <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader size={15} /></motion.div>
                      </motion.span>
                    ) : (
                      <motion.span key="idle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <Save size={15} /><span> Sauvegarder</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {successMsg && (
              <motion.div style={S.successToast} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CheckCircle size={16} color="#16a34a" />{successMsg}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* STATS */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Commandes totales', value: loadStats ? '—' : stats.total,                                         icon: ShoppingBag,  color: BLEU,     bg: '#f0fdf4' },
            { label: 'En cours',          value: loadStats ? '—' : stats.enCours,                                       icon: Clock,        color: '#d97706', bg: '#fffbeb' },
            { label: 'Livrées',           value: loadStats ? '—' : stats.livrees,                                       icon: CheckCircle,  color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Total dépensé',     value: loadStats ? '—' : `${stats.depenses.toLocaleString('fr-FR')} F`,       icon: TrendingUp,   color: '#7c3aed', bg: '#f5f3ff' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} className="col-6 col-md-3" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: i * 0.07 }}>
                <div style={S.statCard}>
                  <div style={{ ...S.statIcon, background: s.bg }}><Icon size={18} color={s.color} /></div>
                  <div style={S.statValue}>{s.value}</div>
                  <div style={S.statLabel}>{s.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* TABS */}
        <div style={S.tabs}>
          {[
            { id: 'infos',     Icon: User,    label: 'Informations'  },
            { id: 'commandes', Icon: Package, label: 'Commandes'      },
            { id: 'securite',  Icon: Lock,    label: 'Sécurité'       },
            { id: 'notifs',    Icon: Bell,    label: 'Notifications'  },
          ].map(tab => (
            <motion.button
              key={tab.id}
              style={{ ...S.tab, background: activeTab === tab.id ? BLEU : 'white', color: activeTab === tab.id ? 'white' : '#374151', borderColor: activeTab === tab.id ? BLEU : '#e5e7eb', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.97 }}
            >
              <tab.Icon size={14} /> {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* TAB INFOS */}
          {activeTab === 'infos' && (
            <motion.div key="infos" style={S.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 style={S.cardTitle}><User size={18} color={BLEU} /><span> Informations personnelles</span></h3>
              <div className="row g-3">

                <div className="col-12 col-md-6">
                  <div style={S.fieldWrap}>
                    <label style={S.label}>Prénom</label>
                    {editing ? <input name="prenom" value={formData.prenom || ''} onChange={handleChange} style={S.input} /> : <div style={S.fieldValue}>{user?.prenom || '—'}</div>}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div style={S.fieldWrap}>
                    <label style={S.label}>Nom</label>
                    {editing ? <input name="nom" value={formData.nom || ''} onChange={handleChange} style={S.input} /> : <div style={S.fieldValue}>{user?.nom || '—'}</div>}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div style={S.fieldWrap}>
                    <label style={S.label}><Mail size={13} /> Email</label>
                    {editing ? <input name="email" type="email" value={formData.email || ''} onChange={handleChange} style={S.input} /> : <div style={S.fieldValue}>{user?.email || '—'}</div>}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div style={S.fieldWrap}>
                    <label style={S.label}><Phone size={13} /> Téléphone</label>
                    <div style={{ ...S.fieldValue, color: '#9ca3af', fontSize: '0.85rem' }}>
                      {user?.telephone || '—'} <span style={{ fontSize: '0.75rem' }}>(non modifiable)</span>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div style={S.fieldWrap}>
                    <label style={S.label}><MapPin size={13} /> Ville</label>
                    {editing ? (
                      <select name="ville" value={formData.ville || ''} onChange={handleChange} style={S.select}>
                        <option value="">Choisir une ville</option>
                        {VILLES.map(v => <option key={v}>{v}</option>)}
                      </select>
                    ) : <div style={S.fieldValue}>{user?.ville || '—'}</div>}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB COMMANDES */}
          {activeTab === 'commandes' && (
            <motion.div key="commandes" style={S.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h3 style={S.cardTitle}><ShoppingBag size={18} color={BLEU} /><span> Mes commandes récentes</span></h3>
                <motion.button onClick={() => navigate('/buyer/orders')} style={S.btnVoirTout} whileHover={{ scale: 1.03 }}>
                  Voir tout →
                </motion.button>
              </div>

              {loadCmds ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                  <Loader size={24} color={BLEU} />
                </div>
              ) : commandes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#9ca3af', fontSize: '0.88rem' }}>
                  <Package size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Aucune commande pour l'instant.
                  <br />
                  <motion.button onClick={() => navigate('/buyer/catalog')} style={{ ...S.btnVoirTout, marginTop: '1rem', display: 'inline-flex' }} whileHover={{ scale: 1.03 }}>
                    Parcourir le catalogue
                  </motion.button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                        {['Commande', 'Date', 'Articles', 'Total', 'Statut'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', color: '#6b7280', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {commandes.slice(0, 8).map((c, i) => {
                        const cfg = STATUT_CONFIG[c.status] || { label: c.status, bg: '#f3f4f6', color: '#374151' };
                        return (
                          <motion.tr
                            key={c.id || i}
                            style={{ borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                            whileHover={{ background: '#f9fafb' }}
                            onClick={() => navigate(`/buyer/orders/${c.id}`)}
                          >
                            <td style={{ padding: '10px 12px', fontWeight: '700', color: '#1a2e10' }}>#{c.id}</td>
                            <td style={{ padding: '10px 12px', color: '#6b7280' }}>{formatDate(c.created_at)}</td>
                            <td style={{ padding: '10px 12px', color: '#374151' }}>{c.items?.length ?? '—'} article(s)</td>
                            <td style={{ padding: '10px 12px', fontWeight: '700', color: '#1a5c2a' }}>{Number(c.total || 0).toLocaleString('fr-FR')} FCFA</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', background: cfg.bg, color: cfg.color }}>
                                {cfg.label}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB SÉCURITÉ */}
          {activeTab === 'securite' && (
            <motion.div key="securite" style={S.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 style={S.cardTitle}><Lock size={18} color={BLEU} /><span> Changer le mot de passe</span></h3>

              <AnimatePresence>
                {pwdError   && <motion.div style={S.errorBox}   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AlertCircle size={15} />{pwdError}</motion.div>}
                {pwdSuccess && <motion.div style={S.successBox} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CheckCircle size={15} />Mot de passe modifié avec succès !</motion.div>}
              </AnimatePresence>

              <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                <div style={S.fieldWrap}>
                  <label style={S.label}>Mot de passe actuel *</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPwd ? 'text' : 'password'} name="actuel" value={pwdForm.actuel} onChange={handlePwdChange} placeholder="••••••••" style={{ ...S.input, paddingRight: '3rem' }} />
                    <button style={S.eyeBtn} onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                    </button>
                  </div>
                </div>

                <div style={S.fieldWrap}>
                  <label style={S.label}>Nouveau mot de passe *</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showNewPwd ? 'text' : 'password'} name="nouveau" value={pwdForm.nouveau} onChange={handlePwdChange} placeholder="Minimum 8 caractères" style={{ ...S.input, paddingRight: '3rem' }} />
                    <button style={S.eyeBtn} onClick={() => setShowNewPwd(!showNewPwd)}>
                      {showNewPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                    </button>
                  </div>
                  {pwdForm.nouveau && (
                    <div style={{ marginTop: '6px' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        {[1,2,3,4].map(n => (
                          <div key={n} style={{ flex: 1, height: '4px', borderRadius: '4px', background: pwdForm.nouveau.length >= n * 2 ? (n <= 1 ? '#ef4444' : n <= 2 ? '#f97316' : n <= 3 ? '#eab308' : '#22c55e') : '#e5e7eb', transition: 'background 0.3s' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {pwdForm.nouveau.length < 4 ? 'Très faible' : pwdForm.nouveau.length < 6 ? 'Faible' : pwdForm.nouveau.length < 8 ? 'Moyen' : 'Fort'}
                      </span>
                    </div>
                  )}
                </div>

                <div style={S.fieldWrap}>
                  <label style={S.label}>Confirmer *</label>
                  <input type="password" name="confirmer" value={pwdForm.confirmer} onChange={handlePwdChange} placeholder="Répétez le mot de passe"
                    style={{ ...S.input, borderColor: pwdForm.confirmer && pwdForm.confirmer !== pwdForm.nouveau ? '#ef4444' : '#e5e7eb' }}
                  />
                  {pwdForm.confirmer && pwdForm.confirmer !== pwdForm.nouveau && <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><XCircle size={13} color="#ef4444" /> Ne correspond pas</span>}
                  {pwdForm.confirmer && pwdForm.confirmer === pwdForm.nouveau  && <span style={{ fontSize: '0.78rem', color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><CheckCircle size={13} color="#22c55e" /> Correspond</span>}
                </div>

                <motion.button
                  style={{ ...S.btnSaveBleu, opacity: pwdLoading ? 0.8 : 1 }}
                  onClick={handlePwdSave}
                  disabled={pwdLoading}
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
                        <Lock size={15} /><span> Mettre à jour le mot de passe</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

              </div>
            </motion.div>
          )}

          {/* TAB NOTIFICATIONS */}
          {activeTab === 'notifs' && (
            <motion.div key="notifs" style={S.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 style={S.cardTitle}><Bell size={18} color={BLEU} /><span> Préférences de notifications</span></h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { key: 'commandeConfirmee', label: 'Commande confirmée',       desc: 'Quand un vendeur accepte votre commande' },
                  { key: 'commandeExpediee',  label: 'Commande expédiée',        desc: 'Quand votre commande est en livraison' },
                  { key: 'commandeLivree',    label: 'Commande livrée',          desc: 'Quand votre commande est livrée' },
                  { key: 'offresSpeciales',   label: 'Offres spéciales',         desc: 'Promotions et réductions exclusives' },
                  { key: 'newsletter',        label: 'Newsletter hebdomadaire',  desc: 'Actualités agricoles et conseils pratiques' },
                ].map((n, i, arr) => (
                  <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1a2e10', marginBottom: '2px' }}>{n.label}</div>
                      <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{n.desc}</div>
                    </div>
                    <motion.button
                      onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                      style={{
                        width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative',
                        background: notifs[n.key] ? BLEU : '#d1d5db', transition: 'background 0.3s', flexShrink: 0,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        animate={{ x: notifs[n.key] ? 20 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                      />
                    </motion.button>
                  </div>
                ))}
              </div>

              <motion.button style={{ ...S.btnSaveBleu, marginTop: '1.5rem', maxWidth: '200px' }} whileHover={{ scale: 1.02 }}>
                <Save size={15} /><span> Enregistrer</span>
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

const S = {
  hero:           { background: 'linear-gradient(135deg, #0d2b14 0%, #1a5c2a 100%)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' },
  heroDeco:       { position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' },
  heroContent:    { display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 },
  avatarWrap:     { position: 'relative', flexShrink: 0 },
  avatar:         { width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #60a5fa, #93c5fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.4)', overflow: 'hidden' },
  avatarInitiale: { fontSize: '1.8rem', fontWeight: '900', color: 'white' },
  avatarImg:      { width: '100%', height: '100%', objectFit: 'cover' },
  cameraBtn:      { position: 'absolute', bottom: '0', right: '0', background: BLEU, border: '2px solid white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  photoErrorBubble: { position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px 10px', fontSize: '0.72rem', fontWeight: '600', whiteSpace: 'nowrap', zIndex: 2 },
  heroInfos:      { flex: 1, minWidth: '200px' },
  heroNom:        { color: 'white', fontWeight: '900', fontSize: '1.4rem', margin: '0 0 6px' },
  heroMeta:       { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem' },
  btnEditer:      { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '12px', padding: '0.6rem 1.2rem', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', flexShrink: 0 },
  btnAnnuler:     { display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', padding: '0.55rem 1rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 },
  btnSave:        { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0c040', color: '#1a2e10', border: 'none', borderRadius: '10px', padding: '0.55rem 1.2rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 },
  btnSaveBleu:    { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: `linear-gradient(135deg, #0d2b14, ${BLEU})`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.85rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: `0 4px 14px rgba(26,92,42,0.3)` },
  btnVoirTout:    { display: 'inline-flex', alignItems: 'center', background: '#f0fdf4', color: BLEU, border: '1.5px solid #86efac', borderRadius: '10px', padding: '0.45rem 1rem', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer' },
  successToast:   { display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', color: '#16a34a', borderRadius: '10px', padding: '0.7rem 1rem', marginTop: '1rem', fontSize: '0.85rem', fontWeight: '600', position: 'relative', zIndex: 1 },
  statCard:       { background: 'white', borderRadius: '16px', padding: '1.1rem', border: '1px solid #f0f0f0', textAlign: 'center' },
  statIcon:       { width: '40px', height: '40px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.7rem' },
  statValue:      { fontSize: '1.2rem', fontWeight: '800', color: '#1a2e10', marginBottom: '2px' },
  statLabel:      { fontSize: '0.73rem', color: '#6b7280' },
  tabs:           { display: 'flex', gap: '8px', marginBottom: '1.2rem', flexWrap: 'wrap' },
  tab:            { padding: '0.45rem 1rem', borderRadius: '20px', border: '1.5px solid', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: 'none' },
  card:           { background: 'white', borderRadius: '16px', padding: '1.8rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  cardTitle:      { fontSize: '1.05rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' },
  fieldWrap:      { display: 'flex', flexDirection: 'column', gap: '5px' },
  label:          { fontSize: '0.82rem', fontWeight: '600', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' },
  input:          { width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', fontFamily: 'inherit', boxSizing: 'border-box' },
  select:         { width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', cursor: 'pointer' },
  fieldValue:     { fontSize: '0.92rem', fontWeight: '500', color: '#1a2e10', padding: '0.7rem 0', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f5f5f5' },
  eyeBtn:         { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  errorBox:       { display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#dc2626' },
  successBox:     { display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#16a34a' },
};
