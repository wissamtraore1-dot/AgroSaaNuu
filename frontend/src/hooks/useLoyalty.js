// ============================================================
// AgroConnect — useLoyalty Hook
// src/hooks/useLoyalty.js
// ============================================================
import { useState } from 'react';
import { useLoyaltyContext } from '../context/LoyaltyContext';
import { useWalletContext } from '../context/WalletContext';
import { useNotificationContext } from '../context/NotificationContext';
import { LOYALTY, calcPointsValue } from '../utils/constants';
import { getPointsRedeemError } from '../utils/validators';

const useLoyalty = () => {
  const { points, history, loading, balanceInFcfa, fetchPoints, fetchHistory, redeemPoints } =
    useLoyaltyContext();
  const { fetchBalance }                           = useWalletContext();
  const { notifyPointsRedeemed, error: notifyError } = useNotificationContext();

  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError,   setRedeemError]   = useState(null);

  // ── Can redeem? ───────────────────────────────────────────
  const canRedeem = points.balance >= LOYALTY.MIN_POINTS_TO_REDEEM;

  // ── Preview: how much FCFA for X points ──────────────────
  const previewRedeem = (pointsAmount) => ({
    points: Number(pointsAmount),
    fcfa:   calcPointsValue(Number(pointsAmount)),
  });

  // ── Max points usable on a given order ───────────────────
  const maxPointsForOrder = (orderAmount) => {
    const maxDiscount = Math.floor(orderAmount * LOYALTY.MAX_POINTS_USAGE_PERCENT / 100);
    const maxFromBalance = calcPointsValue(points.balance);
    const discount = Math.min(maxDiscount, maxFromBalance);
    return {
      maxPoints:      Math.floor(discount / LOYALTY.FCFA_PER_POINT),
      maxDiscountFcfa: discount,
    };
  };

  // ── Handle redeem ─────────────────────────────────────────
  const handleRedeem = async (pointsAmount) => {
    const err = getPointsRedeemError(
      pointsAmount,
      points.balance,
      LOYALTY.MIN_POINTS_TO_REDEEM
    );
    if (err) { setRedeemError(err); return { success: false }; }

    try {
      setRedeemLoading(true);
      setRedeemError(null);
      const data = await redeemPoints(Number(pointsAmount));
      notifyPointsRedeemed(data.redeemed_points, data.fcfa_credited);
      await fetchBalance(); // wallet balance updated too
      return { success: true, data };
    } catch (e) {
      const msg = e.response?.data?.message || 'Redemption failed. Try again.';
      notifyError(msg);
      setRedeemError(msg);
      return { success: false };
    } finally {
      setRedeemLoading(false);
    }
  };

  return {
    points,
    history,
    loading,
    balanceInFcfa,
    canRedeem,
    redeemLoading,
    redeemError,
    fetchPoints,
    fetchHistory,
    handleRedeem,
    previewRedeem,
    maxPointsForOrder,
  };
};

export default useLoyalty;