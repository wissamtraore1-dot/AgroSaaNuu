// src/Components/common/CompleteProfileModal.jsx
// Modal qui s'affiche quand l'utilisateur doit compléter son profil
// avant d'effectuer une action (ex: achat).
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';
import { User, MapPin, X, Check, AlertCircle, ShieldCheck } from 'lucide-react';

const GREEN = '#1a5c2a';

const VILLES = [
  'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Djougou',
  'Bohicon', 'Kandi', 'Lokossa', 'Ouidah', 'Natitingou',
  'Abomey', 'Nikki', 'Banikoara', 'Malanville', 'Savè',
];

/**
 * Vérifie si le profil utilisateur est complet pour effectuer un achat.
 * @param {object} user — objet user du contexte
 */
export function isProfileComplete(user) {
  if (!user) return false;
  return !!(user.prenom && user.nom && user.cip);
}

/**
 * Modal de complétion de profil.
 *
 * Props :
 *  - onComplete : () => void — appelé après sauvegarde réussie
 *  - onClose    : () => void — appelé si l'utilisateur ferme sans compléter (optionnel)
 */
export default function CompleteProfileModal({ onComplete, onClose }) {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    prenom:    user?.prenom    || '',
    nom:       user?.nom       || '',
    cip:       user?.cip       || '',
    ville:     user?.ville     || '',
  });

  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [cipError, setCipError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');

    if (name === 'cip') {
      if (!/^\d*$/.test(value))
        setCipError('Chiffres uniquement');
      else if (value.length > 0 && (value.length < 8 || value.length > 12))
        setCipError('8 à 12 chiffres requis');
      else
        setCipError('');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.prenom || !form.nom) { setError('Prénom et nom obligatoires'); return; }
    if (!form.cip)                 { setError('Le numéro CIP est obligatoire'); return; }
    if (cipError)                  { setError(cipError); return; }

    setLoading(true); setError('');
    try {
      const res = await AuthService.completeProfile(form);
      updateUser(res.user);
      onComplete?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem',
      backdropFilter: 'blur(3px)',
    }}>
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1,    opacity: 1, y: 0 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          background: 'white', borderRadius: '20px', padding: '2rem',
          maxWidth: '460px', width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
        }}
      >
        {/* En-tête */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={22} color={GREEN} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1a2e10' }}>
                Compléter mon profil
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
                Requis pour effectuer un achat
              </p>
            </div>
          </div>

          {onClose && (
            <button onClick={onClose}
              style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '7px', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
            >
              <X size={16} color="#6b7280" />
            </button>
          )}
        </div>

        {/* Bandeau info */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1.2rem', fontSize: '0.82rem', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>
            Votre CIP (Carte d'Identité Professionnelle) est nécessaire pour sécuriser les transactions.
          </span>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.83rem', color: '#dc2626' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Prénom + Nom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
            <FieldInput
              label="Prénom *" name="prenom" value={form.prenom}
              onChange={handleChange} placeholder="Jean" Icon={User}
            />
            <FieldInput
              label="Nom *" name="nom" value={form.nom}
              onChange={handleChange} placeholder="Dupont" Icon={User}
            />
          </div>

          {/* CIP */}
          <div style={{ marginBottom: '0.8rem' }}>
            <FieldInput
              label="Numéro CIP *" name="cip" value={form.cip}
              onChange={handleChange} placeholder="8 à 12 chiffres" Icon={ShieldCheck}
              error={cipError}
            />
          </div>

          {/* Ville */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>
              Ville
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={15} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <select name="ville" value={form.ville} onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem 1rem', paddingLeft: '2.3rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.88rem', outline: 'none', color: '#1a2e10', background: '#fafafa', cursor: 'pointer', appearance: 'none' }}
              >
                <option value="">Sélectionner une ville</option>
                {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Bouton */}
          <motion.button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '0.9rem',
              background: loading ? '#4db86a' : `linear-gradient(135deg, ${GREEN} 0%, #2d8c47 100%)`,
              color: 'white', border: 'none', borderRadius: '12px',
              fontSize: '0.97rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 4px 20px rgba(26,92,42,0.28)',
            }}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading
              ? 'Enregistrement…'
              : <><Check size={16} /> Enregistrer et continuer</>
            }
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

// Champ de saisie interne
function FieldInput({ label, name, value, onChange, placeholder, Icon, error }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon size={15} color="#9ca3af"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
        )}
        <input
          type="text" name={name} value={value} onChange={onChange} placeholder={placeholder}
          style={{
            width: '100%', padding: '0.75rem 1rem', paddingLeft: Icon ? '2.3rem' : '1rem',
            border: `1.5px solid ${error ? '#ef4444' : '#e5e7eb'}`,
            borderRadius: '10px', fontSize: '0.88rem', outline: 'none',
            color: '#1a2e10', background: '#fafafa', boxSizing: 'border-box',
          }}
        />
      </div>
      {error && (
        <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
}
