// ============================================================
// AgroConnect — Transporter Deliveries
// src/pages/transporter/Deliveries.jsx
// ============================================================
import React, { useEffect, useState } from 'react';
import { formatPrice, formatDate } from '../../utils/formatPrice';
import TransportService from '../../services/transport.service';
import Badge from '../../components/ui/Badge';

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    TransportService.getMyDeliveries()
      .then(data => setDeliveries(data.results || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.wrap}>
      <h5 style={styles.title}>Delivery History</h5>

      {loading ? (
        [...Array(4)].map((_, i) => <div key={i} style={styles.skeleton} />)
      ) : deliveries.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '40px' }}>📦</div>
          <div style={styles.emptyText}>No deliveries yet</div>
        </div>
      ) : (
        deliveries.map(d => (
          <div key={d.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.deliveryId}>Delivery #{d.id}</div>
                <div style={styles.date}>{formatDate(d.delivered_at || d.created_at)}</div>
              </div>
              <Badge variant={d.status === 'completed' ? 'success' : 'info'}>
                {d.status === 'completed' ? '✓ Delivered' : d.status}
              </Badge>
            </div>
            <div style={styles.route}>
              <span>📍 {d.pickup_location}</span>
              <span style={{ color: '#9CA3AF' }}>→</span>
              <span>🏁 {d.delivery_location}</span>
            </div>
            {d.fee && <div style={styles.fee}>Earned: {formatPrice(d.fee)}</div>}
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  wrap:        { padding: '24px 16px', maxWidth: '760px', margin: '0 auto' },
  title:       { fontSize: '22px', fontWeight: 700, color: '#1F2937', marginBottom: '20px' },
  card:        { background: '#fff', borderRadius: '14px', padding: '16px', border: '1.5px solid #E5E7EB', marginBottom: '10px' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  deliveryId:  { fontSize: '14px', fontWeight: 700, color: '#1F2937' },
  date:        { fontSize: '12px', color: '#6B7280', marginTop: '2px' },
  route:       { display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: '#374151', flexWrap: 'wrap', marginBottom: '6px' },
  fee:         { fontSize: '14px', fontWeight: 600, color: '#16A34A' },
  skeleton:    { background: '#E5E7EB', borderRadius: '14px', height: '100px', marginBottom: '10px' },
  empty:       { textAlign: 'center', padding: '60px 0' },
  emptyText:   { fontSize: '15px', color: '#6B7280', marginTop: '12px' },
};

export default Deliveries;