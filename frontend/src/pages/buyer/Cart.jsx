import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Loader, ShoppingBag, Lock, Package } from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import CartService from '../../services/cart.service';

const GREEN = '#1a5c2a';

export default function Cart() {
  const navigate = useNavigate();
  const [panier,   setPanier]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [actionId, setActionId] = useState(null);

  const charger = async () => {
    try {
      const data = await CartService.monPanier();
      setPanier(data);
    } catch {
      setPanier({ lignes: [], total: 0, nombre_articles: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const modifier = async (ligneId, nouvelleQte) => {
    setActionId(ligneId);
    try {
      const data = await CartService.modifier(ligneId, nouvelleQte);
      setPanier(data);
    } finally { setActionId(null); }
  };

  const supprimer = async (ligneId) => {
    setActionId(ligneId);
    try {
      const data = await CartService.supprimer(ligneId);
      setPanier(data);
    } finally { setActionId(null); }
  };

  const vider = async () => {
    setLoading(true);
    try {
      const data = await CartService.vider();
      setPanier(data);
    } finally { setLoading(false); }
  };

  const lignes = panier?.lignes || [];
  const total  = Number(panier?.total || 0);

  return (
    <DashboardLayout role="buyer">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* En-tête */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}
          >
            <ArrowLeft size={15} /> Retour
          </button>

          <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={20} /> Mon panier
            {lignes.length > 0 && (
              <span style={{ background: GREEN, color: 'white', borderRadius: '20px', padding: '2px 10px', fontSize: '0.78rem' }}>
                {lignes.length}
              </span>
            )}
          </h1>

          {lignes.length > 0 && (
            <button
              onClick={vider}
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '7px 12px', cursor: 'pointer', fontSize: '0.82rem', color: '#dc2626', fontWeight: '600' }}
            >
              <Trash2 size={14} /> Vider le panier
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            <Loader size={24} />
          </div>
        ) : lignes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '20px', border: '1.5px solid #e5e7eb' }}>
            <ShoppingCart size={56} color="#d1d5db" style={{ marginBottom: '1rem' }} />
            <p style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1a2e10', marginBottom: '0.5rem' }}>Votre panier est vide</p>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Ajoutez des produits depuis le catalogue</p>
            <button
              onClick={() => navigate('/buyer/catalog')}
              style={{ background: GREEN, color: 'white', border: 'none', borderRadius: '12px', padding: '0.8rem 2rem', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}
            >
              Parcourir le catalogue
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>

            {/* Articles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lignes.map(ligne => (
                <div
                  key={ligne.id}
                  style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '14px', animation: 'fadeIn 0.25s ease both' }}
                >
                  {ligne.produit_image ? (
                    <img
                      src={ligne.produit_image}
                      alt={ligne.produit_nom}
                      style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Package size={24} color="#d1d5db" />
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 3px', fontWeight: '700', color: '#1a2e10', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ligne.produit_nom}
                    </p>
                    <p style={{ margin: '0 0 6px', fontSize: '0.78rem', color: '#6b7280' }}>Vendeur : {ligne.vendeur_nom}</p>
                    <p style={{ margin: 0, fontWeight: '700', color: GREEN, fontSize: '0.9rem' }}>
                      {Number(ligne.prix_unitaire).toLocaleString('fr-FR')} FCFA / unité
                    </p>
                  </div>

                  {/* Quantité */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => modifier(ligne.id, ligne.quantite - 1)}
                      disabled={actionId === ligne.id}
                      style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', minWidth: '24px', textAlign: 'center' }}>
                      {actionId === ligne.id ? '…' : ligne.quantite}
                    </span>
                    <button
                      onClick={() => modifier(ligne.id, ligne.quantite + 1)}
                      disabled={actionId === ligne.id}
                      style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Sous-total + supprimer */}
                  <div style={{ textAlign: 'right', minWidth: '110px' }}>
                    <p style={{ margin: '0 0 6px', fontWeight: '800', color: '#1a2e10', fontSize: '0.95rem' }}>
                      {Number(ligne.sous_total).toLocaleString('fr-FR')} FCFA
                    </p>
                    <button
                      onClick={() => supprimer(ligne.id)}
                      disabled={actionId === ligne.id}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: '600', marginLeft: 'auto' }}
                    >
                      <Trash2 size={13} /> Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #e5e7eb', position: 'sticky', top: '80px' }}>
              <p style={{ margin: '0 0 1rem', fontWeight: '800', fontSize: '1rem', color: '#1a2e10' }}>Résumé</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
                {lignes.map(ligne => (
                  <div key={ligne.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#6b7280' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                      {ligne.produit_nom} ×{ligne.quantite}
                    </span>
                    <span>{Number(ligne.sous_total).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1rem', color: '#1a2e10', marginBottom: '1.2rem' }}>
                <span>Total</span>
                <span style={{ color: GREEN }}>{total.toLocaleString('fr-FR')} FCFA</span>
              </div>

              <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '0.7rem', fontSize: '0.78rem', color: GREEN, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                <Lock size={13} /> Paiement sécurisé — fonds bloqués jusqu'à la réception
              </div>

              <button
                onClick={() => navigate('/buyer/checkout', { state: { total, lignes } })}
                style={{ width: '100%', background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.9rem', fontWeight: '700', fontSize: '0.97rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(26,92,42,0.25)' }}
              >
                <ShoppingBag size={17} /> Passer la commande
              </button>
            </div>

          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </DashboardLayout>
  );
}
