// src/pages/buyer/Receipt.jsx — Reçu numérique d'une commande
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, ArrowLeft, Truck, Package, DollarSign, Printer } from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import OrderService from '../../services/order.service';
import logo from '../../assets/images/logo.jpeg';

const GREEN = '#1a5c2a';

const STATUT_LABELS = {
  PAIEMENT_EN_ATTENTE: 'Paiement en attente',
  PAIEMENT_RECU:       'Paiement reçu (en séquestre)',
  EN_PREPARATION:      'En préparation',
  EN_LIVRAISON:        'En livraison',
  LIVREE:              'Livrée',
  CONFIRMEE_RECEPTION: 'Réception confirmée',
  PAIEMENT_LIBERE:     'Paiement libéré',
  ANNULEE:             'Annulée',
};

const fmt = (n) => Number(n || 0).toLocaleString('fr-FR');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function Receipt() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const printRef      = useRef(null);
  const [recu,    setRecu]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    OrderService.getRecu(id)
      .then(res => setRecu(res.recu))
      .catch(() => setError('Impossible de charger le reçu'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return (
    <DashboardLayout role="buyer">
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem', color: '#9ca3af' }}>
        Chargement du reçu…
      </div>
    </DashboardLayout>
  );

  if (error || !recu) return (
    <DashboardLayout role="buyer">
      <div style={{ textAlign: 'center', paddingTop: '4rem', color: '#dc2626' }}>{error || 'Reçu non trouvé'}</div>
    </DashboardLayout>
  );

  const { commande, paiement, mission } = recu;

  return (
    <DashboardLayout role="buyer">
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>

        {/* Boutons actions (no-print) */}
        <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '1.2rem' }}>
          <button onClick={() => navigate(-1)} style={btnOutline}>
            <ArrowLeft size={15} /> Retour
          </button>
          <button onClick={handlePrint} style={btnOutline}>
            <Printer size={15} /> Imprimer
          </button>
        </div>

        {/* Reçu */}
        <motion.div ref={printRef}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'white', borderRadius: '20px', boxShadow: '0 2px 24px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', overflow: 'hidden' }}
        >
          {/* En-tête vert */}
          <div style={{ background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`, padding: '2rem', textAlign: 'center', color: 'white' }}>
            <img src={logo} alt="AgroSaaNuu" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', marginBottom: '10px', border: '2px solid rgba(255,255,255,0.4)' }} />
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.03em' }}>AgroSaaNuu</h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.85 }}>Reçu numérique de transaction</p>

            <div style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} />
              <span style={{ fontWeight: '700', fontSize: '1rem' }}>
                {STATUT_LABELS[commande.statut] || commande.statut}
              </span>
            </div>
          </div>

          {/* Corps */}
          <div style={{ padding: '1.5rem' }}>

            {/* Référence */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Référence commande</p>
              <p style={{ margin: '4px 0 0', fontSize: '1.6rem', fontWeight: '900', color: '#1a2e10', letterSpacing: '0.04em' }}>{commande.reference}</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#9ca3af' }}>Émis le {fmtDate(recu.genere_le)}</p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed #e5e7eb', margin: '1rem 0' }} />

            {/* Parties */}
            <Section icon={<Package size={15} />} title="Parties">
              <Row label="Acheteur"   value={commande.acheteur_nom} />
              <Row label="Vendeur"    value={commande.vendeur_nom}  />
              <Row label="Produit"    value={commande.produit_nom}  />
              <Row label="Quantité"   value={`${commande.quantite} — ${commande.prix_unitaire} FCFA/u`} />
            </Section>

            <hr style={{ border: 'none', borderTop: '1px dashed #e5e7eb', margin: '1rem 0' }} />

            {/* Détail financier */}
            <Section icon={<DollarSign size={15} />} title="Détail financier">
              <Row label="Montant produit" value={`${fmt(commande.montant_produit)} FCFA`} />
              <Row label="Frais livraison" value={`${fmt(commande.frais_livraison)} FCFA`} />
              <Row label="Frais paiement"  value={`${fmt(commande.frais_paiement)} FCFA`} />
              <Row label="Commission"      value={`${fmt(commande.commission)} FCFA`} />
              <div style={{ borderTop: '1.5px solid #e5e7eb', paddingTop: '0.6rem', marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '800', color: '#1a2e10', fontSize: '0.95rem' }}>TOTAL</span>
                <span style={{ fontWeight: '900', color: GREEN, fontSize: '1.1rem' }}>{fmt(commande.montant_total)} FCFA</span>
              </div>
            </Section>

            {/* Paiement */}
            {paiement && (
              <>
                <hr style={{ border: 'none', borderTop: '1px dashed #e5e7eb', margin: '1rem 0' }} />
                <Section icon={<DollarSign size={15} />} title="Paiement">
                  <Row label="Mode"            value={paiement.mode_paiement} />
                  <Row label="Statut"          value={paiement.statut} />
                  {paiement.reference_transaction && (
                    <Row label="Référence transaction" value={paiement.reference_transaction} />
                  )}
                  {paiement.date_recu && <Row label="Date réception" value={fmtDate(paiement.date_recu)} />}
                  {paiement.date_transfere && <Row label="Date transfert" value={fmtDate(paiement.date_transfere)} />}
                </Section>
              </>
            )}

            {/* Transport */}
            {mission && (
              <>
                <hr style={{ border: 'none', borderTop: '1px dashed #e5e7eb', margin: '1rem 0' }} />
                <Section icon={<Truck size={15} />} title="Transport">
                  <Row label="Transporteur"  value={mission.transporteur_nom} />
                  <Row label="Trajet"        value={`${mission.ville_depart} → ${mission.ville_arrivee}`} />
                  <Row label="Tarif"         value={mission.tarif_str} />
                  <Row label="Statut"        value={mission.statut} />
                  {mission.date_depart  && <Row label="Départ"  value={fmtDate(mission.date_depart)} />}
                  {mission.date_arrivee && <Row label="Arrivée" value={fmtDate(mission.date_arrivee)} />}
                </Section>
              </>
            )}

            {/* Livraison */}
            <hr style={{ border: 'none', borderTop: '1px dashed #e5e7eb', margin: '1rem 0' }} />
            <Section icon={<Package size={15} />} title="Livraison">
              <Row label="Adresse"    value={commande.adresse_livraison} />
              <Row label="Téléphone"  value={commande.telephone_livraison} />
              {commande.date_confirmation && <Row label="Confirmation" value={fmtDate(commande.date_confirmation)} />}
              {commande.date_livraison    && <Row label="Expédition"   value={fmtDate(commande.date_livraison)} />}
              {commande.date_reception    && <Row label="Réception"    value={fmtDate(commande.date_reception)} />}
            </Section>

            {/* Pied de reçu */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.76rem', lineHeight: 1.5 }}>
              <p style={{ margin: 0 }}>AgroSaaNuu — Plateforme agricole du Bénin</p>
              <p style={{ margin: 0 }}>Ce reçu est valide et constitue une preuve de transaction.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}

function Section({ icon, title, children }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.82rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '5px' }}>
        {icon} {title}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
      <span style={{ fontSize: '0.84rem', color: '#6b7280', minWidth: '140px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.84rem', color: '#1a2e10', fontWeight: '600', textAlign: 'right' }}>{value || '—'}</span>
    </div>
  );
}

const btnOutline = {
  display: 'flex', alignItems: 'center', gap: '6px',
  background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px',
  padding: '7px 14px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#374151',
};
