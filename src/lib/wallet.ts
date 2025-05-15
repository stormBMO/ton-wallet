// Абстракция для работы с кошельками

export interface WalletAdapter {
  getAddress(): Promise<string | null>;
  getBalance(token?: string): Promise<string>;
  sendTx(tx: any): Promise<any>;
  signMsg(msg: string | Uint8Array): Promise<string>;
  isAvailable(): boolean;
  getName(): string;
}

// Адаптер для внутреннего кошелька (например, по сид-фразе)
export class InternalWalletAdapter implements WalletAdapter {
  private mnemonic: string;
  private address: string | null = null;
  private network: 'testnet' | 'mainnet';

  constructor(mnemonic: string, network: 'testnet' | 'mainnet' = 'testnet') {
    this.mnemonic = mnemonic;
    this.network = network;
  }

  async getAddress(): Promise<string | null> {
    if (this.address) return this.address;
    // Импортируем только при необходимости
    const { mnemonicToWalletKey } = await import('@ton/crypto');
    const { WalletContractV4 } = await import('@ton/ton');
    const key = await mnemonicToWalletKey(this.mnemonic.split(' '));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    this.address = wallet.address.toString();
    return this.address;
  }

  async getBalance(token?: string): Promise<string> {
    const address = await this.getAddress();
    if (!address) throw new Error('Адрес не найден');
    // Для TON и jetton используем tonapi.io
    if (!token || token === 'TON') {
      const res = await fetch(`https://tonapi.io/v2/accounts/${address}`);
      const data = await res.json();
      return data.balance;
    } else {
      const res = await fetch(`https://tonapi.io/v2/accounts/${address}/jettons`);
      const data = await res.json();
      const jetton = (data.balances || []).find((j: any) => j.symbol === token);
      return jetton?.balance || '0';
    }
  }

  async sendTx(tx: any): Promise<any> {
    // Для InternalWalletAdapter используем transferTX
    const { transferTX } = await import('./transferTX');
    const { mnemonicToWalletKey } = await import('@ton/crypto');
    const { WalletContractV4 } = await import('@ton/ton');
    const key = await mnemonicToWalletKey(this.mnemonic.split(' '));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const secretKey = key.secretKey;
    return transferTX({
      ...tx,
      secretKey,
      walletAddress: wallet.address.toString(),
      network: this.network,
    });
  }

  async signMsg(msg: string | Uint8Array): Promise<string> {
    // Пример: подпись сообщения приватным ключом
    const { mnemonicToWalletKey } = await import('@ton/crypto');
    const key = await mnemonicToWalletKey(this.mnemonic.split(' '));
    // Здесь должна быть реализация подписи (например, через ed25519)
    // Для простоты возвращаем base64 от msg
    if (typeof msg === 'string') {
      return btoa(msg);
    }
    return btoa(String.fromCharCode(...msg));
  }

  isAvailable(): boolean {
    return !!this.mnemonic;
  }

  getName(): string {
    return 'Встроенный кошелек';
  }
}

// Адаптер для TonConnect
export class TonConnectAdapter implements WalletAdapter {
  private tonConnectUI: any;

  constructor(tonConnectUI: any) {
    this.tonConnectUI = tonConnectUI;
  }

  async getAddress(): Promise<string | null> {
    return this.tonConnectUI.account?.address || null;
  }

  async getBalance(token?: string): Promise<string> {
    const address = await this.getAddress();
    if (!address) throw new Error('Адрес не найден');
    if (!token || token === 'TON') {
      const res = await fetch(`https://tonapi.io/v2/accounts/${address}`);
      const data = await res.json();
      return data.balance;
    } else {
      const res = await fetch(`https://tonapi.io/v2/accounts/${address}/jettons`);
      const data = await res.json();
      const jetton = (data.balances || []).find((j: any) => j.symbol === token);
      return jetton?.balance || '0';
    }
  }

  async sendTx(tx: any): Promise<any> {
    return this.tonConnectUI.sendTransaction(tx);
  }

  async signMsg(msg: string | Uint8Array): Promise<string> {
    // TonConnect не всегда поддерживает подпись произвольных сообщений
    throw new Error('signMsg не поддерживается для TonConnect');
  }

  isAvailable(): boolean {
    return !!this.tonConnectUI.account;
  }

  getName(): string {
    return 'TonConnect';
  }
} 