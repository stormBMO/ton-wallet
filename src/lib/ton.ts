import { TonConnect } from '@tonconnect/sdk';
import { TON_CONNECT_CONFIG } from '@/config/constants';

const manifestUrl = TON_CONNECT_CONFIG.MANIFEST_URL;

export const createTonConnect = () => {
    return new TonConnect({ manifestUrl });
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
  
    return Math.sqrt(variance * 252); 
};

export const calculateRiskScore = (volatility: number): number => {
    return Math.min(100, Math.round(volatility * 800));
};