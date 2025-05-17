import { transferTXThunk } from '@/store/thunks/transferTX';
import React, { useState } from 'react';

const TOKENS = [
  { symbol: 'TON', name: 'Toncoin' },
  { symbol: 'TIP3', name: 'Jetton (TIP-3)' },
];

export const SendForm = () => {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [token, setToken] = useState('TON');
  const [jettonAddress, setJettonAddress] = useState('');
  const [secretKey, setSecretKey] = useState(''); // base64 или hex строка
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const tx = await transferTXThunk({
        to,
        amount,
        comment,
        token: token as 'TON' | 'TIP3',
        secretKey: Uint8Array.from(Buffer.from(secretKey, 'hex')),
        jettonAddress: token === 'TIP3' ? jettonAddress : undefined,
        walletAddress,
        network: 'testnet',
      });
      setResult(`Транзакция отправлена! Hash: ${tx.txHash}`);
    } catch (err: any) {
      setError(err.message || 'Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-[12px] shadow p-6 flex flex-col gap-4 max-w-md mx-auto w-full">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Отправить токены</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Токен</label>
        <select value={token} onChange={e => setToken(e.target.value)} className="w-full py-3 px-4 rounded-[12px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
          {TOKENS.map(t => (
            <option key={t.symbol} value={t.symbol}>{t.name}</option>
          ))}
        </select>
      </div>
      {token === 'TIP3' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jetton Address</label>
          <input type="text" value={jettonAddress} onChange={e => setJettonAddress(e.target.value)} required className="w-full py-3 px-4 rounded-[12px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]" />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Адрес получателя</label>
        <input type="text" value={to} onChange={e => setTo(e.target.value)} required className="w-full py-3 px-4 rounded-[12px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Сумма</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" required className="w-full py-3 px-4 rounded-[12px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Комментарий</label>
        <input type="text" value={comment} onChange={e => setComment(e.target.value)} className="w-full py-3 px-4 rounded-[12px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secret Key (hex)</label>
        <input type="text" value={secretKey} onChange={e => setSecretKey(e.target.value)} required className="w-full py-3 px-4 rounded-[12px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wallet Address</label>
        <input type="text" value={walletAddress} onChange={e => setWalletAddress(e.target.value)} required className="w-full py-3 px-4 rounded-[12px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]" />
      </div>
      <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-[12px] bg-[#7C3AED] text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition">
        {loading ? 'Отправка...' : 'Отправить'}
      </button>
      {result && <div className="text-green-600 dark:text-green-400 mt-2">{result}</div>}
      {error && <div className="text-red-600 dark:text-red-400 mt-2">{error}</div>}
    </form>
  );
};

export default SendForm; 