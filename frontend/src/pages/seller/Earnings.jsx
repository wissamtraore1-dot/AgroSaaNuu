import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Lock, TrendingUp, ArrowUpRight, Loader, CheckCircle, AlertTriangle, RefreshCw, ClipboardList, Info } from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import WalletService from '../../services/wallet.service';

const GREEN  = '#1a5c2a';
const ORANGE = '#d97706';
const fadeUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

const TABS = [
  { label: 'Toutes',          value: null },
  { label: 'Libérées',        value: 'released' },
  { label: 'En séquestre',    value: 'held'     },
  { label: 'Remboursées',     value: 'refunded' },
];

const STATUT_TX = {
  released: { label: 'Libéré',      bg: '#dcfce7', color: '#16a34a', Icon: CheckCircle  },
  held:     { label: 'En attente',  bg: '#fef3c7', color: '#d97706', Icon: Lock         },
  refunded: { label: 'Remboursé',   bg: '#eff6ff', color: '#2563eb', Icon: RefreshCw    },
  disputed: { label: 'En litige',   bg: '#fee2e2', color: '#dc2626', Icon: AlertTriangle },
};

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

export default function Earnings() {
  const navigate = useNavigate();
  const [wallet,   setWallet]   = useState({ solde: 0, en_attente: 0, total_credit: 0 });
  const [txs,      setTxs]      = useState([]);
  const [tab,      setTab]      = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { charger(); }, [tab]);

  const charger = async () => {
    try {
      setLoading(true);
      const [w, t] = await Promise.all([
        WalletService.monWallet(),
        WalletService.transactions(),
      ]);
      setWallet(w);
      const liste = Array.isArray(t) ? t : t.results || [];
      const filtré = tab ? liste.filter(x => x.escrow_status === tab || x.type === tab) : liste;
      setTxs(filtré);
    } catch {
      // garde les valeurs vides
    } finally {
      setLoading(false);
    }
  };

  const solde      = Number(wallet.solde      ?? wallet.available     ?? 0);
  const enAttente  = Number(wallet.en_attente ?? wallet.in_escrow     ?? 0);
  const totalGagné = Number(wallet.total_credit ?? wallet.total_earned ?? 0);

  return (
    <DashboardLayout role="seller">
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={22} color={GREEN} /><span> Mes gains</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
            Gérez vos revenus et retraits
          </p>
        </motion.div>

        {/* CARTES STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '1.2rem' }}>

          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}
            style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1.5px solid #e5e7eb', borderTop: `3px solid ${GREEN}` }}
          >
            <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '6px' }}>Solde disponible</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: GREEN, marginBottom: '4px' }}>
              {solde.toLocaleString('fr-FR')} FCFA
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '10px' }}>Prêt à retirer</div>
            <motion.button
              onClick={() => navigate('/finance/withdraw')}
              style={{ width: '100%', padding: '0.5rem', background: `linear-gradient(135deg, ${GREEN}, #2d6a4f)`, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              Retirer
            </motion.button>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}
            style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1.5px solid #e5e7eb', borderTop: `3px solid ${ORANGE}` }}
          >
            <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '6px' }}>En séquestre</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: ORANGE, marginBottom: '4px' }}>
              {enAttente.toLocaleString('fr-FR')} FCFA
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '10px' }}>
              Libéré à la confirmation de livraison
            </div>
            <div style={{ fontSize: '0.75rem', color: ORANGE, background: '#fffbeb', borderRadius: '6px', padding: '5px 8px' }}>
              <Lock size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Libéré si l'acheteur confirme (ou auto après 72h)
            </div>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}
            style={{ background: 'white', borderRadius: '14px', padding: '1.2rem', border: '1.5px solid #e5e7eb', borderTop: '3px solid #4f46e5' }}
          >
            <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '6px' }}>Total gagné</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#4f46e5', marginBottom: '4px' }}>
              {totalGagné.toLocaleString('fr-FR')} FCFA
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Depuis l'ouverture du compte</div>
          </motion.div>

        </div>

        {/* EXPLICATION SÉQUESTRE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}
          style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#eef2ff', borderRadius: '14px', padding: '1rem', border: '1.5px solid #c7d2fe', marginBottom: '1.2rem' }}
        >
          <Info size={20} color="#3730a3" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#3730a3', marginBottom: '4px' }}>
              Comment fonctionne le séquestre ?
            </div>
            <div style={{ fontSize: '0.82rem', color: '#4338ca', lineHeight: 1.6 }}>
              Quand un acheteur paie, les fonds sont bloqués en séquestre. Vous les recevez dès que l'acheteur confirme la réception — ou automatiquement après 72h sans réponse.
            </div>
          </div>
        </motion.div>

        {/* HISTORIQUE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.25 }}
          style={{ background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #e5e7eb' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: '700', fontSize: '1rem', color: '#1a2e10', margin: 0 }}>
              Historique des paiements
            </h3>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {TABS.map(t => (
                <button
                  key={String(t.value)}
                  onClick={() => setTab(t.value)}
                  style={{
                    border: 'none', borderRadius: '20px', padding: '5px 12px',
                    fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', transition: 'all .2s',
                    background: tab === t.value ? GREEN   : '#f3f4f6',
                    color:      tab === t.value ? 'white' : '#374151',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Loader size={24} color={GREEN} />
            </div>

          ) : txs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#9ca3af', fontSize: '0.88rem' }}>
              <ClipboardList size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Aucune transaction pour l'instant
            </div>

          ) : (
            txs.map((tx, i) => {
              const cfg = STATUT_TX[tx.escrow_status] || STATUT_TX.held;
              const TxIcon = cfg.Icon;
              return (
                <div key={tx.id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < txs.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TxIcon size={18} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.88rem', color: '#1a2e10' }}>
                      Commande #{tx.order_id || tx.commande_id}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>{formatDate(tx.created_at)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1a2e10' }}>
                      {Number(tx.montant || tx.amount || 0).toLocaleString('fr-FR')} FCFA
                    </div>
                    <span style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: cfg.bg, color: cfg.color, marginTop: '3px' }}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
