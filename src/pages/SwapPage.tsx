import React, { useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { SwapForm } from '../components/SwapForm';
import { WalletAdapter, TonConnectAdapter, InternalWalletAdapter } from '../lib/wallet';

// Заглушка для ConfirmSwapModal
const ConfirmSwapModal = ({ open, onClose, amount, rate, fee, onConfirm }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-neutral-900 rounded-[12px] p-6 w-full max-w-xs shadow-xl">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Подтвердите обмен</h2>
        <div className="mb-2 text-gray-700 dark:text-gray-300">Сумма: <b>{amount}</b></div>
        <div className="mb-2 text-gray-700 dark:text-gray-300">Курс: <b>{rate}</b></div>
        <div className="mb-4 text-gray-700 dark:text-gray-300">Комиссия: <b>{fee}</b></div>
        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-[12px] bg-[#7C3AED] text-white font-semibold" onClick={onConfirm}>Подтвердить</button>
          <button className="flex-1 py-2 rounded-[12px] bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-white" onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
};

const tokens = [
  { symbol: 'TON', name: 'Toncoin' },
  { symbol: 'jUSDT', name: 'Jetton USDT' },
];

export const SwapPage = () => {
  const [fromToken, setFromToken] = useState('TON');
  const [toToken, setToToken] = useState('jUSDT');
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [walletType, setWalletType] = useState<'tonconnect' | 'internal'>('tonconnect');
  const [walletAdapter, setWalletAdapter] = useState<WalletAdapter | null>(null);
  const [tonConnectUI] = useTonConnectUI();
  // Примерные значения для превью
  const rate = '1 TON ≈ 1.01 jUSDT';
  const minReceive = amount ? (parseFloat(amount) * 1.01).toFixed(2) : '0.00';
  const fee = '0.1%';

  // Инициализация адаптера при смене типа кошелька
  React.useEffect(() => {
    if (walletType === 'tonconnect') {
      setWalletAdapter(new TonConnectAdapter(tonConnectUI));
    } else {
      // Для демо: prompt для сид-фразы
      const mnemonic = window.localStorage.getItem('demo_mnemonic') || window.prompt('Введите сид-фразу (24 слова):') || '';
      if (mnemonic) {
        window.localStorage.setItem('demo_mnemonic', mnemonic);
        setWalletAdapter(new InternalWalletAdapter(mnemonic));
      }
    }
  }, [walletType, tonConnectUI]);

  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setShowModal(false);
    if (!walletAdapter) {
      alert('Кошелек не выбран!');
      return;
    }
    try {
      // Получаем котировку
      const amountInNano = (parseFloat(amount) * 1_000_000_000).toString();
      const apiUrl = 'https://testnet.ston.fi/api/v1/quote';
      const address = await walletAdapter.getAddress();
      const quoteResponse = await fetch(`${apiUrl}?from=TON&to=jUSDT&amount=${amountInNano}&slippage=0.5&userAddress=${address}`);
      const quote = await quoteResponse.json();
      if (!quote || !quote.to) throw new Error('Не удалось получить котировку');
      // Формируем транзакцию
      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: quote.to,
            amount: quote.amount,
            payload: quote.payload,
          },
        ],
      };
      await walletAdapter.sendTx(tx);
      alert('Своп подтверждён!');
      setAmount('');
    } catch (e: any) {
      alert(e.message || 'Ошибка свопа');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md min-h-screen flex flex-col justify-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Своп токенов</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Кошелек</label>
        <select value={walletType} onChange={e => setWalletType(e.target.value as any)} className="w-full py-3 px-4 rounded-[12px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
          <option value="tonconnect">TonConnect</option>
          <option value="internal">Встроенный кошелек</option>
        </select>
      </div>
      <form onSubmit={handleSwap} className="bg-white dark:bg-neutral-900 rounded-[12px] shadow p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Из</label>
          <select value={fromToken} onChange={e => setFromToken(e.target.value)} className="w-full py-3 px-4 rounded-[12px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
            {tokens.filter(t => t.symbol !== toToken).map(t => (
              <option key={t.symbol} value={t.symbol}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">В</label>
          <select value={toToken} onChange={e => setToToken(e.target.value)} className="w-full py-3 px-4 rounded-[12px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
            {tokens.filter(t => t.symbol !== fromToken).map(t => (
              <option key={t.symbol} value={t.symbol}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Сумма</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" placeholder="0.00" required className="w-full py-3 px-4 rounded-[12px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]" />
        </div>
        <div className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-neutral-800 rounded-[12px] p-3">
          <div>Курс: <b>{rate}</b></div>
          <div>Мин. к получению: <b>{minReceive} {toToken}</b></div>
        </div>
        <button type="submit" className="w-full py-3 px-4 rounded-[12px] bg-[#7C3AED] text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition">Своп</button>
      </form>
      <ConfirmSwapModal open={showModal} onClose={() => setShowModal(false)} amount={amount} rate={rate} fee={fee} onConfirm={handleConfirm} />
    </div>
  );
};

export default SwapPage;