import axios from 'axios';
import TonWeb from 'tonweb';
import { Network } from '@/store/slices/wallet/types';

/**
 * Получение котировки для свопа
 */
export const fetchQuoteFromAPI = async ({ 
  fromToken, 
  toToken, 
  amount, 
  userAddress, 
  network = 'testnet' 
}: { 
  fromToken: string; 
  toToken: string; 
  amount: string; 
  userAddress: string; 
  network?: Network;
}) => {
  // Используем DeDust API для получения котировки
  const apiUrl = network === 'testnet' 
    ? 'https://api-testnet.dedust.io/v2/quote'
    : 'https://api.dedust.io/v2/quote';

  const response = await axios.post(apiUrl, {
    address: userAddress,
    jetton_master_in: fromToken === 'TON' ? null : fromToken,
    jetton_master_out: toToken === 'TON' ? null : toToken,
    amount: amount,
    slippage: 0.5 // 0.5% slippage
  });

  return response.data;
};

/**
 * Получение списка токенов пользователя
 */
export const fetchUserTokensFromAPI = async (
  address: string, 
  network: Network = 'mainnet'
) => {
  // Выбор API-эндпоинта в зависимости от сети
  const apiBase = network === 'testnet' 
    ? 'https://testnet.tonapi.io/v2/accounts'
    : 'https://tonapi.io/v2/accounts';

  // Получаем данные о балансе TON
  const [tonResponse, jettonsResponse] = await Promise.all([
    axios.get(`${apiBase}/${address}`),
    axios.get(`${apiBase}/${address}/jettons`)
  ]);

  // Получаем баланс TON
  const tonBalance = tonResponse.data.balance;
  
  // Формируем массив токенов
  const tokens = [
    {
      symbol: 'TON',
      name: 'Toncoin',
      balance: tonBalance,
      address: 'TON', // Используем 'TON' как идентификатор для нативного токена
    }
  ];

  // Добавляем информацию о Jetton-токенах
  if (jettonsResponse.data && jettonsResponse.data.balances) {
    const jettonBalances = jettonsResponse.data.balances.map((jetton: any) => {
      return {
        symbol: jetton.metadata?.symbol || 'Unknown',
        name: jetton.metadata?.name || 'Unknown Token',
        balance: jetton.balance,
        address: jetton.jetton.address,
        icon: jetton.metadata?.image || ''
      };
    });
    
    tokens.push(...jettonBalances);
  }

  return tokens;
};

/**
 * Отправка транзакции свопа
 */
export const sendSwapTransaction = async (
  transactionData: {
    to: string;
    amount: string;
    payload?: string;
    stateInit?: any;
  },
  provider: any // тип зависит от используемой библиотеки (tonconnect или tonweb)
) => {
  if ('sendTransaction' in provider) {
    // TonConnect реализация
    return await provider.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут
      messages: [
        {
          address: transactionData.to,
          amount: transactionData.amount,
          payload: transactionData.payload,
          stateInit: transactionData.stateInit
        }
      ]
    });
  } else if ('send' in provider) {
    // TonWeb реализация
    return await provider.send(
      transactionData.to,
      transactionData.amount,
      transactionData.payload,
      transactionData.stateInit
    );
  }
  
  throw new Error('Неподдерживаемый провайдер кошелька');
};

/**
 * Конвертация между нано и обычными единицами
 */
export const convertAmount = {
  toNano: (amount: string | number): string => {
    return TonWeb.utils.toNano(amount).toString();
  },
  fromNano: (amount: string | number): string => {
    return TonWeb.utils.fromNano(amount).toString();
  }
}; 