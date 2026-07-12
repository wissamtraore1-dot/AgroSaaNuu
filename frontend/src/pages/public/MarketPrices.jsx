import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, Wrench, ArrowLeft } from 'lucide-react';

export default function MarketPrices() {
  return (
    <div style={{ minHeight: '80vh', background: '#f8f9f4', display: 'flex', flexDirection: 'column' }}>

      {/* En-tête vert identique aux autres pages */}
      <div style={{
        background:    'linear-gradient(135deg, #0e2a14 0%, #1a5c2a 60%, #2d8c47 100%)',
        padding:       '3rem 1.5rem 2.5rem',
        textAlign:     'center',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
          <TrendingUp size={28} color="#f0c040" />
          <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '800', margin: 0 }}>
            Prix du marché
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', margin: 0 }}>
          Céréales · Bénin
        </p>
      </div>

      {/* Carte maintenance */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background:    'white',
            borderRadius:  '24px',
            border:        '1.5px solid #e5e7eb',
            padding:       '3rem 2.5rem',
            maxWidth:      '520px',
            width:         '100%',
            textAlign:     'center',
            boxShadow:     '0 8px 40px rgba(0,0,0,0.07)',
          }}
        >
          {/* Icône animée */}
          <motion.div
            animate={{ rotate: [0, -10, 10, -8, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 3 }}
            style={{
              width:          '80px',
              height:         '80px',
              borderRadius:   '50%',
              background:     'linear-gradient(135deg, #f0c04022, #1a5c2a18)',
              border:         '2px solid #f0c04066',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              margin:         '0 auto 1.8rem',
            }}
          >
            <Wrench size={36} color="#d97706" />
          </motion.div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.8rem' }}>
            Page en maintenance
          </h2>

          <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.7, marginBottom: '0.6rem' }}>
            Les données de prix du marché seront saisies manuellement par l'équipe AgroSaaNuu.
          </p>
          <p style={{ fontSize: '0.88rem', color: '#9ca3af', lineHeight: 1.6, marginBottom: '2rem' }}>
            Cette section sera disponible dès que les premiers relevés de prix auront été enregistrés.
            Les données proviendront du <strong style={{ color: '#6b7280' }}>MAEP / ONASA Bénin</strong>.
          </p>

          {/* Badge "bientôt disponible" */}
          <div style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '8px',
            background:     '#fef9c3',
            border:         '1px solid #fde047',
            borderRadius:   '30px',
            padding:        '0.5rem 1.3rem',
            marginBottom:   '2rem',
            fontSize:       '0.88rem',
            fontWeight:     '600',
            color:          '#854d0e',
          }}>
            <Clock size={15} />
            Bientôt disponible
          </div>

          <br />

          <Link
            to="/"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            '8px',
              background:     '#1a5c2a',
              color:          'white',
              padding:        '0.75rem 1.8rem',
              borderRadius:   '30px',
              textDecoration: 'none',
              fontWeight:     '700',
              fontSize:       '0.94rem',
            }}
          >
            <ArrowLeft size={17} />
            Retour à l'accueil
          </Link>
        </motion.div>
      </div>

    </div>
  );
}
