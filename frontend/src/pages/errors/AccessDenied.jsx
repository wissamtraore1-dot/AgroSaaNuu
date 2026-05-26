// ============================================================
// AgroConnect — 403 Access Denied
// src/pages/errors/AccessDenied.jsx
// ============================================================
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Home } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div style={styles.page}>
      <motion.div
        style={styles.content}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={styles.iconWrap}>
          <Shield size={60} color="#dc2626" />
        </div>
        <div style={styles.code}>403</div>
        <h1 style={styles.title}>Accès refusé</h1>
        <p style={styles.desc}>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link to="/" style={styles.btnHome}>
            <Home size={16} /> Retour à l'accueil
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

const styles = {
  page:    { minHeight: '100vh', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  content: { textAlign: 'center', padding: '2rem' },
  iconWrap:{ marginBottom: '1rem' },
  code:    { fontSize: '6rem', fontWeight: '900', color: '#fecaca', lineHeight: 1 },
  title:   { fontSize: '1.8rem', fontWeight: '800', color: '#991b1b', marginBottom: '0.8rem' },
  desc:    { fontSize: '1rem', color: '#6b7280', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' },
  btnHome: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dc2626', color: 'white', padding: '0.7rem 1.5rem', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' },
};