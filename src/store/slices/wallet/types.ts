export type Network = 'testnet' | 'mainnet';

export interface JettonBalance {
  symbol: string;
  balance: string;
  address: string;
}

// Базовый интерфейс адаптера кошелька
export interface WalletAdapter {
  getAddress(): Promise<string | null>;
  getBalance(token?: string): Promise<string>;
  sendTx(tx: any): Promise<any>;
  signMsg(msg: string | Uint8Array): Promise<string>;
  disconnect(): Promise<void>;
} 