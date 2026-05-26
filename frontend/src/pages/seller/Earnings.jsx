// ============================================================
// AgroConnect — Seller Earnings Page
// src/pages/seller/Earnings.jsx
// ============================================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { formatPrice, formatDate, formatRelativeTime } from '../../utils/formatPrice';
import { ESCROW_STATUS, ESCROW_STATUS_LABELS, ROUTES } from '../../utils/constants';
import WalletService from '../../services/wallet.service';

const TABS = [
  { label: 'All',      value: null },
  { label: 'Released', value: ESCROW_STATUS.RELEASED },
  { label: 'In Escrow',value: ESCROW_STATUS.HELD },
  { label: 'Refunded', value: ESCROW_STATUS.REFUNDED },
];

const Earnings = () => {
  const navigate = useNavigate();

  const [summary,      setSummary]      = useState({ available: 0, in_escrow: 0, total_earned: 0 });
  const [transactions, setTransactions] = useState([]);
  const [activeTab,    setActiveTab]    = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bal, txs] = await Promise.all([
        WalletService.getBalance(),
        WalletService.getTransactions({
          type:  activeTab || 'escrow_release',
          limit: 20,
        }),
      ]);
      setSummary({
        available:    bal.available,
        in_escrow:    bal.in_escrow,
        total_earned: bal.total_earned || 0,
      });
      setTransactions(txs.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <h5 style={styles.title}>💰 My Earnings</h5>

      {/* Summary cards */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderTop: '3px solid #16A34A' }}>
          <div style={styles.statLabel}>Available</div>
          <div style={{ ...styles.statValue, color: '#16A34A' }}>
            {formatPrice(summary.available)}
          </div>
          <div style={styles.statSub}>Ready to withdraw</div>
          <button
            style={styles.withdrawBtn}
            onClick={() => navigate(ROUTES.WITHDRAWAL)}
          >
            Withdraw
          </button>
        </div>

        <div style={{ ...styles.statCard, borderTop: '3px solid #D97706' }}>
          <div style={styles.statLabel}>In Escrow</div>
          <div style={{ ...styles.statValue, color: '#D97706' }}>
            {formatPrice(summary.in_escrow)}
          </div>
          <div style={styles.statSub}>Awaiting delivery confirmation</div>
          <div style={styles.escrowNote}>
            🔒 Released when buyer confirms receipt
          </div>
        </div>

        <div style={{ ...styles.statCard, borderTop: '3px solid #4F46E5' }}>
          <div style={styles.statLabel}>Total Earned</div>
          <div style={{ ...styles.statValue, color: '#4F46E5' }}>
            {formatPrice(summary.total_earned)}
          </div>
          <div style={styles.statSub}>All time</div>
        </div>
      </div>

      {/* Escrow explanation */}
      <div style={styles.explainCard}>
        <span style={{ fontSize: '20px' }}>ℹ️</span>
        <div>
          <div style={styles.explainTitle}>How escrow works for sellers</div>
          <div style={styles.explainText}>
            When a buyer pays, the funds are held in escrow. You receive them
            as soon as the buyer confirms delivery — or automatically after 72h
            if the buyer doesn't respond.
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Payment History</div>
          {/* Tabs */}
          <div style={styles.tabs}>
            {TABS.map(tab => (
              <button
                key={String(tab.value)}
                style={{
                  ...styles.tab,
                  background: activeTab === tab.value ? '#16A34A' : '#F3F4F6',
                  color:      activeTab === tab.value ? '#fff'     : '#374151',
                }}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} style={styles.skeletonRow}>
              <div style={styles.skeletonLine} />
            </div>
          ))
        ) : transactions.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: '36px' }}>📋</div>
            <div style={styles.emptyText}>No transactions yet</div>
          </div>
        ) : (
          transactions.map((tx, i) => (
            <div key={tx.id || i} style={styles.txRow}>
              {/* Icon */}
              <div style={{
                ...styles.txIcon,
                background: tx.escrow_status === ESCROW_STATUS.RELEASED
                  ? '#EAF3DE' : '#FEF3C7',
              }}>
                {tx.escrow_status === ESCROW_STATUS.RELEASED ? '✅' : '🔒'}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.txLabel}>
                  Order #{tx.order_id}
                </div>
                <div style={styles.txDate}>
                  {formatRelativeTime(tx.created_at)}
                </div>
              </div>

              {/* Status */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#1F2937' }}>
                  {formatPrice(tx.amount)}
                </div>
                <Badge
                  variant={
                    tx.escrow_status === ESCROW_STATUS.RELEASED ? 'success' :
                    tx.escrow_status === ESCROW_STATUS.HELD      ? 'warning' :
                    tx.escrow_status === ESCROW_STATUS.DISPUTED  ? 'danger'  : 'info'
                  }
                >
                  {ESCROW_STATUS_LABELS[tx.escrow_status] || tx.escrow_status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  wrap:      { padding: '24px 16px', maxWidth: '860px', margin: '0 auto' },
  title:     { fontSize: '22px', fontWeight: 700, color: '#1F2937', marginBottom: '20px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' },
  statCard: {
    background: '#fff', borderRadius: '14px',
    padding: '18px', border: '1.5px solid #E5E7EB',
  },
  statLabel:   { fontSize: '13px', color: '#6B7280', marginBottom: '6px' },
  statValue:   { fontSize: '24px', fontWeight: 700, marginBottom: '4px' },
  statSub:     { fontSize: '12px', color: '#9CA3AF', marginBottom: '10px' },
  withdrawBtn: {
    width: '100%', padding: '8px', background: '#16A34A',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontWeight: 600, fontSize: '13px', cursor: 'pointer',
  },
  escrowNote: {
    fontSize: '12px', color: '#D97706',
    background: '#FFFBEB', borderRadius: '6px', padding: '6px 8px',
  },
  explainCard: {
    display: 'flex', gap: '12px', alignItems: 'flex-start',
    background: '#EEF2FF', borderRadius: '14px',
    padding: '16px', border: '1.5px solid #C7D2FE',
    marginBottom: '16px',
  },
  explainTitle: { fontSize: '14px', fontWeight: 600, color: '#3730A3', marginBottom: '4px' },
  explainText:  { fontSize: '13px', color: '#4338CA', lineHeight: 1.6 },
  card:         { background: '#fff', borderRadius: '16px', padding: '20px', border: '1.5px solid #E5E7EB' },
  cardHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' },
  cardTitle:    { fontSize: '15px', fontWeight: 700, color: '#1F2937' },
  tabs:         { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  tab: {
    border: 'none', borderRadius: '20px', padding: '5px 12px',
    fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all .2s',
  },
  txRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 0', borderBottom: '1px solid #F3F4F6',
  },
  txIcon: {
    width: '40px', height: '40px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', flexShrink: 0,
  },
  txLabel:  { fontSize: '14px', fontWeight: 500, color: '#1F2937' },
  txDate:   { fontSize: '12px', color: '#6B7280', marginTop: '2px' },
  empty:    { textAlign: 'center', padding: '32px 0' },
  emptyText:{ fontSize: '14px', color: '#6B7280', marginTop: '8px' },
  skeletonRow: { padding: '12px 0', borderBottom: '1px solid #F3F4F6' },
  skeletonLine: { height: '16px', background: '#E5E7EB', borderRadius: '6px', width: '100%' },
};

export default Earnings;