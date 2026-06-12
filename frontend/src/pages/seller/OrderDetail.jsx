import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, Package, Truck, CheckCircle, Clock,
  AlertCircle, ChevronLeft, Banknote, User, Sparkles,
  ClipboardCheck, Wrench, HandshakeIcon,
} from 'lucide-react';
import { formatDate } from '../../utils/formatPrice';
import { ORDER_STATUS, ORDER_STATUS_COLORS } from '../../utils/constants';
import OrderService from '../../services/order.service';
import { useNotificationContext } from '../../context/NotificationContext';
import DashboardLayout from '../../Components/layout/DashboardLayout';

const GREEN  = '#1a5c2a';
const ORANGE = '#d97706';
const fmt    = (n) => new Intl.NumberFormat('fr-BJ').format(Number(n || 0)) + ' FCFA';

/* ─── Étapes du flux ─────────────────────────────────────── */
const STEPS = [
  { key: 'PAIEMENT_RECU',   label: 'Paiement reçu',           sub: 'Fonds sécurisés en escrow' },
  { key: '_recep',          label: 'Réception confirmée',      sub: 'Vous avez accusé réception'  },
  { key: 'EN_PREPARATION',  label: 'Préparation confirmée',    sub: 'Colis prêt'                  },
  { key: '_remis',          label: 'Remis au transporteur',    sub: 'Attente prise en charge'     },
  { key: 'EN_LIVRAISON',    label: 'En livraison',             sub: 'Transporteur en route'       },
  { key: 'LIVREE',          label: 'Livré',                    sub: 'En attente confirmation acheteur' },
  { key: 'PAIEMENT_LIBERE', label: 'Paiement libéré',         sub: 'Fonds virés sur votre compte' },
];

function getStepIndex(commande) {
  const s = commande?.statut;
  if (!s) return -1;
  if (s === 'PAIEMENT_RECU') {
    if (commande.confirme_preparation_vendeur) return 2; // after prep confirmed → EN_PREPARATION coming
    if (commande.confirme_reception_vendeur)   return 1;
    return 0;
  }
  if (s === 'EN_PREPARATION') {
    return commande.confirme_vendeur ? 3 : 2;
  }
  if (s === 'EN_LIVRAISON')    return 4;
  if (s === 'LIVREE')          return 5;
  if (s === 'PAIEMENT_LIBERE') return 6;
  return -1;
}

const STATUS_BADGE = {
  PAIEMENT_EN_ATTENTE: { label: 'Paiement en attente', color: '#92400e', bg: '#fef3c7' },
  PAIEMENT_RECU:       { label: 'Paiement reçu',       color: '#1e40af', bg: '#dbeafe' },
  EN_PREPARATION:      { label: 'En préparation',       color: '#6d28d9', bg: '#ede9fe' },
  EN_LIVRAISON:        { label: 'En livraison',         color: '#0369a1', bg: '#e0f2fe' },
  LIVREE:              { label: 'Livrée',               color: '#15803d', bg: '#dcfce7' },
  PAIEMENT_LIBERE:     { label: 'Paiement libéré',      color: '#15803d', bg: '#dcfce7' },
  ANNULEE:             { label: 'Annulée',              color: '#dc2626', bg: '#fee2e2' },
  LITIGE:              { label: 'En litige',            color: '#dc2626', bg: '#fee2e2' },
};

export default function SellerOrderDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { success, error: notifyError } = useNotificationContext();

  const [order,    setOrder]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [actif,    setActif]    = useState(null);

  useEffect(() => { charger(); }, [id]);

  const charger = async () => {
    try {
      setLoading(true);
      const data = await OrderService.detail(id);
      setOrder(data.commande || data);
    } catch {
      notifyError('Impossible de charger la commande');
    } finally {
      setLoading(false);
    }
  };

  const action = async (label, fn) => {
    setActif(label);
    try {
      await fn();
      await charger();
      success('Mis à jour avec succès.');
    } catch (e) {
      notifyError(e.response?.data?.message || 'Erreur lors de l\'action.');
    } finally {
      setActif(null);
    }
  };

  if (loading) return (
    <DashboardLayout role="seller">
      <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Chargement…</div>
    </DashboardLayout>
  );
  if (!order) return (
    <DashboardLayout role="seller">
      <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Commande introuvable</div>
    </DashboardLayout>
  );

  const statut    = order.statut;
  const badge     = STATUS_BADGE[statut] || { label: statut, color: '#374151', bg: '#f3f4f6' };
  const stepIdx   = getStepIndex(order);
  const isClosed  = ['ANNULEE', 'LITIGE'].includes(statut);

  /* ─── Actions disponibles ─────────────────────────────── */
  const showStep1 = statut === 'PAIEMENT_RECU' && !order.confirme_reception_vendeur;
  const showStep2 = statut === 'PAIEMENT_RECU' && order.confirme_reception_vendeur && !order.confirme_preparation_vendeur;
  const showStep3 = statut === 'EN_PREPARATION' && order.confirme_preparation_vendeur && !order.confirme_vendeur;

  return (
    <DashboardLayout role="seller">
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Retour */}
        <button onClick={() => navigate('/seller/orders')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6b7280', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
          <ChevronLeft size={16} /> Mes commandes
        </button>

        {/* En-tête */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a2e10', margin: '0 0 4px' }}>
              Commande #{order.reference}
            </h2>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>{formatDate(order.created_at)}</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, background: badge.bg, color: badge.color }}>
            {badge.label}
          </span>
        </div>

        {/* ── BARRE DE PROGRESSION ─────────────────────────── */}
        {!isClosed && (
          <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', padding: '1.2rem 1.5rem', marginBottom: '20px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: '600px' }}>
              {STEPS.map((step, i) => {
                const done    = i < stepIdx;
                const current = i === stepIdx;
                return (
                  <React.Fragment key={step.key}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0, width: '80px' }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: done ? GREEN : current ? ORANGE : '#e5e7eb',
                        border: current ? `3px solid ${ORANGE}` : 'none',
                        boxShadow: current ? `0 0 0 4px rgba(217,119,6,0.15)` : 'none',
                        transition: 'all 0.3s',
                      }}>
                        {done ? <CheckCircle size={12} color="white" /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: current ? 'white' : '#9ca3af' }} />}
                      </div>
                      <div style={{ fontSize: '10px', textAlign: 'center', lineHeight: 1.3, fontWeight: current ? 700 : 500, color: done ? GREEN : current ? ORANGE : '#9ca3af' }}>
                        {step.label}
                      </div>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ flex: 1, height: '2px', marginTop: '10px', background: done ? GREEN : '#e5e7eb', transition: 'background 0.3s' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ACTIONS VENDEUR ──────────────────────────────── */}
        <AnimatePresence>
          {showStep1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '14px', padding: '1rem 1.2rem', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <ClipboardCheck size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e40af', marginBottom: '4px' }}>
                    Étape 1 — Confirmer la réception de la commande
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#3b82f6', margin: '0 0 12px' }}>
                    Le paiement est sécurisé en escrow. Confirmez que vous avez bien reçu cette commande.
                  </p>
                  <button onClick={() => action('step1', () => OrderService.confirmer(id))}
                    disabled={actif === 'step1'}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.3rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer', opacity: actif === 'step1' ? 0.7 : 1 }}>
                    <ClipboardCheck size={14} />
                    {actif === 'step1' ? 'Traitement…' : 'Confirmer la réception'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {showStep2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: '14px', padding: '1rem 1.2rem', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Wrench size={20} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#6d28d9', marginBottom: '4px' }}>
                    Étape 2 — Confirmer la préparation du colis
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#7c3aed', margin: '0 0 12px' }}>
                    Vous avez accusé réception. Confirmez maintenant que le produit est prêt et emballé.
                  </p>
                  <button onClick={() => action('step2', () => OrderService.confirmerPreparation(id))}
                    disabled={actif === 'step2'}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.3rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer', opacity: actif === 'step2' ? 0.7 : 1 }}>
                    <Wrench size={14} />
                    {actif === 'step2' ? 'Traitement…' : 'Confirmer la préparation'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {showStep3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '14px', padding: '1rem 1.2rem', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Truck size={20} color={ORANGE} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#b45309', marginBottom: '4px' }}>
                    Étape 3 — Remettre le colis au transporteur
                  </div>
                  <p style={{ fontSize: '0.82rem', color: ORANGE, margin: '0 0 12px' }}>
                    Le colis est prêt. Confirmez que vous l'avez remis physiquement au transporteur.
                  </p>
                  <button onClick={() => action('step3', () => OrderService.enLivraison(id))}
                    disabled={actif === 'step3'}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.3rem', background: ORANGE, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer', opacity: actif === 'step3' ? 0.7 : 1 }}>
                    <Truck size={14} />
                    {actif === 'step3' ? 'Traitement…' : 'Confirmer la remise au transporteur'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {statut === 'EN_PREPARATION' && order.confirme_vendeur && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '1rem 1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} color="#16a34a" />
              <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>
                Colis remis — en attente de prise en charge par le transporteur.
              </span>
            </motion.div>
          )}

          {statut === 'EN_LIVRAISON' && (
            <motion.div key="indelivery" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: '#e0f2fe', border: '1.5px solid #7dd3fc', borderRadius: '14px', padding: '1rem 1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Truck size={18} color="#0369a1" />
              <span style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 600 }}>
                Le transporteur est en route vers l'acheteur.
              </span>
            </motion.div>
          )}

          {statut === 'LIVREE' && (
            <motion.div key="livree" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '14px', padding: '1rem 1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={18} color="#16a34a" />
              <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>
                Colis livré — en attente de confirmation de l'acheteur pour libérer les fonds.
              </span>
            </motion.div>
          )}

          {statut === 'PAIEMENT_LIBERE' && (
            <motion.div key="libere" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #86efac', borderRadius: '16px', padding: '1.2rem 1.5rem', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={22} color="#16a34a" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#15803d' }}>Paiement libéré !</div>
                  <div style={{ fontSize: '0.85rem', color: '#16a34a', marginTop: '2px' }}>
                    {fmt(order.montant_vendeur)} ont été ajoutés à votre portefeuille.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CORPS ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>

          {/* Colonne principale */}
          <div style={{ flex: 2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Produit */}
            <div style={card}>
              <div style={cardTitle}>Produit commandé</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {order.produit_image && (
                  <img src={order.produit_image} alt={order.produit_nom}
                    style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a2e10' }}>{order.produit_nom || '—'}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px' }}>
                    {order.quantite} kg × {fmt(order.prix_unitaire)}
                  </div>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a2e10' }}>{fmt(order.montant_produit)}</div>
              </div>
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  ['Sous-total', fmt(order.montant_produit)],
                  ['Frais livraison', fmt(order.frais_livraison)],
                  ['Frais paiement', fmt(order.frais_paiement)],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280' }}>
                    <span>{l}</span><span>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, color: '#1a2e10', borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' }}>
                  <span>Total</span><span>{fmt(order.montant_total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600, color: GREEN }}>
                  <span>Votre gain net</span><span>{fmt(order.montant_vendeur)}</span>
                </div>
              </div>
            </div>

            {/* Note acheteur */}
            {order.note_acheteur && (
              <div style={card}>
                <div style={cardTitle}>Note de l'acheteur</div>
                <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: 1.6 }}>"{order.note_acheteur}"</p>
              </div>
            )}
          </div>

          {/* Colonne latérale */}
          <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Adresse livraison */}
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #86efac', borderRadius: '16px', padding: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#15803d', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} /> Livraison
              </div>
              <p style={{ fontSize: '14px', color: '#1a2e10', margin: '0 0 10px', fontWeight: 500, lineHeight: 1.6 }}>
                {order.adresse_livraison || '—'}
              </p>
              {order.telephone_livraison && (
                <a href={`tel:${order.telephone_livraison}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: GREEN, color: '#fff', padding: '7px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  <Phone size={13} /> {order.telephone_livraison}
                </a>
              )}
            </div>

            {/* Acheteur */}
            <div style={card}>
              <div style={cardTitle}>Acheteur</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: GREEN, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
                  {order.acheteur_nom?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a2e10' }}>{order.acheteur_nom || '—'}</div>
              </div>
            </div>

            {/* Transporteur */}
            {order.transporteur_nom && (
              <div style={card}>
                <div style={cardTitle}>Transporteur</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1e40af', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
                    {order.transporteur_nom?.[0]?.toUpperCase() || 'T'}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a2e10' }}>{order.transporteur_nom}</div>
                </div>
              </div>
            )}

            {/* Paiement */}
            <div style={card}>
              <div style={cardTitle}>Paiement</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#374151' }}>
                <div><strong>Mode :</strong> {order.mode_paiement || '—'}</div>
                <div><strong>Référence :</strong> {order.reference}</div>
                <div><strong>Total :</strong> <span style={{ color: GREEN, fontWeight: 700 }}>{fmt(order.montant_total)}</span></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const card     = { background: '#fff', borderRadius: '16px', padding: '18px', border: '1.5px solid #e5e7eb' };
const cardTitle = { fontSize: '14px', fontWeight: 700, color: '#1a2e10', marginBottom: '14px' };
