import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CheckCircle, Save, Loader } from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import TransportService from '../../services/transport.service';

const JOURS = [
  { id: 'lundi',    label: 'Lun' },
  { id: 'mardi',    label: 'Mar' },
  { id: 'mercredi', label: 'Mer' },
  { id: 'jeudi',    label: 'Jeu' },
  { id: 'vendredi', label: 'Ven' },
  { id: 'samedi',   label: 'Sam' },
  { id: 'dimanche', label: 'Dim' },
];

const VILLES = [
  'Cotonou','Porto-Novo','Abomey-Calavi','Ouidah','Bohicon',
  'Abomey','Lokossa','Parakou','Natitingou','Djougou',
  'Kandi','Nikki','Banikoara','Malanville','Savè',
];

const ORANGE = '#d97706';
const fadeUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

export default function Availability() {
  const [disponible, setDisponible] = useState(false);
  const [joursActifs, setJoursActifs] = useState([]);
  const [villesActives, setVillesActives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [erreur,  setErreur]  = useState('');

  useEffect(() => {
    TransportService.getAvailability()
      .then(data => {
        setDisponible(data.est_disponible ?? false);
        setJoursActifs(data.jours || []);
        setVillesActives(data.villes || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleJour = (id) => {
    setJoursActifs(prev =>
      prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]
    );
  };

  const toggleVille = (ville) => {
    setVillesActives(prev =>
      prev.includes(ville) ? prev.filter(v => v !== ville) : [...prev, ville]
    );
  };

  const handleToggleDispo = async () => {
    const newVal = !disponible;
    setDisponible(newVal);
    try {
      await TransportService.setAvailability(newVal);
    } catch {
      setDisponible(!newVal);
    }
  };

  const handleSave = async () => {
    setSaving(true); setErreur('');
    try {
      await TransportService.setAvailability(disponible);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setErreur('Impossible de sauvegarder. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="transporter">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Loader size={28} color={ORANGE} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="transporter">
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>
            Disponibilité
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
            Gérez vos créneaux et zones de disponibilité
          </p>
        </motion.div>

        {/* STATUT PRINCIPAL */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}
          style={{ background: 'white', borderRadius: '16px', padding: '1.4rem', border: '1px solid #e5e7eb', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '1rem', color: '#1a2e10' }}>
              Disponible pour les missions
            </p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b7280', marginTop: '3px' }}>
              Désactivez pour suspendre les nouvelles demandes
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: disponible ? '#16a34a' : '#9ca3af' }}>
              {disponible ? 'Actif' : 'Inactif'}
            </span>
            <motion.div
              style={{ width: '50px', height: '26px', borderRadius: '13px', background: disponible ? '#1a5c2a' : '#d1d5db', position: 'relative', cursor: 'pointer', flexShrink: 0 }}
              onClick={handleToggleDispo}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                style={{ position: 'absolute', top: '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
                animate={{ x: disponible ? 27 : 3 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* JOURS */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}
          style={{ background: 'white', borderRadius: '16px', padding: '1.4rem', border: '1px solid #e5e7eb', marginBottom: '1rem' }}
        >
          <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1a2e10', marginBottom: '1rem' }}>
            Jours disponibles
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {JOURS.map(j => {
              const actif = joursActifs.includes(j.id);
              return (
                <motion.button
                  key={j.id}
                  onClick={() => toggleJour(j.id)}
                  style={{ width: '52px', height: '52px', borderRadius: '12px', border: `2px solid ${actif ? ORANGE : '#e5e7eb'}`, background: actif ? '#fffbeb' : 'white', color: actif ? ORANGE : '#6b7280', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s' }}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                >
                  {j.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* VILLES */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}
          style={{ background: 'white', borderRadius: '16px', padding: '1.4rem', border: '1px solid #e5e7eb', marginBottom: '1.5rem' }}
        >
          <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1a2e10', marginBottom: '0.4rem' }}>
            Zones d'intervention
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '1rem' }}>
            Sélectionnez les villes où vous êtes disponible
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
            {VILLES.map(ville => {
              const actif = villesActives.includes(ville);
              return (
                <motion.button
                  key={ville}
                  onClick={() => toggleVille(ville)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.45rem 0.9rem', borderRadius: '20px', border: `1.5px solid ${actif ? ORANGE : '#e5e7eb'}`, background: actif ? ORANGE : 'white', color: actif ? 'white' : '#374151', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                >
                  <MapPin size={12} /> {ville}
                  {actif && <CheckCircle size={12} />}
                </motion.button>
              );
            })}
          </div>
          {villesActives.length > 0 && (
            <p style={{ fontSize: '0.78rem', color: ORANGE, fontWeight: '500', margin: 0 }}>
              {villesActives.length} ville(s) sélectionnée(s)
            </p>
          )}
        </motion.div>

        {/* MESSAGES */}
        {erreur && (
          <p style={{ color: '#dc2626', fontSize: '0.84rem', marginBottom: '0.8rem' }}>{erreur}</p>
        )}
        {saved && (
          <p style={{ color: '#16a34a', fontSize: '0.84rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={15} /> Disponibilité sauvegardée !
          </p>
        )}

        {/* BOUTON SAVE */}
        <motion.button
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: `linear-gradient(135deg, ${ORANGE}, #f59e0b)`, color: 'white', border: 'none', borderRadius: '14px', padding: '0.9rem', fontWeight: '700', fontSize: '0.95rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.8 : 1, boxShadow: '0 4px 14px rgba(217,119,6,0.3)' }}
          whileHover={{ scale: saving ? 1 : 1.02 }} whileTap={{ scale: saving ? 1 : 0.98 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {saving ? (
              <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div>
                <span> Sauvegarde…</span>
              </motion.span>
            ) : (
              <motion.span key="idle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <Save size={16} /><span> Sauvegarder ma disponibilité</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

      </div>
    </DashboardLayout>
  );
}
