import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Package, MapPin } from 'lucide-react';
import AdminLayout from '../../Components/layout/AdminLayout';
import AdminService from '../../services/admin.service';
import ProductService from '../../services/product.service';

const STATUT_STYLE = {
  disponible:    { bg: '#dcfce7', color: '#16a34a', label: 'Disponible'   },
  indisponible:  { bg: '#fee2e2', color: '#dc2626', label: 'Indisponible' },
  suspendu:      { bg: '#fef3c7', color: '#d97706', label: 'Suspendu'     },
  en_attente:    { bg: '#eff6ff', color: '#2563eb', label: 'En attente'   },
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [msg,      setMsg]      = useState('');

  const charger = (q = '') => {
    setLoading(true);
    const params = q ? { search: q } : {};
    ProductService.liste(params)
      .then(data => setProducts(data.results ?? data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const moderer = async (id, action) => {
    try {
      await AdminService.modererProduit(id, action);
      setMsg(`Produit ${action === 'approuver' ? 'approuvé' : 'suspendu'}`);
      charger(search);
    } catch {
      setMsg('Erreur lors de la modération');
    }
  };

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>Modérer les produits</h1>
          <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>{products.length} produits publiés</p>
        </div>

        {msg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {msg}
          </div>
        )}

        {/* Recherche */}
        <form onSubmit={e => { e.preventDefault(); charger(search); }}
          style={{ background: 'white', borderRadius: '14px', padding: '1rem', border: '1px solid #f0f0f0', marginBottom: '1.2rem', display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un produit, vendeur, ville..."
              style={{ width: '100%', padding: '0.55rem 0.8rem 0.55rem 2rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>
          <button type="submit" style={{ padding: '0.55rem 1rem', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
            Chercher
          </button>
        </form>

        {/* Grille produits */}
        {loading ? (
          <div className="row g-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4">
                <div style={{ background: '#f3f4f6', borderRadius: '14px', height: '180px' }} />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1px solid #f0f0f0' }}>
            <Package size={40} color="#d1d5db" />
            <p style={{ color: '#9ca3af', fontWeight: '600', marginTop: '0.8rem' }}>Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="row g-3">
            {products.map(p => {
              const statut = p.est_disponible ? 'disponible' : 'indisponible';
              const ss = STATUT_STYLE[p.statut_moderation ?? statut] || STATUT_STYLE.disponible;
              const img = p.images?.find(i => i.est_principale)?.image || p.images?.[0]?.image;
              return (
                <div key={p.id} className="col-12 col-md-6 col-lg-4">
                  <motion.div
                    whileHover={{ y: -3 }}
                    style={{ background: 'white', borderRadius: '14px', border: '1px solid #f0f0f0', overflow: 'hidden' }}
                  >
                    {img ? (
                      <img src={img} alt={p.nom} style={{ width: '100%', height: '130px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '130px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={32} color="#86efac" />
                      </div>
                    )}
                    <div style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: '700', color: '#1a2e10', fontSize: '0.92rem' }}>{p.nom}</div>
                        <span style={{ background: ss.bg, color: ss.color, padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '6px' }}>
                          {ss.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.3rem' }}>
                        <MapPin size={12} /> {p.ville || '—'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.8rem' }}>
                        Vendeur : {p.vendeur_nom || '—'} · {Number(p.prix).toLocaleString('fr-FR')} FCFA
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => moderer(p.id, 'approuver')}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '5px', background: '#f0fdf4', color: '#1a5c2a', border: '1px solid #86efac', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                          <CheckCircle size={13} /> Approuver
                        </button>
                        <button
                          onClick={() => moderer(p.id, 'suspendre')}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '5px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                          <XCircle size={13} /> Suspendre
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
