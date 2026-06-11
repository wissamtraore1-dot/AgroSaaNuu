import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, Package, ShoppingBag, AlertTriangle,
  TrendingUp, ArrowDownLeft, ShieldCheck, CreditCard,
  ArrowUpRight,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '../../Components/layout/AdminLayout';
import AdminService from '../../services/admin.service';

const fadeUp = { hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1 } };

const STAT_CARDS = (s) => [
  { label: 'Utilisateurs',     value: s.total_users        ?? '—', icon: Users,          color: '#2563eb', bg: '#eff6ff', to: '/admin/users'        },
  { label: 'Produits actifs',  value: s.total_products     ?? '—', icon: Package,        color: '#1a5c2a', bg: '#f0fdf4', to: '/admin/products'      },
  { label: 'Commandes',        value: s.total_orders       ?? '—', icon: ShoppingBag,    color: '#7c3aed', bg: '#f5f3ff', to: '/admin/transactions'  },
  { label: 'Litiges ouverts',  value: s.open_disputes      ?? '—', icon: AlertTriangle,  color: '#dc2626', bg: '#fee2e2', to: '/admin/disputes'      },
  { label: 'Retraits en attente', value: s.pending_withdrawals ?? '—', icon: ArrowDownLeft, color: '#d97706', bg: '#fffbeb', to: '/admin/withdrawals' },
  { label: 'KYC à valider',   value: s.pending_kyc        ?? '—', icon: ShieldCheck,    color: '#0891b2', bg: '#ecfeff', to: '/admin/kyc'           },
];

export default function AdminDashboard() {
  const [stats,   setStats]   = useState({});
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([
    { mois: 'Jan', commandes: 0, revenus: 0 },
    { mois: 'Fév', commandes: 0, revenus: 0 },
    { mois: 'Mar', commandes: 0, revenus: 0 },
    { mois: 'Avr', commandes: 0, revenus: 0 },
    { mois: 'Mai', commandes: 0, revenus: 0 },
    { mois: 'Juin', commandes: 0, revenus: 0 },
  ]);

  useEffect(() => {
    AdminService.getStats()
      .then(data => {
        setStats(data);
        if (data.monthly_chart) setChartData(data.monthly_chart);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = STAT_CARDS(stats);

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>Tableau de bord</h1>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '4px 0 0' }}>Vue d'ensemble de la plateforme AgroSaaNuu</p>
        </div>

        {/* Cartes stats */}
        <div className="row g-3 mb-4">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={i}
                className="col-6 col-md-4 col-xl-2"
                variants={fadeUp} initial="hidden" animate="show"
                transition={{ delay: i * 0.07 }}
              >
                <Link to={c.to} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                    style={{ background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', cursor: 'pointer' }}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' }}>
                      <Icon size={20} color={c.color} />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a2e10' }}>
                      {loading ? <div style={{ width: '40px', height: '24px', background: '#f3f4f6', borderRadius: '6px' }} /> : c.value}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>{c.label}</div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Graphique activité */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f0f0f0', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#1a5c2a" /> Activité mensuelle
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gCmd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1a5c2a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1a5c2a" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="commandes" name="Commandes" stroke="#1a5c2a" strokeWidth={2} fill="url(#gCmd)" />
              <Area type="monotone" dataKey="revenus"   name="Revenus (FCFA)" stroke="#2563eb" strokeWidth={2} fill="url(#gRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Liens rapides */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.5 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', marginBottom: '1rem' }}>Actions rapides</h3>
          <div className="row g-3">
            {[
              { label: 'Valider KYC en attente',   to: '/admin/kyc',         color: '#0891b2', bg: '#ecfeff' },
              { label: 'Approuver retraits',        to: '/admin/withdrawals', color: '#d97706', bg: '#fffbeb' },
              { label: 'Résoudre litiges',          to: '/admin/disputes',    color: '#dc2626', bg: '#fee2e2' },
              { label: 'Modérer produits',          to: '/admin/products',    color: '#1a5c2a', bg: '#f0fdf4' },
            ].map((a, i) => (
              <div key={i} className="col-6 col-md-3">
                <Link to={a.to} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    style={{ background: a.bg, borderRadius: '12px', padding: '1rem', border: `1.5px solid ${a.color}22`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: a.color }}>{a.label}</span>
                    <ArrowUpRight size={16} color={a.color} />
                  </motion.div>
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
