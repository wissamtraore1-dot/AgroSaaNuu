import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Newspaper, ExternalLink } from 'lucide-react';
import AdminLayout from '../../Components/layout/AdminLayout';
import AdminService from '../../services/admin.service';

export default function AdminNews() {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');

  const EMPTY = { titre: '', contenu: '', source: '', url_source: '', categorie: 'general' };

  const charger = () => {
    setLoading(true);
    AdminService.getAllNews()
      .then(data => setList(data.results ?? data ?? []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const handleCreate = async () => {
    if (!form.titre || !form.contenu) return;
    setSaving(true);
    try {
      await AdminService.createNews(form);
      setMsg('Actualité publiée avec succès');
      setForm(null);
      charger();
    } catch {
      setMsg('Erreur lors de la publication');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette actualité ?')) return;
    try {
      await AdminService.deleteNews(id);
      setMsg('Actualité supprimée');
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
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>Actualités</h1>
            <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>{list.length} articles publiés</p>
          </div>
          <button
            onClick={() => setForm({ ...EMPTY })}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.65rem 1.2rem', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer' }}
          >
            <Plus size={16} /> Nouvel article
          </button>
        </div>

        {msg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {msg}
          </div>
        )}

        {/* Formulaire */}
        {form && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '2px solid #1a5c2a22', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', marginBottom: '1rem' }}>Publier un article</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Titre *</label>
                <input
                  value={form.titre}
                  onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                  placeholder="Titre de l'article..."
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Contenu *</label>
                <textarea
                  value={form.contenu}
                  onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))}
                  placeholder="Contenu de l'article..."
                  rows={5}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.88rem', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div className="row g-3">
                <div className="col-md-4">
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Catégorie</label>
                  <select
                    value={form.categorie}
                    onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.88rem', outline: 'none' }}
                  >
                    {['general', 'marche', 'meteo', 'politique', 'technologie'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Source</label>
                  <input
                    value={form.source}
                    onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                    placeholder="ONASA, FAO..."
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
                <div className="col-md-4">
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>URL source</label>
                  <input
                    value={form.url_source}
                    onChange={e => setForm(f => ({ ...f, url_source: e.target.value }))}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '1.2rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setForm(null)} style={{ padding: '0.6rem 1.2rem', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.titre || !form.contenu}
                style={{ padding: '0.6rem 1.4rem', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Publication...' : 'Publier'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Liste articles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '14px', height: '80px', border: '1px solid #f0f0f0' }} />
            ))
          ) : list.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1px solid #f0f0f0' }}>
              <Newspaper size={40} color="#d1d5db" style={{ marginBottom: '0.8rem' }} />
              <p style={{ color: '#9ca3af', fontWeight: '600' }}>Aucune actualité publiée</p>
            </div>
          ) : (
            list.map(n => (
              <motion.div key={n.id} whileHover={{ y: -2 }}
                style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1px solid #f0f0f0', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Newspaper size={20} color="#2563eb" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: '#1a2e10', fontSize: '0.92rem', marginBottom: '4px' }}>{n.titre}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {n.contenu || n.description || ''}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                    {n.source || ''} · {n.created_at ? new Date(n.created_at).toLocaleDateString('fr-FR') : '—'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {n.url_source && (
                    <a href={n.url_source} target="_blank" rel="noreferrer"
                      style={{ padding: '6px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', display: 'flex', textDecoration: 'none' }}>
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button onClick={() => handleDelete(n.id)} style={{ padding: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
