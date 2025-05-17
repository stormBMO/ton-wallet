import { TonConnect } from '@tonconnect/sdk';
import { TonConnectUI } from '@tonconnect/ui-react';

const manifestUrl = 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json';

export const createTonConnect = () => {
  const connector = new TonConnect({ manifestUrl });
  const tonConnectUI = new TonConnectUI({
    connector,
    uiPreferences: {
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'DARK' : 'LIGHT'
    }
  });

  return { connector, tonConnectUI };
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string | number): string => {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  return num.toFixed(2);
};

export const calculateVolatility = (prices: number[]): number => {
  if (prices.length < 2) return 0;
  
  const returns = prices.slice(1).map((price, i) => 
    Math.log(price / prices[i])
  );
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance * 252); // Годовая волатильность
};

export const calculateRiskScore = (volatility: number): number => {
  // Преобразуем волатильность в риск-скор от 0 до 100
  // Высокая волатильность = высокий риск
  return Math.min(100, Math.round(volatility * 800));
};