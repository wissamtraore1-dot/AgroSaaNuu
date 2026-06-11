import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Plus, Trash2, MapPin, CheckCircle,
  Navigation, Calendar, Shield, Loader, AlertCircle,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import TransportService from '../../services/transport.service';

const ORANGE = '#d97706';
const GREEN  = '#1a5c2a';

const TYPE_LABELS = {
  PICKUP:     { label: 'Pick-up'    },
  CAMION_5T:  { label: 'Camion 5t'  },
  CAMION_8T:  { label: 'Camion 8t'  },
  CAMION_10T: { label: 'Camion 10t' },
  CAMION_15T: { label: 'Camion 15t' },
};

const fadeUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

export default function Vehicles() {
  const navigate = useNavigate();
  const [vehicules, setVehicules] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [supprimant, setSupprimant] = useState(null);
  const [erreur,    setErreur]    = useState('');

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      setLoading(true);
      const data = await TransportService.getMyVehicles();
      setVehicules(Array.isArray(data) ? data : data.results || []);
    } catch {
      setErreur('Impossible de charger les véhicules.');
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm('Supprimer ce véhicule ?')) return;
    setSupprimant(id);
    try {
      await TransportService.deleteVehicle(id);
      setVehicules(prev => prev.filter(v => v.id !== id));
    } catch {
      setErreur('Impossible de supprimer ce véhicule.');
    } finally {
      setSupprimant(null);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

  const isExpirant = (d) => {
    if (!d) return false;
    const diff = new Date(d) - new Date();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  };

  return (
    <DashboardLayout role="transporter">
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}
        >
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Truck size={22} color={ORANGE} /> Mes véhicules
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
              {vehicules.length} véhicule(s) enregistré(s)
            </p>
          </div>
          <motion.button
            onClick={() => navigate('/transporter/enregistrer-vehicule')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `linear-gradient(135deg, ${ORANGE}, #f59e0b)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.7rem 1.4rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(217,119,6,0.3)' }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            <Plus size={16} /><span> Ajouter un véhicule</span>
          </motion.button>
        </motion.div>

        {/* ERREUR */}
        <AnimatePresence>
          {erreur && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: '#dc2626', alignItems: 'center' }}
            >
              <AlertCircle size={15} /> {erreur}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CHARGEMENT */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: '110px', borderRadius: '16px', background: '#f3f4f6' }} />
            ))}
          </div>

        ) : vehicules.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="show"
            style={{ background: 'white', borderRadius: '20px', padding: '3rem 2rem', border: '1px solid #e5e7eb', textAlign: 'center' }}
          >
            <Truck size={52} color="#e5e7eb" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>
              Aucun véhicule enregistré
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
              Enregistrez votre véhicule pour commencer à accepter des missions.
            </p>
            <motion.button
              onClick={() => navigate('/transporter/enregistrer-vehicule')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `linear-gradient(135deg, ${ORANGE}, #f59e0b)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.8rem 2rem', fontWeight: '700', cursor: 'pointer' }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              <Plus size={16} /><span> Enregistrer mon premier véhicule</span>
            </motion.button>
          </motion.div>

        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {vehicules.map((v, i) => {
              const typeInfo = TYPE_LABELS[v.type] || { label: v.type || 'Véhicule' };
              const estDispo = v.est_disponible ?? true;
              const assurExp = isExpirant(v.assurance_expiry);
              const visiteExp = isExpirant(v.visite_expiry);

              return (
                <motion.div
                  key={v.id}
                  variants={fadeUp} initial="hidden" animate="show"
                  transition={{ delay: i * 0.06 }}
                  style={{ background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>

                    {/* ICÔNE / PHOTO */}
                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #fde68a' }}>
                      {v.photo
                        ? <img src={v.photo} alt="" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                        : <Truck size={28} color={ORANGE} />
                      }
                    </div>

                    {/* INFOS */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '800', fontSize: '1rem', color: '#1a2e10' }}>{typeInfo.label}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#6b7280', background: '#f3f4f6', borderRadius: '6px', padding: '2px 8px' }}>
                          {v.immatriculation || '—'}
                        </span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '0.72rem', fontWeight: '700', padding: '2px 10px', borderRadius: '20px',
                          background: estDispo ? '#dcfce7' : '#dbeafe',
                          color:      estDispo ? '#16a34a' : '#2563eb',
                        }}>
                          {estDispo ? <CheckCircle size={11} /> : <Navigation size={11} />}
                          {estDispo ? 'Disponible' : 'En mission'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#6b7280', marginBottom: '8px' }}>
                        <span><Calendar size={12} /> Année : <strong>{v.annee || '—'}</strong></span>
                        <span><Truck size={12} /> Capacité : <strong>{v.capacite_tonnes ? `${v.capacite_tonnes}t` : '—'}</strong></span>
                        {v.localisation && <span><MapPin size={12} /> {v.localisation}</span>}
                      </div>

                      {/* DOCUMENTS */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {v.assurance_expiry && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '8px', background: assurExp ? '#fef3c7' : '#f0fdf4', color: assurExp ? '#d97706' : '#16a34a', border: `1px solid ${assurExp ? '#fde68a' : '#bbf7d0'}` }}>
                            <Shield size={10} /> Assurance : {formatDate(v.assurance_expiry)}
                          </span>
                        )}
                        {v.visite_expiry && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '8px', background: visiteExp ? '#fef3c7' : '#f0fdf4', color: visiteExp ? '#d97706' : '#16a34a', border: `1px solid ${visiteExp ? '#fde68a' : '#bbf7d0'}` }}>
                            <CheckCircle size={10} /> Visite : {formatDate(v.visite_expiry)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SUPPRIMER */}
                    <motion.button
                      onClick={() => handleSupprimer(v.id)}
                      disabled={supprimant === v.id}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {supprimant === v.id ? (
                          <motion.div key="loading"
                            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                            <Loader size={15} color="#dc2626" />
                          </motion.div>
                        ) : (
                          <motion.div key="idle"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                            <Trash2 size={15} color="#dc2626" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
