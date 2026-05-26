// ============================================================
// AgroConnect — Add Vehicle
// src/pages/transporter/AddVehicle.jsx
// ============================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransportService from '../../services/transport.service';
import { useNotificationContext } from '../../context/NotificationContext';

const VEHICLE_TYPES = ['truck', 'van', 'pickup', 'motorcycle', 'tricycle'];

const AddVehicle = () => {
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotificationContext();
  const [form,    setForm]    = useState({ brand: '', model: '', type: '', plate: '', capacity: '', year: '' });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.brand)    errs.brand    = 'Brand is required';
    if (!form.model)    errs.model    = 'Model is required';
    if (!form.type)     errs.type     = 'Type is required';
    if (!form.plate)    errs.plate    = 'Plate number is required';
    if (!form.capacity) errs.capacity = 'Capacity is required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await TransportService.addVehicle(fd);
      success('Vehicle added successfully!');
      navigate('/transporter/vehicles');
    } catch (err) {
      notifyError('Failed to add vehicle');
      setErrors(err.response?.data || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <button style={styles.backBtn} onClick={() => navigate('/transporter/vehicles')}>← My Vehicles</button>
      <h5 style={styles.title}>Add New Vehicle</h5>

      <div style={styles.card}>
        {[
          { name: 'brand',    label: 'Brand',          type: 'text',   placeholder: 'e.g. Toyota' },
          { name: 'model',    label: 'Model',          type: 'text',   placeholder: 'e.g. Hilux' },
          { name: 'plate',    label: 'Plate Number',   type: 'text',   placeholder: 'e.g. AB 1234 BJ' },
          { name: 'capacity', label: 'Capacity (kg)',  type: 'number', placeholder: 'e.g. 1000' },
          { name: 'year',     label: 'Year',           type: 'number', placeholder: 'e.g. 2020' },
        ].map(f => (
          <div key={f.name} style={styles.field}>
            <label style={styles.label}>{f.label}</label>
            <input
              type={f.type}
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
              placeholder={f.placeholder}
              style={{ ...styles.input, borderColor: errors[f.name] ? '#E02424' : '#D1D5DB' }}
            />
            {errors[f.name] && <div style={styles.errText}>{errors[f.name]}</div>}
          </div>
        ))}

        <div style={styles.field}>
          <label style={styles.label}>Vehicle Type</label>
          <select name="type" value={form.type} onChange={handleChange} style={{ ...styles.input, borderColor: errors.type ? '#E02424' : '#D1D5DB' }}>
            <option value="">Select type</option>
            {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          {errors.type && <div style={styles.errText}>{errors.type}</div>}
        </div>

        <button style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Adding...' : 'Add Vehicle'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrap:      { padding: '24px 16px', maxWidth: '540px', margin: '0 auto' },
  backBtn:   { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6B7280', marginBottom: '8px', padding: 0 },
  title:     { fontSize: '22px', fontWeight: 700, color: '#1F2937', marginBottom: '20px' },
  card:      { background: '#fff', borderRadius: '16px', padding: '24px', border: '1.5px solid #E5E7EB' },
  field:     { marginBottom: '16px' },
  label:     { display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' },
  input:     { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  errText:   { color: '#E02424', fontSize: '12px', marginTop: '4px' },
  submitBtn: { width: '100%', padding: '13px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' },
};

export default AddVehicle;