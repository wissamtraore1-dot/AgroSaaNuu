// ============================================================
// AgroConnect — Transporter Missions
// src/pages/transporter/Missions.jsx
// ============================================================
import React, { useEffect, useState } from 'react';
import { formatPrice, formatDate } from '../../utils/formatPrice';
import TransportService from '../../services/transport.service';
import { useNotificationContext } from '../../context/NotificationContext';
import Badge from '../../components/ui/Badge';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',     variant: 'warning' },
  accepted:  { label: 'Accepted',    variant: 'info' },
  in_transit:{ label: 'In Transit',  variant: 'primary' },
  completed: { label: 'Completed',   variant: 'success' },
  cancelled: { label: 'Cancelled',   variant: 'danger' },
};

const Missions = () => {
  const { success, error: notifyError } = useNotificationContext();
  const [missions, setMissions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState(null);

  useEffect(() => { load(); }, [tab]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await TransportService.getMyMissions({ status: tab });
      setMissions(data.results || []);
    } finally { setLoading(false); }
  };

  const handleAction = async (id, status, label) => {
    try {
      await TransportService.updateMissionStatus(id, status);
      success(`Mission ${label}`);
      load();
    } catch { notifyError('Failed to update mission'); }
  };

  const TABS = [null, 'pending', 'accepted', 'in_transit', 'completed'];

  return (
    <div style={styles.wrap}>
      <h5 style={styles.title}>My Missions</h5>

      <div style={styles.tabs}>
        {TABS.map(t => (
          <button
            key={String(t)}
            style={{ ...styles.tab, background: tab === t ? '#16A34A' : '#F3F4F6', color: tab === t ? '#fff' : '#374151' }}
            onClick={() => setTab(t)}
          >
            {t ? STATUS_CONFIG[t]?.label : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        [...Array(3)].map((_, i) => <div key={i} style={styles.skeleton} />)
      ) : missions.length === 0 ? (
        <div style={styles.empty}><div style={{ fontSize: '40px' }}>📋</div><div style={styles.emptyText}>No missions</div></div>
      ) : (
        missions.map(m => {
          const cfg = STATUS_CONFIG[m.status] || STATUS_CONFIG.pending;
          return (
            <div key={m.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.missionId}>Mission #{m.id}</div>
                  <div style={styles.missionDate}>{formatDate(m.created_at)}</div>
                </div>
                <Badge variant={cfg.variant}>{cfg.label}</Badge>
              </div>

              <div style={styles.route}>
                <span>📍 {m.pickup_location}</span>
                <span style={{ color: '#9CA3AF' }}>→</span>
                <span>🏁 {m.delivery_location}</span>
              </div>

              {m.fee && (
                <div style={styles.fee}>Fee: {formatPrice(m.fee)}</div>
              )}

              {/* Actions */}
              <div style={styles.cardActions}>
                {m.status === 'pending' && (
                  <>
                    <button style={styles.acceptBtn} onClick={() => handleAction(m.id, 'accepted', 'accepted')}>Accept</button>
                    <button style={styles.declineBtn} onClick={() => handleAction(m.id, 'cancelled', 'declined')}>Decline</button>
                  </>
                )}
                {m.status === 'accepted' && (
                  <button style={styles.acceptBtn} onClick={() => handleAction(m.id, 'in_transit', 'started')}>Start Delivery</button>
                )}
                {m.status === 'in_transit' && (
                  <button style={styles.acceptBtn} onClick={() => handleAction(m.id, 'completed', 'completed')}>Mark Delivered</button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

const styles = {
  wrap:        { padding: '24px 16px', maxWidth: '760px', margin: '0 auto' },
  title:       { fontSize: '22px', fontWeight: 700, color: '#1F2937', marginBottom: '16px' },
  tabs:        { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' },
  tab:         { border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all .2s' },
  card:        { background: '#fff', borderRadius: '14px', padding: '16px', border: '1.5px solid #E5E7EB', marginBottom: '10px' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  missionId:   { fontSize: '14px', fontWeight: 700, color: '#1F2937' },
  missionDate: { fontSize: '12px', color: '#6B7280', marginTop: '2px' },
  route:       { display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: '#374151', flexWrap: 'wrap', marginBottom: '8px' },
  fee:         { fontSize: '14px', fontWeight: 600, color: '#16A34A', marginBottom: '10px' },
  cardActions: { display: 'flex', gap: '8px' },
  acceptBtn:   { padding: '8px 16px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' },
  declineBtn:  { padding: '8px 16px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' },
  skeleton:    { background: '#E5E7EB', borderRadius: '14px', height: '120px', marginBottom: '10px' },
  empty:       { textAlign: 'center', padding: '60px 0' },
  emptyText:   { fontSize: '15px', color: '#6B7280', marginTop: '12px' },
};

export default Missions;