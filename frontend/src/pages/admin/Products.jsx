import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Package, MapPin, Clock } from 'lucide-react';
import AdminLayout from '../../Components/layout/AdminLayout';
import AdminService from '../../services/admin.service';

const STATUT_STYLE = {
  ACTIF:      { bg: '#dcfce7', color: '#16a34a', label: 'Approuvé'   },
  INACTIF:    { bg: '#fee2e2', color: '#dc2626', label: 'Suspendu'   },
  EN_ATTENTE: { bg: '#eff6ff', color: '#2563eb', label: 'En attente' },
  EPUISE:     { bg: '#f3f4f6', color: '#6b7280', label: 'Épuisé'     },
};

const FILTRES = [
  { key: '',           label: 'Tous'        },
  { key: 'EN_ATTENTE', label: 'En attente'  },
  { key: 'ACTIF',      label: 'Approuvés'   },
  { key: 'INACTIF',    label: 'Suspendus'   },
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filtre,   setFiltre]   = useState('EN_ATTENTE');
  const [msg,      setMsg]      = useState({ text: '', ok: true });

  const charger = (q = '', statut = filtre) => {
    setLoading(true);
    AdminService.getAllProducts({ search: q, statut })
      .then(data => setProducts(data.results ?? data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger('', filtre); }, [filtre]);

  const moderer = async (id, action) => {
    try {
      await AdminService.modererProduit(id, action);
      const labels = { approuver: 'approuvé', suspendre: 'suspendu', en_attente: 'remis en attente' };
      setMsg({ text: `Produit ${labels[action]}`, ok: action === 'approuver' });
      setTimeout(() => setMsg({ text: '', ok: true }), 3000);
      charger(search, filtre);
    } catch {
      setMsg({ text: 'Erreur lors de la modération', ok: false });
    }
  };

  const enAttente = products.filter(p => p.statut === 'EN_ATTENTE').length;

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>
            Modérer les produits
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>
            {products.length} produit{products.length !== 1 ? 's' : ''} affiché{products.length !== 1 ? 's' : ''}
            {enAttente > 0 && filtre !== 'EN_ATTENTE' && (
              <span style={{ marginLeft: '8px', background: '#dbeafe', color: '#1d4ed8', borderRadius: '20px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '700' }}>
                {enAttente} en attente
              </span>
            )}
          </p>
        </div>

        {msg.text && (
          <div style={{ background: msg.ok ? '#f0fdf4' : '#fef2f2', border: `1px solid ${msg.ok ? '#86efac' : '#fca5a5'}`, color: msg.ok ? '#16a34a' : '#dc2626', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {msg.text}
          </div>
        )}

        {/* Filtres statut */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {FILTRES.map(f => (
            <button key={f.key} onClick={() => setFiltre(f.key)}
              style={{ padding: '6px 14px', borderRadius: '20px', border: `1.5px solid ${filtre === f.key ? '#1a5c2a' : '#e5e7eb'}`, background: filtre === f.key ? '#1a5c2a' : 'white', color: filtre === f.key ? 'white' : '#374151', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Recherche */}
        <form onSubmit={e => { e.preventDefault(); charger(search, filtre); }}
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
                <div style={{ background: '#f3f4f6', borderRadius: '14px', height: '210px' }} />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1px solid #f0f0f0' }}>
            <Clock size={40} color="#d1d5db" />
            <p style={{ color: '#9ca3af', fontWeight: '600', marginTop: '0.8rem' }}>
              {filtre === 'EN_ATTENTE' ? 'Aucun produit en attente d\'approbation' : 'Aucun produit trouvé'}
            </p>
          </div>
        ) : (
          <div className="row g-3">
            {products.map(p => {
              const ss  = STATUT_STYLE[p.statut] || STATUT_STYLE.EN_ATTENTE;
              const img = p.images?.find(i => i.est_principale)?.image || p.images?.[0]?.image;
              return (
                <div key={p.id} className="col-12 col-md-6 col-lg-4">
                  <motion.div whileHover={{ y: -3 }}
                    style={{ background: 'white', borderRadius: '14px', border: `1px solid ${p.statut === 'EN_ATTENTE' ? '#bfdbfe' : '#f0f0f0'}`, overflow: 'hidden' }}>
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
                        {p.statut !== 'ACTIF' && (
                          <button onClick={() => moderer(p.id, 'approuver')}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px', background: '#f0fdf4', color: '#1a5c2a', border: '1px solid #86efac', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                            <CheckCircle size={13} /> Approuver
                          </button>
                        )}
                        {p.statut !== 'INACTIF' && (
                          <button onClick={() => moderer(p.id, 'suspendre')}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                            <XCircle size={13} /> Suspendre
                          </button>
                        )}
                        {p.statut === 'INACTIF' && (
                          <button onClick={() => moderer(p.id, 'en_attente')}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                            <Clock size={13} /> En attente
                          </button>
                        )}
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
