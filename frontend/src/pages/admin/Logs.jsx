import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Search, RefreshCw } from 'lucide-react';
import AdminLayout from '../../Components/layout/AdminLayout';
import AdminService from '../../services/admin.service';

const ACTION_STYLE = {
  LOGIN:      { bg: '#eff6ff', color: '#2563eb' },
  LOGOUT:     { bg: '#f3f4f6', color: '#6b7280' },
  CREATE:     { bg: '#f0fdf4', color: '#1a5c2a' },
  UPDATE:     { bg: '#fffbeb', color: '#d97706' },
  DELETE:     { bg: '#fee2e2', color: '#dc2626' },
  APPROVE:    { bg: '#ecfeff', color: '#0891b2' },
  REJECT:     { bg: '#fee2e2', color: '#dc2626' },
  SUSPEND:    { bg: '#fef3c7', color: '#d97706' },
  PAYMENT:    { bg: '#f5f3ff', color: '#7c3aed' },
};

export default function AdminLogs() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  const charger = () => {
    setLoading(true);
    const params = search ? { search } : {};
    AdminService.getLogs(params)
      .then(data => setLogs(data.results ?? data ?? []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  return (
    <AdminLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>Logs d'activité</h1>
            <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>Historique des actions effectuées sur la plateforme</p>
          </div>
          <button
            onClick={charger}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.65rem 1.2rem', background: '#f4f6f4', color: '#1a5c2a', border: '1px solid #d1fae5', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer' }}
          >
            <RefreshCw size={15} /> Rafraîchir
          </button>
        </div>

        {/* Recherche */}
        <form onSubmit={e => { e.preventDefault(); charger(); }}
          style={{ background: 'white', borderRadius: '14px', padding: '1rem', border: '1px solid #f0f0f0', marginBottom: '1.2rem', display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Utilisateur, action, ressource..."
              style={{ width: '100%', padding: '0.55rem 0.8rem 0.55rem 2rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>
          <button type="submit" style={{ padding: '0.55rem 1rem', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
            Chercher
          </button>
        </form>

        {/* Logs */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '1.5rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: '52px', background: '#f3f4f6', borderRadius: '8px', marginBottom: '8px' }} />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <ScrollText size={40} color="#d1d5db" style={{ marginBottom: '0.8rem' }} />
              <p style={{ color: '#9ca3af', fontWeight: '600', margin: 0 }}>Aucun log disponible</p>
              <p style={{ color: '#d1d5db', fontSize: '0.82rem', margin: '4px 0 0' }}>
                Les logs apparaîtront quand des actions sont effectuées
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f0f0f0', background: '#fafafa' }}>
                    {['Date/Heure', 'Utilisateur', 'Action', 'Ressource', 'Détails', 'IP'].map(h => (
                      <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: '700', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l, i) => {
                    const as = ACTION_STYLE[l.action?.toUpperCase()] || { bg: '#f3f4f6', color: '#374151' };
                    return (
                      <motion.tr key={l.id || i} whileHover={{ background: '#f9fafb' }} style={{ borderBottom: '1px solid #f9fafb' }}>
                        <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {l.created_at ? new Date(l.created_at).toLocaleString('fr-FR') : '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: '600', color: '#1a2e10', fontSize: '0.82rem' }}>{l.user_nom || l.user || '—'}</div>
                          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{l.user_email || l.role || ''}</div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ background: as.bg, color: as.color, padding: '3px 8px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            {l.action || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#374151', fontSize: '0.82rem' }}>{l.ressource || l.resource || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {l.details || l.description || '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#9ca3af', fontSize: '0.72rem', fontFamily: 'monospace' }}>{l.ip || '—'}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
