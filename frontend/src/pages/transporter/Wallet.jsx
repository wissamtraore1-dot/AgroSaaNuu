import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, ArrowDownCircle, Loader, Clock } from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import WalletService from '../../services/wallet.service';

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

export default function TransporterWallet() {
  const [wallet,       setWallet]       = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      WalletService.monWallet(),
      WalletService.mesTransactions(),
    ]).then(([w, t]) => {
      setWallet(w.wallet || w);
      setTransactions(Array.isArray(t) ? t : t.results || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="transporter">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader size={32} color={GREEN} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </DashboardLayout>
    );
  }

  const solde     = Number(wallet?.solde     || 0);
  const totalRecu = Number(wallet?.total_recu || 0);

  return (
    <DashboardLayout role="transporter">
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* En-tête */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wallet size={22} color={GREEN} /> Mon wallet
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Vos revenus de livraison</p>
        </motion.div>

        {/* Cartes solde */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '1.5rem' }}>
          <motion.div variants={fadeUp} initial="hidden" animate="show"
            style={{ background: `linear-gradient(135deg, ${GREEN}, #2d6a4f)`, borderRadius: '20px', padding: '1.5rem', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', opacity: 0.85, fontSize: '0.82rem', fontWeight: '600' }}>
              <Wallet size={15} /> Solde disponible
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900' }}>
              {solde.toLocaleString('fr-FR')} <span style={{ fontSize: '1rem', fontWeight: '600' }}>FCFA</span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.06 }}
            style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: '#6b7280', fontSize: '0.82rem', fontWeight: '600' }}>
              <TrendingUp size={15} /> Total reçu
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1a2e10' }}>
              {totalRecu.toLocaleString('fr-FR')} <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#6b7280' }}>FCFA</span>
            </div>
          </motion.div>
        </div>

        {/* Historique transactions */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
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
                const s = TYPE_STYLE[t.type] || { bg: '#f3f4f6', color: '#6b7280', label: t.type };
                const montant = Number(t.montant_net || t.montant || 0);
                const sign    = ['RETRAIT', 'PAIEMENT', 'COMMISSION', 'BLOCAGE'].includes(t.type) ? '-' : '+';
                return (
                  <div key={t.id || i}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: i < transactions.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                      {s.label}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.83rem', color: '#374151', fontWeight: '600' }}>{t.description || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                        {t.created_at ? new Date(t.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                      </div>
                    </div>
                    <span style={{ fontWeight: '800', fontSize: '0.92rem', color: sign === '+' ? GREEN : '#dc2626', whiteSpace: 'nowrap' }}>
                      {sign}{montant.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
