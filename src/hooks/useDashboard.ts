// src/hooks/useDashboard.ts
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTonConnectUI } from '@tonconnect/ui-react';

import { RootState, AppDispatch } from '@/store';
import { setConnectWalletModalOpen } from '@/store/slices/ui/uiSlice';
import { AuthStatus } from '@/store/slices/auth/types';
import { useWalletAuth } from './useWalletAuth';
import { useNotify } from '@/hooks/useNotify';
import { loadWalletData } from '@/store/thunks/wallet';
import { fetchTonRates } from '@/store/thunks/wallet';
import { selectTokens, selectTotalTonValue } from '@/store/selectors/wallet';

export const useDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const notify = useNotify();

  const { isAuthenticated, authStatus } = useWalletAuth();
  const { address: walletAddress, network, status: walletStatus, error: walletError } =
    useSelector((s: RootState) => s.wallet);

  const tokens = useSelector(selectTokens);
  const totalTonValue = useSelector(selectTotalTonValue);

  const { byToken: riskByToken, status: riskStatusMap, error: riskErrorMap } =
    useSelector((s: RootState) => s.risk);


  useEffect(() => {
    if (authStatus !== AuthStatus.LOADING && !isAuthenticated) {
      navigate('/connect-wallet');
      dispatch(setConnectWalletModalOpen(true));
    }
  }, [isAuthenticated, authStatus, navigate, dispatch]);

  useEffect(() => {
    if (!isAuthenticated || !walletAddress) return;
  
    dispatch(loadWalletData({ address: walletAddress, network }))
      .unwrap()
      .catch(err => {
        if (err === 'WALLET_NOT_FOUND') {
          notify('error', 'Кошелек не существует');
        } else {
          notify('error', 'Ошибка загрузки данных кошелька');
        }
      });
  }, [isAuthenticated, walletAddress, network, dispatch, notify]);

  // Загружаем курсы токенов, если они еще не загружены
  useEffect(() => {
    if (tokens.length && !tokens.every(t => t.priceTon)) {
      dispatch(fetchTonRates({ network }));
    }
  }, [tokens, network, dispatch]);

  const displayTokens = useMemo(() => {
    return tokens.map(token => ({
      ...token,
      risk:       riskByToken[token.address],
      riskStatus: riskStatusMap[token.address],
      riskError:  riskErrorMap[token.address],
    }));
  }, [tokens, riskByToken, riskStatusMap, riskErrorMap]);

  return {
    isBalancesLoading : walletStatus === 'loading',
    dataError         : walletError,
    displayTokens,
    totalTonValue,
    isAuthenticated,
    authStatus,
    walletAddress,
    network,
  };
};