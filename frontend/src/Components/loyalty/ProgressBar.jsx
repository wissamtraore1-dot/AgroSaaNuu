// ============================================================
// AgroConnect — Tier Progress Bar
// src/components/loyalty/ProgressBar.jsx
// ============================================================
import React from 'react';
import { LOYALTY } from '../../utils/constants';
import { formatPoints } from '../../utils/formatPrice';

const ProgressBar = ({ totalPoints = 0 }) => {
  const tiers  = Object.entries(LOYALTY.TIERS);

  return (
    <div style={styles.wrap}>

      {/* Tier milestones */}
      <div style={styles.tiersRow}>
        {tiers.map(([key, tier]) => {
          const reached = totalPoints >= tier.min;
          return (
            <div key={key} style={styles.tierItem}>
              <div style={{
                ...styles.tierDot,
                background:  reached ? tier.color : '#D1D5DB',
                boxShadow:   reached ? `0 0 0 3px ${tier.color}33` : 'none',
              }}>
                <span style={{ fontSize: '14px' }}>{tier.badge}</span>
              </div>
              <div style={{
                ...styles.tierName,
                color: reached ? tier.color : '#9CA3AF',
                fontWeight: reached ? 600 : 400,
              }}>
                {tier.name}
              </div>
              <div style={styles.tierMin}>
                {formatPoints(tier.min)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Track */}
      <div style={styles.track}>
        {tiers.map(([key, tier], i) => {
          // Calculate fill for each segment
          const nextMin = tiers[i + 1]?.[1]?.min ?? tier.min;
          const segStart = tier.min;
          const segEnd   = tiers[i + 1] ? nextMin : tier.min + 1;
          const segLen   = segEnd - segStart;
          const filled   = Math.min(
            Math.max((totalPoints - segStart) / segLen, 0),
            1
          );

          return (
            <div key={key} style={{ flex: 1, position: 'relative' }}>
              <div style={{ ...styles.segment, background: '#E5E7EB' }}>
                <div style={{
                  ...styles.segmentFill,
                  width:      `${filled * 100}%`,
                  background: tier.color,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Current points indicator */}
      <div style={styles.currentRow}>
        <span style={{ fontSize: '13px', color: '#6B7280' }}>Your points</span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
          {formatPoints(totalPoints)}
        </span>
      </div>
    </div>
  );
};

const styles = {
  wrap: {
    padding: '4px 0',
  },
  tiersRow: {
    display:        'flex',
    justifyContent: 'space-between',
    marginBottom:   '8px',
  },
  tierItem: {
    display:    'flex',
    flexDirection:'column',
    alignItems: 'center',
    gap:        '4px',
    flex:       1,
  },
  tierDot: {
    width:          '36px',
    height:         '36px',
    borderRadius:   '50%',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    transition:     'all .3s',
  },
  tierName: {
    fontSize:  '12px',
    textAlign: 'center',
  },
  tierMin: {
    fontSize: '11px',
    color:    '#9CA3AF',
  },
  track: {
    display:      'flex',
    gap:          '4px',
    marginBottom: '10px',
  },
  segment: {
    height:       '8px',
    borderRadius: '20px',
    overflow:     'hidden',
  },
  segmentFill: {
    height:       '100%',
    borderRadius: '20px',
    transition:   'width .6s ease',
  },
  currentRow: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        '8px 12px',
    background:     '#F9FAFB',
    borderRadius:   '8px',
  },
};

export default ProgressBar;