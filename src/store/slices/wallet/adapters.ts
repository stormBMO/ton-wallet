import { TonConnect } from '@tonconnect/sdk';
import { TonConnectUI } from '@tonconnect/ui-react';
import TonWeb from 'tonweb';
import { WalletAdapter } from './types';

// Адаптер для TonConnect
export class TonConnectAdapter implements WalletAdapter {
  private connector: TonConnect | TonConnectUI;

  constructor(connector: TonConnect | TonConnectUI) {
    this.connector = connector;
  }

  async getAddress(): Promise<string | null> {
    const wallet = this.connector.wallet;
    return wallet?.account.address || null;
  }

  async getBalance(token?: string): Promise<string> {
    if (token && token !== 'TON') {
      // Для получения баланса Jetton-токенов используем tonapi.io
      const address = await this.getAddress();
      if (!address) throw new Error('Кошелек не подключен');
      
      const response = await fetch(`https://tonapi.io/v2/accounts/${address}/jettons`);
      const data = await response.json();
      
      const jetton = data.balances.find((j: any) => j.jetton.address === token);
      return jetton ? jetton.balance : '0';
    }
    
    // Для TON используем встроенный метод или запрос к API
    const wallet = this.connector.wallet;
    if (!wallet) return '0';
    
    // Если balance не доступен напрямую, запрашиваем из API
    if (wallet.account && !('balance' in wallet.account)) {
      const address = wallet.account.address;
      const response = await fetch(`https://tonapi.io/v2/accounts/${address}`);
      const data = await response.json();
      return data.balance || '0';
    }
    
    // @ts-ignore - Игнорируем ошибку типа, так как в некоторых реализациях balance может присутствовать
    return wallet.account.balance || '0';
  }

  async sendTx(tx: any): Promise<any> {
    if (!this.connector.wallet) throw new Error('Кошелек не подключен');

    // TonConnect ожидает определенный формат транзакции
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут
      messages: [
        {
          address: tx.to,
          amount: tx.amount.toString(),
          payload: tx.payload,
          stateInit: tx.stateInit
        }
      ]
    };

    // Используем sendTransaction с приведением типов для обеих реализаций
    return await (this.connector as any).sendTransaction(transaction);
  }

  async signMsg(msg: string | Uint8Array): Promise<string> {
    if (!this.connector.wallet) throw new Error('Кошелек не подключен');
    
    const messageToSign = typeof msg === 'string' ? msg : Buffer.from(msg).toString('hex');
    
    // Используем произвольный метод подписи сообщения с приведением типов
    // TonConnectUI и TonConnect могут иметь разные API, но оба должны поддерживать подпись
    if ('signMessage' in this.connector) {
      return await (this.connector as any).signMessage(messageToSign);
    }
    
    // Fallback для случаев, когда метод может называться иначе
    throw new Error('Метод подписи сообщений не поддерживается данным коннектором');
  }

  async disconnect(): Promise<void> {
    await this.connector.disconnect();
  }
}

// Адаптер для внутреннего кошелька (может использовать TonWeb)
export class InternalWalletAdapter implements WalletAdapter {
  private wallet: any; // TonWeb Wallet instance
  private secretKey: Uint8Array;
  private address: string;
  private provider: any;

  constructor(secretKey: Uint8Array, address: string, network: 'mainnet' | 'testnet' = 'mainnet') {
    this.secretKey = secretKey;
    this.address = address;
    
    const providerUrl = network === 'testnet'
      ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
      : 'https://toncenter.com/api/v2/jsonRPC';
    
    this.provider = new TonWeb.HttpProvider(providerUrl);
    const tonweb = new TonWeb(this.provider);
    
    // Создаем экземпляр кошелька
    const WalletClass = TonWeb.Wallets.all.v3R2;
    this.wallet = new WalletClass(tonweb.provider, {
      publicKey: secretKey.subarray(32, 64),
      wc: 0
    });
  }

  async getAddress(): Promise<string> {
    return this.address;
  }

  async getBalance(token?: string): Promise<string> {
    if (token && token !== 'TON') {
      // Для Jetton-токенов используем tonapi.io
      const response = await fetch(`https://tonapi.io/v2/accounts/${this.address}/jettons`);
      const data = await response.json();
      
      const jetton = data.balances.find((j: any) => j.jetton.address === token);
      return jetton ? jetton.balance : '0';
    }
    
    // Для TON используем TonWeb
    const balance = await this.provider.getBalance(this.address);
    return balance;
  }

  async sendTx(tx: any): Promise<any> {
    try {
      const seqno = await this.wallet.methods.seqno().call() || 0;
      
      const txParams = {
        secretKey: this.secretKey,
        toAddress: tx.to,
        amount: tx.amount,
        seqno: Number(seqno),
        payload: tx.payload,
        sendMode: 3,
      };
      
      const transaction = this.wallet.methods.transfer(txParams);
      return await transaction.send();
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  async signMsg(msg: string | Uint8Array): Promise<string> {
    const msgBytes = typeof msg === 'string' ? new TextEncoder().encode(msg) : msg;
    // Используем нативные методы для подписи сообщения
    const cell = new TonWeb.boc.Cell();
    cell.bits.writeBytes(msgBytes);
    const cellBytes = await cell.toBoc();
    
    // Хэшируем данные перед подписью
    const hash = await TonWeb.utils.sha256(cellBytes);
    
    // Используем nacl для подписи (TonWeb.utils.nacl)
    // Преобразуем ArrayBuffer в Uint8Array для совместимости
    const hashArray = new Uint8Array(hash);
    const signature = TonWeb.utils.nacl.sign.detached(hashArray, this.secretKey);
    
    return Buffer.from(signature).toString('hex');
  }

  async disconnect(): Promise<void> {
    // Ничего не делаем для внутреннего кошелька
  }
} 