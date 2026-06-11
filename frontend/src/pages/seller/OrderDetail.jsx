import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Package, Truck, CheckCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatPrice';
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ROUTES } from '../../utils/constants';
import OrderService from '../../services/order.service';
import { useNotificationContext } from '../../context/NotificationContext';
import Badge from '../../components/ui/Badge';

const STATUS_STEPS = [
  { key: ORDER_STATUS.PENDING,  label: 'En attente de paiement' },
  { key: ORDER_STATUS.PAID,     label: 'Paiement reçu' },
  { key: ORDER_STATUS.PREPARING,label: 'En préparation' },
  { key: ORDER_STATUS.SHIPPED,  label: 'En livraison' },
  { key: ORDER_STATUS.RECEIVED, label: 'Réception confirmée' },
  { key: ORDER_STATUS.RELEASED, label: 'Paiement libéré' },
];

const STEP_ORDER = STATUS_STEPS.map(s => s.key);

const fmt = (n) => new Intl.NumberFormat('fr-BJ').format(Number(n)) + ' FCFA';

const SellerOrderDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotificationContext();

  const [order,    setOrder]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { loadOrder(); }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await OrderService.detail(id);
      setOrder(data.commande || data);
    } catch {
      notifyError('Impossible de charger la commande');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmer = async () => {
    try {
      setUpdating(true);
      await OrderService.confirmer(id);
      success('Commande confirmée — en préparation');
      await loadOrder();
    } catch {
      notifyError('Erreur lors de la confirmation');
    } finally {
      setUpdating(false);
    }
  };

  const handleEnLivraison = async () => {
    try {
      setUpdating(true);
      await OrderService.enLivraison(id);
      success('Commande marquée en livraison');
      await loadOrder();
    } catch {
      notifyError('Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
      Chargement…
    </div>
  );

  if (!order) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
      Commande introuvable
    </div>
  );

  const statut     = order.statut;
  const stepIndex  = STEP_ORDER.indexOf(statut);
  const canConfirm = statut === ORDER_STATUS.PAID;
  const canShip    = statut === ORDER_STATUS.PREPARING;

  return (
    <div style={s.wrap}>
      <button style={s.backBtn} onClick={() => navigate(ROUTES.SELLER_ORDERS)}>
        ← Mes commandes
      </button>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Commande #{order.reference}</h2>
          <div style={s.subtitle}>{formatDate(order.created_at)}</div>
        </div>
        <Badge variant={ORDER_STATUS_COLORS[statut] || 'secondary'}>
          {ORDER_STATUS_LABELS[statut] || statut}
        </Badge>
      </div>

      {/* Progress bar */}
      {!['ANNULEE', 'LITIGE'].includes(statut) && (
        <div style={s.progress}>
          {STATUS_STEPS.map((step, i) => (
            <React.Fragment key={step.key}>
              <div style={s.step}>
                <div style={{
                  ...s.dot,
                  background: i <= stepIndex ? '#16A34A' : '#E5E7EB',
                  border:     i === stepIndex ? '3px solid #16A34A' : '2px solid transparent',
                  boxShadow:  i === stepIndex ? '0 0 0 3px rgba(22,163,74,0.2)' : 'none',
                }} />
                <div style={{ ...s.stepLabel, color: i <= stepIndex ? '#16A34A' : '#9CA3AF' }}>
                  {step.label}
                </div>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div style={{
                  ...s.connector,
                  background: i < stepIndex ? '#16A34A' : '#E5E7EB',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {canConfirm && (
        <button
          style={{ ...s.actionBtn, background: '#4F46E5', opacity: updating ? 0.7 : 1 }}
          onClick={handleConfirmer}
          disabled={updating}
        >
          <Package size={18} />
          {updating ? 'Traitement…' : 'Confirmer et préparer'}
        </button>
      )}
      {canShip && (
        <button
          style={{ ...s.actionBtn, background: '#0066B3', opacity: updating ? 0.7 : 1 }}
          onClick={handleEnLivraison}
          disabled={updating}
        >
          <Truck size={18} />
          {updating ? 'Traitement…' : 'Marquer en livraison'}
        </button>
      )}
      {statut === ORDER_STATUS.RELEASED && (
        <div style={s.releasedCard}>
          <CheckCircle size={18} />
          Paiement de {fmt(order.montant_vendeur)} libéré dans votre portefeuille.
        </div>
      )}

      <div style={s.layout}>
        {/* Left column */}
        <div style={s.mainCol}>

          {/* Product card */}
          <div style={s.card}>
            <div style={s.cardTitle}>Produit commandé</div>
            <div style={s.productRow}>
              {order.produit_image && (
                <img src={order.produit_image} alt={order.produit_nom} style={s.productImg} />
              )}
              <div style={{ flex: 1 }}>
                <div style={s.productName}>{order.produit_nom || '—'}</div>
                <div style={s.productMeta}>
                  {order.quantite} kg × {fmt(order.prix_unitaire)}
                </div>
              </div>
              <div style={s.productTotal}>{fmt(order.montant_produit)}</div>
            </div>

            {/* Totaux */}
            <div style={s.totals}>
              <div style={s.totalRow}>
                <span>Sous-total produit</span>
                <span>{fmt(order.montant_produit)}</span>
              </div>
              <div style={s.totalRow}>
                <span>Frais de livraison</span>
                <span>{fmt(order.frais_livraison)}</span>
              </div>
              <div style={s.totalRow}>
                <span>Frais de paiement</span>
                <span>{fmt(order.frais_paiement)}</span>
              </div>
              <div style={{ ...s.totalRow, fontWeight: 700, fontSize: '15px', borderTop: '1px solid #E5E7EB', paddingTop: '8px', marginTop: '4px' }}>
                <span>Total commande</span>
                <span>{fmt(order.montant_total)}</span>
              </div>
              <div style={{ ...s.totalRow, color: '#16A34A', fontWeight: 600 }}>
                <span>Votre gain net</span>
                <span>{fmt(order.montant_vendeur)}</span>
              </div>
            </div>
          </div>

          {/* Note acheteur */}
          {order.note_acheteur && (
            <div style={{ ...s.card, marginTop: '12px' }}>
              <div style={s.cardTitle}>Note de l'acheteur</div>
              <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: 1.6 }}>
                "{order.note_acheteur}"
              </p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={s.sideCol}>

          {/* DELIVERY ADDRESS — prominent */}
          <div style={s.deliveryCard}>
            <div style={s.deliveryTitle}>
              <MapPin size={18} color="#16A34A" />
              Adresse de livraison
            </div>
            <p style={s.deliveryAddress}>{order.adresse_livraison || '—'}</p>
            {order.telephone_livraison && (
              <a
                href={`tel:${order.telephone_livraison}`}
                style={s.deliveryPhone}
              >
                <Phone size={14} />
                {order.telephone_livraison}
              </a>
            )}
          </div>

          {/* Acheteur */}
          <div style={{ ...s.card, marginTop: '12px' }}>
            <div style={s.cardTitle}>Acheteur</div>
            <div style={s.buyerRow}>
              <div style={s.buyerAvatar}>
                {order.acheteur_nom?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
                {order.acheteur_nom || '—'}
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div style={{ ...s.card, marginTop: '12px' }}>
            <div style={s.cardTitle}>Paiement</div>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>Mode :</strong> {order.mode_paiement}
              </div>
              <div>
                <strong>Référence :</strong> {order.reference}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const s = {
  wrap:       { padding: '24px 16px', maxWidth: '960px', margin: '0 auto' },
  backBtn:    { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6B7280', marginBottom: '12px', padding: 0 },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  title:      { fontSize: '22px', fontWeight: 700, color: '#1F2937', margin: '0 0 4px' },
  subtitle:   { fontSize: '13px', color: '#6B7280' },

  progress:   { display: 'flex', alignItems: 'center', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' },
  step:       { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 },
  dot:        { width: '18px', height: '18px', borderRadius: '50%', transition: 'all 0.2s' },
  stepLabel:  { fontSize: '11px', textAlign: 'center', maxWidth: '80px', lineHeight: 1.3, fontWeight: 500 },
  connector:  { flex: 1, height: '2px', minWidth: '24px', marginBottom: '20px', transition: 'background 0.2s' },

  actionBtn:  { width: '100%', padding: '14px', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px', marginBottom: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  releasedCard:{ background: '#EAF3DE', border: '1.5px solid #86EFAC', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', color: '#15803D', fontWeight: 500, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },

  layout:     { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  mainCol:    { flex: 2, minWidth: '280px' },
  sideCol:    { flex: 1, minWidth: '240px' },

  card:       { background: '#fff', borderRadius: '16px', padding: '18px', border: '1.5px solid #E5E7EB' },
  cardTitle:  { fontSize: '14px', fontWeight: 700, color: '#1F2937', marginBottom: '14px' },

  productRow:   { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  productImg:   { width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 },
  productName:  { fontSize: '15px', fontWeight: 600, color: '#1F2937' },
  productMeta:  { fontSize: '13px', color: '#6B7280', marginTop: '4px' },
  productTotal: { fontSize: '15px', fontWeight: 700, color: '#1F2937', flexShrink: 0 },

  totals:     { borderTop: '1px solid #F3F4F6', paddingTop: '12px' },
  totalRow:   { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#374151', marginBottom: '8px' },

  deliveryCard: {
    background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
    border: '2px solid #86EFAC',
    borderRadius: '16px',
    padding: '18px',
  },
  deliveryTitle: {
    fontSize: '14px', fontWeight: 700, color: '#15803D',
    marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px',
  },
  deliveryAddress: {
    fontSize: '15px', color: '#1F2937', margin: '0 0 10px',
    lineHeight: 1.6, fontWeight: 500,
  },
  deliveryPhone: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: '#16A34A', color: '#fff',
    padding: '8px 14px', borderRadius: '50px',
    fontSize: '13px', fontWeight: 600,
    textDecoration: 'none',
  },

  buyerRow:   { display: 'flex', alignItems: 'center', gap: '12px' },
  buyerAvatar:{ width: '40px', height: '40px', borderRadius: '50%', background: '#16A34A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', flexShrink: 0 },
};

export default SellerOrderDetail;
