// ============================================================
// AgroConnect — Deposit Page
// src/pages/finance/Deposit.jsx
// ============================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentMethodSelector from '../../components/finance/PaymentMethodSelector';
import useWallet from '../../hooks/useWallet';
import { WALLET_LIMITS } from '../../config/paymentConfig';
import { formatPrice } from '../../utils/formatPrice';
import { ROUTES } from '../../utils/constants';

const Deposit = () => {
  const navigate = useNavigate();
  const { balance, depositLoading, formErrors, handleDeposit } = useWallet();

  const [amount,   setAmount]   = useState('');
  const [method,   setMethod]   = useState('mtn_momo');
  const [phone,    setPhone]    = useState('');

  const handleQuickAmount = (val) => setAmount(String(val));

  const handleSubmit = async () => {
    const result = await handleDeposit({
      methodId: method,
      phone,
      amount,
    });
    if (result.success) {
      navigate(ROUTES.PAYMENT_STATUS, {
        state: { status: 'success', type: 'deposit', amount: Number(amount) },
      });
    }
  };

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
      <h5 style={styles.title}>Deposit Funds</h5>
      <p style={styles.subtitle}>Add money to your AgroConnect wallet</p>

      <div style={styles.card}>
        {/* Current balance */}
        <div style={styles.balanceRow}>
          <span style={styles.balanceLabel}>Current balance</span>
          <span style={styles.balanceValue}>{formatPrice(balance.available)}</span>
        </div>

        {/* Amount input */}
        <div style={styles.section}>
          <label style={styles.label}>Amount (FCFA)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Enter amount"
            min={WALLET_LIMITS.MIN_DEPOSIT}
            max={WALLET_LIMITS.MAX_DEPOSIT}
            style={{
              ...styles.input,
              borderColor: formErrors.amount ? '#E02424' : '#D1D5DB',
            }}
          />
          {formErrors.amount && (
            <div style={styles.errorText}>{formErrors.amount}</div>
          )}

          {/* Quick amounts */}
          <div style={styles.quickRow}>
            {WALLET_LIMITS.DEPOSIT_QUICK_AMOUNTS.map(val => (
              <button
                key={val}
                style={{
                  ...styles.quickBtn,
                  background: amount === String(val) ? '#16A34A' : '#F3F4F6',
                  color:      amount === String(val) ? '#fff'     : '#374151',
                }}
                onClick={() => handleQuickAmount(val)}
              >
                {formatPrice(val, false)}
              </button>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div style={styles.section}>
          <PaymentMethodSelector
            selectedMethod={method}
            onMethodChange={setMethod}
            phone={phone}
            onPhoneChange={setPhone}
            amount={Number(amount) || 0}
            walletBalance={balance.available}
            error={formErrors}
          />
        </div>

        {/* Submit */}
        <button
          style={{
            ...styles.submitBtn,
            opacity: depositLoading ? 0.7 : 1,
            cursor:  depositLoading ? 'not-allowed' : 'pointer',
          }}
          onClick={handleSubmit}
          disabled={depositLoading}
        >
          {depositLoading ? 'Processing...' : `Deposit ${amount ? formatPrice(Number(amount)) : ''}`}
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrap: {
    maxWidth: '520px',
    margin:   '0 auto',
    padding:  '24px 16px',
  },
  backBtn: {
    background:   'none',
    border:       'none',
    cursor:       'pointer',
    fontSize:     '14px',
    color:        '#6B7280',
    marginBottom: '8px',
    padding:      0,
  },
  title: {
    fontSize:     '22px',
    fontWeight:   700,
    color:        '#1F2937',
    margin:       '0 0 4px',
  },
  subtitle: {
    fontSize:     '14px',
    color:        '#6B7280',
    marginBottom: '20px',
  },
  card: {
    background:   '#fff',
    borderRadius: '16px',
    padding:      '20px',
    border:       '1.5px solid #E5E7EB',
  },
  balanceRow: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    background:     '#F0FDF4',
    borderRadius:   '10px',
    padding:        '10px 14px',
    marginBottom:   '20px',
  },
  balanceLabel: {
    fontSize: '13px',
    color:    '#374151',
  },
  balanceValue: {
    fontSize:   '15px',
    fontWeight: 700,
    color:      '#16A34A',
  },
  section: {
    marginBottom: '20px',
  },
  label: {
    display:      'block',
    fontSize:     '13px',
    fontWeight:   500,
    color:        '#374151',
    marginBottom: '8px',
  },
  input: {
    width:        '100%',
    padding:      '12px 14px',
    borderRadius: '10px',
    border:       '1.5px solid #D1D5DB',
    fontSize:     '16px',
    outline:      'none',
    boxSizing:    'border-box',
  },
  errorText: {
    color:     '#E02424',
    fontSize:  '12px',
    marginTop: '4px',
  },
  quickRow: {
    display:   'flex',
    gap:       '8px',
    flexWrap:  'wrap',
    marginTop: '10px',
  },
  quickBtn: {
    border:       'none',
    borderRadius: '20px',
    padding:      '6px 12px',
    fontSize:     '12px',
    fontWeight:   500,
    cursor:       'pointer',
    transition:   'all .2s',
  },
  submitBtn: {
    width:        '100%',
    padding:      '14px',
    background:   '#16A34A',
    color:        '#fff',
    border:       'none',
    borderRadius: '12px',
    fontWeight:   700,
    fontSize:     '16px',
    cursor:       'pointer',
    marginTop:    '8px',
  },
};

export default Deposit;