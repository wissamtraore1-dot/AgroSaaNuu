// ============================================================
// AgroSaaNuu — Wallet Context
// src/context/WalletContext.jsx
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import WalletService from '../services/wallet.service';
import { useAuth } from './AuthContext';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState({
    available: 0,
    in_escrow: 0,
    total:     0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  // ── Fetch balance ─────────────────────────────────────────
  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      const data = await WalletService.getBalance();
      setBalance(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load balance');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch transactions ────────────────────────────────────
  const fetchTransactions = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const data = await WalletService.getTransactions(filters);
      setTransactions(data.results);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Deposit ───────────────────────────────────────────────
  const deposit = async (payload) => {
    const data = await WalletService.deposit(payload);
    await fetchBalance();
    return data;
  };

  // ── Withdraw ──────────────────────────────────────────────
  const withdraw = async (payload) => {
    const data = await WalletService.withdraw(payload);
    await fetchBalance();
    return data;
  };

  // Seulement si connecté
  useEffect(() => {
    if (isAuthenticated) fetchBalance();
  }, [fetchBalance, isAuthenticated]);

  return (
    <WalletContext.Provider value={{
      balance,
      transactions,
      loading,
      error,
      fetchBalance,
      fetchTransactions,
      deposit,
      withdraw,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWalletContext must be used inside WalletProvider');
  return ctx;
};
