// ============================================================
// AgroConnect — Points Converter (pts ↔ FCFA simulator)
// src/components/loyalty/PointsConverter.jsx
// ============================================================
import React, { useState } from 'react';
import { Coins } from 'lucide-react';
import { LOYALTY } from '../../utils/constants';
import { formatPoints, formatPrice } from '../../utils/formatPrice';
import { getPointsRedeemError } from '../../utils/validators';

const PointsConverter = ({
  availablePoints = 0,
  onRedeem,
  loading = false,
}) => {
  const [input,  setInput]  = useState('');
  const [error,  setError]  = useState(null);

  const points  = Number(input) || 0;
  const fcfa    = points * LOYALTY.FCFA_PER_POINT;
  const canRedeem = availablePoints >= LOYALTY.MIN_POINTS_TO_REDEEM;

  const handleChange = (val) => {
    const cleaned = val.replace(/\D/g, '');
    setInput(cleaned);
    setError(null);
  };

  const handleMax = () => {
    setInput(String(availablePoints));
    setError(null);
  };

  const handleSubmit = () => {
    const err = getPointsRedeemError(
      input,
      availablePoints,
      LOYALTY.MIN_POINTS_TO_REDEEM
    );
    if (err) { setError(err); return; }
    onRedeem?.(points);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.title}>
        <Coins size={17} color="#D97706" style={{ verticalAlign: 'middle', marginRight: 6 }} />
        Convertir les points en FCFA
      </div>

      {/* Rate info */}
      <div style={styles.rateRow}>
        <div style={styles.rateBox}>
          <div style={styles.rateValue}>1 pt</div>
          <div style={styles.rateLabel}>= {LOYALTY.FCFA_PER_POINT} FCFA</div>
        </div>
        <div style={styles.arrow}>→</div>
        <div style={styles.rateBox}>
          <div style={styles.rateValue}>{formatPoints(availablePoints)}</div>
          <div style={styles.rateLabel}>available</div>
        </div>
        <div style={styles.arrow}>→</div>
        <div style={styles.rateBox}>
          <div style={styles.rateValue}>
            {formatPrice(availablePoints * LOYALTY.FCFA_PER_POINT)}
          </div>
          <div style={styles.rateLabel}>max value</div>
        </div>
      </div>

      {!canRedeem ? (
        <div style={styles.notice}>
          You need at least {formatPoints(LOYALTY.MIN_POINTS_TO_REDEEM)} to redeem.
          You have {formatPoints(availablePoints)} — need{' '}
          {formatPoints(LOYALTY.MIN_POINTS_TO_REDEEM - availablePoints)} more.
        </div>
      ) : (
        <>
          {/* Input */}
          <div style={styles.inputWrap}>
            <input
              type="text"
              inputMode="numeric"
              value={input}
              onChange={e => handleChange(e.target.value)}
              placeholder={`Min ${LOYALTY.MIN_POINTS_TO_REDEEM} pts`}
              style={{
                ...styles.input,
                borderColor: error ? '#E02424' : '#D1D5DB',
              }}
            />
            <button style={styles.maxBtn} onClick={handleMax}>
              Max
            </button>
          </div>
          {error && <div style={styles.errorText}>{error}</div>}

          {/* Preview */}
          {points > 0 && !error && (
            <div style={styles.preview}>
              <span>{formatPoints(points)}</span>
              <span style={{ opacity: 0.5 }}>→</span>
              <span style={{ color: '#3B6D11', fontWeight: 700 }}>
                +{formatPrice(fcfa)}
              </span>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>
                added to wallet
              </span>
            </div>
          )}

          {/* Submit */}
          <button
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor:  loading ? 'not-allowed' : 'pointer',
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Converting...' : `Convert ${points > 0 ? formatPoints(points) : ''}`}
          </button>
        </>
      )}
    </div>
  );
};

const styles = {
  wrap: {
    background:   '#fff',
    borderRadius: '16px',
    padding:      '20px',
    border:       '1.5px solid #E5E7EB',
  },
  title: {
    fontSize:     '15px',
    fontWeight:   600,
    marginBottom: '16px',
    color:        '#1F2937',
  },
  rateRow: {
    display:        'flex',
    alignItems:     'center',
    gap:            '8px',
    marginBottom:   '16px',
    flexWrap:       'wrap',
  },
  rateBox: {
    background:   '#F9FAFB',
    borderRadius: '10px',
    padding:      '8px 12px',
    textAlign:    'center',
    flex:         1,
    minWidth:     '70px',
  },
  rateValue: {
    fontWeight: 600,
    fontSize:   '14px',
    color:      '#1F2937',
  },
  rateLabel: {
    fontSize: '11px',
    color:    '#6B7280',
    marginTop:'2px',
  },
  arrow: {
    fontSize: '16px',
    color:    '#9CA3AF',
  },
  notice: {
    background:   '#FEF3C7',
    borderRadius: '10px',
    padding:      '12px',
    fontSize:     '13px',
    color:        '#92400E',
  },
  inputWrap: {
    display:  'flex',
    gap:      '8px',
    marginBottom: '6px',
  },
  input: {
    flex:         1,
    padding:      '10px 14px',
    borderRadius: '10px',
    border:       '1.5px solid #D1D5DB',
    fontSize:     '15px',
    outline:      'none',
    boxSizing:    'border-box',
  },
  maxBtn: {
    padding:      '10px 14px',
    background:   '#F3F4F6',
    border:       'none',
    borderRadius: '10px',
    fontWeight:   600,
    fontSize:     '13px',
    cursor:       'pointer',
    color:        '#374151',
  },
  errorText: {
    color:        '#E02424',
    fontSize:     '12px',
    marginBottom: '8px',
  },
  preview: {
    display:      'flex',
    alignItems:   'center',
    gap:          '8px',
    background:   '#EAF3DE',
    borderRadius: '10px',
    padding:      '10px 14px',
    fontSize:     '14px',
    fontWeight:   500,
    marginBottom: '12px',
    flexWrap:     'wrap',
  },
  submitBtn: {
    width:        '100%',
    padding:      '12px',
    background:   '#16A34A',
    color:        '#fff',
    border:       'none',
    borderRadius: '10px',
    fontWeight:   700,
    fontSize:     '15px',
    cursor:       'pointer',
    marginTop:    '4px',
  },
};

export default PointsConverter;