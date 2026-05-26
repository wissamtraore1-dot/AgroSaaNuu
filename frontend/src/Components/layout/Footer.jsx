import { Link } from 'react-router-dom';
import logo from "../../assets/images/logo.jpeg";
import { motion } from 'framer-motion';
import {
  Wheat, Phone, Mail, MapPin,
  ArrowRight, Shield, Truck, Users,
  Share2, MessageCircle, PlayCircle, Radio
} from 'lucide-react';

const footerLinks = {
  plateforme: [
    { label: 'Comment ça marche ?',           to: '/help' },
    { label: 'Trouver un transporteur',       to: '/transporters' },
    { label: 'Prix du marché en temps réel',  to: '/market-prices' },
    { label: 'Devenir coopérative certifiée', to: '/auth/register' },
  ],
  aide: [
    { label: "Centre d'aide / FAQ",           to: '/help' },
    { label: 'Conditions de vente',           to: '/help' },
    { label: 'Politique de confidentialité',  to: '/help' },
    { label: 'Signaler un problème',          to: '/contact' },
  ],
  contact: [
    { icon: Phone,  text: '+229 O1 68 21 44 05' },
    { icon: Mail,   text: 'contact@agroSuuNii.bj' },
    { icon: MapPin, text: 'Parakou, Bénin' },
  ],
};

const socials = [
  { icon: Share2,         href: '#', color: '#1877f2' },
  { icon: MessageCircle,  href: '#', color: '#1da1f2' },
  { icon: Radio,          href: '#', color: '#e1306c' },
  { icon: PlayCircle,     href: '#', color: '#ff0000' },
];

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

export default function Footer() {
  return (
    <footer style={styles.footer}>

      {/* BODY */}
      <div style={styles.footerBody}>
        <div className="container-fluid px-4 px-lg-5">
          <div className="row g-5">

            {/* COL 1 — LOGO */}
            <motion.div
              className="col-12 col-md-6 col-lg-3"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <Link to="/" style={styles.logo}>
              <img 
                 src={logo} 
                 alt="logo"
                    style={{
                    width: "36px",
                     height: "36px",
                    objectFit: "cover",
                     borderRadius: "8px"
                 }}
            />
                <span>Agro<span style={{ color: '#f0c040' }}>SaaNuu</span></span>
              </Link>
              <p style={styles.logoDesc}>
                Plateforme directe dédiée à la commercialisation des céréales au Bénin.
                Connectons producteurs, acheteurs et transporteurs.
              </p>
              <div style={styles.socials}>
                {socials.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.a
                      key={i}
                      href={s.href}
                      style={styles.socialBtn}
                      whileHover={{ scale: 1.15, background: s.color, borderColor: s.color }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon size={16} />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            {/* COL 2 — LIENS UTILES */}
            <motion.div
              className="col-12 col-md-6 col-lg-3"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 style={styles.colTitle}>Liens utiles</h4>
              <ul style={styles.linkList}>
                {footerLinks.plateforme.map((l, i) => (
                  <li key={i}>
                    <Link to={l.to} style={styles.footerLink}>
                      <ArrowRight size={13} />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* COL 3 — AIDE */}
            <motion.div
              className="col-12 col-md-6 col-lg-3"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h4 style={styles.colTitle}>Aide & Support</h4>
              <ul style={styles.linkList}>
                {footerLinks.aide.map((l, i) => (
                  <li key={i}>
                    <Link to={l.to} style={styles.footerLink}>
                      <ArrowRight size={13} />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* COL 4 — CONTACT */}
            <motion.div
              className="col-12 col-md-6 col-lg-3"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h4 style={styles.colTitle}>Contacte</h4>
              <ul style={styles.linkList}>
                {footerLinks.contact.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <li key={i} style={styles.contactItem}>
                      <div style={styles.contactIcon}>
                        <Icon size={14} color="#f0c040" />
                      </div>
                      <span style={styles.contactText}>{c.text}</span>
                    </li>
                  );
                })}
              </ul>

              {/* Newsletter */}
              <div style={styles.newsletter}>
                <p style={styles.newsletterTitle}>Recevoir les alertes prix</p>
                <div style={styles.newsletterForm}>
                  <input
                    type="email"
                    placeholder="Votre email"
                    style={styles.newsletterInput}
                  />
                  <motion.button
                    style={styles.newsletterBtn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowRight size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div style={styles.footerBottom}>
        <div className="container-fluid px-4 px-lg-5">
          <div className="d-flex flex-column align-items-center text-center gap-2">
            <p style={styles.copyright} className="mb-0">
              © 2026 AgroConnect — Tous droits réservés. Développé pour le Bénin.
            </p>
            <div className="d-flex gap-3">
              <Link to="/help"    style={styles.bottomLink}>Confidentialité</Link>
              <Link to="/help"    style={styles.bottomLink}>CGU</Link>
              <Link to="/contact" style={styles.bottomLink}>Contact</Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}

const styles = {
  footer:       { background: '#0d2b14', marginTop: '4rem' },
  trustItem:    { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  logo:         { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white', fontWeight: '900', fontSize: '1.4rem', marginBottom: '1rem', letterSpacing: '-0.02em' },
  logoIcon:     { background: '#f0c040', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoDesc:     { color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.65, marginBottom: '1.5rem' },
  socials:      { display: 'flex', gap: '10px' },
  socialBtn:    { width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.25)', background: 'transparent', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s' },
  colTitle:     { color: '#f0c040', fontWeight: '700', fontSize: '0.95rem', marginBottom: '1.2rem', letterSpacing: '0.04em', textTransform: 'uppercase' },
  linkList:     { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
  footerLink:   { color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.87rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' },
  contactItem:  { display: 'flex', alignItems: 'center', gap: '10px' },
  contactIcon:  { width: '30px', height: '30px', background: 'rgba(240,192,64,0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  contactText:  { color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' },
  newsletter:   { marginTop: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' },
  newsletterTitle: { color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.7rem' },
  newsletterForm:  { display: 'flex', gap: '8px' },
  newsletterInput: { flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.45rem 0.8rem', color: 'white', fontSize: '0.82rem', outline: 'none' },
  newsletterBtn:   { background: '#f0c040', border: 'none', borderRadius: '8px', padding: '0.45rem 0.8rem', cursor: 'pointer', color: '#1a2e10', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  footerBottom: { borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1.2rem 0' },
  copyright:    { color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', margin: 0 },
  bottomLink:   { color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', textDecoration: 'none' },
};