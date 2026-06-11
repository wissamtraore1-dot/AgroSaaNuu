import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, CheckCircle, ChevronRight,
  Loader, Lock, MapPin, Package, Shield, ShoppingBag, Smartphone, Truck,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import OrderService from '../../services/order.service';
import CartService from '../../services/cart.service';
import { useAuth } from '../../context/AuthContext';

const GREEN = '#1a5c2a';

const MODES_PAIEMENT = [
  { id: 'MTN',    label: 'MTN Mobile Money',  frais: 1   },
  { id: 'MOOV',   label: 'Moov Money',         frais: 1   },
  { id: 'CELTIS', label: 'Celtis Cash',         frais: 0.5 },
  { id: 'BANK',   label: 'Virement bancaire',   frais: 0   },
];

const FRAIS_LIVRAISON_PAR_COMMANDE = 5000;

export default function Checkout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();

  /* Lignes passées depuis le panier */
  const lignes = location.state?.lignes || [];

  const [step,       setStep]       = useState(1); // 1=formulaire 2=traitement 3=succès
  const [mode,       setMode]       = useState('MTN');
  const [adresse,    setAdresse]    = useState('');
  const [telephone,  setTelephone]  = useState(user?.telephone || '');
  const [note,       setNote]       = useState('');
  const [erreur,     setErreur]     = useState('');
  const [commandes,  setCommandes]  = useState([]); // résultats après création

  /* Calculs */
  const modeActif      = MODES_PAIEMENT.find(m => m.id === mode);
  const totalProduits  = lignes.reduce((s, l) => s + Number(l.sous_total || 0), 0);
  const fraisLivraison = FRAIS_LIVRAISON_PAR_COMMANDE * lignes.length;
  const fraisPaiement  = Math.round(totalProduits * (modeActif?.frais || 0) / 100);
  const totalEstime    = totalProduits + fraisLivraison + fraisPaiement;

  /* Redirection si on arrive sans lignes */
  useEffect(() => {
    if (lignes.length === 0) navigate('/buyer/cart', { replace: true });
  }, []); // eslint-disable-line

  /* ── Création des commandes ── */
  const handleCommander = async () => {
    if (!adresse.trim())    return setErreur('Veuillez saisir votre adresse de livraison.');
    if (!telephone.trim())  return setErreur('Veuillez saisir votre numéro de téléphone.');
    setErreur('');
    setStep(2);

    const creees = [];
    for (const ligne of lignes) {
      try {
        const res = await OrderService.passerCommande({
          produit_id:          ligne.produit_id,
          quantite:            ligne.quantite,
          mode_paiement:       mode,
          adresse_livraison:   adresse.trim(),
          telephone_livraison: telephone.trim(),
          note_acheteur:       note.trim(),
        });
        creees.push({ ...res.commande, produit_nom: ligne.produit_nom, ok: true });
      } catch (err) {
        const msg = err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' ')
          : err.response?.data?.message || 'Erreur inconnue';
        creees.push({ produit_nom: ligne.produit_nom, ok: false, erreur: msg });
      }
    }

    setCommandes(creees);
    /* Vider le panier si toutes les commandes ont réussi */
    if (creees.every(c => c.ok)) {
      try { await CartService.vider(); } catch { /* silencieux */ }
    }
    setStep(3);
  };

  /* ── RENDU ── */
  if (lignes.length === 0) return null;

  return (
    <DashboardLayout role="buyer">
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Retour */}
        <button
          onClick={() => navigate('/buyer/cart')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '1.2rem' }}
        >
          <ArrowLeft size={15} /> Retour au panier
        </button>

        <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingBag size={20} color={GREEN} /> Finaliser la commande
        </h1>

        {/* ══════════ ÉTAPE 1 : FORMULAIRE ══════════ */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>

            {/* Formulaire gauche */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {erreur && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px', padding: '12px' }}>
                  <AlertCircle size={15} /> {erreur}
                </div>
              )}

              {/* Articles commandés */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', padding: '1.2rem' }}>
                <p style={{ margin: '0 0 1rem', fontWeight: '800', fontSize: '0.95rem', color: '#1a2e10' }}>
                  Articles ({lignes.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {lignes.map(l => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid #f3f4f6' }}>
                      {l.produit_image ? (
                        <img src={l.produit_image} alt={l.produit_nom} style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Package size={22} color="#d1d5db" />
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '0.88rem', color: '#1a2e10' }}>{l.produit_nom}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>Vendeur : {l.vendeur_nom} · Qté : {l.quantite}</p>
                      </div>
                      <p style={{ margin: 0, fontWeight: '800', color: GREEN, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                        {Number(l.sous_total).toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Livraison */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', padding: '1.2rem' }}>
                <p style={{ margin: '0 0 1rem', fontWeight: '800', fontSize: '0.95rem', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={16} color={GREEN} /> Livraison
                </p>

                <label style={lbl}>Adresse de livraison *</label>
                <textarea
                  value={adresse}
                  onChange={e => setAdresse(e.target.value)}
                  rows={3}
                  placeholder="Ville, quartier, repère..."
                  style={inp}
                />

                <label style={lbl}>Téléphone de contact *</label>
                <input
                  value={telephone}
                  onChange={e => setTelephone(e.target.value)}
                  placeholder="+229 XX XX XX XX"
                  style={inp}
                />

                <label style={lbl}>Note au vendeur (optionnel)</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  placeholder="Instructions utiles pour la préparation..."
                  style={inp}
                />
              </div>

              {/* Mode de paiement */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', padding: '1.2rem' }}>
                <p style={{ margin: '0 0 1rem', fontWeight: '800', fontSize: '0.95rem', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Smartphone size={16} color={GREEN} /> Mode de paiement
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {MODES_PAIEMENT.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '12px', borderRadius: '12px', cursor: 'pointer',
                        border: `2px solid ${mode === m.id ? GREEN : '#e5e7eb'}`,
                        background: mode === m.id ? '#f0fdf4' : 'white',
                        fontWeight: '700', fontSize: '0.82rem', color: mode === m.id ? GREEN : '#374151',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Smartphone size={15} />
                      <span>{m.label}</span>
                      {m.frais > 0 && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#9ca3af' }}>+{m.frais}%</span>}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Récapitulatif droite */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #e5e7eb', padding: '1.4rem', position: 'sticky', top: '80px' }}>
              <p style={{ margin: '0 0 1rem', fontWeight: '800', fontSize: '0.95rem', color: '#1a2e10' }}>Récapitulatif</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <div style={row}>
                  <span style={{ color: '#6b7280', fontSize: '0.83rem' }}>Produits ({lignes.length})</span>
                  <span style={{ fontWeight: '700', fontSize: '0.83rem' }}>{totalProduits.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div style={row}>
                  <span style={{ color: '#6b7280', fontSize: '0.83rem' }}>Livraison</span>
                  <span style={{ fontWeight: '700', fontSize: '0.83rem' }}>{fraisLivraison.toLocaleString('fr-FR')} FCFA</span>
                </div>
                {fraisPaiement > 0 && (
                  <div style={row}>
                    <span style={{ color: '#6b7280', fontSize: '0.83rem' }}>Frais {modeActif?.label}</span>
                    <span style={{ fontWeight: '700', fontSize: '0.83rem' }}>{fraisPaiement.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1rem', color: '#1a2e10', marginBottom: '1rem' }}>
                <span>Total estimé</span>
                <span style={{ color: GREEN }}>{totalEstime.toLocaleString('fr-FR')} FCFA</span>
              </div>

              <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '0.65rem 0.9rem', fontSize: '0.75rem', color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                <Lock size={12} /> Paiement sécurisé — fonds bloqués jusqu'à réception
              </div>

              <button
                onClick={handleCommander}
                style={{ width: '100%', background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.9rem', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(26,92,42,0.25)' }}
              >
                <ShoppingBag size={17} /> Passer la commande <ChevronRight size={16} />
              </button>
            </div>

          </div>
        )}

        {/* ══════════ ÉTAPE 2 : TRAITEMENT ══════════ */}
        {step === 2 && (
          <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #e5e7eb', padding: '3rem', textAlign: 'center' }}>
            <Loader size={40} color={GREEN} style={{ animation: 'spin 1s linear infinite', marginBottom: '1.2rem' }} />
            <p style={{ fontWeight: '700', color: '#1a2e10', fontSize: '1rem' }}>Création de vos commandes en cours…</p>
            <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Veuillez patienter, ne fermez pas cette page.</p>
          </div>
        )}

        {/* ══════════ ÉTAPE 3 : RÉSULTAT ══════════ */}
        {step === 3 && (
          <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #e5e7eb', padding: '2rem' }}>

            {/* En-tête résultat */}
            {commandes.every(c => c.ok) ? (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <CheckCircle size={36} color="white" />
                </div>
                <h2 style={{ fontWeight: '800', color: '#1a2e10', margin: '0 0 6px' }}>
                  {commandes.length === 1 ? 'Commande créée !' : `${commandes.length} commandes créées !`}
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  Vos fonds sont sécurisés en séquestre. Le vendeur peut maintenant préparer la livraison.
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <AlertCircle size={40} color="#f59e0b" style={{ marginBottom: '0.8rem' }} />
                <h2 style={{ fontWeight: '800', color: '#1a2e10', margin: '0 0 6px' }}>Résultat partiel</h2>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Certaines commandes ont rencontré une erreur.</p>
              </div>
            )}

            {/* Détail par commande */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
              {commandes.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: c.ok ? '#f0fdf4' : '#fef2f2', border: `1px solid ${c.ok ? '#bbf7d0' : '#fecaca'}` }}>
                  {c.ok
                    ? <CheckCircle size={18} color="#16a34a" />
                    : <AlertCircle size={18} color="#dc2626" />
                  }
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '0.88rem', color: '#1a2e10' }}>{c.produit_nom}</p>
                    {c.ok
                      ? <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>Référence : {c.reference}</p>
                      : <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#dc2626' }}>{c.erreur}</p>
                    }
                  </div>
                  {c.ok && (
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#16a34a', background: '#dcfce7', borderRadius: '20px', padding: '2px 10px' }}>
                      Créée
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/buyer/orders')}
                style={{ flex: 1, background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.85rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ShoppingBag size={16} /> Voir mes commandes
              </button>
              <button
                onClick={() => navigate('/buyer/catalog')}
                style={{ flex: 1, background: 'white', color: GREEN, border: `1.5px solid ${GREEN}`, borderRadius: '12px', padding: '0.85rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        )}

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}

const lbl = { display: 'block', color: '#374151', fontWeight: '700', fontSize: '0.83rem', margin: '12px 0 5px' };
const inp = { width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '10px 12px', background: '#fafafa', color: '#1a2e10', outline: 'none', fontSize: '0.88rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' };
const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
