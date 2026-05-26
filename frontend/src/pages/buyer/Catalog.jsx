// ============================================================
// AgroConnect — Buyer Catalog
// src/pages/buyer/Catalog.jsx
// ============================================================
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../../services/product.service';
import useCart from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';

const Catalog = () => {
  const navigate = useNavigate();
  const { handleAddItem, totalItems } = useCart();

  const [products,  setProducts]  = useState([]);
  const [categories,setCategories]= useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('');
  const [ordering,  setOrdering]  = useState('');
  const [page,      setPage]      = useState(1);
  const [hasMore,   setHasMore]   = useState(false);

  const load = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const p = reset ? 1 : page;
      const data = await ProductService.getAll({ page: p, search, category, ordering });
      setProducts(prev => reset ? data.results : [...prev, ...data.results]);
      setHasMore(!!data.next);
      if (reset) setPage(1);
    } finally {
      setLoading(false);
    }
  }, [search, category, ordering, page]);

  useEffect(() => {
    ProductService.getCategories().then(setCategories);
  }, []);

  useEffect(() => { load(true); }, [search, category, ordering]);

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <h5 style={styles.title}>🌾 Product Catalog</h5>
        <button style={styles.cartBtn} onClick={() => navigate('/buyer/cart')}>
          🛒 Cart {totalItems > 0 && <span style={styles.cartBadge}>{totalItems}</span>}
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <select value={category} onChange={e => setCategory(e.target.value)} style={styles.select}>
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={ordering} onChange={e => setOrdering(e.target.value)} style={styles.select}>
          <option value="">Sort by</option>
          <option value="price">Price ↑</option>
          <option value="-price">Price ↓</option>
          <option value="-created_at">Newest</option>
        </select>
      </div>

      {/* Grid */}
      {loading && products.length === 0 ? (
        <div style={styles.grid}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={styles.skeleton} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '40px' }}>🌾</div>
          <div style={styles.emptyText}>No products found</div>
        </div>
      ) : (
        <div style={styles.grid}>
          {products.map(p => (
            <div key={p.id} style={styles.card}>
              <img
                src={p.image || '/assets/images/placeholder.png'}
                alt={p.name}
                style={styles.img}
                onClick={() => navigate(`/products/${p.id}`)}
              />
              <div style={styles.body}>
                <div style={styles.productName}>{p.name}</div>
                <div style={styles.sellerName}>by {p.seller_name}</div>
                <div style={styles.price}>{formatPrice(p.price)}</div>
                <div style={styles.stock}>
                  {p.stock > 0
                    ? <span style={{ color: '#16A34A' }}>✓ In stock ({p.stock})</span>
                    : <span style={{ color: '#E02424' }}>Out of stock</span>}
                </div>
                <button
                  style={{
                    ...styles.addBtn,
                    opacity: p.stock === 0 ? 0.5 : 1,
                    cursor:  p.stock === 0 ? 'not-allowed' : 'pointer',
                  }}
                  onClick={() => p.stock > 0 && handleAddItem(p)}
                  disabled={p.stock === 0}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <button style={styles.loadMoreBtn} onClick={() => { setPage(p => p + 1); load(); }}>
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
};

const styles = {
  wrap:        { padding: '24px 16px', maxWidth: '1100px', margin: '0 auto' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title:       { fontSize: '22px', fontWeight: 700, color: '#1F2937', margin: 0 },
  cartBtn:     { position: 'relative', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' },
  cartBadge:   { background: '#fff', color: '#16A34A', borderRadius: '50%', fontSize: '11px', fontWeight: 700, padding: '1px 5px', marginLeft: '6px' },
  filters:     { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' },
  searchInput: { flex: 2, minWidth: '200px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '14px', outline: 'none' },
  select:      { flex: 1, minWidth: '150px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '14px', outline: 'none', background: '#fff' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
  card:        { background: '#fff', borderRadius: '14px', border: '1.5px solid #E5E7EB', overflow: 'hidden' },
  img:         { width: '100%', height: '160px', objectFit: 'cover', cursor: 'pointer' },
  body:        { padding: '14px' },
  productName: { fontSize: '14px', fontWeight: 600, color: '#1F2937', marginBottom: '4px' },
  sellerName:  { fontSize: '12px', color: '#6B7280', marginBottom: '6px' },
  price:       { fontSize: '16px', fontWeight: 700, color: '#16A34A', marginBottom: '4px' },
  stock:       { fontSize: '12px', marginBottom: '10px' },
  addBtn:      { width: '100%', padding: '9px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px' },
  skeleton:    { background: '#E5E7EB', borderRadius: '14px', height: '280px', animation: 'pulse 1.5s infinite' },
  empty:       { textAlign: 'center', padding: '60px 0' },
  emptyText:   { fontSize: '15px', color: '#6B7280', marginTop: '12px' },
  loadMoreBtn: { width: '100%', marginTop: '20px', padding: '12px', background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#374151' },
};

export default Catalog;