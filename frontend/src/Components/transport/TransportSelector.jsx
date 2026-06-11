// src/Components/transport/TransportSelector.jsx
// Modal de sélection d'un transporteur après confirmation d'une commande.
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Star, X, Check, MapPin, Package, Loader, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import TransportService from '../../services/transport.service';

const GREEN  = '#1a5c2a';
const YELLOW = '#f0c040';

const VILLES = [
  'Cotonou','Porto-Novo','Abomey-Calavi','Ouidah','Bohicon',
  'Abomey','Lokossa','Parakou','Natitingou','Djougou',
  'Kandi','Nikki','Banikoara','Malanville','Savè','Bembèrèkè',
];

/**
 * Props:
 *  - commande     : objet commande (id, quantite, localisation/ville du vendeur)
 *  - onAssigned   : (mission) => void — appelé après assignation réussie
 *  - onClose      : () => void
 */
export default function TransportSelector({ commande, onAssigned, onClose }) {
  const [villeDepart,   setVilleDepart]   = useState(commande?.localisation || '');
  const [villeArrivee,  setVilleArrivee]  = useState('');
  const [transporteurs, setTransporteurs] = useState([]);
  const [estimation,    setEstimation]    = useState(null);
  const [selected,      setSelected]      = useState(null);
  const [vehiculeId,    setVehiculeId]    = useState('');
  const [dateDepart,    setDateDepart]    = useState('');
  const [loading,       setLoading]       = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState('');
  const [expanded,      setExpanded]      = useState(null);

  const tonnes = parseFloat(commande?.quantite || 1);

  // Charger transporteurs disponibles
  const rechercher = async () => {
    if (!villeDepart || !villeArrivee) { setError('Sélectionnez départ et arrivée'); return; }
    setLoading(true); setError('');
    try {
      const [res, est] = await Promise.all([
        TransportService.getTransporteursDisponibles({ ville_depart: villeDepart, ville_arrivee: villeArrivee, tonnes }),
        TransportService.estimerCout({ ville_depart: villeDepart, ville_arrivee: villeArrivee, tonnes }),
      ]);
      setTransporteurs(res.transporteurs || []);
      setEstimation(est);
      if ((res.transporteurs || []).length === 0) setError('Aucun transporteur disponible pour ce trajet.');
    } catch {
      setError('Erreur lors de la recherche');
    } finally { setLoading(false); }
  };

  const handleAssigner = async () => {
    if (!selected) { setError('Sélectionnez un transporteur'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await TransportService.assignerTransporteur({
        commande_id:    commande.id,
        transporteur_id: selected.id,
        vehicule_id:    vehiculeId || undefined,
        ville_depart:   villeDepart,
        ville_arrivee:  villeArrivee,
        date_depart:    dateDepart || undefined,
      });
      onAssigned?.(res.mission);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'assignation');
    } finally { setSubmitting(false); }
  };

  const stars = (note) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={13} fill={i < Math.round(note) ? YELLOW : 'none'}
      color={i < Math.round(note) ? YELLOW : '#d1d5db'} />
  ));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem', backdropFilter: 'blur(3px)' }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '580px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} color={GREEN} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#1a2e10' }}>Choisir un transporteur</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>
                {tonnes} tonne{tonnes > 1 ? 's' : ''} — Commande {commande?.reference}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '7px', cursor: 'pointer', display: 'flex' }}>
            <X size={16} color="#6b7280" />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: '1.2rem 1.5rem', flex: 1 }}>

          {/* Itinéraire */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
            <div>
              <label style={labelStyle}>Ville de départ</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <select value={villeDepart} onChange={e => setVilleDepart(e.target.value)} style={selectStyle}>
                  <option value="">Sélectionner</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Ville d'arrivée</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <select value={villeArrivee} onChange={e => setVilleArrivee(e.target.value)} style={selectStyle}>
                  <option value="">Sélectionner</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Bouton recherche */}
          <motion.button onClick={rechercher} disabled={loading}
            style={{ ...btnStyle(GREEN), marginBottom: '1rem' }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          >
            {loading ? <><Loader size={15} /><span> Recherche…</span></> : <span>Rechercher les transporteurs</span>}
          </motion.button>

          {/* Estimation */}
          {estimation && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: '#166534', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span><strong>{estimation.distance_km} km</strong> de trajet</span>
              <span>Estimation : <strong>{estimation.tarif_estime?.toLocaleString('fr-FR')} FCFA</strong></span>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: '#dc2626' }}>
              {error}
            </div>
          )}

          {/* Liste transporteurs */}
          {transporteurs.map(t => (
            <motion.div key={t.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => { setSelected(t); setVehiculeId(''); }}
              style={{
                border: `2px solid ${selected?.id === t.id ? GREEN : '#e5e7eb'}`,
                borderRadius: '14px', padding: '1rem', marginBottom: '0.8rem', cursor: 'pointer',
                background: selected?.id === t.id ? '#f0fdf4' : 'white',
                transition: 'all 0.2s',
                boxShadow: selected?.id === t.id ? `0 0 0 3px rgba(26,92,42,0.12)` : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {t.photo
                      ? <img src={t.photo} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                      : <Truck size={20} color="#6b7280" />
                    }
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', color: '#1a2e10', fontSize: '0.95rem' }}>
                      {t.nom}
                      {t.est_certifie && <span style={{ marginLeft: '6px', fontSize: '0.72rem', background: '#f0fdf4', color: GREEN, border: `1px solid ${GREEN}`, borderRadius: '4px', padding: '1px 5px' }}>Certifié</span>}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      {stars(t.note_moyenne)}
                      <span style={{ fontSize: '0.76rem', color: '#6b7280', marginLeft: '4px' }}>
                        {t.note_moyenne?.toFixed(1)} · {t.total_missions} missions
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: '800', color: GREEN, fontSize: '1rem' }}>
                    {t.tarif_estime?.toLocaleString('fr-FR')} FCFA
                  </p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#9ca3af' }}>estimé</p>
                </div>
              </div>

              {/* Véhicules disponibles */}
              <button type="button"
                onClick={e => { e.stopPropagation(); setExpanded(expanded === t.id ? null : t.id); }}
                style={{ marginTop: '8px', background: 'none', border: 'none', color: '#6b7280', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Package size={13} /> {t.vehicules?.length} véhicule{t.vehicules?.length > 1 ? 's' : ''}
                {expanded === t.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              <AnimatePresence>
                {expanded === t.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden', marginTop: '8px' }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {t.vehicules.map(v => (
                        <button key={v.id} type="button"
                          onClick={e => { e.stopPropagation(); setSelected(t); setVehiculeId(v.id); }}
                          style={{
                            padding: '5px 10px', borderRadius: '8px', border: `1.5px solid ${vehiculeId === v.id && selected?.id === t.id ? GREEN : '#e5e7eb'}`,
                            background: vehiculeId === v.id && selected?.id === t.id ? '#f0fdf4' : 'white',
                            fontSize: '0.78rem', cursor: 'pointer', color: '#374151',
                          }}
                        >
                          {v.type} — {v.immatriculation} ({v.capacite_tonnes}t)
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Date de départ souhaitée */}
          {selected && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Calendar size={14} /> Date de départ souhaitée (optionnel)
              </label>
              <input type="datetime-local" value={dateDepart} onChange={e => setDateDepart(e.target.value)}
                style={{ width: '100%', padding: '0.72rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.88rem', outline: 'none', color: '#1a2e10', marginBottom: '1rem' }}
              />
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}>
          <motion.button onClick={handleAssigner} disabled={!selected || submitting}
            style={{ ...btnStyle(selected ? GREEN : '#d1d5db'), cursor: selected ? 'pointer' : 'not-allowed' }}
            whileHover={{ scale: selected ? 1.02 : 1 }} whileTap={{ scale: selected ? 0.98 : 1 }}
          >
            {submitting ? <><Loader size={15} /><span> Assignation…</span></> : <><Check size={15} /><span> Confirmer le transporteur</span></>}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.83rem', fontWeight: '600', color: '#374151', marginBottom: '5px' };
const selectStyle = { width: '100%', padding: '0.72rem 1rem 0.72rem 2.2rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.88rem', outline: 'none', color: '#1a2e10', background: '#fafafa', cursor: 'pointer', appearance: 'none' };
const btnStyle = (bg) => ({ width: '100%', padding: '0.85rem', background: bg, color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `0 4px 16px ${bg}40`, transition: 'all 0.2s' });
