import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store'; // Предполагается, что у вас есть типизация для RootState и AppDispatch
import { loginWithWallet, clearToken } from '../store/slices/auth/authSlice';
import { useCallback } from 'react';

export const useWalletAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jwt, status, error, address } = useSelector((state: RootState) => state.auth);

  const handleLogin = useCallback(async (payload: { address: string; publicKey: string; signature: string }) => {
    return dispatch(loginWithWallet(payload)).unwrap(); // теперь возвращает { jwt, address }
  }, [dispatch]);

  const handleLogout = useCallback(() => {
    dispatch(clearToken());
    // Можно добавить здесь логику для редиректа или очистки других состояний
  }, [dispatch]);

  return {
    isAuthenticated: !!jwt,
    jwt,
    address,
    authStatus: status,
    authError: error,
    login: handleLogin,
    logout: handleLogout,
  };
}; 