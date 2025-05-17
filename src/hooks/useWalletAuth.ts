import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store'; // Предполагается, что у вас есть типизация для RootState и AppDispatch
import { loginWithWallet, clearToken } from '../store/slices/auth/authSlice';

export const useWalletAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jwt, status, error, address } = useSelector((state: RootState) => state.auth);

  const handleLogin = async (payload: { address: string; publicKey: string }) => {
    return dispatch(loginWithWallet(payload)).unwrap(); // теперь возвращает { jwt, address }
  };

  const handleLogout = () => {
    dispatch(clearToken());
    // Можно добавить здесь логику для редиректа или очистки других состояний
  };

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