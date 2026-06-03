// src/Components/common/LanguageSwitcher.jsx
// Bouton de bascule FR ↔ EN visible dans la navbar.
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function LanguageSwitcher({ style = {} }) {
  const { i18n } = useTranslation();
  const isFr = i18n.language?.startsWith('fr');

  const toggle = () => i18n.changeLanguage(isFr ? 'en' : 'fr');

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      title={isFr ? 'Switch to English' : 'Passer en français'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: '8px',
        padding: '5px 10px',
        cursor: 'pointer',
        fontSize: '0.82rem',
        fontWeight: '700',
        color: 'white',
        letterSpacing: '0.03em',
        transition: 'background 0.2s',
        ...style,
      }}
    >
      <span style={{ fontSize: '1rem' }}>{isFr ? '🇫🇷' : '🇬🇧'}</span>
      {isFr ? 'FR' : 'EN'}
    </motion.button>
  );
}
