import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Clock, CheckCircle, XCircle, Navigation, Package } from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import OrderService from '../../services/order.service';
import { ORDER_STATUS } from '../../utils/constants';

const STATUT_CONFIG = {
  PAIEMENT_EN_ATTENTE: { label: 'Paiement en attente', bg: '#fef3c7', color: '#d97706', icon: Clock       },
  PAIEMENT_RECU:       { label: 'Paiement sécurisé',   bg: '#dbeafe', color: '#2563eb', icon: CheckCircle },
  EN_PREPARATION:      { label: 'En préparation',       bg: '#ede9fe', color: '#7c3aed', icon: Package     },
  EN_LIVRAISON:        { label: 'En livraison',         bg: '#dbeafe', color: '#2563eb', icon: Navigation  },
  LIVREE:              { label: 'Livrée',               bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  CONFIRMEE_RECEPTION: { label: 'Réception confirmée',  bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  PAIEMENT_LIBERE:     { label: 'Clôturée',             bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  ANNULEE:             { label: 'Annulée',              bg: '#fee2e2', color: '#dc2626', icon: XCircle     },
  LITIGE:              { label: 'En litige',            bg: '#fee2e2', color: '#dc2626', icon: XCircle     },
};

const TABS = [
  { label: 'Toutes',          value: null },
  { label: 'En attente',      value: ORDER_STATUS.PENDING },
  { label: 'En cours',        value: ORDER_STATUS.PREPARING },
  { label: 'Livrées',         value: ORDER_STATUS.DELIVERED },
  { label: 'Annulées',        value: ORDER_STATUS.CANCELLED },
];

const BLEU    = '#1a5c2a';
const fadeUp  = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

export default function BuyerOrders() {
  const navigate = useNavigate();
  const [commandes, setCommandes] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState(null);

  useEffect(() => { charger(); }, [tab]);

  const charger = async () => {
    try {
      setLoading(true);
      const data = await OrderService.getBuyerOrders({ status: tab });
      setCommandes(data.results || data || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="buyer">
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={22} color={BLEU} /><span> Mes commandes</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
            Suivez l'état de toutes vos commandes
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
                background:  tab === t.value ? BLEU   : 'white',
                color:       tab === t.value ? 'white' : '#374151',
                borderColor: tab === t.value ? BLEU   : '#e5e7eb',
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

        ) : commandes.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="show"
            style={{ background: 'white', borderRadius: '20px', padding: '3rem', textAlign: 'center', border: '1px solid #e5e7eb' }}
          >
            <ShoppingCart size={48} color="#e5e7eb" style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.9rem', color: '#9ca3af', margin: '0 0 1.2rem' }}>Aucune commande trouvée</p>
            <motion.button
              onClick={() => navigate('/buyer/catalog')}
              style={{ background: `linear-gradient(135deg, #0d2b14, ${BLEU})`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.8rem 2rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              Parcourir le catalogue
            </motion.button>
          </motion.div>

        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {commandes.map((c, i) => {
              const cfg  = STATUT_CONFIG[c.status] || STATUT_CONFIG.PAIEMENT_EN_ATTENTE;
              const Icon = cfg.icon;
              const enLivraison = c.status === ORDER_STATUS.SHIPPED || c.status === ORDER_STATUS.IN_DELIVERY;

              return (
                <motion.div
                  key={c.id || i}
                  variants={fadeUp} initial="hidden" animate="show"
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/buyer/orders/${c.id}`)}
                  style={{ background: 'white', borderRadius: '14px', padding: '1.1rem 1.2rem', border: '1px solid #e5e7eb', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  whileHover={{ y: -2 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.7rem' }}>
                    <div>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10' }}>Commande #{c.id}</span>
                      <span style={{ marginLeft: '10px', fontSize: '0.78rem', color: '#9ca3af' }}>{formatDate(c.created_at)}</span>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: cfg.bg, color: cfg.color }}>
                      <Icon size={12} /><span> {cfg.label}</span>
                    </span>
                  </div>

                  {c.items?.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
                      {c.items.slice(0, 2).map((item, j) => (
                        <span key={j} style={{ background: '#f3f4f6', borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', color: '#374151' }}>
                          {item.nom || item.name}
                        </span>
                      ))}
                      {c.items.length > 2 && (
                        <span style={{ background: '#f3f4f6', borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', color: '#6b7280' }}>
                          +{c.items.length - 2} de plus
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1a5c2a' }}>
                      {Number(c.total || 0).toLocaleString('fr-FR')} FCFA
                    </span>
                    {enLivraison && (
                      <span style={{ fontSize: '0.78rem', color: BLEU, fontWeight: '600' }}>
                        Suivre la livraison →
                      </span>
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
