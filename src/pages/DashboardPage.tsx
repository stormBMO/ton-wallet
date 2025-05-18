import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '../lib/motion';
import { TokenCard } from '../components/ui/TokenCard';
import '../index.css';
import { useDashboard } from '@/hooks/useDashboard';

export const Dashboard = () => {
  const { isBalancesLoading, dataError, displayTokens, isAuthenticated, authStatus, walletAddress, totalTonValue } = useDashboard();

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-300 text-lg">Аутентификация...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Пожалуйста, подключите кошелек для просмотра дашборда.
        </p>
      </div>
    );
  }

  if (isBalancesLoading && displayTokens.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-300 text-lg">Загрузка данных кошелька...</p>
      </div>
    );
  }

  const tonTokenForDisplay = displayTokens.find(token => token.symbol === 'TON');
  const otherTokensForDisplay = displayTokens.filter(token => token.symbol !== 'TON');

  return (
    <div className="min-h-screen px-4 py-10">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show" 
        className="relative z-10 max-w-4xl mx-auto flex flex-col gap-8"
      >
        <div className="flex flex-col items-center gap-2 mb-6">
          <h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Дашборд
          </h1>
          <span className="text-base text-gray-600 dark:text-gray-400 font-medium">Ваши активы и риски в TON</span>
        </div>

        {/* Отображение общего баланса */}
        <motion.div
          variants={fadeIn}
          className="glasscard p-6 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{totalTonValue} TON</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Общая стоимость всех активов</p>
        </motion.div>

        {dataError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-4" role="alert">
            <strong className="font-bold">Ошибка: </strong>
            <span className="block sm:inline">{dataError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {tonTokenForDisplay && (
            <TokenCard 
              symbol="TON" 
              balance={tonTokenForDisplay?.balance || (isBalancesLoading ? '...' : '0')}
              risk={tonTokenForDisplay?.risk?.sigma30d}
            />
          )}
          
          {displayTokens.length === 0 ? (
            <div className="glasscard p-10 text-center text-gray-600 dark:text-gray-400">
              Нет активов
            </div>
          ) : (
            otherTokensForDisplay.map((token) => (
              <TokenCard 
                key={token.symbol}
                symbol={token.symbol}
                balance={token.balance || '0'}
                priceTon={token.priceTon?.toString()}
                risk={token.risk?.sigma30d}
              />
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};