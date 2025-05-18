import { createAsyncThunk } from "@reduxjs/toolkit";
import { WalletAdapter } from "../slices/wallet/types";
import axios from 'axios';
import TonWeb from 'tonweb';

// Базовые функции
export const getQuote = async ({ 
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
  network?: 'testnet' | 'mainnet' 
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

  return {
    ...response.data,
    fromToken,
    toToken,
    amount,
    userAddress,
    network
  };
};

export const calcFee = async ({ fromToken, toToken, amount, network = 'mainnet' }: { 
  fromToken: string; 
  toToken: string; 
  amount: string; 
  network?: 'testnet' | 'mainnet' 
}) => {
  const baseGasAmount = '0.05'; // Базовая комиссия TON в газе
  const swapGasAmount = '0.1'; // Комиссия для свопа
  
  // Преобразуем в наноTON (10^9)
  const baseGas = TonWeb.utils.toNano(baseGasAmount);
  const swapGas = TonWeb.utils.toNano(swapGasAmount);
  
  // Общая комиссия
  const totalFee = (BigInt(baseGas) + BigInt(swapGas)).toString();
  
  return {
    feeInTon: TonWeb.utils.fromNano(totalFee),
    feeInNano: totalFee,
    fromToken,
    toToken,
    amount
  };
};

export const checkBalance = async ({ 
  walletAdapter, 
  token, 
  amount 
}: { 
  walletAdapter: WalletAdapter; 
  token: string; 
  amount: string 
}) => {
  try {
    // Получаем баланс пользователя для указанного токена
    const balance = await walletAdapter.getBalance(token === 'TON' ? undefined : token);
    
    // Преобразуем сумму и баланс в наноTON или наноJetton для сравнения
    let amountInNano;
    if (token === 'TON') {
      amountInNano = TonWeb.utils.toNano(amount);
    } else {
      // Для Jetton проверка должна быть в соответствующих единицах
      amountInNano = TonWeb.utils.toNano(amount); // Предполагая, что Jetton имеет 9 десятичных знаков как TON
    }
    
    // Проверяем, достаточно ли средств
    const hasEnoughBalance = BigInt(balance) >= BigInt(amountInNano);
    
    return hasEnoughBalance;
  } catch (error) {
    console.error('Error checking balance:', error);
    throw new Error('Не удалось проверить баланс');
  }
};

export const performSwap = async ({ 
  walletAdapter, 
  quote 
}: { 
  walletAdapter: WalletAdapter; 
  quote: any 
}) => {
  try {
    const { 
      fromToken, 
      toToken, 
      amount, 
      userAddress, 
      network, 
      pool_address, 
      expected_amount,
      min_amount_out,
      message_body
    } = quote;

    // Создаем транзакцию для отправки
    let transaction;
    
    if (fromToken === 'TON') {
      // Своп TON на Jetton
      transaction = {
        to: pool_address,
        amount: amount, // уже в нанотонах
        payload: message_body,
      };
    } else {
      // Своп Jetton на TON или другой Jetton
      // Необходимо создать payload для вызова методов контракта Jetton
      transaction = {
        to: pool_address,
        amount: TonWeb.utils.toNano('0.1'), // минимальная сумма для покрытия gas fee
        payload: message_body, // специальный payload для свопа Jetton
        stateInit: quote.state_init
      };
    }

    // Отправляем транзакцию
    const result = await walletAdapter.sendTx(transaction);

    return {
      success: true,
      txHash: result.txHash || result.id || result,
      fromToken,
      toToken,
      amount,
      expectedAmount: expected_amount,
      minAmountOut: min_amount_out,
      userAddress
    };
  } catch (error) {
    console.error('Error performing swap:', error);
    throw new Error('Не удалось выполнить своп');
  }
};

export const getUserTokens = async (
  address: string, 
  network: 'mainnet' | 'testnet' = 'mainnet'
) => {
  try {
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
    const tonBalance = TonWeb.utils.fromNano(tonResponse.data.balance);
    
    // Формируем массив токенов
    const tokens = [
      {
        symbol: 'TON',
        name: 'Toncoin',
        balance: tonBalance,
        address: 'TON', // Используем 'TON' как идентификатор для нативного токена
        icon: 'https://static.tildacdn.com/tild3966-6664-4032-a130-333061376633/ton_symbol.svg'
      }
    ];

    // Добавляем информацию о Jetton-токенах
    if (jettonsResponse.data && jettonsResponse.data.balances) {
      const jettonBalances = jettonsResponse.data.balances.map((jetton: any) => {
        return {
          symbol: jetton.metadata?.symbol || 'Unknown',
          name: jetton.metadata?.name || 'Unknown Token',
          balance: TonWeb.utils.fromNano(jetton.balance),
          address: jetton.jetton.address,
          icon: jetton.metadata?.image || ''
        };
      });
      
      tokens.push(...jettonBalances);
    }

    return tokens;
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    throw new Error('Не удалось получить список токенов пользователя');
  }
};

// Thunks
export const fetchQuote = createAsyncThunk<
  any,
  { fromToken: string; toToken: string; amount: string; userAddress: string; network?: 'testnet' | 'mainnet' },
  { rejectValue: string }
>('swap/fetchQuote', async (params, { rejectWithValue }) => {
  try {
    return await getQuote(params);
  } catch (e: any) {
    return rejectWithValue(e.message || 'Ошибка получения котировки');
  }
});

export const checkUserBalance = createAsyncThunk<
  boolean,
  { walletAdapter: WalletAdapter; token: string; amount: string },
  { rejectValue: string }
>('swap/checkBalance', async (params, { rejectWithValue }) => {
  try {
    return await checkBalance(params);
  } catch (e: any) {
    return rejectWithValue(e.message || 'Ошибка проверки баланса');
  }
});

export const performSwapThunk = createAsyncThunk<
  any,
  { walletAdapter: WalletAdapter; quote: any },
  { rejectValue: string }
>('swap/performSwap', async (params, { rejectWithValue }) => {
  try {
    return await performSwap(params);
  } catch (e: any) {
    return rejectWithValue(e.message || 'Ошибка свопа');
  }
});

export const fetchUserTokens = createAsyncThunk<
  Array<{ symbol: string; name: string; balance: string; address: string; icon?: string }>,
  { address: string; network?: 'mainnet' | 'testnet' },
  { rejectValue: string }
>('swap/fetchUserTokens', async (params, { rejectWithValue }) => {
  try {
    return await getUserTokens(params.address, params.network);
  } catch (e: any) {
    return rejectWithValue(e.message || 'Ошибка получения токенов пользователя');
  }
});

export const swapThunk = createAsyncThunk(
  'swap/perform',
  async (
    {
      fromToken,
      toToken,
      amount,
      walletAdapter,
      userAddress,
      network,
    }: {
      fromToken: string;
      toToken: string;
      amount: string; // в нанотокенах
      walletAdapter: WalletAdapter;
      userAddress: string;
      network?: 'testnet' | 'mainnet';
    },
    { rejectWithValue }
  ) => {
    try {
      // Получаем котировку
      const quote = await getQuote({ fromToken, toToken, amount, userAddress, network });
      
      // Проверяем баланс
      const hasBalance = await checkBalance({ 
        walletAdapter, 
        token: fromToken, 
        amount 
      });
      
      if (!hasBalance) {
        throw new Error('Недостаточно средств для свопа');
      }
      
      // Выполняем своп
      const result = await performSwap({ walletAdapter, quote });
      
      return result;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Ошибка свопа');
    }
  }
); 