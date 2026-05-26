// ============================================================
// AgroConnect — Seller Products
// src/pages/seller/Products.jsx
// ============================================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';
import ProductService from '../../services/product.service';
import { useNotificationContext } from '../../context/NotificationContext';

const SellerProducts = () => {
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotificationContext();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  useEffect(() => { load(); }, [search]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getMyProducts({ search });
      setProducts(data.results || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await ProductService.delete(id);
      success(`"${name}" deleted`);
      load();
    } catch {
      notifyError('Failed to delete product');
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h5 style={styles.title}>My Products</h5>
        <button style={styles.addBtn} onClick={() => navigate('/seller/products/add')}>
          + Add Product
        </button>
      </div>

      <input
        type="text"
        placeholder="Search my products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={styles.searchInput}
      />

      {loading ? (
        [...Array(4)].map((_, i) => <div key={i} style={styles.skeleton} />)
      ) : products.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '40px' }}>🌾</div>
          <div style={styles.emptyText}>No products yet</div>
          <button style={styles.addBtn} onClick={() => navigate('/seller/products/add')}>
            Add your first product
          </button>
        </div>
      ) : (
        <div style={styles.list}>
          {products.map(p => (
            <div key={p.id} style={styles.row}>
              <img src={p.image || '/assets/images/placeholder.png'} alt={p.name} style={styles.img} />
              <div style={{ flex: 1 }}>
                <div style={styles.name}>{p.name}</div>
                <div style={styles.meta}>{p.category_name} • Stock: {p.stock}</div>
                <div style={styles.price}>{formatPrice(p.price)}</div>
              </div>
              <div style={styles.actions}>
                <button style={styles.editBtn} onClick={() => navigate(`/seller/products/${p.id}/edit`)}>Edit</button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(p.id, p.name)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  wrap:        { padding: '24px 16px', maxWidth: '860px', margin: '0 auto' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  title:       { fontSize: '22px', fontWeight: 700, color: '#1F2937', margin: 0 },
  addBtn:      { padding: '10px 18px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' },
  searchInput: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' },
  list:        { display: 'flex', flexDirection: 'column', gap: '10px' },
  row:         { display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', borderRadius: '12px', padding: '14px', border: '1.5px solid #E5E7EB' },
  img:         { width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 },
  name:        { fontSize: '14px', fontWeight: 600, color: '#1F2937' },
  meta:        { fontSize: '12px', color: '#6B7280', marginTop: '2px' },
  price:       { fontSize: '14px', fontWeight: 700, color: '#16A34A', marginTop: '4px' },
  actions:     { display: 'flex', gap: '8px', flexShrink: 0 },
  editBtn:     { padding: '7px 14px', background: '#EEF2FF', color: '#4F46E5', border: 'none', borderRadius: '8px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' },
  deleteBtn:   { padding: '7px 14px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '8px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' },
  skeleton:    { background: '#E5E7EB', borderRadius: '12px', height: '80px', marginBottom: '10px' },
  empty:       { textAlign: 'center', padding: '60px 0' },
  emptyText:   { fontSize: '15px', color: '#6B7280', margin: '12px 0 20px' },
};

export default SellerProducts;