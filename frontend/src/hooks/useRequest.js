// ============================================================
// AgroConnect — useRequest Hook (generic async state)
// src/hooks/useRequest.js
// ============================================================
import { useState, useCallback } from 'react';

const useRequest = (requestFn) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await requestFn(...args);
      setData(result);
      return { success: true, data: result };
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.detail
        || err.message
        || 'Something went wrong';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [requestFn]);

  const reset = () => { setData(null); setError(null); };

  return { data, loading, error, execute, reset };
};

export default useRequest;