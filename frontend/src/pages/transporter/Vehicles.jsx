// ============================================================
// AgroConnect — Transporter Vehicles
// src/pages/transporter/Vehicles.jsx
// ============================================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransportService from '../../services/transport.service';
import { useNotificationContext } from '../../context/NotificationContext';

const Vehicles = () => {
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotificationContext();
  const [vehicles, setVehicles] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await TransportService.getMyVehicles();
      setVehicles(data.results || data);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this vehicle?')) return;
    try {
      await TransportService.deleteVehicle(id);
      success('Vehicle removed');
      load();
    } catch { notifyError('Failed to remove vehicle'); }
  };

  const TYPE_ICONS = { truck: '🚛', motorcycle: '🏍️', tricycle: '🛺', van: '🚐', pickup: '🛻' };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h5 style={styles.title}>My Vehicles</h5>
        <button style={styles.addBtn} onClick={() => navigate('/transporter/vehicles/add')}>+ Add Vehicle</button>
      </div>

      {loading ? (
        [...Array(3)].map((_, i) => <div key={i} style={styles.skeleton} />)
      ) : vehicles.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '40px' }}>🚚</div>
          <div style={styles.emptyText}>No vehicles yet</div>
          <button style={styles.addBtn} onClick={() => navigate('/transporter/vehicles/add')}>Add your first vehicle</button>
        </div>
      ) : (
        vehicles.map(v => (
          <div key={v.id} style={styles.card}>
            <div style={styles.icon}>{TYPE_ICONS[v.type] || '🚚'}</div>
            <div style={{ flex: 1 }}>
              <div style={styles.name}>{v.brand} {v.model}</div>
              <div style={styles.meta}>{v.type} • Plate: {v.plate} • Capacity: {v.capacity}kg</div>
              <div style={{ ...styles.statusBadge, background: v.is_available ? '#EAF3DE' : '#FEF2F2', color: v.is_available ? '#3B6D11' : '#9B1C1C' }}>
                {v.is_available ? '✓ Available' : '✗ Unavailable'}
              </div>
            </div>
            <div style={styles.actions}>
              <button style={styles.editBtn} onClick={() => navigate(`/transporter/vehicles/${v.id}/edit`)}>Edit</button>
              <button style={styles.deleteBtn} onClick={() => handleDelete(v.id)}>Remove</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  wrap:        { padding: '24px 16px', maxWidth: '760px', margin: '0 auto' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title:       { fontSize: '22px', fontWeight: 700, color: '#1F2937', margin: 0 },
  addBtn:      { padding: '10px 18px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' },
  card:        { display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', borderRadius: '14px', padding: '16px', border: '1.5px solid #E5E7EB', marginBottom: '10px' },
  icon:        { fontSize: '36px', flexShrink: 0 },
  name:        { fontSize: '15px', fontWeight: 600, color: '#1F2937' },
  meta:        { fontSize: '12px', color: '#6B7280', marginTop: '3px' },
  statusBadge: { display: 'inline-block', fontSize: '12px', padding: '2px 10px', borderRadius: '20px', marginTop: '6px', fontWeight: 500 },
  actions:     { display: 'flex', gap: '8px', flexShrink: 0 },
  editBtn:     { padding: '7px 14px', background: '#EEF2FF', color: '#4F46E5', border: 'none', borderRadius: '8px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' },
  deleteBtn:   { padding: '7px 14px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '8px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' },
  skeleton:    { background: '#E5E7EB', borderRadius: '14px', height: '90px', marginBottom: '10px' },
  empty:       { textAlign: 'center', padding: '60px 0' },
  emptyText:   { fontSize: '15px', color: '#6B7280', margin: '12px 0 20px' },
};

export default Vehicles;