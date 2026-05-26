// ============================================================
// AgroConnect — Forgot Password
// src/pages/auth/ForgotPassword.jsx
// ============================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';
import { getEmailError } from '../../utils/validators';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleSubmit = async () => {
    const err = getEmailError(email);
    if (err) { setError(err); return; }
    try {
      setLoading(true);
      setError(null);
      await AuthService.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{ fontSize: '52px', marginBottom: '16px' }}>📧</div>
        <h4 style={styles.title}>Check your email</h4>
        <p style={styles.text}>
          We sent a password reset link to <strong>{email}</strong>.
          Check your inbox and follow the instructions.
        </p>
        <button style={styles.btn} onClick={() => navigate('/auth/login')}>
          Back to Login
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔑</div>
        <h4 style={styles.title}>Forgot Password</h4>
        <p style={styles.text}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <label style={styles.label}>Email address</label>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(null); }}
          placeholder="you@example.com"
          style={{ ...styles.input, borderColor: error ? '#E02424' : '#D1D5DB' }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        {error && <div style={styles.errorText}>{error}</div>}

        <button
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <button style={styles.ghostBtn} onClick={() => navigate('/auth/login')}>
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrap:      { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: '24px 16px' },
  card:      { background: '#fff', borderRadius: '20px', padding: '40px 32px', maxWidth: '420px', width: '100%', border: '1.5px solid #E5E7EB', textAlign: 'center' },
  title:     { fontSize: '22px', fontWeight: 700, color: '#1F2937', marginBottom: '8px' },
  text:      { fontSize: '14px', color: '#6B7280', lineHeight: 1.6, marginBottom: '24px' },
  label:     { display: 'block', textAlign: 'left', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' },
  input:     { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '6px' },
  errorText: { color: '#E02424', fontSize: '12px', textAlign: 'left', marginBottom: '10px' },
  btn:       { width: '100%', padding: '13px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginTop: '8px' },
  ghostBtn:  { width: '100%', padding: '10px', background: 'transparent', color: '#6B7280', border: 'none', cursor: 'pointer', fontSize: '14px', marginTop: '8px' },
};

export default ForgotPassword;