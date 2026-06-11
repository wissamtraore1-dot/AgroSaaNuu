import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Phone, Mail, MapPin, Clock,
  Send, CheckCircle, AlertCircle,
  MessageSquare, HelpCircle, Building,
  Share2, MessageCircle, Radio, Loader
} from 'lucide-react';

// ===== MOCK DATA =====
const infosContact = [
  {
    icon:    Phone,
    titre:   'Téléphone',
    valeur:  '+229 01 XX XX XX XX',
    sous:    'Lun – Sam, 8h – 18h',
    color:   '#1a5c2a',
    bg:      '#f0fdf4',
  },
  {
    icon:    Mail,
    titre:   'Email',
    valeur:  'contact@agroconnect.bj',
    sous:    'Réponse sous 24h',
    color:   '#2563eb',
    bg:      '#eff6ff',
  },
  {
    icon:    MapPin,
    titre:   'Adresse',
    valeur:  'Carré 109, Cotonou',
    sous:    'Bénin, Afrique de l\'Ouest',
    color:   '#d97706',
    bg:      '#fffbeb',
  },
  {
    icon:    Clock,
    titre:   'Horaires',
    valeur:  'Lun – Sam : 8h – 18h',
    sous:    'Fermé le dimanche',
    color:   '#7c3aed',
    bg:      '#f5f3ff',
  },
];

const sujets = [
  'Sélectionnez un sujet',
  'Problème technique',
  'Question sur une commande',
  'Signaler un utilisateur',
  'Devenir partenaire',
  'Presse & médias',
  'Autre',
];

const faq = [
  {
    question: 'Comment créer un compte vendeur ?',
    reponse:  'Cliquez sur "S\'inscrire", sélectionnez le rôle "Vendeur", remplissez le formulaire avec votre CIP et les informations de votre coopérative.',
  },
  {
    question: 'Quels modes de paiement sont acceptés ?',
    reponse:  'AgroConnect accepte MTN Mobile Money, Moov Money, Celtis et les virements bancaires classiques.',
  },
  {
    question: 'Comment suivre ma commande ?',
    reponse:  'Connectez-vous à votre espace acheteur, rendez-vous dans "Mes commandes" et cliquez sur "Suivi" pour voir l\'état en temps réel.',
  },
  {
    question: 'Comment contacter un vendeur ?',
    reponse:  'Sur la fiche produit ou le profil du vendeur, cliquez sur "Contacter" pour envoyer un message directement.',
  },
];

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

export default function Contact() {
  const [form, setForm]         = useState({ nom: '', email: '', telephone: '', sujet: '', message: '' });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');
  const [faqOpen, setFaqOpen]   = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.message || form.sujet === 'Sélectionnez un sujet') {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setForm({ nom: '', email: '', telephone: '', sujet: '', message: '' });
    }, 1800);
  };

  return (
    <div style={{ background: '#f8f9f4', minHeight: '100vh' }}>

      {/* ===== HERO ===== */}
      <div style={styles.hero}>
        <div className="container-fluid px-4 px-lg-5">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div style={styles.heroBreadcrumb}>
              <Link to="/" style={styles.breadLink}>Accueil</Link>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>
              <span style={{ color: 'white' }}>Contact</span>
            </div>
            <h1 style={styles.heroTitle}><Phone size={32} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Contactez-nous</h1>
            <p style={styles.heroSub}>
              Notre équipe est disponible pour répondre à toutes vos questions
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-fluid px-4 px-lg-5 py-5">

        {/* ===== INFOS DE CONTACT ===== */}
        <div className="row g-3 mb-5">
          {infosContact.map((info, i) => {
            const Icon = info.icon;
            return (
              <motion.div
                key={i}
                className="col-6 col-lg-3"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: i * 0.1 }}
              >
                <motion.div
                  style={styles.infoCard}
                  whileHover={{ y: -5, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                >
                  <div style={{ ...styles.infoIcon, background: info.bg }}>
                    <Icon size={24} color={info.color} strokeWidth={2} />
                  </div>
                  <h4 style={styles.infoTitre}>{info.titre}</h4>
                  <p style={{ ...styles.infoValeur, color: info.color }}>{info.valeur}</p>
                  <p style={styles.infoSous}>{info.sous}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <div className="row g-5">

          {/* ===== FORMULAIRE ===== */}
          <motion.div
            className="col-12 col-lg-7"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.3 }}
          >
            <div style={styles.formCard}>
              <div style={styles.formHeader}>
                <MessageSquare size={20} color="#1a5c2a" />
                <h3 style={styles.formTitle}>Envoyez-nous un message</h3>
              </div>

              {/* SUCCÈS */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    style={styles.successBox}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <CheckCircle size={40} color="#16a34a" />
                    <h4 style={{ color: '#16a34a', margin: '0.8rem 0 0.4rem' }}>
                      Message envoyé !
                    </h4>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
                      Nous vous répondrons dans les 24 heures.
                    </p>
                    <motion.button
                      style={styles.btnNouveauMsg}
                      onClick={() => setSuccess(false)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Envoyer un autre message
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!success && (
                <form onSubmit={handleSubmit}>

                  {/* ERREUR */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        style={styles.errorBox}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <AlertCircle size={15} />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="row g-3">

                    {/* NOM */}
                    <div className="col-12 col-md-6">
                      <div style={styles.fieldWrap}>
                        <label style={styles.label}>Nom complet *</label>
                        <input
                          type="text"
                          name="nom"
                          value={form.nom}
                          onChange={handleChange}
                          placeholder="Votre nom complet"
                          style={styles.input}
                        />
                      </div>
                    </div>

                    {/* EMAIL */}
                    <div className="col-12 col-md-6">
                      <div style={styles.fieldWrap}>
                        <label style={styles.label}>Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="votre@email.com"
                          style={styles.input}
                        />
                      </div>
                    </div>

                    {/* TÉLÉPHONE */}
                    <div className="col-12 col-md-6">
                      <div style={styles.fieldWrap}>
                        <label style={styles.label}>Téléphone</label>
                        <input
                          type="tel"
                          name="telephone"
                          value={form.telephone}
                          onChange={handleChange}
                          placeholder="+229 XX XX XX XX"
                          style={styles.input}
                        />
                      </div>
                    </div>

                    {/* SUJET */}
                    <div className="col-12 col-md-6">
                      <div style={styles.fieldWrap}>
                        <label style={styles.label}>Sujet *</label>
                        <select
                          name="sujet"
                          value={form.sujet}
                          onChange={handleChange}
                          style={styles.select}
                        >
                          {sujets.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* MESSAGE */}
                    <div className="col-12">
                      <div style={styles.fieldWrap}>
                        <label style={styles.label}>Message *</label>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Décrivez votre demande en détail..."
                          rows={5}
                          style={{ ...styles.input, resize: 'vertical', minHeight: '120px' }}
                        />
                        <span style={styles.charCount}>
                          {form.message.length} / 500 caractères
                        </span>
                      </div>
                    </div>

                    {/* BOUTON SUBMIT */}
                    <div className="col-12">
                      <motion.button
                        type="submit"
                        style={{ ...styles.submitBtn, opacity: loading ? 0.8 : 1 }}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        disabled={loading}
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Loader size={18} />
                          </motion.div>
                        ) : (
                          <>
                            <Send size={18} />
                            Envoyer le message
                          </>
                        )}
                      </motion.button>
                    </div>

                  </div>
                </form>
              )}

            </div>
          </motion.div>

          {/* ===== FAQ + RÉSEAUX ===== */}
          <motion.div
            className="col-12 col-lg-5"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.4 }}
          >

            {/* FAQ */}
            <div style={styles.faqCard}>
              <div style={styles.formHeader}>
                <HelpCircle size={20} color="#1a5c2a" />
                <h3 style={styles.formTitle}>Questions fréquentes</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {faq.map((item, i) => (
                  <motion.div
                    key={i}
                    style={styles.faqItem}
                    initial={false}
                  >
                    <motion.button
                      style={styles.faqQuestion}
                      onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      whileHover={{ background: '#f9fafb' }}
                    >
                      <span style={{ flex: 1, textAlign: 'left' }}>{item.question}</span>
                      <motion.span
                        animate={{ rotate: faqOpen === i ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ fontSize: '1.1rem', color: '#1a5c2a', flexShrink: 0 }}
                      >
                        ▼
                      </motion.span>
                    </motion.button>

                    <AnimatePresence>
                      {faqOpen === i && (
                        <motion.div
                          style={styles.faqReponse}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <p style={{ margin: 0, fontSize: '0.87rem', color: '#6b7280', lineHeight: 1.6 }}>
                            {item.reponse}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* RÉSEAUX SOCIAUX */}
            <motion.div
              style={styles.sociauxCard}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.5 }}
            >
              <div style={styles.formHeader}>
                <Building size={20} color="#1a5c2a" />
                <h3 style={styles.formTitle}>Suivez-nous</h3>
              </div>

              <div style={styles.sociauxGrid}>
                {[
                   { icon: Share2,        label: 'Facebook',  handle: '@AgroConnectBJ',       color: '#1877f2', bg: '#e7f0fe' },
                   { icon: MessageCircle, label: 'Twitter',   handle: '@AgroConnect_BJ',      color: '#1da1f2', bg: '#e8f5fe' },
                   { icon: Radio,         label: 'Instagram', handle: '@agroconnect.bj',      color: '#e1306c', bg: '#fde8f0' },
                  { icon: Mail,          label: 'Email',     handle: 'contact@agroconnect.bj', color: '#1a5c2a', bg: '#f0fdf4' },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.a
                      key={i}
                      href="#"
                      style={styles.socialItem}
                      whileHover={{ x: 4 }}
                    >
                      <div style={{ ...styles.socialIcon, background: s.bg }}>
                        <Icon size={20} color={s.color} />
                      </div>
                      <div>
                        <div style={styles.socialLabel}>{s.label}</div>
                        <div style={styles.socialHandle}>{s.handle}</div>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

          </motion.div>
        </div>

      </div>
    </div>
  );
}

// ===== STYLES =====
const styles = {
  // HERO
  hero: {
    background: 'linear-gradient(135deg, #0d2b14 0%, #1a5c2a 60%, #2d8c47 100%)',
    padding: '3rem 0 2rem',
  },
  heroBreadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.6)' },
  breadLink:      { color: 'rgba(255,255,255,0.6)', textDecoration: 'none' },
  heroTitle:      { color: 'white', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '0.4rem' },
  heroSub:        { color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0' },

  // INFOS
  infoCard:   { background: 'white', borderRadius: '16px', padding: '1.5rem 1rem', border: '1px solid #e5e7eb', textAlign: 'center', cursor: 'default', transition: 'all 0.2s', height: '100%' },
  infoIcon:   { width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' },
  infoTitre:  { fontSize: '0.88rem', fontWeight: '700', color: '#374151', marginBottom: '0.4rem' },
  infoValeur: { fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.2rem' },
  infoSous:   { fontSize: '0.78rem', color: '#9ca3af', margin: 0 },

  // FORMULAIRE
  formCard:   { background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  formHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' },
  formTitle:  { fontSize: '1.1rem', fontWeight: '800', color: '#1a2e10', margin: 0 },
  fieldWrap:  { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:      { fontSize: '0.85rem', fontWeight: '600', color: '#374151' },
  input:      { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', transition: 'border-color 0.2s', fontFamily: 'inherit' },
  select:     { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', cursor: 'pointer' },
  charCount:  { fontSize: '0.75rem', color: '#9ca3af', textAlign: 'right', marginTop: '4px' },
  submitBtn:  { width: '100%', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '12px', padding: '0.9rem', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(26,92,42,0.3)' },

  // SUCCÈS / ERREUR
  successBox:    { textAlign: 'center', padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  btnNouveauMsg: { marginTop: '1.2rem', background: '#f0fdf4', color: '#1a5c2a', border: '1.5px solid #86efac', borderRadius: '10px', padding: '0.6rem 1.5rem', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' },
  errorBox:      { display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#dc2626' },

  // FAQ
  faqCard:     { background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e5e7eb', marginBottom: '1.2rem' },
  faqItem:     { border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden' },
  faqQuestion: { width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '0.9rem 1rem', background: 'white', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600', color: '#1a2e10', transition: 'background 0.2s' },
  faqReponse:  { padding: '0 1rem 1rem', overflow: 'hidden' },

  // RÉSEAUX
  sociauxCard: { background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e5e7eb' },
  sociauxGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  socialItem:  { display: 'flex', alignItems: 'center', gap: '12px', padding: '0.7rem', borderRadius: '12px', border: '1px solid #f0f0f0', textDecoration: 'none', transition: 'all 0.2s' },
  socialIcon:  { width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  socialLabel: { fontWeight: '700', fontSize: '0.88rem', color: '#1a2e10' },
  socialHandle:{ fontSize: '0.78rem', color: '#6b7280' },
};