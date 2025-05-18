import { RootState } from "@/store";
import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { AppDispatch } from "@/store";
import { useNavigate } from "react-router-dom";
import { useWalletAuth } from "./useWalletAuth";
import { Network } from "@/store/types";
import { TON_API_BASE_URL } from "@/constants";
import axios from "axios";
import { fetchRiskMetrics } from "@/store/slices/risk/riskSlice";
import { Token } from "@/components/TokenTable";
import { RiskMetrics as RiskMetricsType } from "@/store/slices/risk/types";
import { setConnectWalletModalOpen } from "@/store/slices/ui/uiSlice";
import { AuthStatus } from "@/store/slices/auth/types";

export interface DashboardToken extends Token {
  address: string;
  risk?: RiskMetricsType;
  riskStatus?: 'idle' | 'loading' | 'succeeded' | 'failed';
  riskError?: string | null | undefined;
}


interface RawTokenData {
  address: string;
  symbol: string;
  name: string;
  balance: string;
}

export const useDashboard = () => {
  const [tonConnectUI] = useTonConnectUI();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { address: connectedWalletAddress, network } = useSelector((state: RootState) => state.wallet) as { address: string | null; network: Network };
  const { isAuthenticated, logout: authLogout, authStatus } = useWalletAuth();
  const riskState = useSelector((state: RootState) => state.risk);
  const riskByToken = riskState?.byToken || {};
  const riskStatusMap = riskState?.status || {};
  const riskErrorMap = riskState?.error || {};

  const [isBalancesLoading, setIsBalancesLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  
  const [rawTokensData, setRawTokensData] = useState<RawTokenData[]>([]);
  const [displayTokens, setDisplayTokens] = useState<DashboardToken[]>([]);

  useEffect(() => {
    if (authStatus !== AuthStatus.LOADING && !isAuthenticated) {
      navigate('/connect-wallet');
      dispatch(setConnectWalletModalOpen(true));
    }
  }, [isAuthenticated, authStatus, navigate]);

  const fetchWalletData = useCallback(async () => {
    if (isAuthenticated && connectedWalletAddress) {
      setIsBalancesLoading(true);
      setDataError(null);
      const apiBaseUrl = TON_API_BASE_URL[network];
      let newRawTokens: RawTokenData[] = [];

      try {
        let tonBalanceStr = '0';
        try {
          const tonResponse = await axios.get(`${apiBaseUrl}/v2/accounts/${connectedWalletAddress}`);
          const balanceInNano = tonResponse.data.balance;
          tonBalanceStr = (BigInt(balanceInNano) / BigInt(1000000000)).toString();
          newRawTokens.push({ address: connectedWalletAddress, symbol: 'TON', name: 'Toncoin', balance: tonBalanceStr });
        } catch (fetchTonError) {
          console.error('Ошибка при получении баланса TON:', fetchTonError);
          setDataError('Ошибка при получении баланса TON');
          newRawTokens.push({ address: connectedWalletAddress, symbol: 'TON', name: 'Toncoin', balance: '0' });
        }

        try {
          const jettonsResponse = await axios.get(`${apiBaseUrl}/v2/accounts/${connectedWalletAddress}/jettons`);
          const fetchedJettons: RawTokenData[] = (jettonsResponse.data.balances || []).map((j: any) => ({
            address: j.jetton.address,
            symbol: j.jetton.symbol || 'JETTON',
            name: j.jetton.name || 'Jetton',
            balance: (BigInt(j.balance) / BigInt(10 ** (j.jetton.decimals || 9))).toString(),
          }));
          newRawTokens.push(...fetchedJettons);
        } catch (fetchJettonsError) {
          console.error('Ошибка при получении балансов джетонов:', fetchJettonsError);
          if (network === 'mainnet') {
            setDataError((prevError) => prevError ? `${prevError}, Ошибка джетонов` : 'Ошибка джетонов');
          }
        }
        
        setRawTokensData(newRawTokens);

        newRawTokens.forEach(token => {
          if (!riskStatusMap[token.address] || riskStatusMap[token.address] === 'failed') {
            dispatch(fetchRiskMetrics({ address: token.address }));
          }
        });

      } catch (err) {
        console.error('Общая ошибка при загрузке данных кошелька:', err);
        setDataError('Общая ошибка загрузки данных');
      } finally {
        setIsBalancesLoading(false);
      }
    } else {
      setRawTokensData([]);
    }
  }, [isAuthenticated, connectedWalletAddress, network, dispatch, authStatus]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  useEffect(() => {
    const combinedTokens = rawTokensData.map(rawToken => ({
      ...rawToken,
      risk: riskByToken[rawToken.address],
      riskStatus: riskStatusMap[rawToken.address],
      riskError: riskErrorMap[rawToken.address],
    }));
    setDisplayTokens(combinedTokens);
  }, [rawTokensData, riskByToken, riskStatusMap, riskErrorMap]);

  const handleLogout = () => {
    authLogout();
    tonConnectUI.disconnect().catch(e => console.error("TonConnect disconnect error:", e));
  };

  return {
    isBalancesLoading,
    dataError,
    displayTokens,
    handleLogout,
    isAuthenticated,
    authStatus,
    connectedWalletAddress,
    network,
  }
}