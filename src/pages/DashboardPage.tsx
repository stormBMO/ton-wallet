import React from 'react';
import { BalanceCard } from '../components/BalanceCard';
import { TokenTable } from '../components/TokenTable';
import '../index.css';
import { Particles } from '../components/magicui/particles';
import { AuroraText } from '../components/magicui/aurora-text';
import { NeonGradientCard } from '../components/magicui/neon-gradient-card';
import { useDashboard } from '@/hooks/useDashboard';

export const Dashboard = () => {
  const { isBalancesLoading, dataError, displayTokens, handleLogout, isAuthenticated, authStatus, connectedWalletAddress } = useDashboard();

  console.log(isBalancesLoading, dataError, displayTokens, handleLogout, isAuthenticated, authStatus, connectedWalletAddress);

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#18122B]">
        <p className="text-gray-300 text-lg">Аутентификация...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#18122B]">
        <p className="text-gray-300 text-lg">
          Пожалуйста, подключите кошелек для просмотра дашборда.
        </p>
      </div>
    );
  }

  if (isBalancesLoading && displayTokens.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#18122B]">
        <p className="text-gray-300 text-lg">Загрузка данных кошелька...</p>
      </div>
    );
  }

  const tonTokenForDisplay = displayTokens.find(token => token.address === connectedWalletAddress && token.symbol === 'TON');
  const otherTokensForDisplay = displayTokens.filter(token => token.address !== connectedWalletAddress || token.symbol !== 'TON');

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <Particles className="absolute inset-0 z-0" quantity={80} color="#8c7aff" size={1.2} />
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-2 py-10">
        <button 
          onClick={handleLogout} 
          className="absolute top-4 right-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-colors duration-150"
        >
          Выйти
        </button>
        <div className="w-full max-w-4xl flex flex-col gap-8 mt-12">
          <div className="flex flex-col items-center gap-2 mb-2">
            <AuroraText className="text-4xl md:text-5xl font-extrabold text-center" colors={["#8c7aff","#ff6ad5","#00fff1"]}>
              Дашборд
            </AuroraText>
            <span className="text-base text-[#b8b8ff] font-medium tracking-wide">Ваши активы и риски в TON</span>
          </div>

          {dataError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Ошибка: </strong>
              <span className="block sm:inline">{dataError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <NeonGradientCard neonColors={{firstColor: '#8c7aff', secondColor: '#ff6ad5'}} borderRadius={24} borderSize={3} className="h-full flex flex-col justify-start p-6">
              <div className="flex flex-col gap-4 items-center">
                <h2 className="text-2xl font-semibold mb-2 text-white text-center">TON</h2>
                <BalanceCard balance={tonTokenForDisplay?.balance || (isBalancesLoading ? '...' : '0')} />
                {tonTokenForDisplay?.address && (
                  <>
                    {tonTokenForDisplay.riskStatus === 'loading' && <p className="text-sm text-gray-400">Загрузка риска TON...</p>}
                    {tonTokenForDisplay.riskStatus === 'failed' && <p className="text-sm text-red-400">Ошибка риска TON: {tonTokenForDisplay.riskError}</p>}
                    {tonTokenForDisplay.riskStatus === 'succeeded' && tonTokenForDisplay.risk && (
                      <div className="mt-2 text-sm text-white/90 w-full">
                        <h3 className="text-md font-semibold mb-1 text-center text-[#ff6ad5]">Метрики Риска (TON):</h3>
                        <ul className="list-disc list-inside pl-4 space-y-1 bg-white/5 p-3 rounded-md">
                          <li>💠 σ30d: {tonTokenForDisplay.risk.sigma30d}</li>
                          <li>💧 Ликвидность: {tonTokenForDisplay.risk.liquidity_score}</li>
                          <li>🔒 Риск Контракта: {tonTokenForDisplay.risk.contract_risk}</li>
                          <li>📣 Настроения: {tonTokenForDisplay.risk.sentiment_index}</li>
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </NeonGradientCard>
            <NeonGradientCard neonColors={{firstColor: '#00fff1', secondColor: '#8c7aff'}} borderRadius={24} borderSize={3} className="h-full flex flex-col justify-start p-6">
              <h2 className="text-2xl font-semibold mb-4 text-[#00fff1] text-center">Другие Токены</h2>
              <TokenTable tokens={otherTokensForDisplay} />
            </NeonGradientCard>
          </div>
        </div>
      </div>
    </div>
  );
};