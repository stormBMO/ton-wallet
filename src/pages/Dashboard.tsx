import React from 'react';
import { useEffect, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Network } from '../store/slices/walletSlice';
import { BalanceCard } from '../components/BalanceCard';
import { RiskBadge } from '../components/RiskBadge';
import { TokenTable, Token } from '../components/TokenTable';
import axios from 'axios';
import '../index.css';
import { Particles } from '../components/magicui/particles';
import { AuroraText } from '../components/magicui/aurora-text';
import { NeonGradientCard } from '../components/magicui/neon-gradient-card';
// Magic UI imports (предполагается, что компоненты уже установлены)

const TON_API_BASE_URL: Record<Network, string> = {
  mainnet: 'https://tonapi.io',
  testnet: 'https://testnet.tonapi.io'
};

export const Dashboard = () => {
  const [tonConnectUI] = useTonConnectUI();
  const dispatch = useDispatch();
  const { address, status, network } = useSelector((state: RootState) => state.wallet) as { address: string | null; status: string; network: Network };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tonBalance, setTonBalance] = useState('0');
  const [jettonBalances, setJettonBalances] = useState<Token[]>([]);
  const [riskScore, setRiskScore] = useState(50); // По умолчанию средний риск

  useEffect(() => {
    const fetchData = async () => {
      if (address) {
        setIsLoading(true);
        setError(null);
        const apiBaseUrl = TON_API_BASE_URL[network];

        try {
          // Получаем баланс TON
          try {
            const tonResponse = await axios.get(`${apiBaseUrl}/v2/accounts/${address}`);
            // Конвертируем баланс из нанотонов в тоны
            const balanceInNano = tonResponse.data.balance;
            const balanceInTon = (BigInt(balanceInNano) / BigInt(1000000000)).toString();
            setTonBalance(balanceInTon);
          } catch (error) {
            setError('Ошибка при получении баланса TON');
            return;
          }

          // Получаем балансы jettons
          try {
            const jettonsResponse = await axios.get(`${apiBaseUrl}/v2/accounts/${address}/jettons`);
            const jettons = (jettonsResponse.data.balances || []).map((j: any) => ({
              symbol: j.symbol || 'JETTON',
              name: j.name || 'Jetton',
              balance: j.balance || '0',
            }));
            setJettonBalances(jettons);
          } catch (error) {
            if (network === 'mainnet') {
              setError('Ошибка при получении балансов джетонов');
            }
          }

          // Получаем риск (заглушка)
          setRiskScore(50);
        } catch (error) {
          setError('Ошибка при загрузке данных');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [address, network]);

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#18122B]">
        <p className="text-gray-300 text-lg">
          Пожалуйста, подключите кошелек для просмотра дашборда
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#18122B]">
        <p className="text-gray-300 text-lg">
          Загрузка данных...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#18122B]">
        <p className="text-red-400 text-lg">
          Ошибка: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* <Particles className="absolute inset-0 z-0" quantity={80} color="#8c7aff" size={1.2} /> */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-2">
        <div className="w-full max-w-4xl flex flex-col gap-8">
          <div className="flex flex-col items-center gap-2 mb-2">
            <AuroraText className="text-4xl md:text-5xl font-extrabold text-center" colors={["#8c7aff","#ff6ad5","#00fff1"]}>
              Дашборд
            </AuroraText>
            <span className="text-base text-[#b8b8ff] font-medium tracking-wide">Ваши активы и риски в TON</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <NeonGradientCard neonColors={{firstColor: '#8c7aff', secondColor: '#ff6ad5'}} borderRadius={24} borderSize={3} className="h-full flex flex-col justify-center">
              <div className="flex flex-col gap-4 items-center">
                <BalanceCard balance={tonBalance} />
                <RiskBadge score={riskScore} />
              </div>
            </NeonGradientCard>
            <NeonGradientCard neonColors={{firstColor: '#00fff1', secondColor: '#8c7aff'}} borderRadius={24} borderSize={3} className="h-full flex flex-col justify-center">
              <h2 className="text-xl font-semibold mb-4 text-[#8c7aff] text-center">Токены</h2>
              <TokenTable tokens={[{ symbol: 'TON', name: 'Toncoin', balance: tonBalance }, ...jettonBalances]} />
            </NeonGradientCard>
          </div>
        </div>
      </div>
    </div>
  );
};