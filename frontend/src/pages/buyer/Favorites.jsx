import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import ProductService from '../../services/product.service';
import DashboardLayout from '../../Components/layout/DashboardLayout';

export default function Favorites() {
  const navigate = useNavigate();
  const [favoris,  setFavoris]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  const charger = async () => {
    try {
      const data = await ProductService.mesFavoris();
      setFavoris(Array.isArray(data) ? data : data.results ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const retirerFavori = async (id) => {
    await ProductService.toggleFavori(id);
    setFavoris(prev => prev.filter(p => p.id !== id));
  };

  return (
    <DashboardLayout role="buyer">
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={20} color="#ef4444" fill="#ef4444" /> Mes favoris
          <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#6b7280' }}>({favoris.length})</span>
        </h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Chargement…</div>
      ) : favoris.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Heart size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
          <p style={{ color: '#9ca3af', fontSize: '1rem' }}>Aucun produit en favori</p>
          <motion.button
            onClick={() => navigate('/buyer/catalog')}
            style={{ background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: '700', marginTop: '0.5rem' }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            Parcourir le catalogue
          </motion.button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {favoris.map(produit => (
            <motion.div
              key={produit.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={produit.image || '/assets/images/placeholder.png'}
                  alt={produit.nom}
                  style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                />
                <motion.button
                  onClick={() => retirerFavori(produit.id)}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  whileHover={{ scale: 1.1 }} title="Retirer des favoris"
                >
                  <Heart size={16} color="#ef4444" fill="#ef4444" />
                </motion.button>
              </div>

              <div style={{ padding: '0.9rem' }}>
                <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#1a2e10', fontSize: '0.95rem' }}>{produit.nom}</p>
                <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: '#6b7280' }}>{produit.categorie?.nom || '—'}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '800', color: '#1a5c2a', fontSize: '1rem' }}>
                    {Number(produit.prix_unitaire).toLocaleString('fr-FR')} FCFA
                  </span>
                  <motion.button
                    onClick={() => navigate(`/products/${produit.id}`)}
                    style={{ background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: '600' }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  >
                    <ShoppingCart size={13} /> Voir
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
