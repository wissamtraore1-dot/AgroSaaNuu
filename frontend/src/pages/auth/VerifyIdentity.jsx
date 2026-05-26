// ============================================================
// AgroConnect — Verify Identity (OTP)
// src/pages/auth/VerifyIdentity.jsx
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthService from '../../services/auth.service';

const VerifyIdentity = () => {
  const navigate         = useNavigate();
  const [params]         = useSearchParams();
  const token            = params.get('token') || '';
  const [otp,    setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);
  const inputs               = useRef([]);

  const handleChange = (val, i) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter the full 6-digit code'); return; }
    try {
      setLoading(true);
      setError(null);
      await AuthService.verifyEmail(token || code);
      setSuccess(true);
      setTimeout(() => navigate('/auth/login'), 2500);
    } catch {
      setError('Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{ fontSize: '52px' }}>✅</div>
        <h4 style={styles.title}>Email Verified!</h4>
        <p style={styles.text}>Your account is confirmed. Redirecting to login...</p>
      </div>
    </div>
  );

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📱</div>
        <h4 style={styles.title}>Verify your identity</h4>
        <p style={styles.text}>Enter the 6-digit code sent to your email</p>

        {/* OTP inputs */}
        <div style={styles.otpRow}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              style={{
                ...styles.otpInput,
                borderColor: error ? '#E02424' : digit ? '#16A34A' : '#D1D5DB',
                color:       digit ? '#1F2937' : '#9CA3AF',
              }}
            />
          ))}
        </div>

        {error && <div style={styles.errorText}>{error}</div>}

        <button
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>

        <button style={styles.ghostBtn} onClick={() => navigate('/auth/login')}>
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrap:     { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: '24px 16px' },
  card:     { background: '#fff', borderRadius: '20px', padding: '40px 32px', maxWidth: '400px', width: '100%', border: '1.5px solid #E5E7EB', textAlign: 'center' },
  title:    { fontSize: '22px', fontWeight: 700, color: '#1F2937', marginBottom: '8px' },
  text:     { fontSize: '14px', color: '#6B7280', lineHeight: 1.6, marginBottom: '24px' },
  otpRow:   { display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px' },
  otpInput: { width: '46px', height: '54px', textAlign: 'center', fontSize: '22px', fontWeight: 700, borderRadius: '10px', border: '2px solid #D1D5DB', outline: 'none', transition: 'border-color .2s' },
  errorText:{ color: '#E02424', fontSize: '13px', marginBottom: '12px' },
  btn:      { width: '100%', padding: '13px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' },
  ghostBtn: { width: '100%', padding: '10px', background: 'transparent', color: '#6B7280', border: 'none', cursor: 'pointer', fontSize: '14px', marginTop: '8px' },
};

export default VerifyIdentity;