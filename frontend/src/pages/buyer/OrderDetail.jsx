// ============================================================
// AgroConnect — Buyer Order Detail
// src/pages/buyer/OrderDetail.jsx
// ============================================================
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import EscrowBanner from '../../components/finance/EscrowBanner';
import { formatPrice, formatDate } from '../../utils/formatPrice';
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ROUTES } from '../../utils/constants';
import OrderService from '../../services/order.service';

const BuyerOrderDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrderService.getOrder(id)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Loading...</div>;
  if (!order)  return <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Order not found</div>;

  return (
    <div style={styles.wrap}>
      <button style={styles.backBtn} onClick={() => navigate(ROUTES.BUYER_ORDERS)}>← My Orders</button>

      <div style={styles.header}>
        <div>
          <h5 style={styles.title}>Order #{order.id}</h5>
          <div style={styles.date}>{formatDate(order.created_at)}</div>
        </div>
        <Badge variant={ORDER_STATUS_COLORS[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      {/* Escrow banner */}
      <div style={{ marginBottom: '16px' }}>
        <EscrowBanner status={order.escrow_status} amount={order.total} autoReleaseIn={72} />
      </div>

      {/* Items */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Items ({order.items?.length})</div>
        {order.items?.map((item, i) => (
          <div key={i} style={styles.itemRow}>
            <img src={item.image || '/assets/images/placeholder.png'} alt={item.name} style={styles.itemImg} />
            <div style={{ flex: 1 }}>
              <div style={styles.itemName}>{item.name}</div>
              <div style={styles.itemMeta}>Qty: {item.qty} × {formatPrice(item.price)}</div>
            </div>
            <div style={styles.itemTotal}>{formatPrice(item.price * item.qty)}</div>
          </div>
        ))}
        <div style={styles.totalRow}>
          <span style={{ fontWeight: 700 }}>Total</span>
          <span style={{ fontWeight: 700, color: '#16A34A' }}>{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Track button */}
      {[ORDER_STATUS.SHIPPED, ORDER_STATUS.IN_DELIVERY, ORDER_STATUS.PAID, ORDER_STATUS.PREPARING].includes(order.status) && (
        <button style={styles.trackBtn} onClick={() => navigate(`/buyer/orders/${id}/tracking`)}>
          📍 Track my order
        </button>
      )}
    </div>
  );
};

const styles = {
  wrap:      { padding: '24px 16px', maxWidth: '700px', margin: '0 auto' },
  backBtn:   { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6B7280', marginBottom: '8px', padding: 0 },
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' },
  title:     { fontSize: '20px', fontWeight: 700, color: '#1F2937', margin: '0 0 4px' },
  date:      { fontSize: '13px', color: '#6B7280' },
  card:      { background: '#fff', borderRadius: '16px', padding: '18px', border: '1.5px solid #E5E7EB', marginBottom: '14px' },
  cardTitle: { fontSize: '14px', fontWeight: 700, color: '#1F2937', marginBottom: '14px' },
  itemRow:   { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #F3F4F6' },
  itemImg:   { width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' },
  itemName:  { fontSize: '14px', fontWeight: 500, color: '#1F2937' },
  itemMeta:  { fontSize: '12px', color: '#6B7280', marginTop: '2px' },
  itemTotal: { fontSize: '14px', fontWeight: 600 },
  totalRow:  { display: 'flex', justifyContent: 'space-between', fontSize: '15px', paddingTop: '12px' },
  trackBtn:  { width: '100%', padding: '13px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' },
};

export default BuyerOrderDetail;