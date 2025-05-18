import React from 'react';
import { useSwap } from '../hooks/useSwap';
import { motion } from 'framer-motion';
import { fadeIn, tap } from '@/lib/motion';

// Заглушка для ConfirmSwapModal
const ConfirmSwapModal = ({ open, onClose, amount, rate, fee, onConfirm }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glasscard p-6 w-full max-w-xs"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Подтвердите обмен</h2>
        <div className="mb-2 text-gray-700 dark:text-gray-300">Сумма: <b>{amount}</b></div>
        <div className="mb-2 text-gray-700 dark:text-gray-300">Курс: <b>{rate}</b></div>
        <div className="mb-4 text-gray-700 dark:text-gray-300">Комиссия: <b>{fee}</b></div>
        <div className="flex gap-2">
          <motion.button 
            whileTap={tap}
            className="flex-1 py-2 rounded-xl bg-secondary text-white font-semibold" 
            onClick={onConfirm}
          >
            Подтвердить
          </motion.button>
          <button className="flex-1 py-2 rounded-xl bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-white" onClick={onClose}>Отмена</button>
        </div>
      </motion.div>
    </div>
  );
};

// Простая модалка для ошибок и успеха
const SimpleModal = ({ open, onClose, title, message }: { open: boolean, onClose: () => void, title: string, message: string }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glasscard p-6 w-full max-w-xs"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h2>
        <div className="mb-4 text-gray-700 dark:text-gray-300">{message}</div>
        <motion.button 
          whileTap={tap}
          className="w-full py-2 rounded-xl bg-primary text-white font-semibold" 
          onClick={onClose}
        >
          Ок
        </motion.button>
      </motion.div>
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
    showModal, showError, errorMsg, showSuccess, isLoading,
    setFromToken, setToToken, setAmount, setShowModal, setShowError, setShowSuccess,
    performSwap
  } = useSwap();

  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setShowModal(false);
    performSwap();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md min-h-screen flex flex-col justify-center">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="show"
      >
        <h1 className="text-2xl font-semibold text-center mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Своп токенов</h1>
        <motion.form 
          onSubmit={handleSwap} 
          className="glasscard p-6 flex flex-col gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Из</label>
            <select 
              value={fromToken} 
              onChange={e => setFromToken(e.target.value)} 
              className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
              disabled={isLoading}
            >
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
            <select 
              value={toToken} 
              onChange={e => setToToken(e.target.value)} 
              className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
              disabled={isLoading}
            >
              {supportedTokens.filter(t => t.symbol !== fromToken).map(t => (
                <option key={t.symbol} value={t.symbol}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Сумма</label>
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              min="0" 
              step="0.01" 
              placeholder="0.00" 
              required 
              className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300 glasscard p-3">
            <div>Курс: <b>{rate}</b></div>
            <div>Мин. к получению: <b>{minReceive} {toToken}</b></div>
            {rateError && <div className="text-red-500 mt-1">{rateError}</div>}
          </div>
          <motion.button 
            type="submit" 
            className="w-full py-3 px-4 rounded-xl bg-secondary text-white font-semibold focus:outline-none focus:ring-2 focus:ring-secondary transition"
            disabled={isLoading || !!rateError}
            whileTap={tap}
          >
            {isLoading ? 'Загрузка...' : 'Своп'}
          </motion.button>
        </motion.form>
      </motion.div>
      <ConfirmSwapModal open={showModal} onClose={() => setShowModal(false)} amount={amount} rate={rate} fee={fee} onConfirm={handleConfirm} />
      <SimpleModal open={showError} onClose={() => setShowError(false)} title="Ошибка" message={errorMsg} />
      <SimpleModal open={showSuccess} onClose={() => setShowSuccess(false)} title="Успех" message="Своп подтверждён!" />
    </div>
  );
};

export default SwapPage;