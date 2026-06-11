// Onboarding étape 1 — Informations personnelles (communes à tous les rôles)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, MapPin, Upload, CheckCircle, AlertCircle, Loader, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';

const GREEN = '#1a5c2a';

const inp = (focused, name) => ({
  width: '100%', padding: '0.82rem 1rem 0.82rem 2.5rem',
  border: `1.5px solid ${focused === name ? GREEN : '#e5e7eb'}`,
  borderRadius: '12px', fontSize: '0.92rem', outline: 'none',
  color: '#1a2e10', background: focused === name ? '#fafff9' : '#fafafa',
  transition: 'all 0.2s', boxSizing: 'border-box',
});
const LB = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' };
const FW = { marginBottom: '1rem' };
const IL = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' };

const ROLE_LABELS = { BUYER: 'Acheteur', SELLER: 'Vendeur', TRANSPORTER: 'Transporteur' };

export default function ProfilPersonnel() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [cip,        setCip]        = useState('');
  const [adresse,    setAdresse]    = useState('');
  const [ville,      setVille]      = useState('');
  const [photoCIP,   setPhotoCIP]   = useState(null);
  const [previewCIP, setPreviewCIP] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [focused,    setFocused]    = useState('');

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setPhotoCIP(f);
    if (f.type.startsWith('image/')) setPreviewCIP(URL.createObjectURL(f));
  };

  const valider = () => {
    if (!cip.trim())     { setError('Le numéro CIP est obligatoire'); return false; }
    if (!/^\d{8,12}$/.test(cip.trim())) { setError('Le CIP doit contenir 8 à 12 chiffres'); return false; }
    if (!adresse.trim()) { setError('L\'adresse est obligatoire'); return false; }
    if (!ville.trim())   { setError('La ville est obligatoire'); return false; }
    if (!photoCIP)       { setError('La photo de votre pièce d\'identité est obligatoire'); return false; }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!valider()) return;
    setLoading(true); setError('');
    try {
      // 1. Sauvegarder CIP + adresse
      const res = await AuthService.completeProfile({
        cip:     cip.trim(),
        adresse: adresse.trim(),
        ville:   ville.trim(),
      });
      updateUser(res.user);

      // 2. Upload photo CIP
      await AuthService.uploadKYCDocument({ document_type: 'cip', cip_photo: photoCIP });

      // 3. Rediriger vers l'étape activité selon le rôle
      const role = user?.role;
      if (role === 'SELLER')      navigate('/onboarding/activite', { replace: true });
      else if (role === 'TRANSPORTER') navigate('/onboarding/activite', { replace: true });
      else navigate('/buyer/dashboard', { replace: true }); // Acheteur → direct

    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '480px' }}>

        {/* Progression */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '4px', borderRadius: '4px', background: GREEN }} />
          <div style={{ flex: 1, height: '4px', borderRadius: '4px', background: user?.role !== 'BUYER' ? '#e5e7eb' : GREEN }} />
        </div>
        <p style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '1.5rem', textAlign: 'center' }}>
          Étape 1 sur {user?.role !== 'BUYER' ? 2 : 1} — Vos informations personnelles
        </p>

        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>

          {/* En-tête */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={22} color={GREEN} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1a2e10' }}>Qui êtes-vous ?</h2>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b7280' }}>
                {ROLE_LABELS[user?.role] || 'Utilisateur'} — informations requises avant toute activité
              </p>
            </div>
          </div>

          {/* Erreur */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: '#dc2626', alignItems: 'center' }}
              >
                <AlertCircle size={15} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>

            {/* CIP */}
            <div style={FW}>
              <label style={LB}>Numéro CIP (Carte d'Identité Personnelle) *</label>
              <div style={{ position: 'relative' }}>
                <Hash size={15} color="#9ca3af" style={IL} />
                <input type="text" value={cip} onChange={e => { setCip(e.target.value); setError(''); }}
                  onFocus={() => setFocused('cip')} onBlur={() => setFocused('')}
                  placeholder="Ex : 12345678" maxLength={12}
                  style={inp(focused, 'cip')} />
              </div>
              <span style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: '3px', display: 'block' }}>8 à 12 chiffres</span>
            </div>

            {/* Adresse */}
            <div style={FW}>
              <label style={LB}>Adresse complète *</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} color="#9ca3af" style={IL} />
                <input type="text" value={adresse} onChange={e => { setAdresse(e.target.value); setError(''); }}
                  onFocus={() => setFocused('adresse')} onBlur={() => setFocused('')}
                  placeholder="Quartier, rue, numéro"
                  style={inp(focused, 'adresse')} />
              </div>
            </div>

            {/* Ville */}
            <div style={FW}>
              <label style={LB}>Ville *</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} color="#9ca3af" style={IL} />
                <input type="text" value={ville} onChange={e => { setVille(e.target.value); setError(''); }}
                  onFocus={() => setFocused('ville')} onBlur={() => setFocused('')}
                  placeholder="Ex : Cotonou"
                  style={inp(focused, 'ville')} />
              </div>
            </div>

            {/* Photo CIP */}
            <div style={FW}>
              <label style={LB}>Photo pièce d'identité (CIP) *</label>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: `2px dashed ${photoCIP ? GREEN : '#e5e7eb'}`, borderRadius: '14px', padding: '1.4rem', cursor: 'pointer', background: photoCIP ? '#f0fdf4' : '#fafafa', transition: 'all 0.2s' }}>
                {previewCIP
                  ? <img src={previewCIP} alt="CIP" style={{ maxHeight: '140px', objectFit: 'contain', borderRadius: '8px' }} />
                  : <>
                      <Upload size={28} color="#9ca3af" />
                      <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Cliquez pour uploader</span>
                      <span style={{ fontSize: '0.74rem', color: '#9ca3af' }}>JPG, PNG, PDF — max 5 MB</span>
                    </>
                }
                <input type="file" accept="image/*,.pdf" onChange={handleFile} style={{ display: 'none' }} />
              </label>
              {photoCIP && <span style={{ fontSize: '0.75rem', color: GREEN, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={13} color={GREEN} /> {photoCIP.name}</span>}
            </div>

            <motion.button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.9rem', background: loading ? '#9ca3af' : `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.97rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : '0 4px 20px rgba(26,92,42,0.28)' }}
              whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {loading ? (
                  <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div>
                    <span> Enregistrement…</span>
                  </motion.span>
                ) : (
                  <motion.span key="idle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <CheckCircle size={16} /><span> Continuer</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

          </form>
        </div>
      </motion.div>
    </div>
  );
}
