import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Lock, CheckCircle, ArrowLeft,
  MapPin, Star, Package, AlertCircle,
} from 'lucide-react';
import ProductService from '../../services/product.service';
import CartService from '../../services/cart.service';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';

const GREEN = '#1a5c2a';

const UNITE_LABEL = {
  KG:        'kg',
  TONNE:     'tonne',
  SAC_50KG:  'sac 50kg',
  SAC_100KG: 'sac 100kg',
};

export default function ProductDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [produit,  setProduit]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [qty,      setQty]      = useState(1);
  const [imgIdx,   setImgIdx]   = useState(0);
  const [adding,   setAdding]   = useState(false);
  const [added,    setAdded]    = useState(false);
  const [errCart,  setErrCart]  = useState('');

  useEffect(() => {
    ProductService.detail(id)
      .then(data => setProduit(data.produit || data))
      .catch(() => setProduit(null))
      .finally(() => setLoading(false));
  }, [id]);

  const ajouterPanier = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    setAdding(true);
    setErrCart('');
    try {
      await CartService.ajouter(produit.id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Impossible d\'ajouter au panier.';
      setErrCart(msg);
      setTimeout(() => setErrCart(''), 3000);
    } finally {
      setAdding(false);
    }
  };

  /* ── États de chargement / erreur ───────────────────────── */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f4' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${GREEN}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!produit) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f4f6f4', gap: '12px' }}>
      <Package size={48} color="#d1d5db" />
      <p style={{ color: '#6b7280', fontSize: '1rem' }}>Produit introuvable</p>
      <button onClick={() => navigate(-1)} style={{ background: GREEN, color: 'white', border: 'none', borderRadius: '10px', padding: '0.6rem 1.4rem', cursor: 'pointer', fontWeight: '600' }}>
        Retour
      </button>
    </div>
  );

  /* ── Dérivés ────────────────────────────────────────────── */
  const images     = produit.images || [];
  const imgSrc     = images.length > 0 ? images[imgIdx]?.image : null;
  const enStock    = produit.est_disponible && Number(produit.quantite) > 0;
  const uniteLabel = UNITE_LABEL[produit.unite] || produit.unite || 'kg';
  const maxQty     = Math.max(1, Number(produit.quantite));

  /* ── Rendu ──────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f4' }}>

      {/* TOPBAR */}
      <div style={{ background: 'white', padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: '#f3f4f6', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex' }}
        >
          <ArrowLeft size={18} color="#374151" />
        </button>
        <span style={{ fontWeight: '700', fontSize: '1rem', color: '#1a2e10' }}>Détail du produit</span>
      </div>

      {/* CONTENU */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.5rem', animation: 'fadeIn 0.35s ease both' }} className="product-detail-grid">

          {/* ── COLONNE IMAGE ── */}
          <div>
            <div style={{ borderRadius: '20px', overflow: 'hidden', background: 'white', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={produit.nom}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                <Package size={64} color="#d1d5db" />
              )}
            </div>

            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <div
                    key={img.id}
                    onClick={() => setImgIdx(i)}
                    style={{ width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === imgIdx ? GREEN : '#e5e7eb'}`, transition: 'border-color 0.2s' }}
                  >
                    <img src={img.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── COLONNE INFOS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Catégorie + nom */}
            <div>
              {produit.categorie_nom && (
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: GREEN, background: '#dcfce7', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {produit.categorie_nom}
                </span>
              )}
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a2e10', margin: '10px 0 0', lineHeight: 1.3 }}>
                {produit.nom}
              </h1>
            </div>

            {/* Prix */}
            <div style={{ fontSize: '2rem', fontWeight: '800', color: GREEN }}>
              {formatPrice(produit.prix)}
              <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#6b7280', marginLeft: '6px' }}>/ {uniteLabel}</span>
            </div>

            {/* Stock */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '5px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600',
              background: enStock ? '#dcfce7' : '#fee2e2',
              color:      enStock ? '#15803d' : '#dc2626',
              width: 'fit-content',
            }}>
              <CheckCircle size={13} />
              {enStock
                ? `En stock — ${Number(produit.quantite)} ${uniteLabel} disponible(s)`
                : 'Rupture de stock'}
            </div>

            {/* Vendeur */}
            {produit.vendeur_nom && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', borderRadius: '12px', padding: '10px 14px', border: '1px solid #e5e7eb' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${GREEN}, #4db86a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.9rem', flexShrink: 0 }}>
                  {produit.vendeur_nom.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#1a2e10' }}>{produit.vendeur_nom}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Vendeur</div>
                </div>
              </div>
            )}

            {/* Localisation */}
            {(produit.ville || produit.localisation) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: '#6b7280' }}>
                <MapPin size={14} color="#9ca3af" />
                {[produit.ville, produit.localisation].filter(Boolean).join(', ')}
              </div>
            )}

            {/* Note */}
            {produit.note_moyenne > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: '#6b7280' }}>
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                <span style={{ fontWeight: '600', color: '#1a2e10' }}>{Number(produit.note_moyenne).toFixed(1)}</span>
                <span>({produit.total_avis} avis)</span>
              </div>
            )}

            {/* Description */}
            {produit.description && (
              <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.7, margin: 0, background: 'white', borderRadius: '12px', padding: '12px 14px', border: '1px solid #e5e7eb' }}>
                {produit.description}
              </p>
            )}

            {/* Sélecteur quantité */}
            {enStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: 'white', fontSize: '1.2rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >−</button>
                <span style={{ fontSize: '1rem', fontWeight: '700', minWidth: '28px', textAlign: 'center' }}>{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                  style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: 'white', fontSize: '1.2rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >+</button>
                <span style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: '500' }}>{uniteLabel}</span>
              </div>
            )}

            {/* Erreur panier */}
            {errCart && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.6rem 1rem', fontSize: '0.83rem', color: '#dc2626' }}>
                <AlertCircle size={14} /> {errCart}
              </div>
            )}

            {/* Bouton ajouter au panier */}
            <button
              onClick={ajouterPanier}
              disabled={!enStock || adding}
              style={{
                width: '100%', padding: '0.9rem',
                background: added
                  ? '#15803d'
                  : (!enStock || adding ? '#e5e7eb' : `linear-gradient(135deg, ${GREEN}, #2d8c47)`),
                color: (!enStock || adding) ? '#9ca3af' : 'white',
                border: 'none', borderRadius: '14px',
                fontWeight: '700', fontSize: '0.97rem',
                cursor: (!enStock || adding) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: enStock && !adding ? '0 4px 20px rgba(26,92,42,0.28)' : 'none',
                transition: 'background 0.3s ease',
              }}
            >
              {adding ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Ajout en cours…
                </span>
              ) : added ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={18} /> Ajouté au panier !
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCart size={18} />
                  {enStock ? 'Ajouter au panier' : 'Rupture de stock'}
                </span>
              )}
            </button>

            {/* Accès panier rapide (après ajout) */}
            {added && (
              <button
                onClick={() => navigate('/buyer/cart')}
                style={{ width: '100%', padding: '0.75rem', background: 'white', border: `1.5px solid ${GREEN}`, borderRadius: '14px', fontWeight: '700', fontSize: '0.9rem', color: GREEN, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                Voir mon panier →
              </button>
            )}

            {/* Note sécurité */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#6b7280', background: '#f9fafb', borderRadius: '10px', padding: '10px 14px', border: '1px solid #e5e7eb' }}>
              <Lock size={13} color="#9ca3af" />
              Paiement sécurisé — les fonds sont libérés uniquement après livraison confirmée
            </div>

          </div>
        </div>

        {/* AVIS */}
        {produit.avis?.length > 0 && (
          <div style={{ marginTop: '1.5rem', background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', animation: 'fadeIn 0.4s ease 0.15s both' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a2e10', margin: '0 0 1rem' }}>
              Avis clients ({produit.avis.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {produit.avis.map((a, i) => (
                <div key={a.id ?? i} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none', paddingTop: i > 0 ? '10px' : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `linear-gradient(135deg, ${GREEN}, #4db86a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.75rem' }}>
                      {a.acheteur_nom?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '0.84rem', color: '#1a2e10' }}>{a.acheteur_nom}</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={11} color="#f59e0b" fill={s <= a.note ? '#f59e0b' : 'none'} />)}
                    </div>
                  </div>
                  {a.commentaire && (
                    <p style={{ fontSize: '0.83rem', color: '#6b7280', margin: 0, paddingLeft: '36px' }}>
                      {a.commentaire}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 640px) {
          .product-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
