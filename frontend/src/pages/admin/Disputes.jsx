import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import AdminLayout from '../../Components/layout/AdminLayout';
import AdminService from '../../services/admin.service';

const STATUT_STYLE = {
  OUVERT:   { bg: '#fee2e2', color: '#dc2626', label: 'Ouvert'   },
  EN_COURS: { bg: '#fef3c7', color: '#d97706', label: 'En cours' },
  RESOLU:   { bg: '#dcfce7', color: '#16a34a', label: 'Résolu'   },
  FERME:    { bg: '#f3f4f6', color: '#6b7280', label: 'Fermé'    },
};

export default function AdminDisputes() {
  const [list,       setList]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [decision,   setDecision]   = useState('');
  const [commentaire,setCommentaire]= useState('');
  const [montantAcheteur, setMontantAcheteur] = useState('');
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState('');

  const charger = () => {
    setLoading(true);
    AdminService.getLitiges()
      .then(data => setList(data.results ?? data ?? []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const resoudre = async () => {
    if (!selected || !decision) return;
    if (decision === 'PARTAGER' && (!montantAcheteur || Number(montantAcheteur) <= 0)) return;
    setSaving(true);
    try {
      await AdminService.resoudreLitige(
        selected.id, decision, commentaire,
        decision === 'PARTAGER' ? montantAcheteur : null
      );
      setMsg('Litige résolu avec succès');
      setSelected(null);
      setMontantAcheteur('');
      charger();
    } catch {
      setMsg('Erreur lors de la résolution');
    } finally {
      setSaving(false);
    }
  };

  const ouverts = list.filter(l => l.statut === 'OUVERT' || l.statut === 'EN_COURS');

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>Litiges</h1>
          <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>
            <span style={{ fontWeight: '700', color: '#dc2626' }}>{ouverts.length}</span> litiges ouverts
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
              <div key={i} style={{ background: 'white', borderRadius: '14px', height: '100px', border: '1px solid #f0f0f0' }} />
            ))
          ) : list.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1px solid #f0f0f0' }}>
              <CheckCircle size={40} color="#d1d5db" style={{ marginBottom: '0.8rem' }} />
              <p style={{ color: '#9ca3af', fontWeight: '600' }}>Aucun litige en cours</p>
            </div>
          ) : (
            list.map(l => {
              const ss = STATUT_STYLE[l.statut] || STATUT_STYLE.OUVERT;
              return (
                <motion.div
                  key={l.id}
                  whileHover={{ y: -2 }}
                  style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1px solid #f0f0f0' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AlertTriangle size={20} color="#dc2626" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '700', color: '#1a2e10', fontSize: '0.92rem' }}>
                          Commande #{l.commande_ref || l.commande || l.id?.slice(0, 8)}
                        </span>
                        <span style={{ background: ss.bg, color: ss.color, padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700' }}>
                          {ss.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '4px' }}>
                        <strong>Acheteur :</strong> {l.acheteur_nom || '—'} &nbsp;·&nbsp;
                        <strong>Vendeur :</strong> {l.vendeur_nom || '—'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280', background: '#f9fafb', borderRadius: '8px', padding: '8px 10px', marginBottom: '6px' }}>
                        {l.description || l.motif || 'Aucune description'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                        Signalé le {l.created_at ? new Date(l.created_at).toLocaleDateString('fr-FR') : '—'}
                      </div>
                    </div>
                    {(l.statut === 'OUVERT' || l.statut === 'EN_COURS' || !l.statut) && (
                      <button
                        onClick={() => { setSelected(l); setDecision(''); setCommentaire(''); setMontantAcheteur(''); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <Eye size={14} /> Décider
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Modal décision */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '460px', width: '100%' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.5rem' }}>Résoudre le litige</h3>
              <p style={{ color: '#6b7280', fontSize: '0.82rem', marginBottom: '1rem' }}>
                Commande #{selected.commande_ref || selected.id?.slice(0, 8)}
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Décision *
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { val: 'REMBOURSER_ACHETEUR', label: 'Rembourser l\'acheteur',     color: '#2563eb' },
                    { val: 'LIBERER_VENDEUR',     label: 'Libérer les fonds vendeur',  color: '#1a5c2a' },
                    { val: 'PARTAGER',            label: 'Partager les fonds',          color: '#d97706' },
                    { val: 'FERMER',              label: 'Fermer sans action',          color: '#6b7280' },
                  ].map(d => (
                    <button
                      key={d.val}
                      onClick={() => setDecision(d.val)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '10px',
                        border: `2px solid ${decision === d.val ? d.color : '#e5e7eb'}`,
                        background: decision === d.val ? d.color + '15' : 'white',
                        color: decision === d.val ? d.color : '#374151',
                        fontWeight: decision === d.val ? '700' : '500',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {decision === 'PARTAGER' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>
                    Montant à rembourser à l'acheteur (FCFA) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selected.commande_montant || undefined}
                    step="1"
                    placeholder={selected.commande_montant ? `Max ${selected.commande_montant} FCFA` : ''}
                    value={montantAcheteur}
                    onChange={e => setMontantAcheteur(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
                  />
                  <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '4px 0 0' }}>
                    Le reste ({selected.commande_montant ? `${selected.commande_montant - (Number(montantAcheteur) || 0)} FCFA` : '—'}) sera versé au vendeur.
                  </p>
                </div>
              )}

              <textarea
                placeholder="Commentaire / justification (obligatoire)..."
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
                  onClick={resoudre}
                  disabled={saving || !decision || !commentaire.trim() || (decision === 'PARTAGER' && !(Number(montantAcheteur) > 0))}
                  style={{ padding: '0.6rem 1.4rem', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'En cours...' : 'Confirmer la décision'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
