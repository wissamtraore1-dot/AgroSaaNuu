import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, ArrowDownCircle, Loader, Clock, PlusCircle } from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import WalletService from '../../services/wallet.service';
import OrderService from '../../services/order.service';
import { useNotificationContext } from '../../context/NotificationContext';

const GREEN  = '#1a5c2a';
const fadeUp = { hidden: { y: 18, opacity: 0 }, show: { y: 0, opacity: 1 } };

const TYPE_STYLE = {
  RECEPTION:   { bg: '#dcfce7', color: '#16a34a', label: 'Reçu'       },
  RETRAIT:     { bg: '#fee2e2', color: '#dc2626', label: 'Retrait'     },
  PAIEMENT:    { bg: '#fef3c7', color: '#d97706', label: 'Paiement'    },
  COMMISSION:  { bg: '#f3f4f6', color: '#6b7280', label: 'Commission'  },
  BLOCAGE:     { bg: '#eff6ff', color: '#2563eb', label: 'Bloqué'      },
  LIBERATION:  { bg: '#dcfce7', color: '#16a34a', label: 'Libéré'      },
  DEPOT:       { bg: '#dcfce7', color: '#16a34a', label: 'Dépôt'       },
  REMBOURSEMENT: { bg: '#eff6ff', color: '#7c3aed', label: 'Remboursé' },
};

export default function SellerWallet() {
  const { success, error: notifError } = useNotificationContext();
  const [wallet,        setWallet]        = useState(null);
  const [transactions,  setTransactions]  = useState([]);
  const [retraits,      setRetraits]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [modalRetrait,  setModalRetrait]  = useState(false);
  const [formRetrait,   setFormRetrait]   = useState({ montant: '', compte_bancaire: '', nom_titulaire: '' });
  const [savingRetrait, setSavingRetrait] = useState(false);

  const charger = async () => {
    try {
      const [w, t, r] = await Promise.all([
        WalletService.monWallet(),
        WalletService.mesTransactions(),
        OrderService.mesRetraits(),
      ]);
      setWallet(w.wallet || w);
      setTransactions(Array.isArray(t) ? t : t.results || []);
      setRetraits(r.retraits || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const handleDemanderRetrait = async () => {
    if (!formRetrait.montant || !formRetrait.compte_bancaire || !formRetrait.nom_titulaire) {
      notifError('Tous les champs sont requis.');
      return;
    }
    setSavingRetrait(true);
    try {
      await OrderService.demandedRetrait(formRetrait);
      success('Demande de retrait soumise. En attente d\'approbation.');
      setModalRetrait(false);
      setFormRetrait({ montant: '', compte_bancaire: '', nom_titulaire: '' });
      charger();
    } catch (e) {
      notifError(e.response?.data?.message || 'Erreur lors de la demande.');
    } finally {
      setSavingRetrait(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="seller">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader size={32} color={GREEN} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </DashboardLayout>
    );
  }

  const solde     = Number(wallet?.solde     || 0);
  const totalRecu = Number(wallet?.total_recu || 0);

  const STATUT_RETRAIT = {
    DEMANDE:     { bg: '#eff6ff', color: '#2563eb', label: 'En attente' },
    APPROUVE:    { bg: '#dcfce7', color: '#16a34a', label: 'Approuvé'   },
    TRAITEMENT:  { bg: '#fef3c7', color: '#d97706', label: 'En cours'   },
    EFFECTUE:    { bg: '#dcfce7', color: '#16a34a', label: 'Effectué'   },
    REJETE:      { bg: '#fee2e2', color: '#dc2626', label: 'Rejeté'     },
  };

  return (
    <DashboardLayout role="seller">
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* En-tête */}
        <motion.div variants={fadeUp} initial="hidden" animate="show"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Wallet size={22} color={GREEN} /> Mon wallet
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Vos revenus de vente</p>
          </div>
          <motion.button onClick={() => setModalRetrait(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `linear-gradient(135deg, ${GREEN}, #2d6a4f)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.7rem 1.4rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <PlusCircle size={16} /> Demander un retrait
          </motion.button>
        </motion.div>

        {/* Soldes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '1.5rem' }}>
          <motion.div variants={fadeUp} initial="hidden" animate="show"
            style={{ background: `linear-gradient(135deg, ${GREEN}, #2d6a4f)`, borderRadius: '20px', padding: '1.5rem', color: 'white' }}>
            <div style={{ opacity: 0.85, fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wallet size={14} /> Solde disponible
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900' }}>
              {solde.toLocaleString('fr-FR')} <span style={{ fontSize: '1rem', fontWeight: '600' }}>FCFA</span>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.06 }}
            style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
            <div style={{ color: '#6b7280', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={14} /> Total reçu
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1a2e10' }}>
              {totalRecu.toLocaleString('fr-FR')} <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#6b7280' }}>FCFA</span>
            </div>
          </motion.div>
        </div>

        {/* Demandes de retrait */}
        {retraits.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.8rem' }}>Mes demandes de retrait</h2>
            <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
              {retraits.map((r, i) => {
                const s = STATUT_RETRAIT[r.statut] || { bg: '#f3f4f6', color: '#6b7280', label: r.statut };
                return (
                  <div key={r.id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: i < retraits.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: '700', whiteSpace: 'nowrap' }}>{s.label}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#1a2e10' }}>{Number(r.montant).toLocaleString('fr-FR')} FCFA</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{r.date_demande ? new Date(r.date_demande).toLocaleDateString('fr-FR') : ''}</div>
                    </div>
                    {r.reference_virement && (
                      <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>Réf : {r.reference_virement}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Transactions */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.12 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color={GREEN} /> Historique des transactions
          </h2>
          {transactions.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>
              <ArrowDownCircle size={40} color="#e5e7eb" style={{ marginBottom: '0.8rem' }} />
              <p style={{ color: '#9ca3af', fontWeight: '600' }}>Aucune transaction pour l'instant</p>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
              {transactions.map((t, i) => {
                const s    = TYPE_STYLE[t.type] || { bg: '#f3f4f6', color: '#6b7280', label: t.type };
                const net  = Number(t.montant_net || t.montant || 0);
                const sign = ['RETRAIT', 'PAIEMENT', 'COMMISSION', 'BLOCAGE'].includes(t.type) ? '-' : '+';
                return (
                  <div key={t.id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: i < transactions.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: '700', whiteSpace: 'nowrap' }}>{s.label}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.83rem', color: '#374151', fontWeight: '600' }}>{t.description || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                        {t.created_at ? new Date(t.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                      </div>
                    </div>
                    <span style={{ fontWeight: '800', fontSize: '0.92rem', color: sign === '+' ? GREEN : '#dc2626', whiteSpace: 'nowrap' }}>
                      {sign}{net.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal demande retrait */}
      {modalRetrait && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => e.target === e.currentTarget && setModalRetrait(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontWeight: '800', color: '#1a2e10', marginBottom: '1.2rem', fontSize: '1.1rem' }}>Demander un retrait</h2>
            {[
              { label: 'Montant (FCFA)', key: 'montant', type: 'number', placeholder: 'Ex: 50000' },
              { label: 'N° compte Mobile Money / Bancaire', key: 'compte_bancaire', type: 'text', placeholder: 'Ex: 0022961XXXXXX' },
              { label: 'Nom du titulaire', key: 'nom_titulaire', type: 'text', placeholder: 'Nom complet' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '0.83rem', color: '#374151', marginBottom: '5px' }}>{label}</label>
                <input type={type} placeholder={placeholder} value={formRetrait[key]}
                  onChange={e => setFormRetrait(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.88rem', color: '#111827', background: 'white', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
              <button onClick={() => setModalRetrait(false)}
                style={{ flex: 1, padding: '0.8rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                Annuler
              </button>
              <button onClick={handleDemanderRetrait} disabled={savingRetrait}
                style={{ flex: 2, padding: '0.8rem', background: `linear-gradient(135deg, ${GREEN}, #2d6a4f)`, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {savingRetrait ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {savingRetrait ? 'Envoi…' : 'Soumettre'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
