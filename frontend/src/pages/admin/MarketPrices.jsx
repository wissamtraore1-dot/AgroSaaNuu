import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, TrendingUp, Save, X } from 'lucide-react';
import AdminLayout from '../../Components/layout/AdminLayout';
import AdminService from '../../services/admin.service';

const EMPTY = { cereale: '', unite: 'tonne', prix_min: '', prix_max: '', prix_moyen: '', ville: '', source: '' };

export default function AdminMarketPrices() {
  const [prices,  setPrices]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');

  const charger = () => {
    setLoading(true);
    AdminService.getPrixMarche()
      .then(data => setPrices(data.results ?? data ?? []))
      .catch(() => setPrices([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const handleSave = async () => {
    if (!form.cereale || !form.prix_moyen) return;
    setSaving(true);
    try {
      if (form.id) await AdminService.updatePrixMarche(form.id, form);
      else         await AdminService.createPrixMarche(form);
      setMsg('Prix enregistré avec succès');
      setForm(null);
      charger();
    } catch {
      setMsg('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce prix de référence ?')) return;
    try {
      await AdminService.deletePrixMarche(id);
      setMsg('Prix supprimé');
      charger();
    } catch {
      setMsg('Erreur lors de la suppression');
    }
  };

  return (
    <AdminLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>Prix de référence marché</h1>
            <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>Gérez les prix officiels affichés sur la plateforme</p>
          </div>
          <button
            onClick={() => setForm({ ...EMPTY })}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.65rem 1.2rem', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer' }}
          >
            <Plus size={16} /> Nouveau prix
          </button>
        </div>

        {msg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {msg}
          </div>
        )}

        {/* Formulaire */}
        {form && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '2px solid #1a5c2a22', marginBottom: '1.5rem' }}
          >
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', marginBottom: '1rem' }}>
              {form.id ? 'Modifier le prix' : 'Ajouter un prix de référence'}
            </h3>
            <div className="row g-3">
              {[
                { key: 'cereale',    label: 'Céréale',       placeholder: 'Maïs, Riz...' },
                { key: 'ville',      label: 'Ville',         placeholder: 'Parakou...'   },
                { key: 'prix_min',   label: 'Prix min (FCFA)', placeholder: '0'          },
                { key: 'prix_max',   label: 'Prix max (FCFA)', placeholder: '0'          },
                { key: 'prix_moyen', label: 'Prix moyen *',  placeholder: '0'            },
                { key: 'source',     label: 'Source',        placeholder: 'ONASA...'     },
              ].map(f => (
                <div key={f.key} className="col-6 col-md-4">
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>{f.label}</label>
                  <input
                    value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: '0.55rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              ))}
              <div className="col-6 col-md-4">
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Unité</label>
                <select
                  value={form.unite}
                  onChange={e => setForm(prev => ({ ...prev, unite: e.target.value }))}
                  style={{ width: '100%', padding: '0.55rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
                >
                  {['tonne', 'kg', 'sac_50kg', 'sac_100kg'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '1.2rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setForm(null)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.6rem 1.2rem', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                <X size={14} /> Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.cereale || !form.prix_moyen}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.6rem 1.4rem', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', opacity: saving ? 0.7 : 1 }}
              >
                <Save size={14} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Table */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0', background: '#fafafa' }}>
                  {['Céréale', 'Ville', 'Prix min', 'Prix moyen', 'Prix max', 'Unité', 'Source', 'Modifié le', ''].map(h => (
                    <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: '700', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}><td colSpan={9} style={{ padding: '1rem' }}>
                      <div style={{ height: '18px', background: '#f3f4f6', borderRadius: '6px' }} />
                    </td></tr>
                  ))
                ) : prices.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                    Aucun prix enregistré — cliquez sur « Nouveau prix »
                  </td></tr>
                ) : (
                  prices.map(p => (
                    <motion.tr key={p.id} whileHover={{ background: '#f9fafb' }} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: '700', color: '#1a2e10' }}>{p.cereale}</td>
                      <td style={{ padding: '0.8rem 1rem', color: '#374151' }}>{p.ville || '—'}</td>
                      <td style={{ padding: '0.8rem 1rem', color: '#374151' }}>{p.prix_min ? Number(p.prix_min).toLocaleString('fr-FR') : '—'}</td>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: '700', color: '#1a5c2a' }}>{Number(p.prix_moyen).toLocaleString('fr-FR')}</td>
                      <td style={{ padding: '0.8rem 1rem', color: '#374151' }}>{p.prix_max ? Number(p.prix_max).toLocaleString('fr-FR') : '—'}</td>
                      <td style={{ padding: '0.8rem 1rem', color: '#6b7280' }}>{p.unite}</td>
                      <td style={{ padding: '0.8rem 1rem', color: '#6b7280' }}>{p.source || '—'}</td>
                      <td style={{ padding: '0.8rem 1rem', color: '#6b7280', fontSize: '0.75rem' }}>
                        {p.updated_at ? new Date(p.updated_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => setForm({ ...p })} style={{ padding: '5px 8px', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '7px', cursor: 'pointer' }}>
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} style={{ padding: '5px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '7px', cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
