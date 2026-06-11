import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Hash, Calendar, Weight, Upload,
  CheckCircle, ArrowLeft, ArrowRight, AlertCircle,
  Loader, User, MapPin, FileText, ShieldCheck,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import AuthService from '../../services/auth.service';
import TransportService from '../../services/transport.service';
import { useAuth } from '../../context/AuthContext';

const GREEN  = '#1a5c2a';
const ORANGE = '#d97706';

const TYPES_VEHICULE = [
  { value: 'PICKUP',     label: 'Pick-up',    capacite: '1–2t'  },
  { value: 'CAMION_5T',  label: 'Camion 5t',  capacite: '5t'    },
  { value: 'CAMION_8T',  label: 'Camion 8t',  capacite: '8t'    },
  { value: 'CAMION_10T', label: 'Camion 10t', capacite: '10t'   },
  { value: 'CAMION_15T', label: 'Camion 15t', capacite: '15t'   },
];

const ETAPES = [
  { id: 1, label: 'Identité',  icon: User       },
  { id: 2, label: 'Véhicule',  icon: Truck      },
  { id: 3, label: 'Documents', icon: FileText   },
];

function StepDot({ etape, courante }) {
  const fait   = courante > etape.id;
  const active = courante === etape.id;
  const Icon   = etape.icon;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        background: fait ? ORANGE : active ? '#fffbeb' : '#f3f4f6',
        border: `2px solid ${fait || active ? ORANGE : '#e5e7eb'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
      }}>
        {fait
          ? <CheckCircle size={18} color="white" fill={ORANGE} />
          : <Icon size={16} color={active ? ORANGE : '#9ca3af'} />
        }
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: '600', color: active ? ORANGE : '#9ca3af' }}>{etape.label}</span>
    </div>
  );
}

const inputStyle = (focused, name, color = GREEN) => ({
  width: '100%', padding: '0.82rem 1rem 0.82rem 2.6rem',
  border: `1.5px solid ${focused === name ? color : '#e5e7eb'}`,
  borderRadius: '12px', fontSize: '0.93rem', outline: 'none',
  color: '#1a2e10', background: focused === name ? '#fffdf5' : '#fafafa',
  transition: 'all 0.2s',
  boxShadow: focused === name ? `0 0 0 3px rgba(217,119,6,0.08)` : 'none',
});

const iconLeft  = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' };
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' };

export default function EnregistrerVehicule() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromParam = searchParams.get('from');
  const { chargerUtilisateur } = useAuth();

  const [etape,   setEtape]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [focused, setFocused] = useState('');

  // Étape 1 — Identité transporteur
  const [cip,           setCip]           = useState('');
  const [adresse,       setAdresse]       = useState('');
  const [ville,         setVille]         = useState('');
  const [photoCIP,      setPhotoCIP]      = useState(null);
  const [previewCIP,    setPreviewCIP]    = useState(null);
  const [permis,        setPermis]        = useState(null);
  const [previewPermis, setPreviewPermis] = useState(null);

  // Étape 2 — Véhicule
  const [typeVehicule,    setTypeVehicule]    = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [annee,           setAnnee]           = useState('');
  const [capacite,        setCapacite]        = useState('');
  const [photoVehicule,   setPhotoVehicule]   = useState(null);
  const [previewVehicule, setPreviewVehicule] = useState(null);

  // Étape 3 — Documents
  const [carteGrise,       setCarteGrise]       = useState(null);
  const [previewCarteGrise, setPreviewCarteGrise] = useState(null);
  const [assuranceExpiry,  setAssuranceExpiry]  = useState('');
  const [visiteExpiry,     setVisiteExpiry]     = useState('');

  const handleFile = (setter, previewSetter) => e => {
    const f = e.target.files[0];
    if (!f) return;
    setter(f);
    if (previewSetter && f.type.startsWith('image/')) previewSetter(URL.createObjectURL(f));
  };

  const validerEtape = () => {
    setError('');
    if (etape === 1) {
      if (!cip.trim())     { setError('Le numéro CIP est obligatoire'); return false; }
      if (!/^\d{8,12}$/.test(cip.trim())) { setError('Le CIP doit contenir 8 à 12 chiffres'); return false; }
      if (!photoCIP)       { setError('La photo de votre pièce d\'identité (CIP) est obligatoire'); return false; }
      if (!permis)         { setError('Le permis de conduire est obligatoire'); return false; }
      if (!adresse.trim()) { setError('L\'adresse est obligatoire'); return false; }
      if (!ville.trim())   { setError('La ville est obligatoire'); return false; }
    }
    if (etape === 2) {
      if (!typeVehicule)          { setError('Le type de véhicule est obligatoire'); return false; }
      if (!immatriculation.trim()) { setError('Le numéro d\'immatriculation est obligatoire'); return false; }
      if (!annee || Number(annee) < 1990 || Number(annee) > new Date().getFullYear()) {
        setError(`L'année doit être entre 1990 et ${new Date().getFullYear()}`); return false;
      }
      if (!capacite || Number(capacite) <= 0) { setError('La capacité est obligatoire'); return false; }
    }
    if (etape === 3) {
      if (!carteGrise)       { setError('La carte grise est obligatoire'); return false; }
      if (!assuranceExpiry)  { setError('La date d\'expiration d\'assurance est obligatoire'); return false; }
      if (!visiteExpiry)     { setError('La date de visite technique est obligatoire'); return false; }
    }
    return true;
  };

  const suivant   = () => { if (validerEtape()) setEtape(e => e + 1); };
  const precedent = () => { setError(''); setEtape(e => e - 1); };

  const soumettre = async () => {
    if (!validerEtape()) return;
    setLoading(true); setError('');
    try {
      // 1. Compléter profil (CIP + adresse)
      await AuthService.completeProfile({ cip: cip.trim(), adresse: adresse.trim(), ville: ville.trim() });

      // 2. Upload photo CIP
      await AuthService.uploadKYCDocument({ document_type: 'cip', cip_photo: photoCIP });

      // 2b. Upload permis de conduire (via FormData direct)
      if (permis) {
        const fdPermis = new FormData();
        fdPermis.append('document_type', 'permis');
        fdPermis.append('cip_photo', permis);
        try { await AuthService.uploadKYCDocument({ document_type: 'permis', cip_photo: permis }); } catch {}
      }

      // 3. Enregistrer le véhicule
      const fd = new FormData();
      fd.append('type',            typeVehicule);
      fd.append('immatriculation', immatriculation.trim().toUpperCase());
      fd.append('annee',           annee);
      fd.append('capacite_tonnes', capacite);
      fd.append('assurance_expiry', assuranceExpiry);
      fd.append('visite_expiry',   visiteExpiry);
      if (photoVehicule) fd.append('photo',       photoVehicule);
      if (carteGrise)    fd.append('carte_grise', carteGrise);
      await TransportService.addVehicle(fd);

      chargerUtilisateur(); // rafraîchit user.cip dans le contexte
      setEtape(4); // succès
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="transporter">
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={22} color={ORANGE} /> Enregistrer mon véhicule
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: 0 }}>
            Ces informations sont requises pour accepter des missions de livraison.
          </p>
        </div>

        {/* Stepper */}
        {etape < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            {ETAPES.map((e, i) => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center' }}>
                <StepDot etape={e} courante={etape} />
                {i < ETAPES.length - 1 && (
                  <div style={{ width: '60px', height: '2px', background: etape > e.id ? ORANGE : '#e5e7eb', margin: '0 4px 20px', transition: 'background 0.3s' }} />
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '20px', padding: '1.8rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1.2rem', fontSize: '0.84rem', color: '#dc2626', alignItems: 'center' }}
              >
                <AlertCircle size={15} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Étape 1 : Identité ── */}
          {etape === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a2e10', marginBottom: '1.2rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <User size={18} color={ORANGE} /> Vos informations personnelles
              </h3>

              {[
                { label: 'Numéro CIP *', value: cip, setter: setCip, icon: Hash, name: 'cip', placeholder: 'Ex : 12345678', maxLength: 12, hint: '8 à 12 chiffres' },
                { label: 'Adresse *', value: adresse, setter: setAdresse, icon: MapPin, name: 'adresse', placeholder: 'Quartier, rue...' },
                { label: 'Ville *', value: ville, setter: setVille, icon: MapPin, name: 'ville', placeholder: 'Ex : Parakou' },
              ].map(({ label, value, setter, icon: Icon, name, placeholder, maxLength, hint }) => (
                <div key={name} style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <Icon size={15} color="#9ca3af" style={iconLeft} />
                    <input type="text" value={value} onChange={e => { setter(e.target.value); setError(''); }}
                      onFocus={() => setFocused(name)} onBlur={() => setFocused('')}
                      placeholder={placeholder} maxLength={maxLength}
                      style={inputStyle(focused, name, ORANGE)}
                    />
                  </div>
                  {hint && <span style={{ fontSize: '0.74rem', color: '#9ca3af', marginTop: '4px', display: 'block' }}>{hint}</span>}
                </div>
              ))}

              {/* Photo CIP */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={labelStyle}>Photo pièce d'identité (CIP) *</label>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: `2px dashed ${photoCIP ? ORANGE : '#e5e7eb'}`, borderRadius: '14px', padding: '1.2rem', cursor: 'pointer', background: photoCIP ? '#fffbeb' : '#fafafa', transition: 'all 0.2s' }}>
                  {previewCIP
                    ? <img src={previewCIP} alt="CIP" style={{ maxHeight: '130px', objectFit: 'contain', borderRadius: '8px' }} />
                    : <><Upload size={24} color="#9ca3af" /><span style={{ fontSize: '0.84rem', color: '#6b7280' }}>Cliquez pour uploader</span></>
                  }
                  <input type="file" accept="image/*,.pdf" onChange={handleFile(setPhotoCIP, setPreviewCIP)} style={{ display: 'none' }} />
                </label>
                {photoCIP && <span style={{ fontSize: '0.75rem', color: ORANGE, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={13} color={ORANGE} /> {photoCIP.name}</span>}
              </div>

              {/* Permis de conduire */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={labelStyle}>Permis de conduire *</label>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: `2px dashed ${permis ? ORANGE : '#e5e7eb'}`, borderRadius: '14px', padding: '1.2rem', cursor: 'pointer', background: permis ? '#fffbeb' : '#fafafa', transition: 'all 0.2s' }}>
                  {previewPermis
                    ? <img src={previewPermis} alt="permis" style={{ maxHeight: '130px', objectFit: 'contain', borderRadius: '8px' }} />
                    : <><Upload size={24} color="#9ca3af" /><span style={{ fontSize: '0.84rem', color: '#6b7280' }}>Photo ou scan du permis de conduire</span><span style={{ fontSize: '0.74rem', color: '#9ca3af' }}>JPG, PNG, PDF — max 5 MB</span></>
                  }
                  <input type="file" accept="image/*,.pdf" onChange={handleFile(setPermis, setPreviewPermis)} style={{ display: 'none' }} />
                </label>
                {permis && <span style={{ fontSize: '0.75rem', color: ORANGE, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={13} color={ORANGE} /> {permis.name}</span>}
              </div>
            </motion.div>
          )}

          {/* ── Étape 2 : Véhicule ── */}
          {etape === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a2e10', marginBottom: '1.2rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Truck size={18} color={ORANGE} /> Informations du véhicule
              </h3>

              {/* Type véhicule */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Type de véhicule *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '8px' }}>
                  {TYPES_VEHICULE.map(t => (
                    <motion.button key={t.value} type="button" onClick={() => { setTypeVehicule(t.value); setError(''); }}
                      style={{ padding: '0.7rem 0.5rem', border: `2px solid ${typeVehicule === t.value ? ORANGE : '#e5e7eb'}`, borderRadius: '12px', background: typeVehicule === t.value ? '#fffbeb' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    >
                      <Truck size={20} color={typeVehicule === t.value ? ORANGE : '#6b7280'} />
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', color: typeVehicule === t.value ? ORANGE : '#374151' }}>{t.label}</span>
                      <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>{t.capacite}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {[
                { label: 'Plaque d\'immatriculation *', value: immatriculation, setter: setImmatriculation, icon: Hash, name: 'immat', placeholder: 'Ex : AB 1234 BJ' },
                { label: 'Année du véhicule *', value: annee, setter: setAnnee, icon: Calendar, name: 'annee', placeholder: `Ex : ${new Date().getFullYear() - 3}`, type: 'number' },
                { label: 'Capacité de charge (tonnes) *', value: capacite, setter: setCapacite, icon: Weight, name: 'capacite', placeholder: 'Ex : 5', type: 'number' },
              ].map(({ label, value, setter, icon: Icon, name, placeholder, type = 'text' }) => (
                <div key={name} style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <Icon size={15} color="#9ca3af" style={iconLeft} />
                    <input type={type} value={value} onChange={e => { setter(e.target.value); setError(''); }}
                      onFocus={() => setFocused(name)} onBlur={() => setFocused('')}
                      placeholder={placeholder}
                      style={inputStyle(focused, name, ORANGE)}
                    />
                  </div>
                </div>
              ))}

              {/* Photo véhicule */}
              <div>
                <label style={labelStyle}>Photo du véhicule (optionnel)</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `2px dashed ${photoVehicule ? ORANGE : '#e5e7eb'}`, borderRadius: '12px', padding: '1rem', cursor: 'pointer', background: photoVehicule ? '#fffbeb' : '#fafafa', transition: 'all 0.2s' }}>
                  {previewVehicule
                    ? <img src={previewVehicule} alt="véhicule" style={{ height: '60px', objectFit: 'contain', borderRadius: '6px' }} />
                    : <Upload size={20} color="#9ca3af" />
                  }
                  <span style={{ fontSize: '0.85rem', color: photoVehicule ? ORANGE : '#6b7280' }}>
                    {photoVehicule ? photoVehicule.name : 'Ajouter une photo'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFile(setPhotoVehicule, setPreviewVehicule)} style={{ display: 'none' }} />
                </label>
              </div>
            </motion.div>
          )}

          {/* ── Étape 3 : Documents ── */}
          {etape === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a2e10', marginBottom: '0.4rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <FileText size={18} color={ORANGE} /> Documents du véhicule
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '1.2rem' }}>Documents obligatoires pour valider le véhicule sur la plateforme.</p>

              {/* Carte grise */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={labelStyle}>Carte grise *</label>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: `2px dashed ${carteGrise ? ORANGE : '#e5e7eb'}`, borderRadius: '14px', padding: '1.4rem', cursor: 'pointer', background: carteGrise ? '#fffbeb' : '#fafafa', transition: 'all 0.2s' }}>
                  {previewCarteGrise
                    ? <img src={previewCarteGrise} alt="carte grise" style={{ maxHeight: '130px', objectFit: 'contain', borderRadius: '8px' }} />
                    : <><FileText size={28} color="#9ca3af" /><span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Photo ou scan de la carte grise</span><span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>JPG, PNG, PDF — max 5 MB</span></>
                  }
                  <input type="file" accept="image/*,.pdf" onChange={handleFile(setCarteGrise, setPreviewCarteGrise)} style={{ display: 'none' }} />
                </label>
                {carteGrise && <span style={{ fontSize: '0.75rem', color: ORANGE, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={13} color={ORANGE} /> {carteGrise.name}</span>}
              </div>

              {/* Dates expiry */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '0.5rem' }}>
                <div>
                  <label style={labelStyle}>Expiry assurance *</label>
                  <div style={{ position: 'relative' }}>
                    <ShieldCheck size={15} color="#9ca3af" style={iconLeft} />
                    <input type="date" value={assuranceExpiry} onChange={e => { setAssuranceExpiry(e.target.value); setError(''); }}
                      onFocus={() => setFocused('assur')} onBlur={() => setFocused('')}
                      min={new Date().toISOString().split('T')[0]}
                      style={inputStyle(focused, 'assur', ORANGE)}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Visite technique *</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={15} color="#9ca3af" style={iconLeft} />
                    <input type="date" value={visiteExpiry} onChange={e => { setVisiteExpiry(e.target.value); setError(''); }}
                      onFocus={() => setFocused('visite')} onBlur={() => setFocused('')}
                      min={new Date().toISOString().split('T')[0]}
                      style={inputStyle(focused, 'visite', ORANGE)}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Succès ── */}
          {etape === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '1rem 0' }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                style={{ width: '72px', height: '72px', borderRadius: '50%', background: `linear-gradient(135deg, ${ORANGE}, #f59e0b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}
              >
                <CheckCircle size={36} color="white" />
              </motion.div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.5rem' }}>Véhicule enregistré !</h3>
              <p style={{ fontSize: '0.88rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Votre véhicule est en cours de vérification par notre équipe.<br />
                Vous pourrez accepter des missions dès validation.
              </p>
              <motion.button
                onClick={() => navigate(fromParam === 'missions' ? '/transporter/missions' : '/transporter/dashboard')}
                style={{ background: `linear-gradient(135deg, ${ORANGE}, #f59e0b)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.85rem 2rem', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(217,119,6,0.3)' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              >
                <span>{fromParam === 'missions' ? 'Voir mes missions' : 'Aller au tableau de bord'}</span>
              </motion.button>
            </motion.div>
          )}

          {/* Navigation */}
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
                  style={{ flex: 2, padding: '0.85rem', background: `linear-gradient(135deg, ${ORANGE}, #f59e0b)`, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(217,119,6,0.28)' }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                >
                  Suivant <ArrowRight size={16} />
                </motion.button>
              ) : (
                <motion.button onClick={soumettre} disabled={loading}
                  style={{ flex: 2, padding: '0.85rem', background: loading ? '#9ca3af' : `linear-gradient(135deg, ${ORANGE}, #f59e0b)`, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: loading ? 'none' : '0 4px 14px rgba(217,119,6,0.28)' }}
                  whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {loading ? (
                      <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div>
                        <span> Envoi…</span>
                      </motion.span>
                    ) : (
                      <motion.span key="idle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <CheckCircle size={16} /><span> Soumettre</span>
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
