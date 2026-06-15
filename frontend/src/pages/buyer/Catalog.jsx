import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ShoppingCart, CheckCircle, Search, Package } from 'lucide-react';
import ProductService from '../../services/product.service';
import CartService from '../../services/cart.service';
import { formatPrice } from '../../utils/formatPrice';
import DashboardLayout from '../../Components/layout/DashboardLayout';

const GREEN = '#1a5c2a';

function getImage(produit) {
  const principale = produit.images?.find(i => i.est_principale);
  const premiere   = produit.images?.[0];
  return principale?.image || premiere?.image || null;
}

export default function Catalog() {
  const navigate = useNavigate();

  const [produits,    setProduits]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [categorie,   setCategorie]   = useState('');
  const [tri,         setTri]         = useState('');
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
  const [addingId,    setAddingId]    = useState(null);
  const [addedIds,    setAddedIds]    = useState(new Set());

  /* â”€â”€ Chargement categories â”€â”€ */
  useEffect(() => {
    ProductService.getCategories()
      .then(data => setCategories(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => {});
  }, []);

  /* â”€â”€ Chargement panier initial â”€â”€ */
  useEffect(() => {
    CartService.monPanier()
      .then(data => {
        const lignes = data.lignes || data.items || [];
        const ids = new Set(lignes.map(l => l.produit_id));
        setAddedIds(ids);
      })
      .catch(() => {});
  }, []);

  /* â”€â”€ Chargement produits â”€â”€ */
  const charger = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const p    = reset ? 1 : page;
      const data = await ProductService.getAll({
        page: p,
        search,
        categorie,
        ordering: tri,
      });
      const results = data.results || [];
      setProduits(prev => reset ? results : [...prev, ...results]);
      setHasMore(!!data.next);
      if (reset) setPage(1);
    } finally {
      setLoading(false);
    }
  }, [search, categorie, tri, page]);

  useEffect(() => { charger(true); }, [search, categorie, tri]);

  /* â”€â”€ Ajouter au panier â”€â”€ */
  const ajouterAuPanier = async (produit) => {
    if (addingId === produit.id || addedIds.has(produit.id)) return;
    setAddingId(produit.id);
    try {
      await CartService.ajouter(produit.id, 1);
      setAddedIds(prev => new Set([...prev, produit.id]));
    } catch {
      /* silencieux */
    } finally {
      setAddingId(null);
    }
  };

  return (
    <DashboardLayout role="buyer">
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* â”€â”€ EN-TÊTE â”€â”€ */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Leaf size={20} color={GREEN} /> Catalogue
          </h1>
          <button
            onClick={() => navigate('/buyer/cart')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: GREEN, color: 'white', border: 'none', borderRadius: '10px', padding: '9px 18px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}
          >
            <ShoppingCart size={16} /> Mon panier
          </button>
        </div>

        {/* â”€â”€ FILTRES â”€â”€ */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.4rem' }}>
          <div style={{ position: 'relative', flex: 2, minWidth: '200px' }}>
            <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Rechercher un produit, ville..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.4rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', color: '#1a2e10' }}
            />
          </div>

          <select
            value={categorie}
            onChange={e => setCategorie(e.target.value)}
            style={{ flex: 1, minWidth: '150px', padding: '0.7rem 1rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.88rem', outline: 'none', background: 'white', color: '#374151' }}
          >
            <option value="">Toutes catégories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.nom || c.name}</option>
            ))}
          </select>

          <select
            value={tri}
            onChange={e => setTri(e.target.value)}
            style={{ flex: 1, minWidth: '150px', padding: '0.7rem 1rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.88rem', outline: 'none', background: 'white', color: '#374151' }}
          >
            <option value="">Trier par</option>
            <option value="prix">Prix croissant</option>
            <option value="-prix">Prix décroissant</option>
            <option value="-created_at">Plus récents</option>
            <option value="-note_moyenne">Mieux notés</option>
          </select>
        </div>

        {/* â”€â”€ GRILLE â”€â”€ */}
        {loading && produits.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {[...Array(8)].map((_, i) => (<div key={`skel-${i}`} style={{ background: '#f3f4f6', borderRadius: '16px', height: '300px' }} />
            ))}
          </div>
        ) : produits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
            <Package size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#6b7280', fontWeight: '600' }}>Aucun produit trouvé</p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Modifiez vos filtres de recherche</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {produits.map((p, i) => {
              const image   = getImage(p);
              const enStock = p.est_disponible && Number(p.quantite) > 0;
              const estAjout = addingId === p.id;
              const estAjoute = addedIds.has(p.id);

              return (
                <div
                  key={p.id}
                  style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', animation: `fadeInUp 0.35s ease both`, animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
                >
                  {/* Image */}
                  <div
                    onClick={() => navigate(`/products/${p.id}`)}
                    style={{ height: '170px', background: '#f9fafb', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={p.nom}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={40} color="#d1d5db" />
                      </div>
                    )}
                    {p.categorie_nom && (
                      <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(26,92,42,0.85)', color: 'white', fontSize: '0.68rem', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                        {p.categorie_nom}
                      </span>
                    )}
                  </div>

                  {/* Infos */}
                  <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <p
                      onClick={() => navigate(`/products/${p.id}`)}
                      style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10', cursor: 'pointer', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                    >
                      {p.nom}
                    </p>

                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                      par <span style={{ fontWeight: '600', color: '#374151' }}>{p.vendeur_nom || '—'}</span>
                    </p>

                    <p style={{ margin: 0, fontWeight: '800', fontSize: '1rem', color: GREEN }}>
                      {formatPrice(p.prix)}
                      <span style={{ fontSize: '0.72rem', fontWeight: '500', color: '#9ca3af', marginLeft: '4px' }}>
                        / {p.unite === 'KG' ? 'kg' : p.unite === 'TONNE' ? 't' : p.unite === 'SAC_50KG' ? 'sac 50kg' : p.unite === 'SAC_100KG' ? 'sac 100kg' : p.unite || 'kg'}
                      </span>
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '600', color: enStock ? '#15803d' : '#dc2626' }}>
                      {enStock
                        ? <><CheckCircle size={12} /> En stock ({Number(p.quantite)})</>
                        : <span>En rupture de stock</span>
                      }
                    </div>

                    <button
                      onClick={() => enStock && ajouterAuPanier(p)}
                      disabled={!enStock || estAjout || estAjoute}
                      style={{
                        marginTop: 'auto',
                        width: '100%', padding: '0.65rem',
                        background: estAjoute
                          ? '#15803d'
                          : (!enStock ? '#f3f4f6' : `linear-gradient(135deg, ${GREEN}, #2d8c47)`),
                        color: (!enStock && !estAjoute) ? '#9ca3af' : 'white',
                        border: 'none', borderRadius: '10px',
                        fontWeight: '700', fontSize: '0.83rem',
                        cursor: (!enStock || estAjoute) ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        transition: 'background 0.3s',
                        opacity: estAjout ? 0.7 : 1,
                      }}
                    >
                      {estAjout ? (
                        <>
                          <span style={{ width: '13px', height: '13px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                          Ajout…
                        </>
                      ) : estAjoute ? (
                        <><CheckCircle size={14} /> Ajouté !</>
                      ) : enStock ? (
                        <><ShoppingCart size={14} /> Ajouter au panier</>
                      ) : (
                        'Rupture de stock'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* â”€â”€ CHARGER PLUS â”€â”€ */}
        {hasMore && (
          <button
            onClick={() => { setPage(p => p + 1); charger(); }}
            style={{ width: '100%', marginTop: '1.2rem', padding: '0.85rem', background: 'white', border: `1.5px solid ${GREEN}`, borderRadius: '12px', fontWeight: '700', color: GREEN, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            {loading ? 'Chargement…' : 'Charger plus de produits'}
          </button>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </DashboardLayout>
  );
}

