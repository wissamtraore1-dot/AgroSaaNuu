import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowDownLeft } from 'lucide-react';
import AdminLayout from '../../Components/layout/AdminLayout';
import AdminService from '../../services/admin.service';

const STATUT_STYLE = {
  EN_ATTENTE: { bg: '#fef3c7', color: '#d97706', label: 'En attente' },
  APPROUVE:   { bg: '#dcfce7', color: '#16a34a', label: 'Approuvé'  },
  REJETE:     { bg: '#fee2e2', color: '#dc2626', label: 'Rejeté'    },
};

export default function AdminWithdrawals() {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(null);
  const [msg,     setMsg]     = useState('');
  const [rejet,   setRejet]   = useState({ open: false, id: null, raison: '' });

  const charger = () => {
    setLoading(true);
    AdminService.getWithdrawals({ statut: 'EN_ATTENTE' })
      .then(data => setList(data.results ?? data ?? []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const approuver = async (id) => {
    setSaving(id);
    try {
      await AdminService.approuverRetrait(id);
      setMsg('Retrait approuvé et fonds transférés');
      charger();
    } catch {
      setMsg('Erreur lors de l\'approbation');
    } finally {
      setSaving(null);
    }
  };

  const rejeter = async () => {
    if (!rejet.raison.trim()) return;
    setSaving(rejet.id);
    try {
      await AdminService.rejeterRetrait(rejet.id, rejet.raison);
      setMsg('Retrait rejeté');
      setRejet({ open: false, id: null, raison: '' });
      charger();
    } catch {
      setMsg('Erreur lors du rejet');
    } finally {
      setSaving(null);
    }
  };

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>Retraits vendeurs</h1>
          <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>
            <span style={{ fontWeight: '700', color: '#d97706' }}>{list.length}</span> demandes en attente d'approbation
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
              <div key={i} style={{ background: 'white', borderRadius: '14px', height: '90px', border: '1px solid #f0f0f0' }} />
            ))
          ) : list.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1px solid #f0f0f0' }}>
              <ArrowDownLeft size={40} color="#d1d5db" style={{ marginBottom: '0.8rem' }} />
              <p style={{ color: '#9ca3af', fontWeight: '600' }}>Aucune demande de retrait en attente</p>
            </div>
          ) : (
            list.map(w => {
              const ss = STATUT_STYLE[w.statut] || STATUT_STYLE.EN_ATTENTE;
              return (
                <motion.div
                  key={w.id}
                  whileHover={{ y: -2 }}
                  style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ArrowDownLeft size={20} color="#d97706" />
                  </div>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <div style={{ fontWeight: '700', color: '#1a2e10', fontSize: '0.92rem' }}>
                      {w.vendeur_nom || w.user_nom || '—'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Vers : {w.mode_paiement || 'MTN'} · {w.numero_telephone || '—'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '2px' }}>
                      Demandé le {w.created_at ? new Date(w.created_at).toLocaleDateString('fr-FR') : '—'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1a5c2a' }}>
                      {Number(w.montant || 0).toLocaleString('fr-FR')} FCFA
                    </div>
                    <span style={{ background: ss.bg, color: ss.color, padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700' }}>
                      {ss.label}
                    </span>
                  </div>
                  {(w.statut === 'EN_ATTENTE' || !w.statut) && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => approuver(w.id)}
                        disabled={saving === w.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: '#f0fdf4', color: '#1a5c2a', border: '1px solid #86efac', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', opacity: saving === w.id ? 0.6 : 1 }}
                      >
                        <CheckCircle size={14} /> Approuver
                      </button>
                      <button
                        onClick={() => setRejet({ open: true, id: w.id, raison: '' })}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        <XCircle size={14} /> Rejeter
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Modal rejet */}
        {rejet.open && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '420px', width: '100%' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.5rem' }}>Rejeter la demande</h3>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>Précisez la raison du rejet (sera communiquée au vendeur)</p>
              <textarea
                placeholder="Raison du rejet..."
                value={rejet.raison}
                onChange={e => setRejet(r => ({ ...r, raison: e.target.value }))}
                rows={3}
                style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', resize: 'none', marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setRejet({ open: false, id: null, raison: '' })} style={{ padding: '0.6rem 1.2rem', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                  Annuler
                </button>
                <button onClick={rejeter} disabled={!rejet.raison.trim()} style={{ padding: '0.6rem 1.4rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}>
                  Confirmer le rejet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
