// ============================================================
// AgroConnect — Points / Loyalty Page
// src/pages/buyer/Points.jsx
// ============================================================
import React, { useEffect } from 'react';
import { Star, ShoppingCart, TrendingUp, Coins, Award, Crown, Gem } from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import PointsCard      from '../../Components/loyalty/PointsCard';
import ProgressBar     from '../../Components/loyalty/ProgressBar';
import PointsConverter from '../../Components/loyalty/PointsConverter';
import PointsHistory   from '../../Components/loyalty/PointsHistory';
import useLoyalty      from '../../hooks/useLoyalty';
import { formatPoints, formatPrice } from '../../utils/formatPrice';
import { LOYALTY } from '../../utils/constants';

const TIER_ICONS = {
  BRONZE:  <Award  size={18} color="#CD7F32" />,
  ARGENT:  <Award  size={18} color="#A8A9AD" />,
  OR:      <Crown  size={18} color="#FFD700" />,
  PLATINE: <Gem    size={18} color="#4F46E5" />,
};

const Points = () => {
  const {
    points, history, loading,
    redeemLoading, canRedeem,
    fetchHistory, handleRedeem,
  } = useLoyalty();

  useEffect(() => { fetchHistory(); }, []);

  return (
    <DashboardLayout role="buyer">
    <div style={styles.wrap}>
      <h5 style={styles.title}><Star size={22} color="#F59E0B" style={{ verticalAlign: 'middle', marginRight: 8 }} />Mes Points & Récompenses</h5>

      <div style={styles.layout}>
        <div style={styles.mainCol}>

          {/* Points card */}
          <PointsCard points={points} loading={loading} />

          {/* How it works */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>How it works</div>
            <div style={styles.howGrid}>
              <div style={styles.howItem}>
                <div style={styles.howIcon}><ShoppingCart size={26} color="#16A34A" /></div>
                <div style={styles.howLabel}>Acheter des produits</div>
                <div style={styles.howText}>
                  Gagnez {LOYALTY.POINTS_PER_1000_FCFA} pt par 1 000 FCFA dépensés
                </div>
              </div>
              <div style={styles.howItem}>
                <div style={styles.howIcon}><TrendingUp size={26} color="#2563EB" /></div>
                <div style={styles.howLabel}>Monter de niveau</div>
                <div style={styles.howText}>
                  Les niveaux supérieurs rapportent plus de points par achat
                </div>
              </div>
              <div style={styles.howItem}>
                <div style={styles.howIcon}><Coins size={26} color="#D97706" /></div>
                <div style={styles.howLabel}>Conversion</div>
                <div style={styles.howText}>
                  {LOYALTY.MIN_POINTS_TO_REDEEM} pts minimum →{' '}
                  {formatPrice(LOYALTY.MIN_POINTS_TO_REDEEM * LOYALTY.FCFA_PER_POINT)} en portefeuille
                </div>
              </div>
            </div>
          </div>

          {/* Tier progress */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Tier Progress</div>
            <ProgressBar totalPoints={points.lifetime_points || 0} />
          </div>

          {/* History */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Points History</div>
            <PointsHistory
              history={history}
              loading={loading}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sideCol}>
          <PointsConverter
            availablePoints={points.balance}
            onRedeem={handleRedeem}
            loading={redeemLoading}
          />

          {/* Tier multipliers */}
          <div style={{ ...styles.card, marginTop: '16px' }}>
            <div style={styles.cardTitle}>Tier Multipliers</div>
            {Object.entries(LOYALTY.TIERS).map(([key, tier]) => (
              <div key={key} style={styles.tierRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {TIER_ICONS[key]}
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{tier.name}</span>
                </div>
                <div style={styles.multiplierBadge}>
                  ×{LOYALTY.TIER_MULTIPLIERS[key]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

const styles = {
  wrap:    { padding: '24px 16px', maxWidth: '960px', margin: '0 auto' },
  title:   { fontSize: '22px', fontWeight: 700, color: '#1F2937', marginBottom: '20px' },
  layout:  { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  mainCol: { flex: 2, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' },
  sideCol: { flex: 1, minWidth: '260px' },
  card:    { background: '#fff', borderRadius: '16px', padding: '20px', border: '1.5px solid #E5E7EB' },
  cardTitle: { fontSize: '15px', fontWeight: 700, color: '#1F2937', marginBottom: '16px' },
  howGrid: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  howItem: { flex: 1, minWidth: '100px', textAlign: 'center' },
  howIcon: { fontSize: '28px', marginBottom: '6px' },
  howLabel: { fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '4px' },
  howText:  { fontSize: '12px', color: '#6B7280', lineHeight: 1.5 },
  tierRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '10px 0',
    borderBottom: '1px solid #F3F4F6',
  },
  multiplierBadge: {
    background: '#EAF3DE', color: '#3B6D11',
    padding: '3px 10px', borderRadius: '20px',
    fontSize: '13px', fontWeight: 700,
  },
};

export default Points;