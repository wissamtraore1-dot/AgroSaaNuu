import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Hash, Upload, CheckCircle,
  ArrowLeft, ArrowRight, AlertCircle, Loader, Store,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import AuthService from '../../services/auth.service';

const GREEN = '#1a5c2a';

const ETAPES = [
  { id: 1, label: 'Identité',  icon: User   },
  { id: 2, label: 'Boutique',  icon: Store  },
  { id: 3, label: 'Documents', icon: Upload },
];

function StepDot({ etape, courante }) {
  const fait     = courante > etape.id;
  const active   = courante === etape.id;
  const Icon     = etape.icon;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        background: fait ? GREEN : active ? '#e8f5e9' : '#f3f4f6',
        border: `2px solid ${fait || active ? GREEN : '#e5e7eb'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s',
      }}>
        {fait
          ? <CheckCircle size={18} color="white" fill={GREEN} />
          : <Icon size={16} color={active ? GREEN : '#9ca3af'} />
        }
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: '600', color: active ? GREEN : '#9ca3af' }}>
        {etape.label}
      </span>
    </div>
  );
}

const inputStyle = (focused, name) => ({
  width: '100%', padding: '0.82rem 1rem 0.82rem 2.6rem',
  border: `2px solid ${focused === name ? GREEN : '#c9d1da'}`,
  borderRadius: '12px', fontSize: '0.93rem', outline: 'none',
  color: '#111827', background: '#ffffff',
  transition: 'all 0.2s',
  boxShadow: focused === name ? `0 0 0 3px rgba(26,92,42,0.10)` : '0 1px 3px rgba(0,0,0,0.06)',
});

const iconLeft = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' };
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#1f2937', marginBottom: '6px' };

export default function CompleterProfilVendeur() {
  const navigate = useNavigate();

  const [etape,   setEtape]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [focused, setFocused] = useState('');

  // Étape 1 — Identité
  const [cip,     setCip]     = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville,   setVille]   = useState('');

  // Étape 2 — Boutique
  const [nomBoutique,  setNomBoutique]  = useState('');
  const [description,  setDescription]  = useState('');

  // Étape 3 — Documents
  const [photoCIP,    setPhotoCIP]    = useState(null);
  const [previewCIP,  setPreviewCIP]  = useState(null);
  const [licence,     setLicence]     = useState(null);

  const handleFile = (setter, previewSetter) => e => {
    const f = e.target.files[0];
    if (!f) return;
    setter(f);
    if (previewSetter && f.type.startsWith('image/')) {
      previewSetter(URL.createObjectURL(f));
    }
  };

  const validerEtape = () => {
    setError('');
    if (etape === 1) {
      if (!cip.trim())     { setError('Le numéro CIP est obligatoire'); return false; }
      if (!/^\d{8,12}$/.test(cip.trim())) { setError('Le CIP doit contenir 8 à 12 chiffres'); return false; }
      if (!adresse.trim()) { setError('L\'adresse est obligatoire'); return false; }
      if (!ville.trim())   { setError('La ville est obligatoire'); return false; }
    }
    if (etape === 2) {
      if (!nomBoutique.trim()) { setError('Le nom de la boutique est obligatoire'); return false; }
    }
    return true;
  };

  const suivant = () => { if (validerEtape()) setEtape(e => e + 1); };
  const precedent = () => { setError(''); setEtape(e => e - 1); };

  const soumettre = async () => {
    if (!photoCIP) { setError('La photo de votre pièce d\'identité (CIP) est obligatoire'); return; }
    setLoading(true); setError('');
    try {
      // 1. Mettre à jour les infos de base
      await AuthService.completeProfile({ cip: cip.trim(), adresse: adresse.trim(), ville: ville.trim() });

      // 2. Mettre à jour le profil vendeur
      await AuthService.updateSellerProfile({ association: nomBoutique.trim(), description: description.trim() });

      // 3. Uploader photo CIP
      await AuthService.uploadKYCDocument({ document_type: 'cip', cip_photo: photoCIP });

      // 4. Uploader licence si fournie
      if (licence) {
        await AuthService.uploadKYCDocument({ document_type: 'business_license', cip_photo: licence });
      }

      setEtape(4); // succès
    } catch (err) {
      const d = err.response?.data;
      const msg = d?.message
        || (d?.errors ? Object.values(d.errors).flat().join(' ') : null)
        || (typeof d === 'string' && d.includes('<') ? 'Erreur serveur (500). Vérifiez les logs Django.' : null)
        || err.message
        || 'Une erreur est survenue. Réessayez.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="seller">
      <div style={{ maxWidth: '540px', margin: '0 auto' }}>

        {/* En-tête */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', marginBottom: '4px' }}>
            Compléter mon profil
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: 0 }}>
            Ces informations sont requises avant de publier votre premier produit.
          </p>
        </div>

        {/* Stepper */}
        {etape < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '2rem' }}>
            {ETAPES.map((e, i) => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center' }}>
                <StepDot etape={e} courante={etape} />
                {i < ETAPES.length - 1 && (
                  <div style={{ width: '60px', height: '2px', background: etape > e.id ? GREEN : '#e5e7eb', margin: '0 4px 20px', transition: 'background 0.3s' }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Carte */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.8rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>

          {/* Erreur */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1.2rem', fontSize: '0.84rem', color: '#dc2626', alignItems: 'center' }}
              >
                <AlertCircle size={15} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Étape 1 : Identité ── */}
          {etape === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a2e10', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color={GREEN} /> Vos informations personnelles
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Numéro CIP (Carte d'Identité Personnelle) *</label>
                <div style={{ position: 'relative' }}>
                  <Hash size={15} color="#9ca3af" style={iconLeft} />
                  <input type="text" value={cip} onChange={e => { setCip(e.target.value); setError(''); }}
                    onFocus={() => setFocused('cip')} onBlur={() => setFocused('')}
                    placeholder="Ex : 12345678" maxLength={12}
                    style={inputStyle(focused, 'cip')}
                  />
                </div>
                <span style={{ fontSize: '0.74rem', color: '#9ca3af', marginTop: '4px', display: 'block' }}>8 à 12 chiffres</span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Adresse complète *</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} color="#9ca3af" style={iconLeft} />
                  <input type="text" value={adresse} onChange={e => { setAdresse(e.target.value); setError(''); }}
                    onFocus={() => setFocused('adresse')} onBlur={() => setFocused('')}
                    placeholder="Quartier, rue, numéro"
                    style={inputStyle(focused, 'adresse')}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={labelStyle}>Ville *</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} color="#9ca3af" style={iconLeft} />
                  <input type="text" value={ville} onChange={e => { setVille(e.target.value); setError(''); }}
                    onFocus={() => setFocused('ville')} onBlur={() => setFocused('')}
                    placeholder="Ex : Cotonou"
                    style={inputStyle(focused, 'ville')}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Étape 2 : Boutique ── */}
          {etape === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a2e10', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={18} color={GREEN} /> Informations de votre boutique
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Nom de la boutique *</label>
                <div style={{ position: 'relative' }}>
                  <Store size={15} color="#9ca3af" style={iconLeft} />
                  <input type="text" value={nomBoutique} onChange={e => { setNomBoutique(e.target.value); setError(''); }}
                    onFocus={() => setFocused('boutique')} onBlur={() => setFocused('')}
                    placeholder="Ex : Céréales Moussa"
                    style={inputStyle(focused, 'boutique')}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={labelStyle}>Description de votre activité (optionnel)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  onFocus={() => setFocused('desc')} onBlur={() => setFocused('')}
                  placeholder="Décrivez vos produits, vos zones de vente, votre expérience..."
                  rows={4}
                  style={{ width: '100%', padding: '0.82rem 1rem', border: `1.5px solid ${focused === 'desc' ? GREEN : '#e5e7eb'}`, borderRadius: '12px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', color: '#1a2e10', background: '#fafafa' }}
                />
              </div>
            </motion.div>
          )}

          {/* ── Étape 3 : Documents ── */}
          {etape === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a2e10', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={18} color={GREEN} /> Documents justificatifs
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '1.2rem' }}>
                Ces documents permettent de vérifier votre identité et sécuriser la plateforme.
              </p>

              {/* Photo CIP */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={labelStyle}>Photo de la pièce d'identité (CIP) *</label>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', border: `2px dashed ${photoCIP ? GREEN : '#e5e7eb'}`, borderRadius: '14px', padding: '1.5rem', cursor: 'pointer', background: photoCIP ? '#f0fdf4' : '#fafafa', transition: 'all 0.2s' }}>
                  {previewCIP
                    ? <img src={previewCIP} alt="CIP" style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '8px' }} />
                    : <><Upload size={28} color="#9ca3af" /><span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Cliquez ou glissez votre photo CIP</span><span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>JPG, PNG, PDF — max 5 MB</span></>
                  }
                  <input type="file" accept="image/*,.pdf" onChange={handleFile(setPhotoCIP, setPreviewCIP)} style={{ display: 'none' }} />
                </label>
                {photoCIP && <span style={{ fontSize: '0.75rem', color: GREEN, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={13} color={GREEN} /> {photoCIP.name}</span>}
              </div>

              {/* Licence business */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={labelStyle}>Licence commerciale (optionnel)</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `2px dashed ${licence ? GREEN : '#e5e7eb'}`, borderRadius: '12px', padding: '1rem 1.2rem', cursor: 'pointer', background: licence ? '#f0fdf4' : '#fafafa', transition: 'all 0.2s' }}>
                  <Upload size={18} color={licence ? GREEN : '#9ca3af'} />
                  <span style={{ fontSize: '0.85rem', color: licence ? GREEN : '#6b7280' }}>
                    {licence ? licence.name : 'Ajouter une licence ou registre de commerce'}
                  </span>
                  <input type="file" accept="image/*,.pdf" onChange={handleFile(setLicence, null)} style={{ display: 'none' }} />
                </label>
              </div>
            </motion.div>
          )}

          {/* ── Succès ── */}
          {etape === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '1rem 0' }}>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                style={{ width: '72px', height: '72px', borderRadius: '50%', background: `linear-gradient(135deg, ${GREEN}, #4db86a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}
              >
                <CheckCircle size={36} color="white" />
              </motion.div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.5rem' }}>Profil complété !</h3>
              <p style={{ fontSize: '0.88rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Vos informations ont été enregistrées. Votre profil est en cours de vérification.<br />
                Vous pouvez dès maintenant publier vos produits.
              </p>
              <motion.button
                onClick={() => navigate('/seller/products')}
                style={{ background: GREEN, color: 'white', border: 'none', borderRadius: '12px', padding: '0.85rem 2rem', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              >
                Publier mon premier produit
              </motion.button>
            </motion.div>
          )}

          {/* ── Navigation ── */}
          {etape < 4 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '1.2rem' }}>
              {etape > 1 && (
                <motion.button onClick={precedent}
                  style={{ flex: 1, padding: '0.85rem', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#374151' }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft size={16} /> Précédent
                </motion.button>
              )}
              {etape < 3 ? (
                <motion.button onClick={suivant}
                  style={{ flex: 2, padding: '0.85rem', background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(26,92,42,0.28)' }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                >
                  Suivant <ArrowRight size={16} />
                </motion.button>
              ) : (
                <motion.button onClick={soumettre} disabled={loading}
                  style={{ flex: 2, padding: '0.85rem', background: loading ? '#9ca3af' : `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: loading ? 'none' : '0 4px 14px rgba(26,92,42,0.28)' }}
                  whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {loading ? (
                      <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div>
                        Envoi…
                      </motion.span>
                    ) : (
                      <motion.span key="idle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <CheckCircle size={16} /> Soumettre
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
