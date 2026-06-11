import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, MapPin, CheckCircle, Navigation,
  Clock, XCircle, Loader, Play, ThumbsDown, ThumbsUp,
  AlertCircle, Package,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import TransportService from '../../services/transport.service';
import { useAuth } from '../../context/AuthContext';

const STATUT_CONFIG = {
  PENDING:    { label: 'En attente', bg: '#fef3c7', color: '#d97706', icon: Clock       },
  ACCEPTEE:   { label: 'Acceptée',   bg: '#dbeafe', color: '#2563eb', icon: Navigation  },
  EN_COURS:   { label: 'En cours',   bg: '#ede9fe', color: '#7c3aed', icon: Play        },
  TERMINEE:   { label: 'Terminée',   bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  ANNULEE:    { label: 'Annulée',    bg: '#fee2e2', color: '#dc2626', icon: XCircle     },
  pending:    { label: 'En attente', bg: '#fef3c7', color: '#d97706', icon: Clock       },
  accepted:   { label: 'Acceptée',   bg: '#dbeafe', color: '#2563eb', icon: Navigation  },
  in_transit: { label: 'En cours',   bg: '#ede9fe', color: '#7c3aed', icon: Play        },
  completed:  { label: 'Terminée',   bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  cancelled:  { label: 'Annulée',    bg: '#fee2e2', color: '#dc2626', icon: XCircle     },
};

const TABS = [
  { value: null,       label: 'Toutes'     },
  { value: 'PENDING',  label: 'En attente' },
  { value: 'ACCEPTEE', label: 'Acceptées'  },
  { value: 'EN_COURS', label: 'En cours'   },
  { value: 'TERMINEE', label: 'Terminées'  },
];

const ORANGE = '#d97706';
const GREEN  = '#1a5c2a';
const fadeUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

export default function Missions() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [missions, setMissions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState(null);
  const [actif,    setActif]    = useState(null);
  const [msg,      setMsg]      = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) return;
    if (!user.cip) {
      navigate('/transporter/enregistrer-vehicule?from=missions', { replace: true });
      return;
    }
    charger();
  }, [tab, user]);

  const charger = async () => {
    try {
      setLoading(true);
      const data = await TransportService.getMyMissions({ status: tab || '' });
      setMissions(data.results || []);
    } finally {
      setLoading(false);
    }
  };

  const notif = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3500);
  };

  const handleAccepter = async (id) => {
    setActif(id);
    try {
      await TransportService.acceptMission(id);
      notif('success', 'Mission acceptée avec succès');
      charger();
    } catch {
      notif('error', "Impossible d'accepter la mission");
    } finally { setActif(null); }
  };

  const handleRefuser = async (id) => {
    setActif(id);
    try {
      await TransportService.declineMission(id);
      notif('success', 'Mission refusée');
      charger();
    } catch {
      notif('error', 'Impossible de refuser la mission');
    } finally { setActif(null); }
  };

  const handleDemarrer = async (id) => {
    setActif(id);
    try {
      await TransportService.demarrerMission(id);
      notif('success', 'Livraison démarrée');
      charger();
    } catch {
      notif('error', 'Impossible de démarrer la mission');
    } finally { setActif(null); }
  };

  const handleTerminer = async (id) => {
    setActif(id);
    try {
      await TransportService.terminerMission(id);
      notif('success', 'Mission terminée !');
      charger();
    } catch {
      notif('error', 'Impossible de terminer la mission');
    } finally { setActif(null); }
  };

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  if (!user) {
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
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardList size={22} color={ORANGE} /><span> Mes missions</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
            Gérez vos demandes de transport en attente et actives
          </p>
        </motion.div>

        {/* FEEDBACK */}
        <AnimatePresence>
          {msg.text && (
            <motion.div
              key="missions-msg"
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                display: 'flex', gap: '8px', borderRadius: '10px', padding: '0.7rem 1rem',
                marginBottom: '1rem', fontSize: '0.84rem', alignItems: 'center',
                background:   msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border:       `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                color:        msg.type === 'success' ? '#16a34a' : '#dc2626',
              }}
            >
              {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              <span>{msg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ONGLETS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <motion.button
              key={String(t.value)}
              onClick={() => setTab(t.value)}
              style={{
                padding: '0.45rem 1.1rem', borderRadius: '20px', border: '1.5px solid',
                fontSize: '0.83rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                background:  tab === t.value ? ORANGE  : 'white',
                color:       tab === t.value ? 'white' : '#374151',
                borderColor: tab === t.value ? ORANGE  : '#e5e7eb',
              }}
              whileTap={{ scale: 0.97 }}
            >
              {t.label}
            </motion.button>
          ))}
        </div>

        {/* LISTE */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: '120px', borderRadius: '14px', background: '#f3f4f6' }} />
            ))}
          </div>

        ) : missions.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="show"
            style={{ background: 'white', borderRadius: '20px', padding: '3rem', textAlign: 'center', border: '1px solid #e5e7eb' }}
          >
            <Package size={48} color="#e5e7eb" style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.9rem', color: '#9ca3af', margin: 0 }}>
              Aucune mission trouvée
            </p>
          </motion.div>

        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {missions.map((m, i) => {
              const cfg     = STATUT_CONFIG[m.status] || STATUT_CONFIG.PENDING;
              const Icon    = cfg.icon;
              const tarif   = Number(m.tarif) || Number(m.cout) || Number(m.montant) || Number(m.fee) || 0;
              const depart  = m.ville_depart  || m.pickup_location   || '—';
              const arrivee = m.ville_arrivee || m.delivery_location || '—';
              const enAction = actif === m.id;
              const st = m.status;

              return (
                <motion.div
                  key={m.id || i}
                  variants={fadeUp} initial="hidden" animate="show"
                  transition={{ delay: i * 0.05 }}
                  style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  whileHover={{ y: -2 }}
                >
                  {/* EN-TÊTE CARTE */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <div>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10' }}>Mission #{m.id}</span>
                      <span style={{ marginLeft: '10px', fontSize: '0.78rem', color: '#9ca3af' }}>{formatDate(m.created_at)}</span>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: cfg.bg, color: cfg.color }}>
                      <Icon size={12} /><span> {cfg.label}</span>
                    </span>
                  </div>

                  {/* TRAJET */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#374151', marginBottom: '0.6rem' }}>
                    <MapPin size={13} color="#9ca3af" />
                    <span style={{ fontWeight: '600' }}>{depart}</span>
                    <span style={{ color: ORANGE, fontWeight: '700' }}>→</span>
                    <span style={{ fontWeight: '600' }}>{arrivee}</span>
                  </div>

                  {/* TARIF */}
                  {tarif > 0 && (
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: GREEN, marginBottom: '0.8rem' }}>
                      {tarif.toLocaleString('fr-FR')} FCFA
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(st === 'PENDING' || st === 'pending') && (
                      <>
                        <motion.button
                          onClick={() => handleAccepter(m.id)}
                          disabled={enAction}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1.2rem', background: `linear-gradient(135deg, ${GREEN}, #2d6a4f)`, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.82rem', cursor: enAction ? 'not-allowed' : 'pointer', opacity: enAction ? 0.7 : 1 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {enAction ? <Loader size={13} /> : <ThumbsUp size={13} />}
                          <span> Accepter</span>
                        </motion.button>
                        <motion.button
                          onClick={() => handleRefuser(m.id)}
                          disabled={enAction}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1.2rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', fontWeight: '700', fontSize: '0.82rem', cursor: enAction ? 'not-allowed' : 'pointer', opacity: enAction ? 0.7 : 1 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <ThumbsDown size={13} /><span> Refuser</span>
                        </motion.button>
                      </>
                    )}
                    {(st === 'ACCEPTEE' || st === 'accepted') && (
                      <motion.button
                        onClick={() => handleDemarrer(m.id)}
                        disabled={enAction}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1.4rem', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.82rem', cursor: enAction ? 'not-allowed' : 'pointer', opacity: enAction ? 0.7 : 1 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {enAction ? <Loader size={13} /> : <Play size={13} />}
                        <span> Démarrer la livraison</span>
                      </motion.button>
                    )}
                    {(st === 'EN_COURS' || st === 'in_transit') && (
                      <motion.button
                        onClick={() => handleTerminer(m.id)}
                        disabled={enAction}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1.4rem', background: `linear-gradient(135deg, ${ORANGE}, #f59e0b)`, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.82rem', cursor: enAction ? 'not-allowed' : 'pointer', opacity: enAction ? 0.7 : 1 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {enAction ? <Loader size={13} /> : <CheckCircle size={13} />}
                        <span> Marquer livré</span>
                      </motion.button>
                    )}
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
