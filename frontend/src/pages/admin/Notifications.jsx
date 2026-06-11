import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Users } from 'lucide-react';
import AdminLayout from '../../Components/layout/AdminLayout';
import AdminService from '../../services/admin.service';

const CIBLES = ['TOUS', 'BUYER', 'SELLER', 'TRANSPORTER'];

export default function AdminNotifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ titre: '', message: '', cible: 'TOUS', type: 'info' });
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');

  const charger = () => {
    setLoading(true);
    AdminService.getNotifications()
      .then(data => setNotifs(data.results ?? data ?? []))
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const envoyer = async (e) => {
    e.preventDefault();
    if (!form.titre || !form.message) return;
    setSaving(true);
    try {
      await AdminService.envoyerNotificationMasse(form);
      setMsg('Notification envoyée avec succès');
      setForm({ titre: '', message: '', cible: 'TOUS', type: 'info' });
      charger();
    } catch {
      setMsg('Erreur lors de l\'envoi');
    } finally {
      setSaving(false);
    }
  };

  const TYPE_COLORS = { info: '#2563eb', success: '#1a5c2a', warning: '#d97706', error: '#dc2626' };

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>Notifications système</h1>
          <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>Envoyez des notifications à tous les utilisateurs ou par rôle</p>
        </div>

        {msg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            {msg}
          </div>
        )}

        <div className="row g-4">
          {/* Formulaire envoi */}
          <div className="col-12 col-lg-5">
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={16} color="#1a5c2a" /> Envoyer une notification
              </h3>
              <form onSubmit={envoyer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Titre *</label>
                  <input
                    value={form.titre}
                    onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                    placeholder="Titre de la notification..."
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Message *</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Contenu du message..."
                    rows={4}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Cible</label>
                    <select
                      value={form.cible}
                      onChange={e => setForm(f => ({ ...f, cible: e.target.value }))}
                      style={{ width: '100%', padding: '0.55rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
                    >
                      {CIBLES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Type</label>
                    <select
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      style={{ width: '100%', padding: '0.55rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
                    >
                      {['info', 'success', 'warning', 'error'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving || !form.titre || !form.message}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.75rem', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
                >
                  <Send size={15} /> {saving ? 'Envoi...' : 'Envoyer à ' + (form.cible === 'TOUS' ? 'tous' : form.cible)}
                </button>
              </form>
            </div>
          </div>

          {/* Historique */}
          <div className="col-12 col-lg-7">
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} color="#1a5c2a" /> Historique des notifications
              </h3>
              {loading ? (
                [...Array(4)].map((_, i) => <div key={i} style={{ height: '64px', background: '#f3f4f6', borderRadius: '10px', marginBottom: '8px' }} />)
              ) : notifs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                  <Bell size={32} color="#d1d5db" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0 }}>Aucune notification envoyée</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '440px', overflowY: 'auto' }}>
                  {notifs.map(n => {
                    const color = TYPE_COLORS[n.type] || TYPE_COLORS.info;
                    return (
                      <motion.div key={n.id} whileHover={{ x: 3 }}
                        style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: '#f9fafb', borderRadius: '10px', borderLeft: `3px solid ${color}` }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1a2e10' }}>{n.titre || n.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', margin: '2px 0' }}>{n.message || n.body || ''}</div>
                          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                            {n.cible || 'Tous'} · {n.created_at ? new Date(n.created_at).toLocaleDateString('fr-FR') : '—'}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
