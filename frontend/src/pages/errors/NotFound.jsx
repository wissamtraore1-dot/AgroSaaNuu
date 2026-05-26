// ============================================================
// AgroConnect — 404 Not Found
// src/pages/errors/NotFound.jsx
// ============================================================
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={styles.page}>
      <motion.div
        style={styles.content}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={styles.code}>404</div>
        <h1 style={styles.title}>Page introuvable</h1>
        <p style={styles.desc}>
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div style={styles.btns}>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link to="/" style={styles.btnHome}>
              <Home size={16} /> Accueil
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <button onClick={() => window.history.back()} style={styles.btnBack}>
              <ArrowLeft size={16} /> Retour
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  page:    { minHeight: '100vh', background: '#f8f9f4', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  content: { textAlign: 'center', padding: '2rem' },
  code:    { fontSize: '8rem', fontWeight: '900', color: '#e5e7eb', lineHeight: 1 },
  title:   { fontSize: '1.8rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.8rem' },
  desc:    { fontSize: '1rem', color: '#6b7280', marginBottom: '2rem' },
  btns:    { display: 'flex', gap: '12px', justifyContent: 'center' },
  btnHome: { display: 'flex', alignItems: 'center', gap: '6px', background: '#1a5c2a', color: 'white', padding: '0.7rem 1.5rem', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' },
  btnBack: { display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: '#374151', border: '1.5px solid #e5e7eb', padding: '0.7rem 1.5rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' },
};