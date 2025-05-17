import React, { useEffect, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { WalletAdapter, TonConnectAdapter, InternalWalletAdapter } from '@/store/slices/wallet';
import { swapThunk, getQuote, checkBalance, getUserTokens } from '@/store/thunks/swap';
import { useSwap } from '../hooks/useSwap';

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

// Простая модалка для ошибок и успеха
const SimpleModal = ({ open, onClose, title, message }: { open: boolean, onClose: () => void, title: string, message: string }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-neutral-900 rounded-[12px] p-6 w-full max-w-xs shadow-xl">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
        <div className="mb-4 text-gray-700 dark:text-gray-300">{message}</div>
        <button className="w-full py-2 rounded-[12px] bg-[#7C3AED] text-white font-semibold" onClick={onClose}>Ок</button>
      </div>
    </div>
  );
};

const supportedTokens = [
  { symbol: 'TON', name: 'Toncoin' },
  { symbol: 'jUSDT', name: 'Jetton USDT' },
];

export const SwapPage = () => {
  const {
    fromToken, toToken, amount, rate, minReceive, fee, userTokens, rateError,
    showModal, showError, errorMsg, showSuccess, walletType,
    setFromToken, setToToken, setAmount, setRate, setMinReceive, setFee,
    setUserTokens, setRateError, setShowModal, setShowError, setErrorMsg,
    setShowSuccess, setWalletType, resetSwap
  } = useSwap();
  const [walletAdapter, setWalletAdapter] = React.useState<WalletAdapter | null>(null);
  const [tonConnectUI] = useTonConnectUI();
  const network = useSelector((state: RootState) => state.wallet.network);
  const walletAddress = useSelector((state: RootState) => state.wallet.address);

  // Мемоизируем setUserTokens, чтобы не было постоянного срабатывания useEffect
  const setUserTokensMemo = useCallback(setUserTokens, []);

  // Инициализация адаптера при смене типа кошелька
  useEffect(() => {
    if (walletType === 'tonconnect') {
      setWalletAdapter(new TonConnectAdapter(tonConnectUI));
    } else {
      const mnemonic = window.localStorage.getItem('demo_mnemonic') || window.prompt('Введите сид-фразу (24 слова):') || '';
      if (mnemonic) {
        window.localStorage.setItem('demo_mnemonic', mnemonic);
        
        // Здесь нужно преобразовать mnemonic в secretKey (Uint8Array) и получить адрес
        // Но поскольку это выходит за рамки текущего исправления, сделаем заглушку:
        // Создаем фиктивный Uint8Array
        const secretKey = new Uint8Array(64);
        // Используем демо-адрес
        const demoAddress = "EQDjVXa_oltdBP64Nc__p397xLCvGm2IcZ1ba7anSW0NAkeP";
        
        setWalletAdapter(new InternalWalletAdapter(secretKey, demoAddress, network));
      }
    }
  }, [walletType, tonConnectUI, network]);

  // Получаем токены пользователя при смене адреса
  useEffect(() => {
    if (walletAddress) {
      getUserTokens(walletAddress, network).then(setUserTokensMemo);
    }
  }, [walletAddress, network, setUserTokensMemo]);

  // Обновляем курс при изменении пары или суммы
  useEffect(() => {
    async function updateRate() {
      setRateError('');
      if (!walletAddress || !fromToken || !toToken || !amount) return;
      try {
        const amountInNano = (parseFloat(amount) * 1_000_000_000).toString();
        const quote = await getQuote({ fromToken, toToken, amount: amountInNano, userAddress: walletAddress, network });
        setRate(`${(parseFloat(quote.amount) / 1_000_000_000 / parseFloat(amount)).toFixed(4)} ${toToken} за 1 ${fromToken}`);
        setMinReceive((parseFloat(quote.amount) / 1_000_000_000).toFixed(4));
        setFee('0.1%');
      } catch (e: any) {
        setRate('—');
        setMinReceive('—');
        setRateError('Пара недоступна или нет ликвидности в выбранной сети.');
      }
    }
    updateRate();
  }, [fromToken, toToken, amount, walletAddress, network, setRate, setMinReceive, setFee, setRateError]);

  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setShowModal(false);
    if (!walletAdapter) {
      setErrorMsg('Кошелек не выбран!');
      setShowError(true);
      return;
    }
    try {
      const amountInNano = (parseFloat(amount) * 1_000_000_000).toString();
      const userAddress = await walletAdapter.getAddress();
      if (!userAddress) {
        setErrorMsg('Не удалось получить адрес кошелька');
        setShowError(true);
        return;
      }
      const hasBalance = await checkBalance({ walletAdapter, token: fromToken, amount: amountInNano });
      if (!hasBalance) {
        setErrorMsg('Недостаточно средств');
        setShowError(true);
        return;
      }
      // swapThunk требует dispatch, но теперь мы не используем useDispatch напрямую
      // Можно импортировать store и вызвать store.dispatch, либо оставить useDispatch только для этого случая
      // Для простоты оставим store.dispatch
      const { store } = require('../store');
      await store.dispatch(swapThunk({
        fromToken,
        toToken,
        amount: amountInNano,
        walletAdapter,
        userAddress,
        network,
      })).unwrap();
      setShowSuccess(true);
      setAmount('');
    } catch (e: any) {
      setErrorMsg(e.message || 'Ошибка свопа');
      setShowError(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md min-h-screen flex flex-col justify-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Своп токенов</h1>
      <form onSubmit={handleSwap} className="bg-white dark:bg-neutral-900 rounded-[12px] shadow p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Из</label>
          <select value={fromToken} onChange={e => setFromToken(e.target.value)} className="w-full py-3 px-4 rounded-[12px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
            {userTokens.filter(t => {
              try {
                return BigInt(t.balance) > 0 && t.symbol !== toToken;
              } catch {
                return false;
              }
            }).map(t => (
              <option key={t.symbol} value={t.symbol}>
                {t.name} {t.balance ? `(${(parseFloat(t.balance) / 1_000_000_000).toFixed(4)})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">В</label>
          <select value={toToken} onChange={e => setToToken(e.target.value)} className="w-full py-3 px-4 rounded-[12px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
            {supportedTokens.filter(t => t.symbol !== fromToken).map(t => (
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
          {rateError && <div className="text-red-500 mt-1">{rateError}</div>}
        </div>
        <button type="submit" className="w-full py-3 px-4 rounded-[12px] bg-[#7C3AED] text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition">Своп</button>
      </form>
      <ConfirmSwapModal open={showModal} onClose={() => setShowModal(false)} amount={amount} rate={rate} fee={fee} onConfirm={handleConfirm} />
      <SimpleModal open={showError} onClose={() => setShowError(false)} title="Ошибка" message={errorMsg} />
      <SimpleModal open={showSuccess} onClose={() => setShowSuccess(false)} title="Успех" message="Своп подтверждён!" />
    </div>
  );
};

export default SwapPage;