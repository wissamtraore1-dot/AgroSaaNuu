// ============================================================
// AgroConnect — Seller Order Detail Page
// src/pages/seller/OrderDetail.jsx
// ============================================================
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EscrowBanner from '../../components/finance/EscrowBanner';
import Badge from '../../components/ui/Badge';
import { formatPrice, formatDate } from '../../utils/formatPrice';
import {
  ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS,
  ESCROW_STATUS, ROUTES,
} from '../../utils/constants';
import OrderService from '../../services/order.service';
import { useNotificationContext } from '../../context/NotificationContext';

const SELLER_ACTIONS = [
  { from: ORDER_STATUS.PAID,      to: ORDER_STATUS.PREPARING,   label: '📦 Start Preparing',  color: '#4F46E5' },
  { from: ORDER_STATUS.PREPARING, to: ORDER_STATUS.SHIPPED,     label: '🚚 Mark as Shipped',  color: '#0066B3' },
  { from: ORDER_STATUS.SHIPPED,   to: ORDER_STATUS.IN_DELIVERY, label: '📍 Out for Delivery', color: '#D97706' },
];

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
      const data = await OrderService.getOrder(id);
      setOrder(data);
    } catch {
      notifyError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await OrderService.updateStatus(id, newStatus);
      success(`Order marked as "${ORDER_STATUS_LABELS[newStatus]}"`);
      await loadOrder();
    } catch {
      notifyError('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const nextAction = SELLER_ACTIONS.find(a => a.from === order?.status);

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
      Loading order...
    </div>
  );

  if (!order) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
      Order not found
    </div>
  );

  return (
    <div style={styles.wrap}>
      <button style={styles.backBtn} onClick={() => navigate(ROUTES.SELLER_ORDERS)}>
        ← My Orders
      </button>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h5 style={styles.title}>Order #{order.id}</h5>
          <div style={styles.subtitle}>{formatDate(order.created_at)}</div>
        </div>
        <Badge variant={ORDER_STATUS_COLORS[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      {/* Escrow banner */}
      <div style={{ marginBottom: '16px' }}>
        <EscrowBanner
          status={order.escrow_status}
          amount={order.total}
          autoReleaseIn={72}
        />
      </div>

      {/* Seller action */}
      {nextAction && order.escrow_status === ESCROW_STATUS.HELD && (
        <button
          style={{
            ...styles.actionBtn,
            background: nextAction.color,
            opacity:    updating ? 0.7 : 1,
            cursor:     updating ? 'not-allowed' : 'pointer',
          }}
          onClick={() => handleUpdateStatus(nextAction.to)}
          disabled={updating}
        >
          {updating ? 'Updating...' : nextAction.label}
        </button>
      )}

      {/* Payment released notice */}
      {order.escrow_status === ESCROW_STATUS.RELEASED && (
        <div style={styles.releasedCard}>
          ✅ Payment of {formatPrice(order.total)} has been released to your wallet.
        </div>
      )}

      <div style={styles.layout}>
        {/* Items */}
        <div style={styles.mainCol}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              Items ({order.items?.length})
            </div>
            {order.items?.map((item, i) => (
              <div key={i} style={styles.itemRow}>
                <img
                  src={item.image || '/assets/images/placeholder.png'}
                  alt={item.name}
                  style={styles.itemImg}
                />
                <div style={{ flex: 1 }}>
                  <div style={styles.itemName}>{item.name}</div>
                  <div style={styles.itemMeta}>
                    Qty: {item.qty} × {formatPrice(item.price)}
                  </div>
                </div>
                <div style={styles.itemTotal}>
                  {formatPrice(item.price * item.qty)}
                </div>
              </div>
            ))}

            {/* Totals */}
            <div style={styles.totalsSection}>
              <div style={styles.totalRow}>
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal || order.total)}</span>
              </div>
              {order.discount > 0 && (
                <div style={styles.totalRow}>
                  <span style={{ color: '#16A34A' }}>Points discount</span>
                  <span style={{ color: '#16A34A' }}>−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div style={{ ...styles.totalRow, fontWeight: 700, fontSize: '15px' }}>
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buyer info + timeline */}
        <div style={styles.sideCol}>

          {/* Buyer */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Buyer</div>
            <div style={styles.buyerRow}>
              <div style={styles.buyerAvatar}>
                {order.buyer?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div style={styles.buyerName}>{order.buyer?.name || 'Unknown'}</div>
                <div style={styles.buyerPhone}>{order.buyer?.phone || '—'}</div>
              </div>
            </div>
          </div>

          {/* Delivery address */}
          {order.delivery_address && (
            <div style={{ ...styles.card, marginTop: '12px' }}>
              <div style={styles.cardTitle}>Delivery Address</div>
              <div style={styles.addressText}>
                📍 {order.delivery_address}
              </div>
            </div>
          )}

          {/* Status timeline */}
          <div style={{ ...styles.card, marginTop: '12px' }}>
            <div style={styles.cardTitle}>Status History</div>
            {order.timeline?.map((event, i) => (
              <div key={i} style={styles.timelineRow}>
                <div style={styles.timelineDot} />
                <div>
                  <div style={styles.timelineLabel}>
                    {ORDER_STATUS_LABELS[event.status] || event.status}
                  </div>
                  <div style={styles.timelineDate}>
                    {formatDate(event.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrap:     { padding: '24px 16px', maxWidth: '900px', margin: '0 auto' },
  backBtn:  { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6B7280', marginBottom: '8px', padding: 0 },
  header:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' },
  title:    { fontSize: '20px', fontWeight: 700, color: '#1F2937', margin: '0 0 4px' },
  subtitle: { fontSize: '13px', color: '#6B7280' },
  actionBtn: {
    width: '100%', padding: '14px', color: '#fff',
    border: 'none', borderRadius: '12px',
    fontWeight: 700, fontSize: '15px', marginBottom: '16px',
  },
  releasedCard: {
    background: '#EAF3DE', border: '1.5px solid #86EFAC',
    borderRadius: '12px', padding: '14px 16px',
    fontSize: '14px', color: '#15803D', fontWeight: 500,
    marginBottom: '16px',
  },
  layout:   { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  mainCol:  { flex: 2, minWidth: '280px' },
  sideCol:  { flex: 1, minWidth: '220px' },
  card:     { background: '#fff', borderRadius: '16px', padding: '18px', border: '1.5px solid #E5E7EB' },
  cardTitle:{ fontSize: '14px', fontWeight: 700, color: '#1F2937', marginBottom: '14px' },
  itemRow:  { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #F3F4F6' },
  itemImg:  { width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 },
  itemName: { fontSize: '14px', fontWeight: 500, color: '#1F2937' },
  itemMeta: { fontSize: '12px', color: '#6B7280', marginTop: '2px' },
  itemTotal:{ fontSize: '14px', fontWeight: 600, color: '#1F2937', flexShrink: 0 },
  totalsSection: { paddingTop: '12px' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#374151', marginBottom: '8px' },
  buyerRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  buyerAvatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: '#16A34A', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '16px', flexShrink: 0,
  },
  buyerName:  { fontSize: '14px', fontWeight: 600, color: '#1F2937' },
  buyerPhone: { fontSize: '12px', color: '#6B7280', marginTop: '2px' },
  addressText:{ fontSize: '13px', color: '#374151', lineHeight: 1.6 },
  timelineRow:{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' },
  timelineDot:{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A', marginTop: '5px', flexShrink: 0 },
  timelineLabel:{ fontSize: '13px', fontWeight: 500, color: '#1F2937' },
  timelineDate: { fontSize: '11px', color: '#9CA3AF', marginTop: '2px' },
};

export default SellerOrderDetail;