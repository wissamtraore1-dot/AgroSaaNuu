// ============================================================
// AgroConnect — Transactions Page
// src/pages/finance/Transactions.jsx
// ============================================================
import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import TransactionItem from '../../components/finance/TransactionItem';
import useWallet from '../../hooks/useWallet';
import { TRANSACTION_TYPE, TRANSACTION_TYPE_LABELS } from '../../utils/constants';

const FILTERS = [
  { label: 'All',       value: null },
  { label: 'Deposits',  value: TRANSACTION_TYPE.DEPOSIT },
  { label: 'Withdrawals', value: TRANSACTION_TYPE.WITHDRAWAL },
  { label: 'Purchases', value: TRANSACTION_TYPE.PURCHASE },
  { label: 'Escrow',    value: TRANSACTION_TYPE.ESCROW_LOCK },
  { label: 'Points',    value: TRANSACTION_TYPE.POINTS_CREDIT },
  { label: 'Refunds',   value: TRANSACTION_TYPE.REFUND },
];

const Transactions = () => {
  const { transactions, loading, fetchTransactions } = useWallet();
  const [activeFilter, setActiveFilter] = useState(null);
  const [page, setPage]                 = useState(1);
  const [hasMore, setHasMore]           = useState(false);

  useEffect(() => {
    load(1, activeFilter);
  }, [activeFilter]);

  const load = async (p, type) => {
    const data = await fetchTransactions({ page: p, type, limit: 10 });
    if (data) setHasMore(!!data.next);
    setPage(p);
  };

  const handleFilter = (val) => {
    setActiveFilter(val);
  };

  const handleLoadMore = () => {
    load(page + 1, activeFilter);
  };

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <h5 style={styles.title}>Transaction History</h5>
      </div>

      {/* Filter chips */}
      <div style={styles.filtersRow}>
        {FILTERS.map(f => (
          <button
            key={String(f.value)}
            onClick={() => handleFilter(f.value)}
            style={{
              ...styles.chip,
              background: activeFilter === f.value ? '#16A34A' : '#F3F4F6',
              color:      activeFilter === f.value ? '#fff'     : '#374151',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={styles.list}>
        {loading && transactions.length === 0 ? (
          [...Array(5)].map((_, i) => (
            <div key={i} style={styles.skeletonRow}>
              <div style={styles.skeletonCircle} />
              <div style={{ flex: 1 }}>
                <div style={styles.skeletonLine} />
                <div style={{ ...styles.skeletonLine, width: '50%', marginTop: '6px' }} />
              </div>
              <div style={{ ...styles.skeletonLine, width: '80px' }} />
            </div>
          ))
        ) : transactions.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><ClipboardList size={40} color="#d1d5db" /></div>
            <div style={styles.emptyText}>No transactions yet</div>
          </div>
        ) : (
          transactions.map((tx, i) => (
            <TransactionItem key={tx.id || i} transaction={tx} />
          ))
        )}
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          style={styles.loadMoreBtn}
          onClick={handleLoadMore}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
};

const styles = {
  wrap: {
    maxWidth:  '680px',
    margin:    '0 auto',
    padding:   '24px 16px',
  },
  header: {
    marginBottom: '16px',
  },
  title: {
    fontSize:   '20px',
    fontWeight: 600,
    color:      '#1F2937',
    margin:     0,
  },
  filtersRow: {
    display:    'flex',
    gap:        '8px',
    flexWrap:   'wrap',
    marginBottom:'16px',
  },
  chip: {
    border:       'none',
    borderRadius: '20px',
    padding:      '6px 14px',
    fontSize:     '13px',
    fontWeight:   500,
    cursor:       'pointer',
    transition:   'all .2s',
  },
  list: {
    background:   '#fff',
    borderRadius: '16px',
    padding:      '4px 16px',
    border:       '1.5px solid #E5E7EB',
  },
  empty: {
    textAlign: 'center',
    padding:   '40px 0',
  },
  emptyText: {
    fontSize:  '15px',
    color:     '#6B7280',
    marginTop: '10px',
  },
  loadMoreBtn: {
    width:        '100%',
    marginTop:    '12px',
    padding:      '12px',
    background:   '#F9FAFB',
    border:       '1.5px solid #E5E7EB',
    borderRadius: '10px',
    fontSize:     '14px',
    fontWeight:   500,
    cursor:       'pointer',
    color:        '#374151',
  },
  skeletonRow: {
    display:      'flex',
    alignItems:   'center',
    gap:          '12px',
    padding:      '12px 0',
    borderBottom: '1px solid #F3F4F6',
  },
  skeletonCircle: {
    width:        '40px',
    height:       '40px',
    borderRadius: '50%',
    background:   '#E5E7EB',
    flexShrink:   0,
  },
  skeletonLine: {
    height:       '14px',
    borderRadius: '6px',
    background:   '#E5E7EB',
    width:        '100%',
  },
};

export default Transactions;