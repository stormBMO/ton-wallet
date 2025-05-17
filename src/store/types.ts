export type Network = 'testnet' | 'mainnet';

export interface JettonBalance {
  symbol: string;
  balance: string;
  address: string;
}