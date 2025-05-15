import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InternalWalletAdapter, TonConnectAdapter } from '../lib/wallet';

// Мокаем fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Мокаем импорты для InternalWalletAdapter
vi.mock('@ton/crypto', () => ({
  mnemonicToWalletKey: vi.fn(async (mnemonic: string[]) => ({
    publicKey: new Uint8Array(32),
    secretKey: new Uint8Array(64),
  })),
}));
vi.mock('@ton/ton', () => ({
  WalletContractV4: {
    create: ({ publicKey }: any) => ({ address: { toString: () => 'EQD_FAKE_ADDRESS' } }),
  },
}));
vi.mock('../lib/transferTX', () => ({
  transferTX: vi.fn(async (params: any) => ({ txHash: 'FAKE_HASH' })),
}));

describe('InternalWalletAdapter', () => {
  let adapter: InternalWalletAdapter;
  beforeEach(() => {
    adapter = new InternalWalletAdapter('word '.repeat(24).trim());
    fetchMock.mockReset();
  });

  it('должен возвращать адрес', async () => {
    const address = await adapter.getAddress();
    expect(address).toBe('EQD_FAKE_ADDRESS');
  });

  it('должен возвращать баланс TON', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => ({ balance: '12345' }) });
    const balance = await adapter.getBalance('TON');
    expect(balance).toBe('12345');
  });

  it('должен возвращать баланс jetton', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => ({ balances: [{ symbol: 'jUSDT', balance: '999' }] }) });
    const balance = await adapter.getBalance('jUSDT');
    expect(balance).toBe('999');
  });

  it('должен отправлять транзакцию', async () => {
    const result = await adapter.sendTx({ to: 'to', amount: '1' });
    expect(result.txHash).toBe('FAKE_HASH');
  });

  it('isAvailable работает корректно', () => {
    expect(adapter.isAvailable()).toBe(true);
  });

  it('getName возвращает корректное имя', () => {
    expect(adapter.getName()).toBe('Встроенный кошелек');
  });
});

describe('TonConnectAdapter', () => {
  const tonConnectUI = {
    account: { address: 'EQD_TONCONNECT' },
    sendTransaction: vi.fn(async (tx: any) => 'ok'),
  };
  const adapter = new TonConnectAdapter(tonConnectUI);

  it('должен возвращать адрес', async () => {
    expect(await adapter.getAddress()).toBe('EQD_TONCONNECT');
  });

  it('должен возвращать баланс TON', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => ({ balance: '777' }) });
    const balance = await adapter.getBalance('TON');
    expect(balance).toBe('777');
  });

  it('должен возвращать баланс jetton', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => ({ balances: [{ symbol: 'jUSDT', balance: '888' }] }) });
    const balance = await adapter.getBalance('jUSDT');
    expect(balance).toBe('888');
  });

  it('должен отправлять транзакцию', async () => {
    const result = await adapter.sendTx({});
    expect(result).toBe('ok');
  });

  it('isAvailable работает корректно', () => {
    expect(adapter.isAvailable()).toBe(true);
  });

  it('getName возвращает корректное имя', () => {
    expect(adapter.getName()).toBe('TonConnect');
  });

  it('signMsg выбрасывает ошибку', async () => {
    await expect(adapter.signMsg('msg')).rejects.toThrow('signMsg не поддерживается для TonConnect');
  });
}); 