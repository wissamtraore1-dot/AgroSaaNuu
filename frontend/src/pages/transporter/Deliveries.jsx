import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, MapPin, CheckCircle, Navigation,
  Clock, XCircle, DollarSign,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import TransportService from '../../services/transport.service';

const STATUT_CONFIG = {
  PENDING:    { label: 'En attente', bg: '#fef3c7', color: '#d97706', icon: Clock       },
  ACCEPTEE:   { label: 'Acceptée',   bg: '#dbeafe', color: '#2563eb', icon: Navigation  },
  EN_COURS:   { label: 'En cours',   bg: '#dbeafe', color: '#2563eb', icon: Navigation  },
  TERMINEE:   { label: 'Livré',      bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  ANNULEE:    { label: 'Annulée',    bg: '#fee2e2', color: '#dc2626', icon: XCircle     },
  pending:    { label: 'En attente', bg: '#fef3c7', color: '#d97706', icon: Clock       },
  accepted:   { label: 'Acceptée',   bg: '#dbeafe', color: '#2563eb', icon: Navigation  },
  in_transit: { label: 'En cours',   bg: '#dbeafe', color: '#2563eb', icon: Navigation  },
  completed:  { label: 'Livré',      bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  cancelled:  { label: 'Annulée',    bg: '#fee2e2', color: '#dc2626', icon: XCircle     },
};

const TABS = [
  { value: null,       label: 'Toutes'      },
  { value: 'TERMINEE', label: 'Livrées'     },
  { value: 'EN_COURS', label: 'En cours'    },
  { value: 'ANNULEE',  label: 'Annulées'    },
];

const fadeUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

export default function Deliveries() {
  const [livraisons, setLivraisons] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState(null);

  useEffect(() => { charger(); }, [tab]);

  const charger = async () => {
    try {
      setLoading(true);
      const data = await TransportService.getMyDeliveries({ status: tab });
      setLivraisons(data.results || []);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <DashboardLayout role="transporter">
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={22} color="#d97706" /> Historique des livraisons
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
            Suivez toutes vos missions de transport
          </p>
        </motion.div>

        {/* ONGLETS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <motion.button
              key={String(t.value)}
              onClick={() => setTab(t.value)}
              style={{
                padding: '0.45rem 1.1rem', borderRadius: '20px', border: '1.5px solid',
                fontSize: '0.83rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                background:  tab === t.value ? '#d97706' : 'white',
                color:       tab === t.value ? 'white'   : '#374151',
                borderColor: tab === t.value ? '#d97706' : '#e5e7eb',
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
            {[...Array(4)].map((_, i) => <div key={i} style={{ height: '100px', borderRadius: '14px', background: '#f3f4f6' }} />)}
          </div>

        ) : livraisons.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="show"
            style={{ background: 'white', borderRadius: '20px', padding: '3rem', textAlign: 'center', border: '1px solid #e5e7eb' }}
          >
            <Package size={48} color="#e5e7eb" style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.9rem', color: '#9ca3af', margin: 0 }}>Aucune livraison trouvée</p>
          </motion.div>

        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {livraisons.map((d, i) => {
              const cfg  = STATUT_CONFIG[d.status] || STATUT_CONFIG.PENDING;
              const Icon = cfg.icon;
              const montant = Number(d.tarif) || Number(d.cout) || Number(d.montant) || Number(d.fee) || 0;
              const depart  = d.ville_depart  || d.pickup_location   || '—';
              const arrivee = d.ville_arrivee || d.delivery_location  || '—';

              return (
                <motion.div
                  key={d.id || i}
                  variants={fadeUp} initial="hidden" animate="show"
                  transition={{ delay: i * 0.05 }}
                  style={{ background: 'white', borderRadius: '14px', padding: '1.1rem 1.2rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  whileHover={{ y: -2 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.7rem' }}>
                    <div>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#d97706' }}>Mission #{d.id}</span>
                      <span style={{ marginLeft: '10px', fontSize: '0.78rem', color: '#9ca3af' }}>{formatDate(d.delivered_at || d.created_at)}</span>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: cfg.bg, color: cfg.color }}>
                      <Icon size={12} /> {cfg.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#374151', marginBottom: montant > 0 ? '0.6rem' : 0 }}>
                    <MapPin size={13} color="#9ca3af" />
                    <span style={{ fontWeight: '600' }}>{depart}</span>
                    <span style={{ color: '#d97706', fontWeight: '700' }}>→</span>
                    <span style={{ fontWeight: '600' }}>{arrivee}</span>
                  </div>

                  {montant > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#16a34a', fontWeight: '700' }}>
                      <DollarSign size={13} /> {montant.toLocaleString('fr-FR')} FCFA
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
