// ============================================================
// AgroConnect — useWallet Hook
// src/hooks/useWallet.js
// ============================================================
import { useState } from 'react';
import { useWalletContext } from '../context/WalletContext';
import { getDepositAmountError, getWithdrawalAmountError, getPhoneError } from '../utils/validators';
import { useNotificationContext } from '../context/NotificationContext';

const useWallet = () => {
  const { balance, transactions, loading, fetchBalance, fetchTransactions, deposit, withdraw } =
    useWalletContext();
  const { success, error: notifyError } = useNotificationContext();

  const [depositLoading,  setDepositLoading]  = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [formErrors,      setFormErrors]      = useState({});

  // ── Deposit ───────────────────────────────────────────────
  const handleDeposit = async ({ methodId, phone, amount }) => {
    const errors = {};
    const amountErr = getDepositAmountError(amount);
    const phoneErr  = phone ? getPhoneError(methodId, phone) : null;
    if (amountErr) errors.amount = amountErr;
    if (phoneErr)  errors.phone  = phoneErr;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return { success: false, errors };
    }

    try {
      setDepositLoading(true);
      setFormErrors({});
      const data = await deposit({ methodId, phone, amount: Number(amount) });
      success(`${Number(amount).toLocaleString('fr-BJ')} FCFA added to your wallet.`, '✅ Deposit Successful');
      return { success: true, data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Deposit failed. Please try again.';
      notifyError(msg);
      return { success: false, error: msg };
    } finally {
      setDepositLoading(false);
    }
  };

  // ── Withdraw ──────────────────────────────────────────────
  const handleWithdraw = async ({ methodId, phone, amount }) => {
    const errors = {};
    const amountErr = getWithdrawalAmountError(amount, balance.available);
    const phoneErr  = getPhoneError(methodId, phone);
    if (amountErr) errors.amount = amountErr;
    if (phoneErr)  errors.phone  = phoneErr;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return { success: false, errors };
    }

    try {
      setWithdrawLoading(true);
      setFormErrors({});
      const data = await withdraw({ methodId, phone, amount: Number(amount) });
      success(`${Number(amount).toLocaleString('fr-BJ')} FCFA sent to ${phone}.`, '✅ Withdrawal Initiated');
      return { success: true, data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Withdrawal failed. Please try again.';
      notifyError(msg);
      return { success: false, error: msg };
    } finally {
      setWithdrawLoading(false);
    }
  };

  return {
    balance,
    transactions,
    loading,
    depositLoading,
    withdrawLoading,
    formErrors,
    setFormErrors,
    fetchBalance,
    fetchTransactions,
    handleDeposit,
    handleWithdraw,
  };
};

export default useWallet;