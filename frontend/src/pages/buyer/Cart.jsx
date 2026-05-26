// ============================================================
// AgroConnect — Cart Page
// src/pages/buyer/Cart.jsx
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatPoints } from '../../utils/formatPrice';
import { ROUTES, LOYALTY } from '../../utils/constants';
import useLoyalty from '../../hooks/useLoyalty';

const Cart = ({ cartItems = [], onUpdateQty, onRemove }) => {
  const navigate = useNavigate();
  const { points, maxPointsForOrder } = useLoyalty();

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const { maxPoints, maxDiscountFcfa } = maxPointsForOrder(subtotal);
  const [usePoints, setUsePoints] = React.useState(false);
  const discount  = usePoints ? maxDiscountFcfa : 0;
  const total     = subtotal - discount;

  if (cartItems.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={{ fontSize: '52px' }}>🛒</div>
        <h5 style={styles.emptyTitle}>Your cart is empty</h5>
        <p style={styles.emptyText}>Add products to start your order</p>
        <button style={styles.shopBtn} onClick={() => navigate(ROUTES.PRODUCTS)}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <h5 style={styles.title}>My Cart ({cartItems.length})</h5>

      <div style={styles.layout}>
        {/* ── Items ── */}
        <div style={styles.itemsCol}>
          {cartItems.map(item => (
            <div key={item.id} style={styles.itemCard}>
              <img
                src={item.image || '/assets/images/placeholder.png'}
                alt={item.name}
                style={styles.itemImg}
              />
              <div style={{ flex: 1 }}>
                <div style={styles.itemName}>{item.name}</div>
                <div style={styles.itemSeller}>by {item.seller}</div>
                <div style={styles.itemPrice}>{formatPrice(item.price)}</div>
              </div>

              {/* Qty controls */}
              <div style={styles.qtyWrap}>
                <button
                  style={styles.qtyBtn}
                  onClick={() => onUpdateQty(item.id, item.qty - 1)}
                  disabled={item.qty <= 1}
                >−</button>
                <span style={styles.qtyVal}>{item.qty}</span>
                <button
                  style={styles.qtyBtn}
                  onClick={() => onUpdateQty(item.id, item.qty + 1)}
                >+</button>
              </div>

              <div style={styles.itemTotal}>
                {formatPrice(item.price * item.qty)}
              </div>

              <button
                style={styles.removeBtn}
                onClick={() => onRemove(item.id)}
              >✕</button>
            </div>
          ))}
        </div>

        {/* ── Summary ── */}
        <div style={styles.summaryCol}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryTitle}>Order Summary</div>

            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {/* Points toggle */}
            {points.balance >= LOYALTY.MIN_POINTS_TO_REDEEM && maxDiscountFcfa > 0 && (
              <div style={styles.pointsBox}>
                <div style={styles.pointsBoxHeader}>
                  <span>⭐ Use my points</span>
                  <label style={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={e => setUsePoints(e.target.checked)}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      ...styles.toggleTrack,
                      background: usePoints ? '#16A34A' : '#D1D5DB',
                    }}>
                      <div style={{
                        ...styles.toggleThumb,
                        transform: usePoints ? 'translateX(18px)' : 'translateX(0)',
                      }} />
                    </div>
                  </label>
                </div>
                <div style={styles.pointsBoxText}>
                  Use {formatPoints(maxPoints)} → save {formatPrice(maxDiscountFcfa)}
                </div>
              </div>
            )}

            {usePoints && (
              <div style={styles.summaryRow}>
                <span style={{ color: '#16A34A' }}>Points discount</span>
                <span style={{ color: '#16A34A' }}>−{formatPrice(discount)}</span>
              </div>
            )}

            <div style={styles.divider} />

            <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: '16px' }}>
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {/* Points to earn */}
            <div style={styles.earnRow}>
              ⭐ You'll earn ~{formatPoints(
                Math.floor(total / 100) * LOYALTY.POINTS_PER_100_FCFA
              )} on this order
            </div>

            {/* Escrow notice */}
            <div style={styles.escrowNotice}>
              🔒 Funds are held securely until delivery is confirmed
            </div>

            <button
              style={styles.checkoutBtn}
              onClick={() => navigate(ROUTES.BUYER_CHECKOUT, {
                state: { subtotal, discount, total, usePoints, pointsUsed: usePoints ? maxPoints : 0 }
              })}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrap:       { padding: '24px 16px', maxWidth: '1000px', margin: '0 auto' },
  title:      { fontSize: '20px', fontWeight: 700, color: '#1F2937', marginBottom: '20px' },
  layout:     { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  itemsCol:   { flex: 2, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '12px' },
  summaryCol: { flex: 1, minWidth: '260px' },
  itemCard: {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: '#fff', borderRadius: '14px',
    padding: '14px', border: '1.5px solid #E5E7EB',
  },
  itemImg:    { width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 },
  itemName:   { fontSize: '14px', fontWeight: 600, color: '#1F2937' },
  itemSeller: { fontSize: '12px', color: '#6B7280', marginTop: '2px' },
  itemPrice:  { fontSize: '13px', color: '#16A34A', fontWeight: 500, marginTop: '4px' },
  qtyWrap:    { display: 'flex', alignItems: 'center', gap: '8px' },
  qtyBtn: {
    width: '28px', height: '28px', borderRadius: '8px',
    border: '1.5px solid #D1D5DB', background: '#F9FAFB',
    cursor: 'pointer', fontSize: '16px', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  qtyVal:     { fontSize: '14px', fontWeight: 600, minWidth: '20px', textAlign: 'center' },
  itemTotal:  { fontSize: '14px', fontWeight: 700, color: '#1F2937', minWidth: '80px', textAlign: 'right' },
  removeBtn: {
    background: 'none', border: 'none', color: '#9CA3AF',
    cursor: 'pointer', fontSize: '14px', padding: '4px',
  },
  summaryCard: {
    background: '#fff', borderRadius: '16px',
    padding: '20px', border: '1.5px solid #E5E7EB',
    position: 'sticky', top: '80px',
  },
  summaryTitle: { fontSize: '16px', fontWeight: 700, color: '#1F2937', marginBottom: '16px' },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '14px', color: '#374151', marginBottom: '10px',
  },
  pointsBox: {
    background: '#F0FDF4', borderRadius: '10px',
    padding: '10px 12px', marginBottom: '10px',
  },
  pointsBoxHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  pointsBoxText:   { fontSize: '12px', color: '#16A34A', marginTop: '4px' },
  toggle:          { cursor: 'pointer' },
  toggleTrack: {
    width: '36px', height: '20px', borderRadius: '20px',
    position: 'relative', transition: 'background .2s',
  },
  toggleThumb: {
    position: 'absolute', top: '2px', left: '2px',
    width: '16px', height: '16px', borderRadius: '50%',
    background: '#fff', transition: 'transform .2s',
  },
  divider:     { borderTop: '1px solid #E5E7EB', margin: '12px 0' },
  earnRow: {
    background: '#FFFBEB', borderRadius: '8px',
    padding: '8px 12px', fontSize: '12px',
    color: '#D97706', marginTop: '10px', marginBottom: '10px',
  },
  escrowNotice: {
    background: '#F0FDF4', borderRadius: '8px',
    padding: '8px 12px', fontSize: '12px',
    color: '#16A34A', marginBottom: '14px',
  },
  checkoutBtn: {
    width: '100%', padding: '13px', background: '#16A34A',
    color: '#fff', border: 'none', borderRadius: '12px',
    fontWeight: 700, fontSize: '15px', cursor: 'pointer',
  },
  empty: {
    textAlign: 'center', padding: '80px 16px',
  },
  emptyTitle: { fontSize: '20px', fontWeight: 700, color: '#1F2937', marginTop: '16px' },
  emptyText:  { fontSize: '14px', color: '#6B7280', marginBottom: '24px' },
  shopBtn: {
    padding: '12px 28px', background: '#16A34A',
    color: '#fff', border: 'none', borderRadius: '12px',
    fontWeight: 600, fontSize: '15px', cursor: 'pointer',
  },
};

export default Cart;