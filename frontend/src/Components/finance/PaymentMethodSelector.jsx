// ============================================================
// AgroSaaNuu — Payment Method Selector
// src/components/finance/PaymentMethodSelector.jsx
// ============================================================
import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { PAYMENT_METHODS_LIST } from '../../config/paymentConfig';
import { formatPhoneInput, detectOperator, calcFees } from '../../utils/paymentMethods';
import { formatPrice } from '../../utils/formatPrice';

const PaymentMethodSelector = ({
  selectedMethod,
  onMethodChange,
  phone,
  onPhoneChange,
  amount = 0,
  walletBalance = 0,
  error = {},
}) => {
  const [detectedOp, setDetectedOp] = useState(null);

  useEffect(() => {
    if (phone) setDetectedOp(detectOperator(phone));
  }, [phone]);

  const { fee, total } = calcFees(selectedMethod, amount);

  return (
    <div>
      <div style={styles.label}>Payment method</div>

      {/* Method cards */}
      <div style={styles.grid}>
        {PAYMENT_METHODS_LIST.map(method => {
          // Disable wallet if balance insufficient
          const disabled = method.id === 'wallet' && walletBalance < amount;
          const selected = selectedMethod === method.id;

          return (
            <div
              key={method.id}
              onClick={() => !disabled && onMethodChange(method.id)}
              style={{
                ...styles.card,
                border: selected
                  ? `2px solid ${method.color}`
                  : '2px solid #E5E7EB',
                opacity:  disabled ? 0.45 : 1,
                cursor:   disabled ? 'not-allowed' : 'pointer',
                background: selected ? `${method.color}15` : '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '28px' }}>
                {method.id === 'wallet'
                  ? <CreditCard size={22} color={method.color} />
                  : <div style={{ width: 22, height: 22, borderRadius: '50%', background: method.id === 'mtn_momo' ? '#FCD34D' : method.id === 'moov_money' ? '#3B82F6' : '#EF4444' }} />
                }
              </div>
              <div style={styles.methodName}>{method.shortName}</div>
              {method.id === 'wallet' && (
                <div style={styles.walletBalance}>
                  {formatPrice(walletBalance)}
                </div>
              )}
              {method.fees.percent > 0 && (
                <div style={styles.feeTag}>{method.fees.percent}% fee</div>
              )}
              {method.fees.percent === 0 && (
                <div style={{ ...styles.feeTag, color: '#3B6D11' }}>No fee</div>
              )}
              {disabled && (
                <div style={{ fontSize: '10px', color: '#E02424', marginTop: '2px' }}>
                  Insufficient balance
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Phone input — only for mobile money */}
      {selectedMethod && selectedMethod !== 'wallet' && (
        <div style={{ marginTop: '16px' }}>
          <label style={styles.label}>
            Mobile money number
            {detectedOp && (
              <span style={{ marginLeft: '8px', color: detectedOp.color, fontWeight: 600 }}>
                ({detectedOp.shortName})
              </span>
            )}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => onPhoneChange(formatPhoneInput(e.target.value))}
            placeholder={
              PAYMENT_METHODS_LIST.find(m => m.id === selectedMethod)?.placeholder || 'XX XX XX XX'
            }
            style={{
              ...styles.input,
              borderColor: error.phone ? '#E02424' : '#D1D5DB',
            }}
          />
          {error.phone && (
            <div style={styles.errorText}>{error.phone}</div>
          )}
        </div>
      )}

      {/* Fee summary */}
      {amount > 0 && selectedMethod && (
        <div style={styles.summary}>
          <div style={styles.summaryRow}>
            <span>Amount</span>
            <span>{formatPrice(amount)}</span>
          </div>
          <div style={styles.summaryRow}>
            <span>Fees</span>
            <span style={{ color: fee > 0 ? '#9B1C1C' : '#3B6D11' }}>
              {fee > 0 ? formatPrice(fee) : 'Free'}
            </span>
          </div>
          <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: '15px' }}>
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  label: {
    fontSize:     '13px',
    fontWeight:   500,
    color:        '#374151',
    marginBottom: '8px',
    display:      'block',
  },
  grid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap:                 '10px',
  },
  card: {
    borderRadius: '12px',
    padding:      '12px',
    textAlign:    'center',
    transition:   'all .2s',
  },
  methodName: {
    fontSize:   '12px',
    fontWeight: 600,
    marginTop:  '6px',
  },
  walletBalance: {
    fontSize: '11px',
    color:    '#6B7280',
  },
  feeTag: {
    fontSize:  '10px',
    color:     '#6B7280',
    marginTop: '2px',
  },
  input: {
    width:        '100%',
    padding:      '10px 14px',
    borderRadius: '10px',
    border:       '1.5px solid #D1D5DB',
    fontSize:     '15px',
    outline:      'none',
    letterSpacing:'2px',
    boxSizing:    'border-box',
  },
  errorText: {
    color:     '#E02424',
    fontSize:  '12px',
    marginTop: '4px',
  },
  summary: {
    background:    '#F9FAFB',
    borderRadius:  '10px',
    padding:       '12px 14px',
    marginTop:     '16px',
    display:       'flex',
    flexDirection: 'column',
    gap:           '6px',
  },
  summaryRow: {
    display:        'flex',
    justifyContent: 'space-between',
    fontSize:       '14px',
    color:          '#374151',
  },
};

export default PaymentMethodSelector;