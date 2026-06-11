import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Trash2, Edit, Search, Loader, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import ProductService from '../../services/product.service';
import { useNotificationContext } from '../../context/NotificationContext';

const GREEN  = '#1a5c2a';
const fadeUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

export default function SellerProducts() {
  const navigate = useNavigate();
  const { success, error: notifError } = useNotificationContext();
  const [produits,   setProduits]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [supprimant, setSupprimant] = useState(null);
  const [search,     setSearch]     = useState('');

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      setLoading(true);
      const data = await ProductService.mesProduits();
      const liste = Array.isArray(data) ? data : data.results || [];
      setProduits(liste);
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimer = async (id, nom) => {
    if (!window.confirm(`Supprimer "${nom}" ?`)) return;
    setSupprimant(id);
    try {
      await ProductService.supprimer(id);
      success(`"${nom}" supprimé`);
      charger();
    } catch {
      notifError('Impossible de supprimer ce produit');
    } finally {
      setSupprimant(null);
    }
  };

  const filtrés = produits.filter(p =>
    (p.nom || p.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="seller">
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}
        >
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={22} color={GREEN} /><span> Mes produits</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>{produits.length} produit(s) en ligne</p>
          </div>
          <motion.button
            onClick={() => navigate('/seller/add-product')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `linear-gradient(135deg, ${GREEN}, #2d6a4f)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.7rem 1.4rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            <Plus size={16} /><span> Ajouter un produit</span>
          </motion.button>
        </motion.div>

        {/* RECHERCHE */}
        <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
          <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* LISTE */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[...Array(4)].map((_, i) => <div key={i} style={{ height: '80px', borderRadius: '12px', background: '#f3f4f6' }} />)}
          </div>

        ) : filtrés.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="show"
            style={{ background: 'white', borderRadius: '20px', padding: '3rem 2rem', border: '1px solid #e5e7eb', textAlign: 'center' }}
          >
            <Package size={52} color="#e5e7eb" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>
              {search ? 'Aucun résultat' : 'Aucun produit pour l\'instant'}
            </h3>
            {!search && (
              <motion.button
                onClick={() => navigate('/seller/add-product')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `linear-gradient(135deg, ${GREEN}, #2d6a4f)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.8rem 2rem', fontWeight: '700', cursor: 'pointer', marginTop: '0.5rem' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              >
                <Plus size={16} /><span> Publier mon premier produit</span>
              </motion.button>
            )}
          </motion.div>

        ) : (
          <AnimatePresence>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtrés.map((p, i) => {
                const nom = p.nom || p.name || 'Produit';
                const prix = Number(p.prix || p.price || 0).toLocaleString('fr-FR');
                const stock = p.stock ?? '—';
                const categorie = p.categorie_nom || p.category_name || '—';

                return (
                  <motion.div
                    key={p.id}
                    variants={fadeUp} initial="hidden" animate="show"
                    transition={{ delay: i * 0.04 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', borderRadius: '12px', padding: '14px', border: '1.5px solid #e5e7eb', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
                    whileHover={{ y: -2 }}
                  >
                    <img
                      src={p.image || '/assets/images/placeholder.png'}
                      alt={nom}
                      style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, background: '#f3f4f6' }}
                      onError={e => { e.target.src = ''; e.target.style.background = '#f3f4f6'; }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10' }}>{nom}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>
                        {categorie} · Stock : {stock}
                      </div>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: GREEN, marginTop: '4px' }}>
                        {prix} FCFA
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <motion.button
                        onClick={() => navigate(`/seller/edit-product/${p.id}`)}
                        style={{ padding: '7px 14px', background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer' }}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      >
                        <Edit size={14} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleSupprimer(p.id, nom)}
                        disabled={supprimant === p.id}
                        style={{ padding: '7px 14px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {supprimant === p.id ? (
                            <motion.div key="loading"
                              animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                              <Loader size={14} color="#dc2626" />
                            </motion.div>
                          ) : (
                            <motion.div key="idle"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                              <Trash2 size={14} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
}
