import { useState } from 'react';
import styled from '@emotion/styled';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axios from 'axios';

const Form = styled.form`
  @apply mt-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow;
`;

const Input = styled.input`
  @apply w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white;
`;

const Button = styled.button`
  @apply w-full mt-4 px-4 py-2 rounded-lg bg-ton-blue text-white 
         hover:bg-opacity-90 transition-all disabled:opacity-50;
`;

const ErrorMessage = styled.div`
  @apply mt-2 text-red-500 text-sm;
`;

const ConnectMessage = styled.div`
  @apply text-center text-gray-600 dark:text-gray-400 p-4;
`;

const InfoMessage = styled.div`
  @apply mt-2 text-blue-500 text-sm;
`;

export const SwapForm = () => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tonConnectUI] = useTonConnectUI();
  const { network, address: walletAddress } = useSelector((state: RootState) => state.wallet);
  const address = tonConnectUI.account?.address || walletAddress;

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isLoading || !address) return;

    setIsLoading(true);
    setError(null);

    try {
      // Конвертируем сумму в нанотоны (1 TON = 1_000_000_000 нанотонов)
      const amountInNano = (parseFloat(amount) * 1_000_000_000).toString();

      const apiUrl = network === 'testnet' 
        ? 'https://testnet.ston.fi/api/v1/quote'
        : 'https://api.ston.fi/v1/quote';

      // Get quote
      const quoteResponse = await axios.get(apiUrl, {
        params: {
          from: 'TON',
          to: 'jUSDT',
          amount: amountInNano,
          slippage: '0.5', // 0.5% slippage
          userAddress: address
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!quoteResponse.data) {
        throw new Error('Не удалось получить котировку');
      }

      // Проверяем, подключен ли кошелек через TonConnect
      if (!tonConnectUI.account?.address) {
        throw new Error('Для выполнения свопа необходимо подключить кошелек через TonConnect');
      }

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: quoteResponse.data.to,
            amount: quoteResponse.data.amount,
            payload: quoteResponse.data.payload
          }
        ]
      };

      // Send transaction
      await tonConnectUI.sendTransaction(transaction);
      
      // Show success message
      alert('Транзакция успешно отправлена!');
      setAmount('');
    } catch (error: any) {
      console.error('Swap failed:', error);
      if (error.response) {
        // Ошибка от сервера
        setError(error.response.data?.message || 'Ошибка сервера при выполнении свопа');
      } else if (error.request) {
        // Ошибка сети
        setError('Ошибка сети. Пожалуйста, проверьте ваше подключение к интернету');
      } else {
        // Другие ошибки
        setError(error.message || 'Ошибка при выполнении свопа. Пожалуйста, попробуйте снова.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!address) {
    return (
      <ConnectMessage>
        Пожалуйста, подключите кошелек для использования функции свопа
      </ConnectMessage>
    );
  }

  return (
    <Form onSubmit={handleSwap}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Своп TON на jUSDT
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Сумма TON
        </label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Введите сумму"
          min="0"
          step="0.1"
          required
        />
      </div>

      {!tonConnectUI.account?.address && (
        <InfoMessage>
          Для выполнения свопа необходимо подключить кошелек через TonConnect
        </InfoMessage>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Button type="submit" disabled={isLoading || !tonConnectUI.account?.address}>
        {isLoading ? 'Выполняется...' : 'Своп'}
      </Button>
    </Form>
  );
};