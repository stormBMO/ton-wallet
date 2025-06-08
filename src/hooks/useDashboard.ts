import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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
            dispatch(setConnectWalletModalOpen(true));
        }
    }, [isAuthenticated, authStatus, navigate, dispatch]);

    useEffect(() => {
        if (!isAuthenticated || !walletAddress) return;
        dispatch(loadWalletData({ address: walletAddress, network }))
            .unwrap()
            .catch(err => {
                notify('error', `Ошибка загрузки данных кошелька: ${err}`);
            });
    }, [isAuthenticated, walletAddress, network, dispatch, notify]);

    useEffect(() => {
        if (tokens.length && !tokens.every(t => t.priceTon)) {
            dispatch(fetchTonRates({ network }));
        }
    }, [tokens, network, dispatch]);

    // Риск-метрики загружаются автоматически в loadWalletData

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