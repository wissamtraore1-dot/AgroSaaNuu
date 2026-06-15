import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Clock, CheckCircle, XCircle, Package, Loader, Navigation,
  Lock, User, Truck, ClipboardCheck, ChevronRight,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import OrderService from '../../services/order.service';
import { ORDER_STATUS } from '../../utils/constants';

const GREEN  = '#1a5c2a';
const fadeUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

const STATUT_CONFIG = {
  PAIEMENT_EN_ATTENTE: { label: 'En attente de paiement', bg: '#fef3c7', color: '#d97706', icon: Clock         },
  PAIEMENT_RECU:       { label: 'Paiement reçu',          bg: '#dbeafe', color: '#2563eb', icon: Lock          },
  EN_PREPARATION:      { label: 'En préparation',          bg: '#ede9fe', color: '#7c3aed', icon: Package       },
  EN_LIVRAISON:        { label: 'En livraison',            bg: '#dbeafe', color: '#2563eb', icon: Navigation    },
  LIVREE:              { label: 'Livrée',                  bg: '#dcfce7', color: '#16a34a', icon: CheckCircle   },
  CONFIRMEE_RECEPTION: { label: 'Réception confirmée',     bg: '#dcfce7', color: '#16a34a', icon: CheckCircle   },
  PAIEMENT_LIBERE:     { label: 'Clôturée — payé',         bg: '#dcfce7', color: '#16a34a', icon: CheckCircle   },
  ANNULEE:             { label: 'Annulée',                 bg: '#fee2e2', color: '#dc2626', icon: XCircle       },
  LITIGE:              { label: 'En litige',               bg: '#fee2e2', color: '#dc2626', icon: XCircle       },
};

const TABS = [
  { label: 'Toutes',          value: null },
  { label: 'Nouvelles',       value: ORDER_STATUS.PAID },
  { label: 'En préparation',  value: ORDER_STATUS.PREPARING },
  { label: 'En livraison',    value: ORDER_STATUS.SHIPPED },
  { label: 'Livrées',         value: ORDER_STATUS.DELIVERED },
];

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

/* Détermine l'action prioritaire à afficher pour une commande */
function getAction(c) {
  if (c.statut === 'PAIEMENT_RECU') {
    if (!c.confirme_reception_vendeur)
      return { key: 'reception',    label: 'Confirmer la réception',   icon: ClipboardCheck, color: '#2563eb', bg: '#eff6ff' };
    if (!c.confirme_preparation_vendeur)
      return { key: 'preparation',  label: 'Confirmer la préparation', icon: Package,        color: '#7c3aed', bg: '#f5f3ff' };
  }
  if (c.statut === 'EN_PREPARATION' && c.confirme_preparation_vendeur && !c.confirme_vendeur)
    return { key: 'livraison',      label: 'Remettre au transporteur', icon: Truck,          color: GREEN,     bg: '#f0fdf4' };
  return null;
}

export default function SellerOrders() {
  const navigate = useNavigate();
  const [commandes, setCommandes] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState(null);
  const [actioning, setActioning] = useState({}); // id → bool

  useEffect(() => { charger(); }, [tab]);

  const charger = async () => {
    try {
      setLoading(true);
      const data = await OrderService.getSellerOrders({ status: tab });
      setCommandes(data.results || data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (e, commande, action) => {
    e.stopPropagation();
    setActioning(prev => ({ ...prev, [commande.id]: true }));
    try {
      if (action.key === 'reception')   await OrderService.confirmer(commande.id);
      if (action.key === 'preparation') await OrderService.confirmerPreparation(commande.id);
      if (action.key === 'livraison')   await OrderService.enLivraison(commande.id);
      await charger();
    } catch {
      // silencieux — on recharge de toute façon
    } finally {
      setActioning(prev => ({ ...prev, [commande.id]: false }));
    }
  };

  return (
    <DashboardLayout role="seller">
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={22} color={GREEN} /> Commandes reçues
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
            Gérez les commandes de vos acheteurs
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
                background:  tab === t.value ? GREEN   : 'white',
                color:       tab === t.value ? 'white' : '#374151',
                borderColor: tab === t.value ? GREEN   : '#e5e7eb',
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
            <ShoppingBag size={48} color="#e5e7eb" style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.9rem', color: '#9ca3af', margin: 0 }}>Aucune commande trouvée</p>
          </motion.div>

        ) : (
          <AnimatePresence>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {commandes.map((c, i) => {
                const cfg    = STATUT_CONFIG[c.statut] || STATUT_CONFIG.PAIEMENT_EN_ATTENTE;
                const Icon   = cfg.icon;
                const action = getAction(c);
                const busy   = !!actioning[c.id];

                return (
                  <motion.div
                    key={c.id || i}
                    variants={fadeUp} initial="hidden" animate="show"
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/seller/orders/${c.id}`)}
                    style={{
                      background: 'white', borderRadius: '14px',
                      border: `1.5px solid ${action ? '#bfdbfe' : '#e5e7eb'}`,
                      cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      overflow: 'hidden',
                    }}
                    whileHover={{ y: -2 }}
                  >
                    {/* ── En-tête ── */}
                    <div style={{ padding: '1rem 1.2rem 0.7rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1a2e10' }}>
                            {c.reference || `#${String(c.id || '').slice(0, 8).toUpperCase()}`}
                          </span>
                          <span style={{ marginLeft: '10px', fontSize: '0.78rem', color: '#9ca3af' }}>
                            {formatDate(c.created_at)}
                          </span>
                        </div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.73rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
                          <Icon size={11} /> {cfg.label}
                        </span>
                      </div>

                      {/* Acheteur + produit */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <User size={12} color="#9ca3af" />
                        <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: '600' }}>
                          {c.acheteur_nom || '—'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Package size={12} color="#9ca3af" />
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {c.produit_nom || 'Produit'}{c.quantite > 1 ? ` × ${Number(c.quantite)}` : ''}
                        </span>
                      </div>

                      {/* Montant */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem' }}>
                        <span style={{ fontWeight: '800', fontSize: '0.95rem', color: GREEN }}>
                          {Number(c.montant_total || 0).toLocaleString('fr-FR')} FCFA
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          Voir détail <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>

                    {/* ── Bouton d'action workflow (si applicable) ── */}
                    {action && (
                      <div
                        onClick={e => handleAction(e, c, action)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          padding: '0.65rem 1.2rem',
                          background: action.bg,
                          borderTop: `1px solid ${action.color}22`,
                          cursor: busy ? 'not-allowed' : 'pointer',
                          opacity: busy ? 0.7 : 1,
                          transition: 'opacity 0.15s',
                        }}
                      >
                        {busy
                          ? <Loader size={14} color={action.color} style={{ animation: 'spin 1s linear infinite' }} />
                          : <action.icon size={14} color={action.color} />
                        }
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: action.color }}>
                          {busy ? 'Traitement…' : action.label}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
