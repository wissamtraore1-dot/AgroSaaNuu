import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, UserX, UserCheck, Shield, Eye, ChevronDown } from 'lucide-react';
import AdminLayout from '../../Components/layout/AdminLayout';
import AdminService from '../../services/admin.service';

const ROLES = ['Tous', 'BUYER', 'SELLER', 'TRANSPORTER'];
const STATUTS = ['Tous', 'actif', 'suspendu', 'banni'];

const ROLE_STYLE = {
  BUYER:       { label: 'Acheteur',     bg: '#eff6ff', color: '#2563eb' },
  SELLER:      { label: 'Vendeur',      bg: '#f0fdf4', color: '#1a5c2a' },
  TRANSPORTER: { label: 'Transporteur', bg: '#fffbeb', color: '#d97706' },
  ADMIN:       { label: 'Admin',        bg: '#fee2e2', color: '#dc2626' },
};

const STATUT_STYLE = {
  actif:     { bg: '#dcfce7', color: '#16a34a', label: 'Actif'     },
  suspendu:  { bg: '#fef3c7', color: '#d97706', label: 'Suspendu'  },
  banni:     { bg: '#fee2e2', color: '#dc2626', label: 'Banni'     },
};

export default function AdminUsers() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [role,     setRole]     = useState('Tous');
  const [statut,   setStatut]   = useState('Tous');
  const [selected, setSelected] = useState(null);
  const [raison,   setRaison]   = useState('');
  const [action,   setAction]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState('');

  const charger = () => {
    setLoading(true);
    const params = {};
    if (role   !== 'Tous') params.role   = role;
    if (statut !== 'Tous') params.statut = statut;
    if (search)            params.search = search;
    AdminService.getUsers(params)
      .then(data => setUsers(data.results ?? data ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, [role, statut]);

  const handleSearch = (e) => {
    e.preventDefault();
    charger();
  };

  const handleAction = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      if (action === 'suspendre') await AdminService.suspendreUtilisateur(selected.id, raison);
      if (action === 'bannir')    await AdminService.bannirUtilisateur(selected.id, raison);
      if (action === 'reactiver') await AdminService.reactiversUtilisateur(selected.id);
      setMsg('Action effectuée avec succès');
      setSelected(null);
      setRaison('');
      charger();
    } catch {
      setMsg('Erreur lors de l\'action');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>Utilisateurs</h1>
            <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>{users.length} utilisateurs trouvés</p>
          </div>
        </div>

        {msg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {msg}
          </div>
        )}

        {/* Filtres */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '1rem', border: '1px solid #f0f0f0', marginBottom: '1.2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '200px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Nom, email, téléphone..."
                style={{ width: '100%', padding: '0.55rem 0.8rem 0.55rem 2rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
            <button type="submit" style={{ padding: '0.55rem 1rem', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
              Chercher
            </button>
          </form>

          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            style={{ padding: '0.55rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
          >
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>

          <select
            value={statut}
            onChange={e => setStatut(e.target.value)}
            style={{ padding: '0.55rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
          >
            {STATUTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  {['Utilisateur', 'Rôle', 'Statut', 'Inscrit le', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: '700', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan={5} style={{ padding: '1rem' }}><div style={{ height: '20px', background: '#f3f4f6', borderRadius: '6px', margin: '4px 0' }} /></td></tr>
                  ))
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Aucun utilisateur trouvé</td></tr>
                ) : (
                  users.map(u => {
                    const rs = ROLE_STYLE[u.role]   || { label: u.role,   bg: '#f3f4f6', color: '#374151' };
                    const ss = STATUT_STYLE[u.statut ?? 'actif'] || STATUT_STYLE.actif;
                    return (
                      <motion.tr key={u.id} whileHover={{ background: '#f9fafb' }} style={{ borderBottom: '1px solid #f9fafb' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: '700', color: '#1a2e10' }}>{u.prenom} {u.nom}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ background: rs.bg, color: rs.color, padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                            {rs.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ background: ss.bg, color: ss.color, padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                            {ss.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#6b7280', fontSize: '0.78rem' }}>
                          {u.date_joined ? new Date(u.date_joined).toLocaleDateString('fr-FR') : '—'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {(!u.statut || u.statut === 'actif') && (
                              <button
                                onClick={() => { setSelected(u); setAction('suspendre'); setMsg(''); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                              >
                                <UserX size={13} /> Suspendre
                              </button>
                            )}
                            {u.statut === 'actif' && (
                              <button
                                onClick={() => { setSelected(u); setAction('bannir'); setMsg(''); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                              >
                                <Shield size={13} /> Bannir
                              </button>
                            )}
                            {(u.statut === 'suspendu' || u.statut === 'banni') && (
                              <button
                                onClick={() => { setSelected(u); setAction('reactiver'); setMsg(''); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#f0fdf4', color: '#1a5c2a', border: '1px solid #86efac', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                              >
                                <UserCheck size={13} /> Réactiver
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal confirmation */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '420px', width: '100%' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.5rem' }}>
                {action === 'suspendre' ? 'Suspendre l\'utilisateur' : action === 'bannir' ? 'Bannir l\'utilisateur' : 'Réactiver l\'utilisateur'}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {selected.prenom} {selected.nom} — {selected.email}
              </p>
              {action !== 'reactiver' && (
                <textarea
                  placeholder="Raison (obligatoire)..."
                  value={raison}
                  onChange={e => setRaison(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', resize: 'none', marginBottom: '1rem' }}
                />
              )}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelected(null)} style={{ padding: '0.6rem 1.2rem', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                  Annuler
                </button>
                <button
                  onClick={handleAction}
                  disabled={saving || (action !== 'reactiver' && !raison.trim())}
                  style={{ padding: '0.6rem 1.4rem', background: action === 'reactiver' ? '#1a5c2a' : '#dc2626', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'En cours...' : 'Confirmer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
