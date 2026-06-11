import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldX, Eye, FileText } from 'lucide-react';
import AdminLayout from '../../Components/layout/AdminLayout';
import AdminService from '../../services/admin.service';

const STATUS_STYLE = {
  PENDING:  { bg: '#fef3c7', color: '#d97706', label: 'En attente' },
  APPROVED: { bg: '#dcfce7', color: '#16a34a', label: 'Approuvé'   },
  REJECTED: { bg: '#fee2e2', color: '#dc2626', label: 'Rejeté'     },
};

export default function AdminKYC() {
  const [list,       setList]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [decision,   setDecision]   = useState('');
  const [commentaire,setCommentaire]= useState('');
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState('');

  const charger = () => {
    setLoading(true);
    AdminService.getKYCPending()
      .then(data => setList(data.results ?? data ?? []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const handleDecision = async () => {
    if (!selected || !decision) return;
    setSaving(true);
    try {
      await AdminService.verifierKYC(selected.user_id || selected.id, decision, commentaire);
      setMsg(`KYC ${decision === 'approve' ? 'approuvé' : 'rejeté'} avec succès`);
      setSelected(null);
      setDecision('');
      setCommentaire('');
      charger();
    } catch {
      setMsg('Erreur lors de la validation');
    } finally {
      setSaving(false);
    }
  };

  const pending = list.filter(k => k.status === 'PENDING' || !k.status);

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>Validations KYC</h1>
          <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>
            <span style={{ fontWeight: '700', color: '#d97706' }}>{pending.length}</span> dossiers en attente
          </p>
        </div>

        {msg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', height: '80px', border: '1px solid #f0f0f0' }} />
            ))
          ) : list.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1px solid #f0f0f0' }}>
              <ShieldCheck size={40} color="#d1d5db" style={{ marginBottom: '0.8rem' }} />
              <p style={{ color: '#9ca3af', fontWeight: '600' }}>Aucun dossier KYC en attente</p>
            </div>
          ) : (
            list.map(k => {
              const ss = STATUS_STYLE[k.status] || STATUS_STYLE.PENDING;
              return (
                <motion.div
                  key={k.id}
                  whileHover={{ y: -2 }}
                  style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} color="#1a5c2a" />
                  </div>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <div style={{ fontWeight: '700', color: '#1a2e10', fontSize: '0.92rem' }}>
                      {k.user_prenom || k.prenom || '—'} {k.user_nom || k.nom || ''}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{k.user_email || k.email || '—'}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '2px' }}>
                      Document : {k.document_type || 'CIP'} · Soumis le {k.created_at ? new Date(k.created_at).toLocaleDateString('fr-FR') : '—'}
                    </div>
                  </div>
                  <span style={{ background: ss.bg, color: ss.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {ss.label}
                  </span>
                  {k.document_url && (
                    <a href={k.document_url} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600', textDecoration: 'none' }}>
                      <Eye size={13} /> Voir doc
                    </a>
                  )}
                  {(k.status === 'PENDING' || !k.status) && (
                    <>
                      <button
                        onClick={() => { setSelected(k); setDecision('approve'); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#f0fdf4', color: '#1a5c2a', border: '1px solid #86efac', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                        <ShieldCheck size={13} /> Approuver
                      </button>
                      <button
                        onClick={() => { setSelected(k); setDecision('reject'); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                        <ShieldX size={13} /> Rejeter
                      </button>
                    </>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Modal */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '420px', width: '100%' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.5rem' }}>
                {decision === 'approve' ? 'Approuver le KYC' : 'Rejeter le KYC'}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {selected.user_prenom} {selected.user_nom}
              </p>
              <textarea
                placeholder={decision === 'approve' ? 'Commentaire (optionnel)...' : 'Motif du rejet (obligatoire)...'}
                value={commentaire}
                onChange={e => setCommentaire(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', resize: 'none', marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelected(null)} style={{ padding: '0.6rem 1.2rem', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                  Annuler
                </button>
                <button
                  onClick={handleDecision}
                  disabled={saving || (decision === 'reject' && !commentaire.trim())}
                  style={{ padding: '0.6rem 1.4rem', background: decision === 'approve' ? '#1a5c2a' : '#dc2626', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'En cours...' : decision === 'approve' ? 'Approuver' : 'Rejeter'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
