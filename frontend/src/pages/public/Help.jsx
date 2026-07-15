import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, ChevronDown, ChevronUp,
  HelpCircle, ShoppingCart, Truck,
  CreditCard, User, Shield, Book,
  MessageSquare, Phone, Mail,
  CheckCircle, ArrowRight, X,
  Leaf, MessageCircle,
} from 'lucide-react';

// ===== MOCK DATA =====
const categories = [
  { id: 'compte',    icon: User,         label: 'Mon compte',        color: '#2563eb', bg: '#eff6ff' },
  { id: 'achat',     icon: ShoppingCart, label: 'Achats & commandes', color: '#1a5c2a', bg: '#f0fdf4' },
  { id: 'transport', icon: Truck,        label: 'Transport',          color: '#d97706', bg: '#fffbeb' },
  { id: 'paiement',  icon: CreditCard,   label: 'Paiement',           color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'securite',  icon: Shield,       label: 'Sécurité',           color: '#dc2626', bg: '#fef2f2' },
  { id: 'general',   icon: Book,         label: 'Général',            color: '#0891b2', bg: '#ecfeff' },
];

const faqs = [
  // COMPTE
  { id: 1, cat: 'compte', question: 'Comment créer un compte sur AgroSaaNuu ?', reponse: 'Cliquez sur "S\'inscrire", choisissez votre rôle (Vendeur, Acheteur ou Transporteur), remplissez le formulaire avec vos informations personnelles et votre numéro CIP, puis validez votre inscription.', utile: 42 },
  { id: 2, cat: 'compte', question: 'Comment modifier mes informations personnelles ?', reponse: 'Connectez-vous, allez dans "Mon Profil" depuis votre tableau de bord, cliquez sur "Modifier" et mettez à jour vos informations. N\'oubliez pas de sauvegarder.', utile: 28 },
  { id: 3, cat: 'compte', question: 'J\'ai oublié mon mot de passe, que faire ?', reponse: 'Sur la page de connexion, cliquez sur "Mot de passe oublié", entrez votre email ou numéro de téléphone, et vous recevrez un lien de réinitialisation dans les minutes qui suivent.', utile: 65 },
  { id: 4, cat: 'compte', question: 'Comment supprimer mon compte ?', reponse: 'Pour supprimer votre compte, allez dans Paramètres > Sécurité > Supprimer le compte. Notez que cette action est irréversible et toutes vos données seront effacées.', utile: 15 },

  // ACHAT
  { id: 5, cat: 'achat', question: 'Comment passer une commande ?', reponse: 'Parcourez le catalogue, sélectionnez un produit, choisissez la quantité souhaitée et cliquez sur "Commander". Vous serez guidé à travers le processus de paiement et de livraison.', utile: 89 },
  { id: 6, cat: 'achat', question: 'Puis-je annuler une commande ?', reponse: 'Vous pouvez annuler une commande tant qu\'elle n\'a pas été confirmée par le vendeur. Dans "Mes commandes", sélectionnez la commande et cliquez sur "Annuler".', utile: 54 },
  { id: 7, cat: 'achat', question: 'Comment suivre ma commande ?', reponse: 'Dans votre tableau de bord, allez dans "Mes commandes" et cliquez sur "Suivi". Vous verrez l\'état en temps réel : En attente, Confirmée, En livraison, Livrée.', utile: 77 },
  { id: 8, cat: 'achat', question: 'Que faire si je reçois un produit endommagé ?', reponse: 'Prenez des photos du produit endommagé et contactez le support dans les 48h suivant la réception. Nous ouvrirons un litige et vous proposerons un remboursement ou un remplacement.', utile: 33 },

  // TRANSPORT
  { id: 9,  cat: 'transport', question: 'Comment trouver un transporteur ?', reponse: 'Dans la section "Transports & logistiques", filtrez par ville et disponibilité. Vous pouvez voir les notes, véhicules disponibles et contacter directement le transporteur de votre choix.', utile: 61 },
  { id: 10, cat: 'transport', question: 'Comment devenir transporteur sur AgroSaaNuu ?', reponse: 'Inscrivez-vous avec le rôle "Transporteur", ajoutez vos véhicules avec les documents requis (carte grise, assurance), définissez vos zones d\'intervention et activez votre disponibilité.', utile: 38 },
  { id: 11, cat: 'transport', question: 'Les transporteurs sont-ils vérifiés ?', reponse: 'Oui. Chaque transporteur passe par une vérification de ses documents (permis, assurance, carte grise) avant d\'être activé sur la plateforme. Ils ont aussi un système de notation.', utile: 45 },

  // PAIEMENT
  { id: 12, cat: 'paiement', question: 'Quels modes de paiement sont acceptés ?', reponse: 'AgroSaaNuu accepte MTN Mobile Money, Moov Money, Celtis Cash, et les virements bancaires. D\'autres modes seront bientôt disponibles.', utile: 102 },
  { id: 13, cat: 'paiement', question: 'Mon paiement a échoué, que faire ?', reponse: 'Vérifiez que votre solde est suffisant et que votre numéro est correct. Si le problème persiste, attendez quelques minutes et réessayez. Contactez le support si l\'échec se répète.', utile: 47 },
  { id: 14, cat: 'paiement', question: 'Comment demander un remboursement ?', reponse: 'Les remboursements sont traités sous 3 à 5 jours ouvrés après validation du litige. Allez dans "Mes commandes" > "Litige" pour initier la demande.', utile: 58 },

  // SÉCURITÉ
  { id: 15, cat: 'securite', question: 'Comment protéger mon compte ?', reponse: 'Utilisez un mot de passe fort et unique, ne le partagez jamais. Activez la double authentification dans vos paramètres de sécurité pour une protection maximale.', utile: 29 },
  { id: 16, cat: 'securite', question: 'Comment signaler un utilisateur suspect ?', reponse: 'Sur le profil de l\'utilisateur, cliquez sur les trois points (...) puis "Signaler". Notre équipe examinera le signalement sous 24h et prendra les mesures nécessaires.', utile: 22 },

  // GÉNÉRAL
  { id: 17, cat: 'general', question: 'AgroSaaNuu est-il gratuit ?', reponse: 'L\'inscription et la navigation sont gratuites. AgroSaaNuu prélève une commission sur les transactions réussies. Les détails sont disponibles dans nos conditions générales.', utile: 93 },
  { id: 18, cat: 'general', question: 'Dans quelles villes AgroSaaNuu est-il disponible ?', reponse: 'AgroSaaNuu est disponible dans tout le Bénin : Cotonou, Porto-Novo, Parakou, Natitingou, Kandi, Nikki, Djougou, Abomey et plus encore.', utile: 71 },
];

const guides = [
  { titre: 'Guide du vendeur',       desc: 'Comment créer et gérer vos annonces',       Icon: Leaf,        lien: '/help' },
  { titre: "Guide de l'acheteur",    desc: 'Comment trouver et commander des céréales', Icon: ShoppingCart, lien: '/help' },
  { titre: 'Guide du transporteur',  desc: 'Comment proposer vos services',              Icon: Truck,       lien: '/help' },
  { titre: 'Guide des paiements',    desc: 'Mobile Money et virements bancaires',        Icon: CreditCard,  lien: '/help' },
];

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

export default function Help() {
  const [search,      setSearch]      = useState('');
  const [catActive,   setCatActive]   = useState('tous');
  const [openFaq,     setOpenFaq]     = useState(null);
  const [utilesVotes, setUtilesVotes] = useState([]);

  const toggleVote = (id) => {
    setUtilesVotes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const faqFiltrees = useMemo(() => {
    let result = [...faqs];
    if (catActive !== 'tous') result = result.filter((f) => f.cat === catActive);
    if (search) result = result.filter((f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.reponse.toLowerCase().includes(search.toLowerCase())
    );
    return result;
  }, [catActive, search]);

  return (
    <div style={{ background: '#f8f9f4', minHeight: '100vh' }}>

      {/* ===== HERO ===== */}
      <div style={styles.hero}>
        <div className="container-fluid px-4 px-lg-5">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center' }}
          >
            <div style={styles.heroBreadcrumb}>
              <Link to="/" style={styles.breadLink}>Accueil</Link>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>
              <span style={{ color: 'white' }}>Aide</span>
            </div>
            <h1 style={styles.heroTitle}><HelpCircle size={32} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Centre d'aide</h1>
            <p style={styles.heroSub}>
              Trouvez rapidement des réponses à vos questions
            </p>

            {/* BARRE RECHERCHE */}
            <div style={styles.heroSearch}>
              <Search size={20} color="#9ca3af" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Rechercher dans l'aide..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.heroSearchInput}
              />
              {search && (
                <button onClick={() => setSearch('')} style={styles.clearBtn}>
                  <X size={16} color="#9ca3af" />
                </button>
              )}
            </div>

            {/* STATS */}
            <div style={styles.heroStats}>
              {[
                { value: faqs.length, label: 'Articles' },
                { value: '24h',       label: 'Temps de réponse' },
                { value: '98%',       label: 'Satisfaction' },
              ].map((s, i) => (
                <div key={i} style={styles.heroStat}>
                  <strong style={{ fontSize: '1.3rem', color: 'white' }}>{s.value}</strong>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-fluid px-4 px-lg-5 py-5">

        {/* ===== CATÉGORIES ===== */}
        <motion.div
          className="mb-5"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.2 }}
        >
          <div className="row g-3">
            {/* TOUS */}
            <div className="col-6 col-md-4 col-lg-2">
              <motion.button
                style={{
                  ...styles.catCard,
                  background:  catActive === 'tous' ? '#1a5c2a' : 'white',
                  borderColor: catActive === 'tous' ? '#1a5c2a' : '#e5e7eb',
                }}
                onClick={() => setCatActive('tous')}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: catActive === 'tous' ? 'rgba(255,255,255,0.2)' : '#f0fdf4' }}>
                  <Book size={20} color={catActive === 'tous' ? 'white' : '#1a5c2a'} />
                </div>
                <span style={{
                  ...styles.catLabel,
                  color: catActive === 'tous' ? 'white' : '#374151',
                }}>
                  Tous
                </span>
                <span style={{
                  ...styles.catCount,
                  background: catActive === 'tous' ? 'rgba(255,255,255,0.2)' : '#f0f0f0',
                  color:      catActive === 'tous' ? 'white' : '#6b7280',
                }}>
                  {faqs.length}
                </span>
              </motion.button>
            </div>

            {categories.map((c, i) => {
              const Icon    = c.icon;
              const isActive = catActive === c.id;
              const count    = faqs.filter((f) => f.cat === c.id).length;
              return (
                <div key={c.id} className="col-6 col-md-4 col-lg-2">
                  <motion.button
                    style={{
                      ...styles.catCard,
                      background:  isActive ? c.color : 'white',
                      borderColor: isActive ? c.color : '#e5e7eb',
                    }}
                    onClick={() => setCatActive(c.id)}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div style={{ ...styles.catIcon, background: isActive ? 'rgba(255,255,255,0.2)' : c.bg }}>
                      <Icon size={20} color={isActive ? 'white' : c.color} />
                    </div>
                    <span style={{ ...styles.catLabel, color: isActive ? 'white' : '#374151' }}>
                      {c.label}
                    </span>
                    <span style={{
                      ...styles.catCount,
                      background: isActive ? 'rgba(255,255,255,0.2)' : '#f0f0f0',
                      color:      isActive ? 'white' : '#6b7280',
                    }}>
                      {count}
                    </span>
                  </motion.button>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="row g-4">

          {/* ===== FAQ ===== */}
          <div className="col-12 col-lg-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.3 }}
            >
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                  <HelpCircle size={20} color="#1a5c2a" />
                  {catActive === 'tous'
                    ? 'Toutes les questions'
                    : categories.find((c) => c.id === catActive)?.label
                  }
                </h2>
                <span style={styles.countBadge}>
                  {faqFiltrees.length} réponses
                </span>
              </div>

              <AnimatePresence mode="wait">
                {faqFiltrees.length === 0 ? (
                  <motion.div
                    key="empty"
                    style={styles.emptyState}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Search size={48} color="#9ca3af" /></div>
                    <h3 style={{ color: '#1a2e10', marginBottom: '0.5rem' }}>
                      Aucune question trouvée
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                      Essayez d'autres mots-clés ou contactez-nous directement
                    </p>
                    <Link to="/contact" style={styles.btnContact}>
                      Contacter le support <ArrowRight size={15} />
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {faqFiltrees.map((faq, i) => (
                      <motion.div
                        key={faq.id}
                        style={styles.faqItem}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        {/* QUESTION */}
                        <motion.button
                          style={styles.faqQuestion}
                          onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                          whileHover={{ background: '#f9fafb' }}
                        >
                          <div style={styles.faqQuestionLeft}>
                            <div style={styles.faqDot} />
                            <span style={{ flex: 1, textAlign: 'left', lineHeight: 1.4 }}>
                              {faq.question}
                            </span>
                          </div>
                          <motion.div
                            animate={{ rotate: openFaq === faq.id ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown size={18} color="#6b7280" />
                          </motion.div>
                        </motion.button>

                        {/* RÉPONSE */}
                        <AnimatePresence>
                          {openFaq === faq.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={styles.faqReponse}>
                                <p style={styles.faqReponseText}>{faq.reponse}</p>

                                {/* VOTE UTILITÉ */}
                                <div style={styles.voteWrap}>
                                  <span style={styles.voteLabel}>
                                    Cette réponse vous a-t-elle aidé ?
                                  </span>
                                  <motion.button
                                    style={{
                                      ...styles.voteBtn,
                                      background: utilesVotes.includes(faq.id) ? '#dcfce7' : '#f4f6f4',
                                      color:      utilesVotes.includes(faq.id) ? '#16a34a' : '#6b7280',
                                      borderColor:utilesVotes.includes(faq.id) ? '#86efac' : '#e5e7eb',
                                    }}
                                    onClick={() => toggleVote(faq.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <CheckCircle size={14} />
                                    Oui ({faq.utile + (utilesVotes.includes(faq.id) ? 1 : 0)})
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* ===== SIDEBAR ===== */}
          <div className="col-12 col-lg-4">

            {/* GUIDES */}
            <motion.div
              style={styles.card}
              className="mb-4"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.4 }}
            >
              <div style={styles.cardHeader}>
                <Book size={18} color="#1a5c2a" />
                <h3 style={styles.cardTitle}>Guides pratiques</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {guides.map((g, i) => {
                  const GIcon = g.Icon;
                  return (
                    <motion.div key={i} whileHover={{ x: 4 }}>
                      <Link to={g.lien} style={styles.guideItem}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <GIcon size={18} color="#1a5c2a" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={styles.guideTitre}>{g.titre}</div>
                          <div style={styles.guideDesc}>{g.desc}</div>
                        </div>
                        <ArrowRight size={16} color="#1a5c2a" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* CONTACT SUPPORT */}
            <motion.div
              style={styles.supportCard}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.5 }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}><MessageCircle size={40} color="#1a5c2a" /></div>
              <h4 style={styles.supportTitle}>Vous n'avez pas trouvé votre réponse ?</h4>
              <p style={styles.supportDesc}>
                Notre équipe est disponible pour vous aider
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/contact" style={styles.supportBtn}>
                    <MessageSquare size={16} />
                    Envoyer un message
                  </Link>
                </motion.div>

                <div style={styles.supportContactItem}>
                  <Phone size={15} color="#1a5c2a" />
                  <span>+229 01 XX XX XX XX</span>
                </div>

                <div style={styles.supportContactItem}>
                  <Mail size={15} color="#1a5c2a" />
                  <span>support@agrosaanuu.com</span>
                </div>
              </div>
            </motion.div>

          </div>
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
    padding: '3.5rem 0 2.5rem',
  },
  heroBreadcrumb: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.82rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.6)' },
  breadLink:      { color: 'rgba(255,255,255,0.6)', textDecoration: 'none' },
  heroTitle:      { color: 'white', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: '800', marginBottom: '0.5rem' },
  heroSub:        { color: 'rgba(255,255,255,0.75)', fontSize: '1rem', marginBottom: '2rem' },
  heroSearch: {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: 'white', borderRadius: '16px',
    padding: '0.9rem 1.4rem',
    maxWidth: '560px', margin: '0 auto 1.5rem',
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
  },
  heroSearchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', color: '#1a2e10', background: 'transparent' },
  clearBtn:        { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' },
  heroStats: { display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' },
  heroStat:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' },

  // CATÉGORIES
  catCard:  { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '1.1rem 0.5rem', borderRadius: '14px', border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s', background: 'none' },
  catIcon:  { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontSize: '0.78rem', fontWeight: '700', textAlign: 'center', lineHeight: 1.2 },
  catCount: { fontSize: '0.72rem', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' },

  // SECTION
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '10px' },
  sectionTitle:  { fontSize: '1.05rem', fontWeight: '800', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  countBadge:    { background: '#f0fdf4', color: '#1a5c2a', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap' },

  // FAQ
  faqItem:         { background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' },
  faqQuestion:     { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '1rem 1.1rem', background: 'white', border: 'none', cursor: 'pointer', transition: 'background 0.15s' },
  faqQuestionLeft: { display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 },
  faqDot:          { width: '8px', height: '8px', borderRadius: '50%', background: '#1a5c2a', flexShrink: 0, marginTop: '6px' },
  faqReponse:      { padding: '0 1.1rem 1.1rem 2.1rem', borderTop: '1px solid #f5f5f5' },
  faqReponseText:  { fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.7, marginBottom: '1rem', paddingTop: '0.8rem' },

  // VOTE
  voteWrap:  { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  voteLabel: { fontSize: '0.78rem', color: '#9ca3af' },
  voteBtn:   { display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px', border: '1px solid', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },

  // EMPTY
  emptyState: { textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' },
  btnContact: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1a5c2a', color: 'white', padding: '0.6rem 1.4rem', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.88rem' },

  // CARD SIDEBAR
  card:       { background: 'white', borderRadius: '16px', padding: '1.3rem', border: '1px solid #e5e7eb' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' },
  cardTitle:  { fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', margin: 0 },

  // GUIDES
  guideItem:  { display: 'flex', alignItems: 'center', gap: '12px', padding: '0.7rem', borderRadius: '10px', border: '1px solid #f0f0f0', textDecoration: 'none', transition: 'all 0.2s' },
  guideEmoji: { display: 'none' },
  guideTitre: { fontWeight: '700', fontSize: '0.87rem', color: '#1a2e10' },
  guideDesc:  { fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' },

  // SUPPORT
  supportCard:        { background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: '16px', padding: '1.5rem', border: '1px solid #86efac', textAlign: 'center' },
  supportIcon:        { fontSize: '2.5rem', marginBottom: '0.8rem' },
  supportTitle:       { fontSize: '0.95rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.4rem' },
  supportDesc:        { fontSize: '0.82rem', color: '#6b7280', marginBottom: '1.2rem' },
  supportBtn:         { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#1a5c2a', color: 'white', padding: '0.75rem', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '0.88rem' },
  supportContactItem: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', color: '#374151', fontWeight: '500' },
};