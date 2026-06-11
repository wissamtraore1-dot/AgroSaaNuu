// frontend/src/pages/auth/SMSAuth.jsx - AUTHENTIFICATION COMPLÈTE PAR SMS

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowLeft, Check, AlertCircle, Loader, Leaf, ShoppingCart, Store, Truck } from 'lucide-react';
import authService from '../../services/auth.service';

const SMSAuth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // phone -> role -> otp -> profile
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpId, setOtpId] = useState('');
  const [timer, setTimer] = useState(0);
  const [devCode, setDevCode] = useState('');
  
  // Formulaire profil
  const [profile, setProfile] = useState({
    prenom: '',
    nom: '',
    ville: '',
    adresse: '',
  });
  
  const [existingUser, setExistingUser] = useState(false);

  // ===== ÉTAPE 1: TÉLÉPHONE =====
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phone) {
      setError('Veuillez entrer un numéro');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await authService.requestOTP(phone);
      setOtpId(response.otp_id);
      setTimer(300); // 5 minutes
      setExistingUser(response.existing); // Vérifier si user existe
      if (import.meta.env.DEV && response.code_dev) {
        setDevCode(response.code_dev);
      }
      setStep(existingUser ? 'otp-login' : 'role');
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setLoading(false);
    }
  };

  // ===== ÉTAPE 2: SÉLECTION RÔLE =====
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep('profile');
  };

  // ===== ÉTAPE 3: PROFIL =====
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profile.prenom || !profile.nom) {
      setError('Prénom et nom obligatoires');
      return;
    }

    setStep('otp');
  };

  // DEV MODE: auto-soumission directe sans passer par le DOM (évite conflits Framer Motion)
  React.useEffect(() => {
    if (!import.meta.env.DEV || !devCode) return;
    if (step !== 'otp' && step !== 'otp-login') return;
    if (!phone) return;

    setOtp(devCode.split(''));

    const t = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        let response;
        if (existingUser) {
          response = await authService.phoneLogin(phone, devCode);
        } else {
          response = await authService.verifyOTPAndRegister({
            phone, code: devCode, role,
            prenom: profile.prenom, nom: profile.nom, ville: profile.ville,
          });
        }
        localStorage.setItem('token', response.tokens.access);
        localStorage.setItem('user', JSON.stringify(response.user));
        navigate(`/${response.user.role.toLowerCase()}/dashboard`);
      } catch (err) {
        setError(err.message || 'Code invalide');
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(t);
    // les dépendances step/devCode suffisent : phone/role/profile sont stables quand on arrive ici
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, devCode]);

  // ===== ÉTAPE 4: VÉRIFIER OTP =====
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Veuillez entrer 6 chiffres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (existingUser) {
        // Login existant
        const response = await authService.phoneLogin(phone, otpCode);
        localStorage.setItem('token', response.tokens.access);
        localStorage.setItem('user', JSON.stringify(response.user));
        navigate(`/${response.user.role.toLowerCase()}/dashboard`);
      } else {
        // Nouvelle inscription
        const response = await authService.verifyOTPAndRegister({
          phone,
          code: otpCode,
          role,
          prenom: profile.prenom,
          nom: profile.nom,
          ville: profile.ville,
        });

        localStorage.setItem('token', response.tokens.access);
        localStorage.setItem('user', JSON.stringify(response.user));
        navigate(`/${response.user.role.toLowerCase()}/dashboard`);
      }
    } catch (err) {
      setError(err.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await authService.requestOTP(phone);
      setOtpId(response.otp_id);
      setTimer(300);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError('Erreur lors de l\'envoi du code');
    }
  };

  // Timer countdown
  React.useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    }
  }, [timer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ===== STYLE =====
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    marginTop: '20px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '16px',
    fontFamily: 'inherit',
  };

  const roleButtonStyle = {
    flex: 1,
    padding: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textAlign: 'center',
    margin: '5px',
  };

  const errorStyle = {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  // ===== RENDU =====

  return (
    <div style={containerStyle}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={cardStyle}
      >
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}><Leaf size={48} color="#1a5c2a" /></div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 5px 0' }}>
            AgroSaaNuu
          </h1>
          <p style={{ color: '#666', margin: 0 }}>
            {step === 'phone' && 'Connexion / Inscription'}
            {step === 'role' && 'Sélectionnez votre rôle'}
            {step === 'profile' && 'Complétez votre profil'}
            {(step === 'otp' || step === 'otp-login') && 'Vérifiez votre code'}
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={errorStyle}
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {/* ÉTAPE 1: TÉLÉPHONE */}
        {step === 'phone' && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handlePhoneSubmit}
          >
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              <Phone size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Numéro de téléphone
            </label>
            <input
              type="tel"
              placeholder="+229 01 23 45 67 89"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
            />
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
              Format: +229XXXXXXXXXX (Bénin)
            </p>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <Loader size={16} style={{ display: 'inline', marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                  Envoi...
                </>
              ) : (
                'Continuer'
              )}
            </button>
          </motion.form>
        )}

        {/* ÉTAPE 2: RÔLE */}
        {step === 'role' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setStep('phone')}
              style={{
                background: 'none',
                border: 'none',
                color: '#10b981',
                cursor: 'pointer',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <ArrowLeft size={18} /> Retour
            </button>

            <p style={{ marginBottom: '20px', color: '#666' }}>
              Quel est votre rôle?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'BUYER', Icon: ShoppingCart, label: 'Acheteur', desc: 'Acheter des produits' },
                { key: 'SELLER', Icon: Leaf, label: 'Vendeur', desc: 'Vendre vos produits' },
                { key: 'TRANSPORTER', Icon: Truck, label: 'Transporteur', desc: 'Livrer des commandes' },
              ].map(({ key, Icon, label, desc }) => (
                <motion.button
                  key={key}
                  onClick={() => handleRoleSelect(key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    ...roleButtonStyle,
                    borderColor: role === key ? '#10b981' : '#e0e0e0',
                    background: role === key ? '#f0fdf4' : 'white',
                  }}
                >
                  <strong style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Icon size={16} /> {label}</strong>
                  <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>{desc}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ÉTAPE 3: PROFIL */}
        {step === 'profile' && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleProfileSubmit}
          >
            <button
              type="button"
              onClick={() => setStep('role')}
              style={{
                background: 'none',
                border: 'none',
                color: '#10b981',
                cursor: 'pointer',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <ArrowLeft size={18} /> Retour
            </button>

            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              Prénom
            </label>
            <input
              type="text"
              name="prenom"
              placeholder="Jean"
              value={profile.prenom}
              onChange={handleProfileChange}
              style={inputStyle}
              required
            />

            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              Nom
            </label>
            <input
              type="text"
              name="nom"
              placeholder="Dupont"
              value={profile.nom}
              onChange={handleProfileChange}
              style={inputStyle}
              required
            />

            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              Ville
            </label>
            <input
              type="text"
              name="ville"
              placeholder="Cotonou"
              value={profile.ville}
              onChange={handleProfileChange}
              style={inputStyle}
            />

            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              Adresse (optionnel)
            </label>
            <input
              type="text"
              name="adresse"
              placeholder="Rue..."
              value={profile.adresse}
              onChange={handleProfileChange}
              style={inputStyle}
            />

            <button
              type="submit"
              style={buttonStyle}
            >
              Continuer
            </button>
          </motion.form>
        )}

        {/* ÉTAPE 4: OTP */}
        {(step === 'otp' || step === 'otp-login') && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleOtpSubmit}
          >
            {import.meta.env.DEV && devCode && (
              <div style={{ background: '#fef3c7', border: '1px dashed #f59e0b', borderRadius: '6px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: '#92400e' }}>
                ⚡ DEV MODE — auto-submit avec code: <strong>{devCode}</strong>
              </div>
            )}
            <button
              type="button"
              onClick={() => setStep(existingUser ? 'phone' : 'profile')}
              style={{
                background: 'none',
                border: 'none',
                color: '#10b981',
                cursor: 'pointer',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <ArrowLeft size={18} /> Retour
            </button>

            <p style={{ marginBottom: '20px', color: '#666', textAlign: 'center' }}>
              Entrez les 6 chiffres reçus par SMS
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  style={{
                    width: '50px',
                    height: '50px',
                    fontSize: '24px',
                    textAlign: 'center',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                  }}
                />
              ))}
            </div>

            {timer > 0 ? (
              <p style={{ textAlign: 'center', color: '#10b981', marginBottom: '15px' }}>
                Code expire dans: <strong>{formatTimer(timer)}</strong>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#10b981',
                  cursor: 'pointer',
                  marginBottom: '15px',
                  textDecoration: 'underline',
                  width: '100%',
                }}
              >
                Renvoyer le code
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <Loader size={16} style={{ display: 'inline', marginRight: '8px' }} />
                  Vérification...
                </>
              ) : (
                <>
                  <Check size={16} style={{ display: 'inline', marginRight: '8px' }} />
                  Vérifier
                </>
              )}
            </button>
          </motion.form>
        )}
      </motion.div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SMSAuth;
