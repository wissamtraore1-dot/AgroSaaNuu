import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Clock, CheckCircle, XCircle, Navigation,
  Package, CreditCard, Loader, X, Smartphone,
} from 'lucide-react';
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

const RESEAUX = [
  { value: 'MTN',      label: 'MTN Mobile Money',    color: '#FFC107', emoji: '🟡' },
  { value: 'MOOV',     label: 'Moov Money',          color: '#1976D2', emoji: '🔵' },
  { value: 'CELTIS',   label: 'Celtis Money',        color: '#E53935', emoji: '🔴' },
  { value: 'VIREMENT', label: 'Virement Bancaire',   color: '#388E3C', emoji: '🏦' },
];

const TABS = [
  { label: 'Toutes',     value: null },
  { label: 'En attente', value: ORDER_STATUS.PENDING },
  { label: 'En cours',   value: ORDER_STATUS.PREPARING },
  { label: 'Livrées',    value: ORDER_STATUS.DELIVERED },
  { label: 'Annulées',   value: ORDER_STATUS.CANCELLED },
];

const GREEN   = '#1a5c2a';
const fadeUp  = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

export default function BuyerOrders() {
  const navigate = useNavigate();
  const [commandes,  setCommandes]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState(null);

  // Simulation modal state
  const [modalCmd,   setModalCmd]   = useState(null);   // commande sélectionnée pour payer
  const [reseau,     setReseau]     = useState('MTN');
  const [telephone,  setTelephone]  = useState('');
  const [paying,     setPaying]     = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [payError,   setPayError]   = useState('');

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

  const ouvrirModal = (e, commande) => {
    e.stopPropagation();
    setModalCmd(commande);
    setReseau('MTN');
    setTelephone('');
    setPaying(false);
    setPaySuccess(false);
    setPayError('');
  };

  const fermerModal = () => {
    if (paying) return;
    if (paySuccess) { charger(); }
    setModalCmd(null);
    setPaySuccess(false);
    setPayError('');
  };

  const handlePayer = async () => {
    if (!telephone.trim()) { setPayError('Entrez votre numéro de téléphone.'); return; }
    if (telephone.trim().length < 8) { setPayError('Numéro invalide.'); return; }
    setPaying(true);
    setPayError('');
    try {
      await OrderService.simulerPaiement(modalCmd.id, {
        telephone: telephone.trim(),
        reseau,
        montant: modalCmd.montant_total,
      });
      setPaySuccess(true);
    } catch (err) {
      setPayError(err.response?.data?.message || 'Erreur lors du paiement. Réessayez.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <DashboardLayout role="buyer">
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={22} color={GREEN} /><span> Mes commandes</span>
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
                background:  tab === t.value ? GREEN  : 'white',
                color:       tab === t.value ? 'white' : '#374151',
                borderColor: tab === t.value ? GREEN  : '#e5e7eb',
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
              style={{ background: `linear-gradient(135deg, #0d2b14, ${GREEN})`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.8rem 2rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              Parcourir le catalogue
            </motion.button>
          </motion.div>

        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {commandes.map((c, i) => {
              const cfg  = STATUT_CONFIG[c.statut] || STATUT_CONFIG.PAIEMENT_EN_ATTENTE;
              const Icon = cfg.icon;
              const enLivraison      = c.statut === ORDER_STATUS.SHIPPED || c.statut === ORDER_STATUS.IN_DELIVERY;
              const enAttentePaiement = c.statut === 'PAIEMENT_EN_ATTENTE';

              return (
                <motion.div
                  key={c.id || i}
                  variants={fadeUp} initial="hidden" animate="show"
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/buyer/orders/${c.id}`)}
                  style={{ background: 'white', borderRadius: '14px', padding: '1.1rem 1.2rem', border: `1px solid ${enAttentePaiement ? '#fcd34d' : '#e5e7eb'}`, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  whileHover={{ y: -2 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.7rem' }}>
                    <div>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10' }}>
                        Commande #{c.reference || c.id?.toString().slice(0, 8).toUpperCase()}
                      </span>
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
                      {Number(c.montant_total || 0).toLocaleString('fr-FR')} FCFA
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {enLivraison && (
                        <span style={{ fontSize: '0.78rem', color: GREEN, fontWeight: '600' }}>
                          Suivre la livraison →
                        </span>
                      )}
                      {enAttentePaiement && (
                        <motion.button
                          onClick={e => ouvrirModal(e, c)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            background: `linear-gradient(135deg, #d97706, #f59e0b)`,
                            color: 'white', border: 'none', borderRadius: '10px',
                            padding: '6px 14px', fontSize: '0.78rem', fontWeight: '700',
                            cursor: 'pointer', boxShadow: '0 2px 8px rgba(217,119,6,0.35)',
                          }}
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        >
                          <CreditCard size={13} /> Payer
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL SIMULATION PAIEMENT ── */}
      <AnimatePresence>
        {modalCmd && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={fermerModal}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '0 24px 80px rgba(0,0,0,0.22)' }}
            >
              {paySuccess ? (
                /* ── SUCCESS STATE ── */
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    style={{ width: '72px', height: '72px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}
                  >
                    <CheckCircle size={38} color="#16a34a" />
                  </motion.div>
                  <h2 style={{ fontWeight: '900', color: '#1a2e10', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Paiement réussi !</h2>
                  <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                    Votre paiement de <strong>{Number(modalCmd.montant_total || 0).toLocaleString('fr-FR')} FCFA</strong> a été sécurisé en séquestre.
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginBottom: '1.5rem' }}>
                    Les fonds seront libérés au vendeur après confirmation de réception.
                  </p>
                  <motion.button
                    onClick={fermerModal}
                    style={{ background: `linear-gradient(135deg, ${GREEN}, #2d6a4f)`, color: 'white', border: 'none', borderRadius: '14px', padding: '0.85rem 2.5rem', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  >
                    Fermer
                  </motion.button>
                </div>
              ) : (
                /* ── FORM STATE ── */
                <>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
                    <div>
                      <h2 style={{ fontWeight: '900', color: '#1a2e10', margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Smartphone size={18} color={GREEN} /> Simulation de paiement
                      </h2>
                      <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#9ca3af' }}>
                        Commande #{modalCmd.reference || modalCmd.id?.toString().slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <motion.button onClick={fermerModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} whileHover={{ background: '#e5e7eb' }}>
                      <X size={16} color="#6b7280" />
                    </motion.button>
                  </div>

                  {/* Montant */}
                  <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '16px', padding: '1rem 1.2rem', marginBottom: '1.4rem', textAlign: 'center', border: '1.5px solid #fcd34d' }}>
                    <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>Montant à payer</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#92400e' }}>
                      {Number(modalCmd.montant_total || 0).toLocaleString('fr-FR')}
                      <span style={{ fontSize: '1rem', fontWeight: '700', marginLeft: '6px' }}>FCFA</span>
                    </div>
                  </div>

                  {/* Réseau */}
                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontWeight: '700', fontSize: '0.83rem', color: '#374151', marginBottom: '8px' }}>
                      Choisir le réseau
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {RESEAUX.map(r => (
                        <motion.button
                          key={r.value}
                          onClick={() => setReseau(r.value)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 12px', borderRadius: '12px', cursor: 'pointer',
                            border: `2px solid ${reseau === r.value ? r.color : '#e5e7eb'}`,
                            background: reseau === r.value ? `${r.color}18` : 'white',
                            fontWeight: '600', fontSize: '0.8rem', color: reseau === r.value ? r.color : '#374151',
                            transition: 'all 0.15s',
                          }}
                          whileTap={{ scale: 0.96 }}
                        >
                          <span style={{ fontSize: '1.1rem' }}>{r.emoji}</span>
                          <span style={{ lineHeight: 1.2 }}>{r.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontWeight: '700', fontSize: '0.83rem', color: '#374151', marginBottom: '6px' }}>
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: 0022961XXXXXX"
                      value={telephone}
                      onChange={e => { setTelephone(e.target.value); setPayError(''); }}
                      style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${payError ? '#fca5a5' : '#e5e7eb'}`, borderRadius: '12px', fontSize: '0.9rem', color: '#111827', outline: 'none', boxSizing: 'border-box', background: 'white' }}
                    />
                  </div>

                  {payError && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', borderRadius: '10px', padding: '8px 12px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1rem' }}>
                      {payError}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={fermerModal}
                      style={{ flex: 1, padding: '0.85rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      Annuler
                    </button>
                    <motion.button
                      onClick={handlePayer}
                      disabled={paying}
                      style={{
                        flex: 2, padding: '0.85rem', background: paying ? '#9ca3af' : 'linear-gradient(135deg, #d97706, #f59e0b)',
                        color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700',
                        cursor: paying ? 'not-allowed' : 'pointer', fontSize: '0.9rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      }}
                      whileHover={!paying ? { scale: 1.02 } : {}}
                      whileTap={!paying ? { scale: 0.97 } : {}}
                    >
                      {paying
                        ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Traitement…</>
                        : <><CreditCard size={15} /> Confirmer le paiement</>
                      }
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
