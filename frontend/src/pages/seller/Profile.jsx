import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Building,
  Edit3, Save, X, Camera, Shield,
  Package, ShoppingBag, TrendingUp,
  CheckCircle, Eye, EyeOff, Lock,
  AlertCircle, Loader, AlertTriangle, XCircle,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';
import OrderService from '../../services/order.service';
import ProductService from '../../services/product.service';
import WalletService from '../../services/wallet.service';

const GREEN  = '#1a5c2a';
const VILLES = [
  'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi',
  'Djougou', 'Bohicon', 'Kandi', 'Natitingou',
  'Ouidah', 'Abomey', 'Nikki', 'Banikoara',
];
const fadeUp = { hidden: { y: 30, opacity: 0 }, show: { y: 0, opacity: 1 } };

export default function SellerProfile() {
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

  const [stats,      setStats]      = useState({ produits: 0, commandes: 0, revenus: 0 });
  const [loadStats,  setLoadStats]  = useState(true);

  // Sync formData with user once loaded
  useEffect(() => {
    if (user) {
      setFormData({
        prenom:      user.prenom      || user.first_name  || '',
        nom:         user.nom         || user.last_name   || '',
        email:       user.email                           || '',
        telephone:   user.telephone                       || '',
        ville:       user.ville                           || '',
        association: user.association || user.cooperative || '',
        bio:         user.bio                             || '',
      });
    }
  }, [user]);

  // Load stats
  useEffect(() => {
    const chargerStats = async () => {
      try {
        const [ordersRes, produitsRes, walletRes] = await Promise.allSettled([
          OrderService.getSellerOrders({ page: 1 }),
          ProductService.mesProduits(),
          WalletService.monWallet(),
        ]);
        const orders  = ordersRes.status   === 'fulfilled' ? (ordersRes.value.count   ?? (ordersRes.value.results || []).length) : 0;
        const produits = produitsRes.status === 'fulfilled' ? (Array.isArray(produitsRes.value) ? produitsRes.value.length : produitsRes.value.results?.length ?? 0) : 0;
        const solde   = walletRes.status   === 'fulfilled' ? Number(walletRes.value.solde ?? walletRes.value.available ?? 0) : 0;
        setStats({ produits, commandes: orders, revenus: solde });
      } finally {
        setLoadStats(false);
      }
    };
    chargerStats();
  }, []);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleCancel = () => { setFormData({ prenom: user?.prenom || '', nom: user?.nom || '', email: user?.email || '', telephone: user?.telephone || '', ville: user?.ville || '', association: user?.association || '', bio: user?.bio || '' }); setEditing(false); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await AuthService.modifierProfil(formData);
      await chargerUtilisateur();
      setEditing(false);
      setSuccessMsg('Profil mis à jour avec succès !');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch {
      setSuccessMsg('');
    } finally {
      setSaving(false);
    }
  };

  const handlePwdChange = (e) => { setPwdForm(prev => ({ ...prev, [e.target.name]: e.target.value })); setPwdError(''); };

  const handlePwdSave = async () => {
    if (!pwdForm.actuel)    { setPwdError('Entrez votre mot de passe actuel.'); return; }
    if (!pwdForm.nouveau)   { setPwdError('Entrez un nouveau mot de passe.'); return; }
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
    <DashboardLayout role="seller">
      <div>

        {/* HERO PROFIL */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={S.profileHero}>
          <div style={S.heroDecoBg} />
          <div style={S.heroContent}>
            {/* AVATAR */}
            <div style={S.avatarWrap}>
              <div style={S.avatar}>
                <span style={S.avatarInitiale}>{prenom[0]}{nom[0]}</span>
              </div>
              <motion.button style={S.cameraBtn} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Camera size={14} color="white" />
              </motion.button>
            </div>

            {/* INFOS */}
            <div style={S.heroInfos}>
              <div style={S.nomWrap}>
                <h1 style={S.heroNom}>{prenom} {nom}</h1>
                {user?.cip && (
                  <span style={S.verifiBadge}><Shield size={12} /> Vérifié</span>
                )}
              </div>
              <div style={S.heroMeta}>
                {user?.association && <span><Building size={14} /> {user.association}</span>}
                {user?.ville       && <span><MapPin size={14} /> {user.ville}</span>}
                {user?.email       && <span><Mail size={14} /> {user.email}</span>}
              </div>
              {user?.bio && <p style={S.heroBio}>{user.bio}</p>}
            </div>

            {/* BOUTONS */}
            {!editing ? (
              <motion.button style={S.btnEditer} onClick={() => setEditing(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Edit3 size={15} /><span> Modifier le profil</span>
              </motion.button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button style={S.btnAnnuler} onClick={handleCancel} whileHover={{ scale: 1.03 }}>
                  <X size={15} /><span> Annuler</span>
                </motion.button>
                <motion.button style={{ ...S.btnSauvegarder, opacity: saving ? 0.8 : 1 }} onClick={handleSave} disabled={saving} whileHover={{ scale: saving ? 1 : 1.03 }}>
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
            { label: 'Produits actifs',   value: loadStats ? '—' : stats.produits,                                     icon: Package,    color: '#d97706', bg: '#fffbeb' },
            { label: 'Commandes reçues',  value: loadStats ? '—' : stats.commandes,                                    icon: ShoppingBag,color: '#2563eb', bg: '#eff6ff' },
            { label: 'Solde disponible',  value: loadStats ? '—' : `${stats.revenus.toLocaleString('fr-FR')} F`,       icon: TrendingUp, color: GREEN,     bg: '#f0fdf4' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} className="col-12 col-sm-4" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: i * 0.08 }}>
                <div style={S.statCard}>
                  <div style={{ ...S.statIcon, background: s.bg }}><Icon size={20} color={s.color} /></div>
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
            { id: 'infos',    Icon: User, label: 'Informations' },
            { id: 'securite', Icon: Lock, label: 'Sécurité'     },
          ].map(tab => (
            <motion.button
              key={tab.id}
              style={{ ...S.tab, background: activeTab === tab.id ? GREEN : 'white', color: activeTab === tab.id ? 'white' : '#374151', borderColor: activeTab === tab.id ? GREEN : '#e5e7eb', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
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
              <h3 style={S.cardTitle}><User size={18} color={GREEN} /><span> Informations personnelles</span></h3>
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

                <div className="col-12 col-md-6">
                  <div style={S.fieldWrap}>
                    <label style={S.label}><Building size={13} /> Association / Coopérative</label>
                    {editing ? <input name="association" value={formData.association || ''} onChange={handleChange} style={S.input} /> : <div style={S.fieldValue}>{user?.association || '—'}</div>}
                  </div>
                </div>

                {user?.cip && (
                  <div className="col-12 col-md-6">
                    <div style={S.fieldWrap}>
                      <label style={S.label}>Numéro CIP</label>
                      <div style={S.fieldValue}>
                        {user.cip}
                        <span style={S.cipBadge}><Shield size={11} /> Vérifié</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-12">
                  <div style={S.fieldWrap}>
                    <label style={S.label}>Bio / Description</label>
                    {editing ? (
                      <textarea name="bio" value={formData.bio || ''} onChange={handleChange} style={{ ...S.input, minHeight: '90px', resize: 'vertical' }} rows={3} />
                    ) : <div style={{ ...S.fieldValue, lineHeight: 1.6 }}>{user?.bio || 'Aucune bio renseignée.'}</div>}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB SÉCURITÉ */}
          {activeTab === 'securite' && (
            <motion.div key="securite" style={S.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 style={S.cardTitle}><Lock size={18} color={GREEN} /><span> Changer le mot de passe</span></h3>

              <AnimatePresence>
                {pwdError   && <motion.div style={S.errorBox}   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AlertCircle size={15} />{pwdError}</motion.div>}
                {pwdSuccess && <motion.div style={S.successBox} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CheckCircle size={15} />Mot de passe modifié avec succès !</motion.div>}
              </AnimatePresence>

              <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                <div style={S.fieldWrap}>
                  <label style={S.label}>Mot de passe actuel *</label>
                  <div style={S.pwdWrap}>
                    <input type={showPwd ? 'text' : 'password'} name="actuel" value={pwdForm.actuel} onChange={handlePwdChange} placeholder="••••••••" style={{ ...S.input, paddingRight: '3rem' }} />
                    <button style={S.eyeBtn} onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                    </button>
                  </div>
                </div>

                <div style={S.fieldWrap}>
                  <label style={S.label}>Nouveau mot de passe *</label>
                  <div style={S.pwdWrap}>
                    <input type={showNewPwd ? 'text' : 'password'} name="nouveau" value={pwdForm.nouveau} onChange={handlePwdChange} placeholder="Minimum 8 caractères" style={{ ...S.input, paddingRight: '3rem' }} />
                    <button style={S.eyeBtn} onClick={() => setShowNewPwd(!showNewPwd)}>
                      {showNewPwd ? <EyeOff size={17} color="#9ca3af" /> : <Eye size={17} color="#9ca3af" />}
                    </button>
                  </div>
                  {pwdForm.nouveau && (
                    <div style={{ marginTop: '6px' }}>
                      <div style={S.strengthBar}>
                        {[1,2,3,4].map(n => (
                          <div key={n} style={{ ...S.strengthSeg, background: pwdForm.nouveau.length >= n * 2 ? (n <= 1 ? '#ef4444' : n <= 2 ? '#f97316' : n <= 3 ? '#eab308' : '#22c55e') : '#e5e7eb' }} />
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
                  style={{ ...S.btnSauvegarderGreen, opacity: pwdLoading ? 0.8 : 1 }}
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

              <div style={S.dangerZone}>
                <h4 style={{ ...S.dangerTitle, display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16} color="#F59E0B" /> Zone de danger</h4>
                <p style={S.dangerDesc}>La suppression de votre compte est irréversible. Toutes vos données seront effacées.</p>
                <motion.button style={S.btnSupprimer} whileHover={{ scale: 1.02 }}>
                  Supprimer mon compte
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}

const S = {
  profileHero:        { background: 'linear-gradient(135deg, #0d2b14 0%, #1a5c2a 100%)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' },
  heroDecoBg:         { position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', pointerEvents: 'none' },
  heroContent:        { display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 },
  avatarWrap:         { position: 'relative', flexShrink: 0 },
  avatar:             { width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #f0c040, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.3)', overflow: 'hidden' },
  avatarInitiale:     { fontSize: '1.8rem', fontWeight: '900', color: 'white' },
  cameraBtn:          { position: 'absolute', bottom: '0', right: '0', background: GREEN, border: '2px solid white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  heroInfos:          { flex: 1, minWidth: '200px' },
  nomWrap:            { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' },
  heroNom:            { color: 'white', fontWeight: '900', fontSize: '1.4rem', margin: 0 },
  verifiBadge:        { display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0c040', color: '#1a2e10', fontSize: '0.72rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' },
  heroMeta:           { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginBottom: '8px' },
  heroBio:            { color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 },
  btnEditer:          { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '12px', padding: '0.6rem 1.2rem', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', flexShrink: 0 },
  btnAnnuler:         { display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', padding: '0.55rem 1rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 },
  btnSauvegarder:     { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0c040', color: '#1a2e10', border: 'none', borderRadius: '10px', padding: '0.55rem 1.2rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 },
  btnSauvegarderGreen:{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: `linear-gradient(135deg, ${GREEN}, #2d6a4f)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.85rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' },
  successToast:       { display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', color: '#16a34a', borderRadius: '10px', padding: '0.7rem 1rem', marginTop: '1rem', fontSize: '0.85rem', fontWeight: '600', position: 'relative', zIndex: 1 },
  statCard:           { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', textAlign: 'center' },
  statIcon:           { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' },
  statValue:          { fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', marginBottom: '3px' },
  statLabel:          { fontSize: '0.78rem', color: '#6b7280' },
  tabs:               { display: 'flex', gap: '8px', marginBottom: '1.2rem', flexWrap: 'wrap' },
  tab:                { padding: '0.5rem 1.2rem', borderRadius: '20px', border: '1.5px solid', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: 'none' },
  card:               { background: 'white', borderRadius: '16px', padding: '1.8rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  cardTitle:          { fontSize: '1.05rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' },
  fieldWrap:          { display: 'flex', flexDirection: 'column', gap: '5px' },
  label:              { fontSize: '0.82rem', fontWeight: '600', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' },
  input:              { width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', fontFamily: 'inherit', boxSizing: 'border-box' },
  select:             { width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', cursor: 'pointer' },
  fieldValue:         { fontSize: '0.92rem', fontWeight: '500', color: '#1a2e10', padding: '0.7rem 0', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f5f5f5' },
  cipBadge:           { display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#f0fdf4', color: GREEN, fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' },
  pwdWrap:            { position: 'relative' },
  eyeBtn:             { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  strengthBar:        { display: 'flex', gap: '4px', marginBottom: '4px' },
  strengthSeg:        { flex: 1, height: '4px', borderRadius: '4px', transition: 'background 0.3s' },
  errorBox:           { display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#dc2626' },
  successBox:         { display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#16a34a' },
  dangerZone:         { marginTop: '2rem', background: '#fef2f2', borderRadius: '14px', padding: '1.2rem', border: '1px solid #fecaca' },
  dangerTitle:        { fontSize: '0.95rem', fontWeight: '800', color: '#dc2626', marginBottom: '0.4rem' },
  dangerDesc:         { fontSize: '0.82rem', color: '#6b7280', marginBottom: '1rem' },
  btnSupprimer:       { display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '0.6rem 1.2rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' },
};
