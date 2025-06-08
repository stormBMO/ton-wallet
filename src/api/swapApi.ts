import axios from 'axios';
import { MyTonSwapClient, toNano, fromNano } from '@mytonswap/sdk';
import TonWeb from 'tonweb';
import { Network } from '@/store/slices/wallet/types';

const mytonswap = new MyTonSwapClient();

// Типы для MyTonSwap
interface SwapRoute {
    pool_data: {
        pay: string;
        receive: string;
        minimumReceive: string;
        status: boolean;
        message?: string;
    };
    selected_pool?: any; // Для совместимости с BestRoute
}

interface JettonBalance {
    jetton: {
        address: string;
        symbol?: string;
        name?: string;
        decimals?: number;
    };
    balance: string;
    metadata?: {
        symbol?: string;
        name?: string;
        image?: string;
    };
}

interface TonConnectProvider {
    sendTransaction: (args: {
        validUntil: number;
        messages: any[];
    }) => Promise<any>;
}

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
}: {
  fromToken: string;
  toToken: string;
  amount: string;
}) => {
    try {
    
        
        // Для TON используем стандартный способ поиска
        let fromAssetId = fromToken;
        let toAssetId = toToken;
        
        // Если это адрес TON, пробуем искать по символу
        if (fromToken === 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c') {
            fromAssetId = 'TON';
        }
        
        if (toToken === 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c') {
            toAssetId = 'TON';
        }



        const assetIn = await mytonswap.assets.getExactAsset(fromAssetId);
        const assetOut = await mytonswap.assets.getExactAsset(toAssetId);
        
        console.log('Found assets:', { 
            assetIn: assetIn ? { address: assetIn.address, symbol: assetIn.symbol } : null,
            assetOut: assetOut ? { address: assetOut.address, symbol: assetOut.symbol } : null
        });
        
        if (!assetIn || !assetOut) {
            return {
                bestRoute: null,
                expectedAmount: '0',
                minAmountOut: '0',
                rate: '—',
                error: `Asset not found. From: ${fromAssetId}, To: ${toAssetId}`
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

        console.log('Quote calculated successfully:', {
            payHuman,
            receiveHuman,
            minReceiveHuman,
            rate
        });

        return {
            bestRoute,
            expectedAmount: receiveHuman,
            minAmountOut: minReceiveHuman,
            rate,
            error: null
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get quote';
        console.error('Swap quote error:', error);
        return {
            bestRoute: null,
            expectedAmount: '0',
            minAmountOut: '0',
            rate: '—',
            error: errorMessage
        };
    }
};

/**
 * Получение списка токенов пользователя (для совместимости, но основная логика в tonApi.ts)
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
            address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c', // Нативный адрес TON для MyTonSwap
        }
    ];

    // Добавляем информацию о Jetton-токенах
    if (jettonsResponse.data && jettonsResponse.data.balances) {
        const jettonBalances = jettonsResponse.data.balances.map((jetton: JettonBalance) => {
            return {
                symbol: jetton.metadata?.symbol || jetton.jetton.symbol || 'Unknown',
                name: jetton.metadata?.name || jetton.jetton.name || 'Unknown Token',
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
    { bestRoute, userAddress }: { bestRoute: SwapRoute; userAddress: string },
    provider: TonConnectProvider
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
    toNano: (amount: string | number, _network: Network = 'mainnet'): string => {
        const tonweb = getTonWeb(_network);
        return tonweb.utils.toNano(amount).toString();
    },
    fromNano: (amount: string | number, _network: Network = 'mainnet'): string => {
        const tonweb = getTonWeb(_network);
        return tonweb.utils.fromNano(amount).toString();
    }
}; 