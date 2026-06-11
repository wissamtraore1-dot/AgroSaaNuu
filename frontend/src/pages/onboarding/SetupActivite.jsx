// Onboarding étape 2 — Informations d'activité (selon le rôle)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, MapPin, AlignLeft, Upload, Truck, Hash,
  Calendar, Weight, FileText, ShieldCheck,
  CheckCircle, AlertCircle, Loader,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';
import TransportService from '../../services/transport.service';

const GREEN  = '#1a5c2a';
const ORANGE = '#d97706';

const inp = (focused, name, color = GREEN) => ({
  width: '100%', padding: '0.82rem 1rem 0.82rem 2.5rem',
  border: `1.5px solid ${focused === name ? color : '#e5e7eb'}`,
  borderRadius: '12px', fontSize: '0.92rem', outline: 'none',
  color: '#1a2e10', background: focused === name ? '#fafff9' : '#fafafa',
  transition: 'all 0.2s', boxSizing: 'border-box',
});
const LB = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' };
const FW = { marginBottom: '1rem' };
const IL = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' };

const TYPES_VEHICULE = [
  { value: 'PICKUP',     label: 'Pick-up',    capacite: '1–2t' },
  { value: 'CAMION_5T',  label: 'Camion 5t',  capacite: '5t'   },
  { value: 'CAMION_8T',  label: 'Camion 8t',  capacite: '8t'   },
  { value: 'CAMION_10T', label: 'Camion 10t', capacite: '10t'  },
  { value: 'CAMION_15T', label: 'Camion 15t', capacite: '15t'  },
];

// ────────────────────────────────────────────────
// Formulaire Vendeur
// ────────────────────────────────────────────────
function FormVendeur({ onSuccess }) {
  const [nomBoutique,  setNomBoutique]  = useState('');
  const [description,  setDescription]  = useState('');
  const [localisation, setLocalisation] = useState('');
  const [ville,        setVille]        = useState('');
  const [licence,      setLicence]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [focused,      setFocused]      = useState('');

  const valider = () => {
    if (!nomBoutique.trim()) { setError('Le nom de la boutique est obligatoire'); return false; }
    if (!ville.trim())       { setError('La ville est obligatoire'); return false; }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!valider()) return;
    setLoading(true); setError('');
    try {
      await AuthService.updateSellerProfile({
        association:  nomBoutique.trim(),
        description:  description.trim(),
        localisation: localisation.trim(),
        ville:        ville.trim(),
      });
      if (licence) {
        await AuthService.uploadKYCDocument({ document_type: 'business_license', cip_photo: licence });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ display: 'flex', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: '#dc2626', alignItems: 'center' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div style={FW}>
        <label style={LB}>Nom de la boutique *</label>
        <div style={{ position: 'relative' }}>
          <Store size={15} color="#9ca3af" style={IL} />
          <input type="text" value={nomBoutique} onChange={e => { setNomBoutique(e.target.value); setError(''); }}
            onFocus={() => setFocused('boutique')} onBlur={() => setFocused('')}
            placeholder="Ex : Céréales Moussa" style={inp(focused, 'boutique')} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
        <div>
          <label style={LB}>Ville *</label>
          <div style={{ position: 'relative' }}>
            <MapPin size={15} color="#9ca3af" style={IL} />
            <input type="text" value={ville} onChange={e => { setVille(e.target.value); setError(''); }}
              onFocus={() => setFocused('ville')} onBlur={() => setFocused('')}
              placeholder="Ex : Cotonou" style={inp(focused, 'ville')} />
          </div>
        </div>
        <div>
          <label style={LB}>Quartier / Localisation</label>
          <div style={{ position: 'relative' }}>
            <MapPin size={15} color="#9ca3af" style={IL} />
            <input type="text" value={localisation} onChange={e => setLocalisation(e.target.value)}
              onFocus={() => setFocused('localisation')} onBlur={() => setFocused('')}
              placeholder="Ex : Akpakpa" style={inp(focused, 'localisation')} />
          </div>
        </div>
      </div>

      <div style={FW}>
        <label style={LB}>Description de votre activité</label>
        <div style={{ position: 'relative' }}>
          <AlignLeft size={15} color="#9ca3af" style={{ ...IL, top: '14px', transform: 'none' }} />
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            onFocus={() => setFocused('desc')} onBlur={() => setFocused('')}
            placeholder="Produits vendus, zones de livraison, expérience…"
            rows={3}
            style={{ width: '100%', padding: '0.82rem 1rem 0.82rem 2.5rem', border: `1.5px solid ${focused === 'desc' ? GREEN : '#e5e7eb'}`, borderRadius: '12px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: '#fafafa', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div style={FW}>
        <label style={LB}>Licence commerciale (optionnel)</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `2px dashed ${licence ? GREEN : '#e5e7eb'}`, borderRadius: '12px', padding: '1rem', cursor: 'pointer', background: licence ? '#f0fdf4' : '#fafafa', transition: 'all 0.2s' }}>
          <Upload size={18} color={licence ? GREEN : '#9ca3af'} />
          <span style={{ fontSize: '0.85rem', color: licence ? GREEN : '#6b7280' }}>
            {licence ? licence.name : 'Registre de commerce ou licence (PDF, image)'}
          </span>
          <input type="file" accept="image/*,.pdf" onChange={e => setLicence(e.target.files[0])} style={{ display: 'none' }} />
        </label>
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
              Enregistrement…
            </motion.span>
          ) : (
            <motion.span key="idle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <CheckCircle size={16} /> Accéder à ma boutique
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </form>
  );
}

// ────────────────────────────────────────────────
// Formulaire Transporteur
// ────────────────────────────────────────────────
function FormTransporteur({ onSuccess }) {
  const [typeVehicule,    setTypeVehicule]    = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [annee,           setAnnee]           = useState('');
  const [capacite,        setCapacite]        = useState('');
  const [photoVehicule,   setPhotoVehicule]   = useState(null);
  const [carteGrise,      setCarteGrise]      = useState(null);
  const [permis,          setPermis]          = useState(null);
  const [assuranceExpiry, setAssuranceExpiry] = useState('');
  const [visiteExpiry,    setVisiteExpiry]    = useState('');
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [focused,         setFocused]         = useState('');

  const handleFile = (setter) => e => { const f = e.target.files[0]; if (f) setter(f); };

  const valider = () => {
    if (!typeVehicule)           { setError('Le type de véhicule est obligatoire'); return false; }
    if (!immatriculation.trim()) { setError('Le numéro d\'immatriculation est obligatoire'); return false; }
    if (!annee)                  { setError('L\'année est obligatoire'); return false; }
    if (!capacite)               { setError('La capacité est obligatoire'); return false; }
    if (!carteGrise)             { setError('La carte grise est obligatoire'); return false; }
    if (!permis)                 { setError('Le permis de conduire est obligatoire'); return false; }
    if (!assuranceExpiry)        { setError('La date d\'expiration de l\'assurance est obligatoire'); return false; }
    if (!visiteExpiry)           { setError('La date de visite technique est obligatoire'); return false; }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!valider()) return;
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('type',             typeVehicule);
      fd.append('immatriculation',  immatriculation.trim().toUpperCase());
      fd.append('annee',            annee);
      fd.append('capacite_tonnes',  capacite);
      fd.append('assurance_expiry', assuranceExpiry);
      fd.append('visite_expiry',    visiteExpiry);
      if (photoVehicule) fd.append('photo',       photoVehicule);
      if (carteGrise)    fd.append('carte_grise', carteGrise);
      await TransportService.addVehicle(fd);
      if (permis) {
        try { await AuthService.uploadKYCDocument({ document_type: 'cip', cip_photo: permis }); } catch {}
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement du véhicule');
    } finally { setLoading(false); }
  };

  const FileUpload = ({ label, setter, file, required }) => (
    <div style={FW}>
      <label style={LB}>{label}{required ? ' *' : ''}</label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `2px dashed ${file ? ORANGE : '#e5e7eb'}`, borderRadius: '12px', padding: '1rem', cursor: 'pointer', background: file ? '#fffbeb' : '#fafafa', transition: 'all 0.2s' }}>
        <Upload size={18} color={file ? ORANGE : '#9ca3af'} />
        <span style={{ fontSize: '0.84rem', color: file ? ORANGE : '#6b7280' }}>
          {file ? file.name : 'Cliquez pour uploader (JPG, PNG, PDF)'}
        </span>
        <input type="file" accept="image/*,.pdf" onChange={handleFile(setter)} style={{ display: 'none' }} />
      </label>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ display: 'flex', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: '#dc2626', alignItems: 'center' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Type de véhicule */}
      <div style={FW}>
        <label style={LB}>Type de véhicule *</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '8px' }}>
          {TYPES_VEHICULE.map(t => (
            <motion.button key={t.value} type="button" onClick={() => { setTypeVehicule(t.value); setError(''); }}
              style={{ padding: '0.6rem', border: `2px solid ${typeVehicule === t.value ? ORANGE : '#e5e7eb'}`, borderRadius: '12px', background: typeVehicule === t.value ? '#fffbeb' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', transition: 'all 0.2s' }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              <Truck size={20} color={typeVehicule === t.value ? ORANGE : '#6b7280'} />
              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: typeVehicule === t.value ? ORANGE : '#374151' }}>{t.label}</span>
              <span style={{ fontSize: '0.62rem', color: '#9ca3af' }}>{t.capacite}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Immat + Année + Capacité */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
        {[
          { label: 'Immatriculation *', value: immatriculation, setter: setImmatriculation, name: 'immat', icon: Hash, placeholder: 'AB 1234 BJ' },
          { label: 'Année *', value: annee, setter: setAnnee, name: 'annee', icon: Calendar, placeholder: '2020', type: 'number' },
          { label: 'Capacité (t) *', value: capacite, setter: setCapacite, name: 'cap', icon: Weight, placeholder: '5', type: 'number' },
        ].map(({ label, value, setter, name, icon: Icon, placeholder, type = 'text' }) => (
          <div key={name}>
            <label style={LB}>{label}</label>
            <div style={{ position: 'relative' }}>
              <Icon size={13} color="#9ca3af" style={IL} />
              <input type={type} value={value} onChange={e => { setter(e.target.value); setError(''); }}
                onFocus={() => setFocused(name)} onBlur={() => setFocused('')}
                placeholder={placeholder}
                style={{ ...inp(focused, name, ORANGE), padding: '0.75rem 0.5rem 0.75rem 2.2rem', fontSize: '0.85rem' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Documents */}
      <FileUpload label="Carte grise"        setter={setCarteGrise}    file={carteGrise}    required />
      <FileUpload label="Permis de conduire" setter={setPermis}        file={permis}        required />
      <FileUpload label="Photo du véhicule"  setter={setPhotoVehicule} file={photoVehicule} required={false} />

      {/* Dates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
        <div>
          <label style={LB}>Expiry assurance *</label>
          <div style={{ position: 'relative' }}>
            <ShieldCheck size={14} color="#9ca3af" style={IL} />
            <input type="date" value={assuranceExpiry} onChange={e => { setAssuranceExpiry(e.target.value); setError(''); }}
              min={new Date().toISOString().split('T')[0]}
              style={{ ...inp(focused, 'assur', ORANGE), padding: '0.75rem 0.5rem 0.75rem 2.2rem' }} />
          </div>
        </div>
        <div>
          <label style={LB}>Visite technique *</label>
          <div style={{ position: 'relative' }}>
            <Calendar size={14} color="#9ca3af" style={IL} />
            <input type="date" value={visiteExpiry} onChange={e => { setVisiteExpiry(e.target.value); setError(''); }}
              min={new Date().toISOString().split('T')[0]}
              style={{ ...inp(focused, 'visite', ORANGE), padding: '0.75rem 0.5rem 0.75rem 2.2rem' }} />
          </div>
        </div>
      </div>

      <motion.button type="submit" disabled={loading}
        style={{ width: '100%', padding: '0.9rem', background: loading ? '#9ca3af' : `linear-gradient(135deg, ${ORANGE}, #f59e0b)`, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.97rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : '0 4px 20px rgba(217,119,6,0.28)' }}
        whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div>
              Enregistrement…
            </motion.span>
          ) : (
            <motion.span key="idle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <CheckCircle size={16} /> Commencer mes missions
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </form>
  );
}

// ────────────────────────────────────────────────
// Page principale
// ────────────────────────────────────────────────
export default function SetupActivite() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const role      = user?.role;

  const handleSuccess = () => {
    navigate(`/${role?.toLowerCase()}/dashboard`, { replace: true });
  };

  const config = {
    SELLER:      { titre: 'Votre boutique',  sous: 'Informations sur votre activité de vente',    couleur: GREEN,  Icon: Store },
    TRANSPORTER: { titre: 'Votre véhicule',  sous: 'Informations sur votre activité de transport', couleur: ORANGE, Icon: Truck },
  };
  const cfg = config[role] || {};
  const { Icon } = cfg;

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '540px' }}>

        {/* Progression */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '4px', borderRadius: '4px', background: cfg.couleur }} />
          <div style={{ flex: 1, height: '4px', borderRadius: '4px', background: cfg.couleur }} />
        </div>
        <p style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '1.5rem', textAlign: 'center' }}>
          Étape 2 sur 2 — Informations d'activité
        </p>

        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            {Icon && (
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: role === 'TRANSPORTER' ? '#fffbeb' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={cfg.couleur} />
              </div>
            )}
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1a2e10' }}>{cfg.titre}</h2>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b7280' }}>{cfg.sous}</p>
            </div>
          </div>

          {role === 'SELLER'      && <FormVendeur      onSuccess={handleSuccess} />}
          {role === 'TRANSPORTER' && <FormTransporteur onSuccess={handleSuccess} />}
        </div>
      </motion.div>
    </div>
  );
}
