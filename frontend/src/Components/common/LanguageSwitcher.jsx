// src/Components/common/LanguageSwitcher.jsx
// Bouton de bascule FR ↔ EN visible dans la navbar.
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({ style = {} }) {
  const { i18n } = useTranslation();
  const isFr = i18n.language?.startsWith('fr');

  const toggle = () => i18n.changeLanguage(isFr ? 'en' : 'fr');

  return (
    <button
      onClick={toggle}
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
        transition: 'background 0.2s, transform 0.1s',
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.94)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1.06)'}
    >
      <span style={{ fontSize: '1rem' }}>{isFr ? '🇫🇷' : '🇬🇧'}</span>
      <span>{isFr ? 'FR' : 'EN'}</span>
    </button>
  );
}
