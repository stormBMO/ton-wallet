import { useTonConnectUI } from '@tonconnect/ui-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { SwapForm } from '../components/SwapForm';

export const SwapPage = () => {
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useSelector((state: RootState) => state.wallet.address);
  const address = tonConnectUI.account?.address || walletAddress;

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">
          Пожалуйста, подключите кошелек для использования функции свопа
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Своп токенов
      </h1>
      
      <div className="max-w-md mx-auto">
        <SwapForm />
      </div>
    </div>
  );
};