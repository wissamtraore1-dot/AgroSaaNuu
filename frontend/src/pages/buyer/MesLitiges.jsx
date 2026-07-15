import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle, Clock, XCircle,
  ChevronDown, ChevronUp, Package, ArrowRight,
  ShieldAlert, FileText
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import OrderService from '../../services/order.service';

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUT_CONFIG = {
  OUVERT:   { label: 'Ouvert',           color: '#dc2626', bg: '#fee2e2', icon: AlertTriangle },
  EN_COURS: { label: 'En cours d\'examen', color: '#d97706', bg: '#fef3c7', icon: Clock       },
  RESOLU:   { label: 'Résolu',           color: '#16a34a', bg: '#dcfce7', icon: CheckCircle  },
  FERME:    { label: 'Fermé',            color: '#6b7280', bg: '#f3f4f6', icon: XCircle      },
};

function StatutBadge({ statut }) {
  const cfg  = STATUT_CONFIG[statut] || STATUT_CONFIG.OUVERT;
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: cfg.bg, color: cfg.color,
      fontSize: '0.75rem', fontWeight: '700',
      padding: '4px 10px', borderRadius: '20px',
      border: `1px solid ${cfg.color}30`,
    }}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

function CompteARebours({ dateLimite }) {
  const [restant, setRestant] = useState(() => new Date(dateLimite) - new Date());

  useEffect(() => {
    const id = setInterval(() => setRestant(new Date(dateLimite) - new Date()), 60000);
    return () => clearInterval(id);
  }, [dateLimite]);

  if (restant <= 0) {
    return (
      <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '600' }}>
        Délai indicatif dépassé — notre équipe reste mobilisée sur votre dossier
      </span>
    );
  }

  const totalHeures    = Math.floor(restant / (1000 * 60 * 60));
  const jours           = Math.floor(totalHeures / 24);
  const heuresRestantes = totalHeures % 24;
  const minutes         = Math.floor((restant % (1000 * 60 * 60)) / (1000 * 60));
  const urgent           = restant < 1000 * 60 * 60 * 12; // moins de 12h restantes

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '0.75rem', fontWeight: '700',
      color: urgent ? '#d97706' : '#6b7280',
    }}>
      <Clock size={12} />
      {jours > 0 ? `${jours}j ${heuresRestantes}h` : `${heuresRestantes}h ${minutes}min`} avant traitement (délai indicatif)
    </span>
  );
}

function LitigeCard({ litige }) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <motion.div
      layout
      style={{
        background: 'white', borderRadius: '14px',
        border: '1px solid #e5e7eb', overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* En-tête */}
      <div
        style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
        onClick={() => setOuvert(!ouvert)}
      >
        <div style={{ background: '#fee2e2', borderRadius: '10px', padding: '8px', flexShrink: 0 }}>
          <ShieldAlert size={18} color="#dc2626" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '700', color: '#1a2e10', fontSize: '0.92rem' }}>
              Commande {litige.commande_reference}
            </span>
            <StatutBadge statut={litige.statut} />
          </div>
          <div style={{ fontSize: '0.80rem', color: '#6b7280', marginTop: '2px' }}>
            {litige.commande_produit} · Vendeur : {litige.vendeur_nom}
          </div>
          {(litige.statut === 'OUVERT' || litige.statut === 'EN_COURS') && litige.date_limite_traitement && (
            <div style={{ marginTop: '4px' }}>
              <CompteARebours dateLimite={litige.date_limite_traitement} />
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1a5c2a' }}>
            {Number(litige.commande_montant).toLocaleString('fr-FR')} FCFA
          </div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '2px' }}>
            {new Date(litige.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>

        <div style={{ color: '#6b7280', flexShrink: 0 }}>
          {ouvert ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Détail dépliant */}
      <AnimatePresence>
        {ouvert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid #f3f4f6', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Description */}
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: '700', color: '#374151', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Votre description du problème
                </p>
                <p style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.6, margin: 0, background: '#f9fafb', borderRadius: '8px', padding: '10px 12px' }}>
                  {litige.description}
                </p>
              </div>

              {/* Résolution */}
              {litige.resolution && (
                <div>
                  <p style={{ fontSize: '0.78rem', fontWeight: '700', color: '#16a34a', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Réponse de l'équipe AgroSaaNuu
                  </p>
                  <p style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.6, margin: 0, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px' }}>
                    {litige.resolution}
                  </p>
                  {litige.date_resolution && (
                    <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '4px' }}>
                      Résolu le {new Date(litige.date_resolution).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )}

              {/* Lien vers la commande */}
              <Link
                to={`/buyer/orders/${litige.commande_id}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#1a5c2a', fontWeight: '600', textDecoration: 'none' }}
              >
                <Package size={14} />
                Voir la commande
                <ArrowRight size={13} />
              </Link>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Page principale ─────────────────────────────────────────────────────────────

export default function MesLitiges() {
  const [litiges,  setLitiges]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await OrderService.mesProblemes();
        setLitiges(data.results || data);
      } catch {
        setError('Impossible de charger vos problèmes.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = {
    total:   litiges.length,
    ouverts: litiges.filter(l => l.statut === 'OUVERT').length,
    enCours: litiges.filter(l => l.statut === 'EN_COURS').length,
    resolus: litiges.filter(l => l.statut === 'RESOLU').length,
  };

  return (
    <DashboardLayout role="buyer">

      {/* ── En-tête ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={22} color="#dc2626" />
          Mes problèmes
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: 0 }}>
          Suivez l'état de vos problèmes signalés et les réponses de notre équipe.
        </p>
      </div>

      {/* ── Cartes stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total',    value: stats.total,   color: '#374151', bg: '#f9fafb' },
          { label: 'Ouverts',  value: stats.ouverts, color: '#dc2626', bg: '#fee2e2' },
          { label: 'En cours', value: stats.enCours, color: '#d97706', bg: '#fef3c7' },
          { label: 'Résolus',  value: stats.resolus, color: '#16a34a', bg: '#dcfce7' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: bg, borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color }}>{value}</div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Contenu ── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ background: 'white', borderRadius: '14px', height: '80px', border: '1px solid #e5e7eb' }}
              className="placeholder-glow">
              <div style={{ height: '100%', borderRadius: '14px', background: '#f3f4f6' }} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem 1.5rem', color: '#dc2626' }}>
          <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> {error}
        </div>
      )}

      {!loading && !error && litiges.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1.5px dashed #e5e7eb' }}>
          <FileText size={48} color="#d1d5db" />
          <h3 style={{ color: '#1a2e10', marginTop: '1rem', fontSize: '1.1rem' }}>Aucun problème signalé</h3>
          <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>
            Vous n'avez signalé aucun problème pour l'instant.
          </p>
          <Link
            to="/buyer/orders"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '1rem', background: '#1a5c2a', color: 'white', borderRadius: '20px', padding: '0.6rem 1.4rem', fontWeight: '600', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            Voir mes commandes <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {!loading && !error && litiges.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {litiges.map(litige => (
            <LitigeCard key={litige.id} litige={litige} />
          ))}
        </div>
      )}

    </DashboardLayout>
  );
}
