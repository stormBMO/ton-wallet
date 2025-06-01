import axios from 'axios';
import { TON_API_BASE_URL } from '@/constants';
import { Network } from '@/store/slices/wallet/types';

export interface RawTokenData {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals?: number;
}

export async function fetchTonBalance(addr: string, network: Network) {
    const { data } = await axios.get(`${TON_API_BASE_URL[network]}/v2/accounts/${addr}`);
    if (data.status === 'nonexist') throw new Error('WALLET_NOT_FOUND');
    const balance = (Number(data.balance) / 1_000_000_000).toFixed(4);
    return { 
        address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c', // Нативный адрес TON для MyTonSwap
        symbol: 'TON', 
        name: 'Toncoin', 
        balance 
    };
}

export async function fetchJettons(addr: string, network: 'mainnet'|'testnet') {
    const { data } = await axios.get(`${TON_API_BASE_URL[network]}/v2/accounts/${addr}/jettons`);
    return (data.balances || []).map((j: Record<string, any>): RawTokenData => ({
        address: j.jetton.address,
        symbol : j.jetton.symbol  ?? 'JETTON',
        name   : j.jetton.name    ?? 'Jetton',
        balance: (BigInt(j.balance) / BigInt(10 ** (j.jetton.decimals ?? 9))).toString(),
    }));
}