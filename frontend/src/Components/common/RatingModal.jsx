// src/Components/common/RatingModal.jsx
// Modal de notation (vendeur ou transporteur).
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, X, Check, Loader } from 'lucide-react';

const GREEN = '#1a5c2a';
const YELLOW = '#f0c040';

/**
 * Props:
 *  - title       : string — ex. "Noter le vendeur"
 *  - subtitle    : string — ex. "Comment s'est passée votre transaction ?"
 *  - onSubmit    : async (note, commentaire) => void
 *  - onClose     : () => void
 *  - loading     : bool (external)
 */
export default function RatingModal({ title, subtitle, onSubmit, onClose, loading = false }) {
  const [hover,       setHover]       = useState(0);
  const [selected,    setSelected]    = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [error,       setError]       = useState('');

  const labels = ['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'];

  const handleSubmit = async () => {
    if (!selected) { setError('Veuillez attribuer une note'); return; }
    setError('');
    await onSubmit(selected, commentaire);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem', backdropFilter: 'blur(3px)' }}>
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '400px', width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1a2e10' }}>{title}</h3>
            {subtitle && <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: '#6b7280' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '7px', cursor: 'pointer', display: 'flex' }}>
            <X size={16} color="#6b7280" />
          </button>
        </div>

        {/* Étoiles */}
        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <motion.button key={n} type="button"
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setSelected(n)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
              >
                <Star
                  size={36}
                  fill={(hover || selected) >= n ? YELLOW : 'none'}
                  color={(hover || selected) >= n ? YELLOW : '#d1d5db'}
                  strokeWidth={1.5}
                />
              </motion.button>
            ))}
          </div>
          {(hover || selected) > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: YELLOW }}
            >
              {labels[hover || selected]}
            </motion.p>
          )}
        </div>

        {/* Commentaire */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
            Commentaire (optionnel)
          </label>
          <textarea
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
            placeholder="Partagez votre expérience…"
            rows={3}
            style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.88rem', outline: 'none', color: '#1a2e10', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>

        {error && (
          <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: '-0.5rem 0 0.8rem', textAlign: 'center' }}>{error}</p>
        )}

        {/* Bouton */}
        <motion.button onClick={handleSubmit} disabled={loading || !selected}
          style={{
            width: '100%', padding: '0.9rem',
            background: selected ? `linear-gradient(135deg, ${GREEN}, #2d8c47)` : '#e5e7eb',
            color: selected ? 'white' : '#9ca3af',
            border: 'none', borderRadius: '12px', fontSize: '0.97rem', fontWeight: '700',
            cursor: selected ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: selected ? '0 4px 20px rgba(26,92,42,0.3)' : 'none',
          }}
          whileHover={{ scale: selected && !loading ? 1.02 : 1 }}
          whileTap={{ scale: selected && !loading ? 0.98 : 1 }}
        >
          {loading ? <><Loader size={16} /> Envoi…</> : <><Check size={16} /> Envoyer l'évaluation</>}
        </motion.button>
      </motion.div>
    </div>
  );
}
