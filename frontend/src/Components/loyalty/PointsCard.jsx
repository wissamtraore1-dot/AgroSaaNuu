// ============================================================
// AgroConnect — Points Card (dashboard widget)
// src/components/loyalty/PointsCard.jsx
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Crown, Gem } from 'lucide-react';
import { formatPoints, formatPrice } from '../../utils/formatPrice';
import { ROUTES, LOYALTY } from '../../utils/constants';

const TIER_ICONS = {
  BRONZE:  <Award size={14} color="#CD7F32" />,
  ARGENT:  <Award size={14} color="#A8A9AD" />,
  OR:      <Crown size={14} color="#FFD700" />,
  PLATINE: <Gem   size={14} color="#4F46E5" />,
};

const PointsCard = ({ points = {}, loading = false, compact = false }) => {
  const navigate = useNavigate();
  const {
    balance       = 0,
    tier          = null,
    tier_progress = 0,
  } = points;

  const canRedeem = balance >= LOYALTY.MIN_POINTS_TO_REDEEM;
  const valueInFcfa = balance * LOYALTY.FCFA_PER_POINT;

  if (loading) {
    return (
      <div style={{ ...styles.card, background: '#E5E7EB' }}>
        <div style={styles.skeleton} />
        <div style={{ ...styles.skeleton, width: '60%', marginTop: '8px' }} />
      </div>
    );
  }

  const tierData = tier || { name: 'Bronze', color: '#CD7F32' };
  const tierKey  = tierData.name?.toUpperCase() === 'OR' ? 'OR'
    : tierData.name?.toUpperCase() === 'ARGENT' ? 'ARGENT'
    : tierData.name?.toUpperCase() === 'PLATINE' ? 'PLATINE'
    : 'BRONZE';

  return (
    <div style={{
      ...styles.card,
      background: 'linear-gradient(135deg, #1a5c2a 0%, #2d8c47 100%)',
    }}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.tierBadge}>
            <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: 4 }}>{TIER_ICONS[tierKey]}</span>
            {tierData.name}
          </span>
        </div>
        <button
          style={styles.detailBtn}
          onClick={() => navigate(ROUTES.BUYER_POINTS)}
        >
          View all
        </button>
      </div>

      {/* Points balance */}
      <div style={styles.balance}>{formatPoints(balance)}</div>
      <div style={styles.subLabel}>
        ≈ {formatPrice(valueInFcfa)} value
      </div>

      {/* Progress bar to next tier */}
      {tier && tier.max && (
        <div style={{ marginTop: '12px' }}>
          <div style={styles.progressLabel}>
            <span>Progress to next tier</span>
            <span>{tier_progress}%</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{
              ...styles.progressFill,
              width: `${tier_progress}%`,
            }} />
          </div>
        </div>
      )}

      {/* Redeem button */}
      {!compact && (
        <button
          style={{
            ...styles.redeemBtn,
            opacity: canRedeem ? 1 : 0.5,
            cursor:  canRedeem ? 'pointer' : 'not-allowed',
          }}
          onClick={() => canRedeem && navigate(ROUTES.BUYER_POINTS)}
          disabled={!canRedeem}
        >
          {canRedeem
            ? `Convert to ${formatPrice(valueInFcfa)}`
            : `Need ${LOYALTY.MIN_POINTS_TO_REDEEM - balance} more pts to redeem`}
        </button>
      )}
    </div>
  );
};

const styles = {
  card: {
    borderRadius: '16px',
    padding:      '20px',
    color:        '#fff',
  },
  header: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   '12px',
  },
  tierBadge: {
    fontSize:     '13px',
    fontWeight:   600,
    background:   'rgba(255,255,255,0.25)',
    padding:      '3px 10px',
    borderRadius: '20px',
  },
  detailBtn: {
    background:   'rgba(255,255,255,0.2)',
    border:       'none',
    borderRadius: '20px',
    color:        '#fff',
    padding:      '4px 12px',
    fontSize:     '12px',
    cursor:       'pointer',
  },
  balance: {
    fontSize:   '28px',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  subLabel: {
    fontSize:  '13px',
    opacity:   0.8,
    marginTop: '2px',
  },
  progressLabel: {
    display:        'flex',
    justifyContent: 'space-between',
    fontSize:       '11px',
    opacity:        0.85,
    marginBottom:   '5px',
  },
  progressTrack: {
    background:   'rgba(255,255,255,0.3)',
    borderRadius: '20px',
    height:       '6px',
    overflow:     'hidden',
  },
  progressFill: {
    height:       '100%',
    background:   '#fff',
    borderRadius: '20px',
    transition:   'width .6s ease',
  },
  redeemBtn: {
    width:        '100%',
    marginTop:    '14px',
    background:   'rgba(255,255,255,0.25)',
    border:       '1.5px solid rgba(255,255,255,0.5)',
    borderRadius: '10px',
    color:        '#fff',
    padding:      '10px',
    fontWeight:   600,
    fontSize:     '13px',
    cursor:       'pointer',
    transition:   'background .2s',
  },
  skeleton: {
    background:   'rgba(255,255,255,0.3)',
    borderRadius: '6px',
    height:       '24px',
    width:        '100%',
  },
};

export default PointsCard;