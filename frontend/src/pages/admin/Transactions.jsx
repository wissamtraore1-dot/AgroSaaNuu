import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, TrendingDown, Search } from 'lucide-react';
import AdminLayout from '../../Components/layout/AdminLayout';
import AdminService from '../../services/admin.service';

const TYPE_STYLE = {
  DEPOT:     { bg: '#dcfce7', color: '#16a34a', label: 'Dépôt',      icon: TrendingUp   },
  RETRAIT:   { bg: '#fee2e2', color: '#dc2626', label: 'Retrait',    icon: TrendingDown },
  PAIEMENT:  { bg: '#eff6ff', color: '#2563eb', label: 'Paiement',   icon: CreditCard   },
  COMMISSION:{ bg: '#f5f3ff', color: '#7c3aed', label: 'Commission', icon: CreditCard   },
  REMBOURSEMENT: { bg: '#fef3c7', color: '#d97706', label: 'Remboursement', icon: TrendingUp },
};

export default function AdminTransactions() {
  const [txs,     setTxs]     = useState([]);
  const [wallet,  setWallet]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  const charger = () => {
    setLoading(true);
    Promise.allSettled([
      AdminService.getTransactions(search ? { search } : {}),
      AdminService.getPlatformWallet(),
    ]).then(([txRes, walletRes]) => {
      if (txRes.status === 'fulfilled') setTxs(txRes.value.results ?? txRes.value ?? []);
      if (walletRes.status === 'fulfilled') setWallet(walletRes.value);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>Transactions</h1>
          <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>Supervision de toutes les transactions de la plateforme</p>
        </div>

        {/* Wallet plateforme */}
        {wallet && (
          <div className="row g-3 mb-4">
            {[
              { label: 'Solde disponible',    value: wallet.solde_disponible ?? wallet.available ?? 0, color: '#1a5c2a', bg: '#f0fdf4' },
              { label: 'En escrow',           value: wallet.solde_escrow ?? wallet.in_escrow ?? 0,      color: '#2563eb', bg: '#eff6ff' },
              { label: 'Commissions totales', value: wallet.total_commissions ?? 0,                     color: '#7c3aed', bg: '#f5f3ff' },
              { label: 'Volume total',        value: wallet.volume_total ?? 0,                          color: '#d97706', bg: '#fffbeb' },
            ].map((c, i) => (
              <div key={i} className="col-6 col-md-3">
                <div style={{ background: c.bg, borderRadius: '14px', padding: '1rem', border: `1px solid ${c.color}22` }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: c.color, marginBottom: '4px' }}>{c.label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: c.color }}>
                    {Number(c.value).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recherche */}
        <form onSubmit={e => { e.preventDefault(); charger(); }}
          style={{ background: 'white', borderRadius: '14px', padding: '1rem', border: '1px solid #f0f0f0', marginBottom: '1.2rem', display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Référence, utilisateur..."
              style={{ width: '100%', padding: '0.55rem 0.8rem 0.55rem 2rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>
          <button type="submit" style={{ padding: '0.55rem 1rem', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
            Chercher
          </button>
        </form>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0', background: '#fafafa' }}>
                  {['Référence', 'Type', 'Utilisateur', 'Montant', 'Mode', 'Date'].map(h => (
                    <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: '700', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan={6} style={{ padding: '1rem' }}>
                      <div style={{ height: '18px', background: '#f3f4f6', borderRadius: '6px' }} />
                    </td></tr>
                  ))
                ) : txs.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Aucune transaction trouvée</td></tr>
                ) : (
                  txs.map(t => {
                    const ts = TYPE_STYLE[t.type] || { bg: '#f3f4f6', color: '#374151', label: t.type };
                    const montant = Number(t.montant || t.amount || 0);
                    return (
                      <motion.tr key={t.id} whileHover={{ background: '#f9fafb' }} style={{ borderBottom: '1px solid #f9fafb' }}>
                        <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#2563eb' }}>
                          #{t.reference || t.id?.slice(0, 10)}
                        </td>
                        <td style={{ padding: '0.8rem 1rem' }}>
                          <span style={{ background: ts.bg, color: ts.color, padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                            {ts.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.8rem 1rem' }}>
                          <div style={{ fontWeight: '600', color: '#1a2e10' }}>{t.user_nom || t.utilisateur || '—'}</div>
                          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{t.user_email || ''}</div>
                        </td>
                        <td style={{ padding: '0.8rem 1rem', fontWeight: '700', color: montant > 0 ? '#1a5c2a' : '#dc2626' }}>
                          {montant > 0 ? '+' : ''}{montant.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td style={{ padding: '0.8rem 1rem', color: '#6b7280', fontSize: '0.78rem' }}>{t.mode_paiement || '—'}</td>
                        <td style={{ padding: '0.8rem 1rem', color: '#6b7280', fontSize: '0.78rem' }}>
                          {t.created_at ? new Date(t.created_at).toLocaleDateString('fr-FR') : '—'}
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
