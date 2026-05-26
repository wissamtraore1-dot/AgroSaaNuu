// ============================================================
// AgroConnect — Buyer Orders
// src/pages/buyer/Orders.jsx
// ============================================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { formatPrice, formatDate } from '../../utils/formatPrice';
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants';
import OrderService from '../../services/order.service';

const TABS = [
  { label: 'All',         value: null },
  { label: 'Pending',     value: ORDER_STATUS.PENDING },
  { label: 'In Progress', value: ORDER_STATUS.PREPARING },
  { label: 'Delivered',   value: ORDER_STATUS.DELIVERED },
  { label: 'Cancelled',   value: ORDER_STATUS.CANCELLED },
];

const BuyerOrders = () => {
  const navigate     = useNavigate();
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState(null);

  useEffect(() => { loadOrders(); }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await OrderService.getBuyerOrders({ status: activeTab });
      setOrders(data.results || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <h5 style={styles.title}>My Orders</h5>

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={String(tab.value)}
            style={{
              ...styles.tab,
              background: activeTab === tab.value ? '#16A34A' : '#F3F4F6',
              color:      activeTab === tab.value ? '#fff'     : '#374151',
            }}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        [...Array(4)].map((_, i) => <div key={i} style={styles.skeleton} />)
      ) : orders.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '40px' }}>📦</div>
          <div style={styles.emptyText}>No orders yet</div>
          <button style={styles.shopBtn} onClick={() => navigate('/buyer/catalog')}>
            Start Shopping
          </button>
        </div>
      ) : (
        orders.map(order => (
          <div
            key={order.id}
            style={styles.orderCard}
            onClick={() => navigate(`/buyer/orders/${order.id}`)}
          >
            <div style={styles.orderHeader}>
              <div>
                <div style={styles.orderId}>Order #{order.id}</div>
                <div style={styles.orderDate}>{formatDate(order.created_at)}</div>
              </div>
              <Badge variant={ORDER_STATUS_COLORS[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>

            <div style={styles.orderItems}>
              {order.items?.slice(0, 2).map((item, i) => (
                <span key={i} style={styles.itemChip}>{item.name}</span>
              ))}
              {order.items?.length > 2 && (
                <span style={styles.itemChip}>+{order.items.length - 2} more</span>
              )}
            </div>

            <div style={styles.orderFooter}>
              <span style={styles.orderTotal}>{formatPrice(order.total)}</span>
              {(order.status === ORDER_STATUS.SHIPPED ||
                order.status === ORDER_STATUS.IN_DELIVERY) && (
                <span style={styles.trackLink}>Track order →</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  wrap:       { padding: '24px 16px', maxWidth: '760px', margin: '0 auto' },
  title:      { fontSize: '22px', fontWeight: 700, color: '#1F2937', marginBottom: '16px' },
  tabs:       { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' },
  tab:        { border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all .2s' },
  orderCard:  { background: '#fff', borderRadius: '14px', padding: '16px', border: '1.5px solid #E5E7EB', marginBottom: '12px', cursor: 'pointer', transition: 'box-shadow .2s' },
  orderHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  orderId:    { fontSize: '14px', fontWeight: 700, color: '#1F2937' },
  orderDate:  { fontSize: '12px', color: '#6B7280', marginTop: '2px' },
  orderItems: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' },
  itemChip:   { background: '#F3F4F6', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', color: '#374151' },
  orderFooter:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: '15px', fontWeight: 700, color: '#16A34A' },
  trackLink:  { fontSize: '13px', color: '#16A34A', fontWeight: 500 },
  skeleton:   { background: '#E5E7EB', borderRadius: '14px', height: '100px', marginBottom: '12px' },
  empty:      { textAlign: 'center', padding: '60px 0' },
  emptyText:  { fontSize: '15px', color: '#6B7280', margin: '12px 0 20px' },
  shopBtn:    { padding: '12px 28px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '15px', cursor: 'pointer' },
};

export default BuyerOrders;