// ============================================================
// AgroConnect — Points History
// src/components/loyalty/PointsHistory.jsx
// ============================================================
import React from 'react';
import { Star, Coins, Gift } from 'lucide-react';
import { formatPoints, formatDate } from '../../utils/formatPrice';

const TYPE_CONFIG = {
  points_credit: { Icon: Star,  label: 'Points earned',    color: '#3B6D11', sign: '+', iconColor: '#F59E0B' },
  points_redeem: { Icon: Coins, label: 'Points converted', color: '#185FA5', sign: '-', iconColor: '#185FA5' },
  bonus:         { Icon: Gift,  label: 'Bonus points',     color: '#D97706', sign: '+', iconColor: '#D97706' },
};

const PointsHistory = ({ history = [], loading = false, onLoadMore, hasMore = false }) => {

  if (loading && history.length === 0) {
    return (
      <div>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={styles.skeletonRow}>
            <div style={styles.skeletonCircle} />
            <div style={{ flex: 1 }}>
              <div style={styles.skeletonLine} />
              <div style={{ ...styles.skeletonLine, width: '50%', marginTop: '6px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!loading && history.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Star size={36} color="#F59E0B" /></div>
        <div style={styles.emptyText}>No points history yet</div>
        <div style={styles.emptySubtext}>
          Earn points by making purchases
        </div>
      </div>
    );
  }

  return (
    <div>
      {history.map((item, i) => {
        const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.points_credit;
        const isEarn = cfg.sign === '+';
        const CfgIcon = cfg.Icon;

        return (
          <div key={item.id || i} style={styles.row}>
            {/* Icon */}
            <div style={styles.iconWrap}>
              <CfgIcon size={18} color={cfg.iconColor} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={styles.rowLabel}>{cfg.label}</div>
              {item.order_id && (
                <div style={styles.rowSub}>Order #{item.order_id}</div>
              )}
              <div style={styles.rowDate}>{formatDate(item.created_at, false)}</div>
            </div>

            {/* Points */}
            <div style={{
              ...styles.points,
              color: isEarn ? '#3B6D11' : '#185FA5',
            }}>
              {cfg.sign}{formatPoints(item.points)}
            </div>
          </div>
        );
      })}

      {/* Load more */}
      {hasMore && (
        <button
          style={styles.loadMoreBtn}
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
};

const styles = {
  row: {
    display:      'flex',
    alignItems:   'center',
    gap:          '12px',
    padding:      '12px 0',
    borderBottom: '1px solid #F3F4F6',
  },
  iconWrap: {
    width:          '40px',
    height:         '40px',
    borderRadius:   '50%',
    background:     '#F9FAFB',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  rowLabel: {
    fontSize:   '14px',
    fontWeight: 500,
    color:      '#1F2937',
  },
  rowSub: {
    fontSize:  '12px',
    color:     '#6B7280',
    marginTop: '1px',
  },
  rowDate: {
    fontSize:  '11px',
    color:     '#9CA3AF',
    marginTop: '2px',
  },
  points: {
    fontWeight:  700,
    fontSize:    '15px',
    flexShrink:  0,
  },
  empty: {
    textAlign: 'center',
    padding:   '40px 20px',
  },
  emptyText: {
    fontSize:   '15px',
    fontWeight: 500,
    color:      '#374151',
    marginTop:  '10px',
  },
  emptySubtext: {
    fontSize:  '13px',
    color:     '#6B7280',
    marginTop: '4px',
  },
  loadMoreBtn: {
    width:        '100%',
    padding:      '10px',
    background:   '#F9FAFB',
    border:       '1.5px solid #E5E7EB',
    borderRadius: '10px',
    fontWeight:   500,
    fontSize:     '14px',
    cursor:       'pointer',
    marginTop:    '12px',
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

export default PointsHistory;