import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldX, Eye, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import AdminLayout from '../../Components/layout/AdminLayout';
import AdminService from '../../services/admin.service';

const GREEN  = '#1a5c2a';
const ORANGE = '#d97706';
const RED    = '#dc2626';

function Countdown({ dateISO }) {
  const [remaining, setRemaining] = useState('');
  const [expired, setExpired]     = useState(false);

  useEffect(() => {
    const compute = () => {
      const deadline = new Date(dateISO).getTime() + 5 * 60 * 60 * 1000; // +5h
      const diff = deadline - Date.now();
      if (diff <= 0) { setExpired(true); setRemaining('Délai dépassé'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`);
    };
    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [dateISO]);

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '0.75rem', fontWeight: '700',
      color: expired ? RED : ORANGE,
      background: expired ? '#fee2e2' : '#fef3c7',
      padding: '3px 10px', borderRadius: '20px',
    }}>
      <Clock size={11} /> {remaining}
    </span>
  );
}

function VerifCard({ item, type, onDecision }) {
  const [motif,   setMotif]   = useState('');
  const [open,    setOpen]    = useState(false);
  const [action,  setAction]  = useState('');
  const [saving,  setSaving]  = useState(false);

  const handleDecision = async () => {
    if (!action) return;
    if (action === 'rejeter' && !motif.trim()) return;
    setSaving(true);
    try {
      await AdminService.traiterVerification(item.user_id, type, action, motif);
      onDecision();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const estVerifie = item.est_verifie;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white', borderRadius: '14px', padding: '1.2rem',
        border: `1px solid ${estVerifie ? '#bbf7d0' : '#f0f0f0'}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ShieldCheck size={20} color={GREEN} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#1a2e10' }}>
            {item.prenom} {item.nom}
          </div>
          <div style={{ fontSize: '0.77rem', color: '#6b7280' }}>{item.email}</div>
          {item.telephone && <div style={{ fontSize: '0.77rem', color: '#6b7280' }}>{item.telephone}</div>}
          {item.ville && <div style={{ fontSize: '0.77rem', color: '#9ca3af' }}>{item.ville}</div>}
        </div>

        {/* Statut + countdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
          {estVerifie ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', color: '#16a34a', background: '#dcfce7', padding: '3px 10px', borderRadius: '20px' }}>
              <CheckCircle size={11} /> Vérifié
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', color: ORANGE, background: '#fef3c7', padding: '3px 10px', borderRadius: '20px' }}>
              <Clock size={11} /> En attente
            </span>
          )}
          {!estVerifie && item.date_demande_verification && (
            <Countdown dateISO={item.date_demande_verification} />
          )}
          {item.date_demande_verification && (
            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
              Soumis le {new Date(item.date_demande_verification).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        {/* Documents */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {item.cip_photo && (
            <a href={item.cip_photo} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', textDecoration: 'none' }}>
              <Eye size={12} /> Photo CIP
            </a>
          )}
          {item.licence_business && (
            <a href={item.licence_business} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: '#fdf4ff', color: '#7c3aed', border: '1px solid #e9d5ff', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', textDecoration: 'none' }}>
              <Eye size={12} /> Licence
            </a>
          )}
        </div>

        {/* Boutons */}
        {!estVerifie && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => { setAction('approuver'); setOpen(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#f0fdf4', color: GREEN, border: `1px solid #86efac`, borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
              <ShieldCheck size={13} /> Approuver
            </button>
            <button
              onClick={() => { setAction('rejeter'); setOpen(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#fee2e2', color: RED, border: `1px solid #fca5a5`, borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
              <ShieldX size={13} /> Rejeter
            </button>
          </div>
        )}
      </div>

      {/* Modal inline */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginTop: '1rem', borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}
          >
            <p style={{ margin: '0 0 0.6rem', fontWeight: '700', fontSize: '0.85rem', color: '#1a2e10' }}>
              {action === 'approuver' ? 'Confirmer l\'approbation' : 'Confirmer le rejet'}
              {' '}— {item.prenom} {item.nom}
            </p>
            <textarea
              placeholder={action === 'approuver' ? 'Commentaire (optionnel)…' : 'Motif du rejet (obligatoire)…'}
              value={motif}
              onChange={e => setMotif(e.target.value)}
              rows={2}
              style={{ width: '100%', padding: '0.6rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.84rem', outline: 'none', resize: 'none', marginBottom: '0.7rem', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setOpen(false); setMotif(''); }}
                style={{ padding: '0.5rem 1.1rem', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.84rem' }}>
                Annuler
              </button>
              <button
                onClick={handleDecision}
                disabled={saving || (action === 'rejeter' && !motif.trim())}
                style={{ padding: '0.5rem 1.3rem', background: action === 'approuver' ? GREEN : RED, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.84rem', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'En cours…' : action === 'approuver' ? 'Approuver' : 'Rejeter'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdminVerifications() {
  const [tab,           setTab]           = useState('vendeurs');
  const [vendeurs,      setVendeurs]      = useState([]);
  const [transporteurs, setTransporteurs] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [msg,           setMsg]           = useState('');

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, tRes] = await Promise.allSettled([
        AdminService.getVerificationsVendeurs(),
        AdminService.getVerificationsTransporteurs(),
      ]);
      setVendeurs(vRes.status === 'fulfilled' ? (vRes.value.vendeurs || []) : []);
      setTransporteurs(tRes.status === 'fulfilled' ? (tRes.value.transporteurs || []) : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const handleDecision = () => {
    setMsg('Décision enregistrée. Notification envoyée.');
    setTimeout(() => setMsg(''), 4000);
    charger();
  };

  const pendingVendeurs      = vendeurs.filter(v => !v.est_verifie);
  const pendingTransporteurs = transporteurs.filter(t => !t.est_verifie);
  const list = tab === 'vendeurs' ? vendeurs : transporteurs;
  const type = tab === 'vendeurs' ? 'vendeur' : 'transporteur';

  return (
    <AdminLayout>
      <div>
        {/* En-tête */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>
            Vérifications de comptes
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>
            <span style={{ fontWeight: '700', color: ORANGE }}>{pendingVendeurs.length}</span> vendeur(s) en attente
            {' · '}
            <span style={{ fontWeight: '700', color: ORANGE }}>{pendingTransporteurs.length}</span> transporteur(s) en attente
          </p>
        </div>

        {/* Message succès */}
        <AnimatePresence>
          {msg && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '12px', padding: '4px', marginBottom: '1.5rem', width: 'fit-content' }}>
          {[
            { key: 'vendeurs',      label: `Vendeurs (${pendingVendeurs.length})` },
            { key: 'transporteurs', label: `Transporteurs (${pendingTransporteurs.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                padding: '0.5rem 1.2rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontWeight: '700', fontSize: '0.85rem',
                background: tab === t.key ? 'white' : 'transparent',
                color:      tab === t.key ? '#1a2e10' : '#6b7280',
                boxShadow:  tab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: '90px', borderRadius: '14px', background: '#f3f4f6' }} />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1px solid #f0f0f0' }}>
            <ShieldCheck size={40} color="#d1d5db" style={{ marginBottom: '0.8rem' }} />
            <p style={{ color: '#9ca3af', fontWeight: '600' }}>
              Aucune demande de vérification en attente
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {list.map(item => (
              <VerifCard
                key={item.user_id}
                item={item}
                type={type}
                onDecision={handleDecision}
              />
            ))}
          </div>
        )}

        {/* Légende délai */}
        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#9ca3af' }}>
          <AlertTriangle size={13} color={ORANGE} />
          Le compte à rebours indique le temps restant sur la fenêtre de 5h depuis la demande.
        </div>
      </div>
    </AdminLayout>
  );
}
