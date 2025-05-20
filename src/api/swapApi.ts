import axios from 'axios';
import { MyTonSwapClient, toNano, fromNano } from '@mytonswap/sdk';
import TonWeb from 'tonweb';
import { Network } from '@/store/slices/wallet/types';

const mytonswap = new MyTonSwapClient();

// Инициализация TonWeb с провайдером
const getTonWeb = (network: Network = 'mainnet') =>
  new TonWeb(
    new TonWeb.HttpProvider(
      network === 'testnet'
        ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
        : 'https://toncenter.com/api/v2/jsonRPC'
    )
  );

/**
 * Получение котировки для свопа через MyTonSwap SDK
 */
export const fetchQuoteFromAPI = async ({
  fromToken,
  toToken,
  amount,
  userAddress,
  network = 'mainnet',
}: {
  fromToken: string;
  toToken: string;
  amount: string;
  userAddress: string;
  network?: Network;
}) => {
  const assetIn = await mytonswap.assets.getExactAsset(fromToken);
  const assetOut = await mytonswap.assets.getExactAsset(toToken);
  if (!assetIn || !assetOut) {
    return {
      bestRoute: null,
      expectedAmount: '0',
      minAmountOut: '0',
      rate: '—',
      error: 'Asset not found'
    };
  }
  const bestRoute = await mytonswap.router.findBestRoute(
    assetIn.address,
    assetOut.address,
    toNano(amount),
    0.5
  );
  if (!bestRoute || !bestRoute.pool_data) {
    return {
      bestRoute: null,
      expectedAmount: '0',
      minAmountOut: '0',
      rate: '—',
      error: 'No route found'
    };
  }
  const { pay, receive, minimumReceive, status, message } = bestRoute.pool_data;
  if (!status || receive === '0') {
    return {
      bestRoute,
      expectedAmount: '0',
      minAmountOut: '0',
      rate: '—',
      error: message || 'No liquidity'
    };
  }
  const payHuman = fromNano(pay);
  const receiveHuman = fromNano(receive);
  const minReceiveHuman = fromNano(minimumReceive);
  const rate = (+receiveHuman / +payHuman).toString();

  return {
    bestRoute,
    expectedAmount: receiveHuman,
    minAmountOut: minReceiveHuman,
    rate,
    error: null
  };
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
 * Отправка транзакции свопа через MyTonSwap SDK
 */
export const sendSwapTransaction = async (
  { bestRoute, userAddress }: { bestRoute: any; userAddress: string },
  provider: any
) => {
  // Генерируем payload для TonConnect
  const swapPayload = await mytonswap.swap.createSwap(userAddress, bestRoute);
  if ('sendTransaction' in provider) {
    return await provider.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [swapPayload],
    });
  }
  throw new Error('Неподдерживаемый провайдер кошелька');
};

/**
 * Конвертация между нано и обычными единицами
 */
export const convertAmount = {
    toNano: (amount: string | number, network: Network = 'mainnet'): string => {
        const tonweb = getTonWeb(network);
        return tonweb.utils.toNano(amount).toString();
    },
    fromNano: (amount: string | number, network: Network = 'mainnet'): string => {
        const tonweb = getTonWeb(network);
        return tonweb.utils.fromNano(amount).toString();
    }
}; 