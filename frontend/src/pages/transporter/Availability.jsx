// ============================================================
// AgroConnect — Transporter Availability
// src/pages/transporter/Availability.jsx
// ============================================================
import React, { useEffect, useState } from 'react';
import TransportService from '../../services/transport.service';
import { useNotificationContext } from '../../context/NotificationContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Availability = () => {
  const { success, error: notifyError } = useNotificationContext();
  const [availability, setAvailability] = useState({ days: [], regions: '', is_available: true });
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    TransportService.getAvailability()
      .then(data => setAvailability(data))
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (day) => {
    setAvailability(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await TransportService.setAvailability(availability);
      success('Availability updated!');
    } catch { notifyError('Failed to update availability'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Loading...</div>;

  return (
    <div style={styles.wrap}>
      <h5 style={styles.title}>My Availability</h5>

      <div style={styles.card}>
        {/* Active toggle */}
        <div style={styles.toggleRow}>
          <div>
            <div style={styles.toggleLabel}>Available for missions</div>
            <div style={styles.toggleSub}>Turn off to pause new mission requests</div>
          </div>
          <div
            style={{
              ...styles.toggle,
              background: availability.is_available ? '#16A34A' : '#D1D5DB',
            }}
            onClick={() => setAvailability(prev => ({ ...prev, is_available: !prev.is_available }))}
          >
            <div style={{
              ...styles.toggleThumb,
              transform: availability.is_available ? 'translateX(22px)' : 'translateX(0)',
            }} />
          </div>
        </div>

        {/* Days */}
        <div style={styles.sectionTitle}>Available days</div>
        <div style={styles.daysGrid}>
          {DAYS.map(day => (
            <div
              key={day}
              style={{
                ...styles.dayChip,
                background: availability.days.includes(day) ? '#16A34A' : '#F3F4F6',
                color:      availability.days.includes(day) ? '#fff'     : '#374151',
              }}
              onClick={() => toggleDay(day)}
            >
              {day.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Region */}
        <div style={styles.sectionTitle}>Operating regions</div>
        <textarea
          value={availability.regions}
          onChange={e => setAvailability(prev => ({ ...prev, regions: e.target.value }))}
          placeholder="e.g. Cotonou, Abomey-Calavi, Porto-Novo..."
          rows={3}
          style={styles.textarea}
        />

        <button
          style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrap:         { padding: '24px 16px', maxWidth: '580px', margin: '0 auto' },
  title:        { fontSize: '22px', fontWeight: 700, color: '#1F2937', marginBottom: '20px' },
  card:         { background: '#fff', borderRadius: '16px', padding: '24px', border: '1.5px solid #E5E7EB' },
  toggleRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  toggleLabel:  { fontSize: '14px', fontWeight: 600, color: '#1F2937' },
  toggleSub:    { fontSize: '12px', color: '#6B7280', marginTop: '2px' },
  toggle:       { width: '46px', height: '26px', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 },
  toggleThumb:  { position: 'absolute', top: '3px', left: '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'transform .2s' },
  sectionTitle: { fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '10px' },
  daysGrid:     { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' },
  dayChip:      { padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all .2s' },
  textarea:     { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', marginBottom: '20px' },
  saveBtn:      { width: '100%', padding: '13px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' },
};

export default Availability;