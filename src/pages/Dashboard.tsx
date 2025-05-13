import { useEffect, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Network } from '../store/slices/walletSlice';
import { AssetTable } from '../components/AssetTable';
import { RiskBarComponent } from '../components/RiskBar';
import { calculateVolatility, calculateRiskScore } from '../lib/risk';
import axios from 'axios';

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
  const [jettonBalances, setJettonBalances] = useState([]);
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
            console.error('Failed to fetch TON balance:', error);
            setError('Ошибка при получении баланса TON');
            return;
          }

          // Получаем балансы jettons
          try {
            const jettonsResponse = await axios.get(`${apiBaseUrl}/v2/accounts/${address}/jettons`);
            setJettonBalances(jettonsResponse.data.balances || []);
          } catch (error) {
            console.error('Failed to fetch jetton balances:', error);
            // Для тестнета это нормально, что джетоны могут отсутствовать
            if (network === 'mainnet') {
              setError('Ошибка при получении балансов джетонов');
            }
          }

          // Получаем исторические цены TON (только для mainnet)
          if (network === 'mainnet') {
            try {
              const endDate = new Date();
              const startDate = new Date();
              startDate.setDate(startDate.getDate() - 30); // 30 дней назад

              const riskResponse = await axios.get(`${apiBaseUrl}/v2/rates/toncoin/history`, {
                params: {
                  start_date: startDate.toISOString().split('T')[0],
                  end_date: endDate.toISOString().split('T')[0],
                  interval: 'day'
                }
              });
              
              if (riskResponse.data && riskResponse.data.rates) {
                const prices = riskResponse.data.rates.map((item: any) => ({
                  price: item.price,
                  timestamp: new Date(item.timestamp).getTime()
                }));

                const volatility = calculateVolatility(prices);
                const score = calculateRiskScore(volatility);
                setRiskScore(score);
              }
            } catch (error) {
              console.error('Failed to fetch price history:', error);
              // Устанавливаем средний риск, если не удалось получить данные
              setRiskScore(50);
            }
          } else {
            // Для тестнета устанавливаем фиксированный риск
            setRiskScore(50);
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">
          Пожалуйста, подключите кошелек для просмотра дашборда
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">
          Загрузка данных...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 dark:text-red-400">
          Ошибка: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Дашборд</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Активы</h2>
          <AssetTable tonBalance={tonBalance} jettonBalances={jettonBalances} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Риск-профиль</h2>
          <RiskBarComponent riskScore={riskScore} />
        </div>
      </div>
    </div>
  );
};