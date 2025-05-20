import { FC } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';

// Определяем тип для объекта риска, если он известен, или используем any
// interface RiskData { /* ... поля объекта риска ... */ }

interface TokenCardProps {
  iconUrl?: string;
  symbol: string;
  balance: string;
  priceTon?: string;
  riskData?: any; // Заменили risk на riskData и тип на any (или RiskData)
  address: string; // Сделаем адрес обязательным для layoutId и onClick
  onClick?: (address: string) => void; // Добавили onClick
}

export const TokenCard: FC<TokenCardProps> = ({ 
  iconUrl, 
  symbol, 
  balance, 
  priceTon, 
  riskData, 
  address,
  onClick
}) => {
  const riskValue = riskData?.overall_risk_score; // Пример получения значения для отображения, если нужно

  const getRiskColor = () => {
    if (riskValue === undefined || riskValue === null) return "bg-gray-300";
    if (riskValue < 50) return "bg-gradient-to-r from-green-400 to-green-500";
    if (riskValue < 70) return "bg-gradient-to-r from-yellow-400 to-orange-400";
    return "bg-gradient-to-r from-orange-500 to-red-500";
  };

  const getRiskLabel = () => {
    if (riskValue === undefined || riskValue === null) return "Нет данных";
    if (riskValue < 50) return "Низкий риск";
    if (riskValue < 70) return "Средний риск";
    return "Высокий риск";
  };

  return (
    <motion.div 
      layoutId={`token-card-${address || symbol}`} // Добавляем layoutId
      variants={fadeIn} // Оставляем fadeIn или можно убрать, если layout анимация будет основной
      initial="hidden"
      animate="show"
      className="glasscard p-5 flex flex-col gap-3 cursor-pointer" // Добавили cursor-pointer
      onClick={() => onClick && address && onClick(address)} // Вызываем onClick
      whileHover={{ y: -5 }} // Небольшой эффект при наведении для интерактивности
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center gap-2">
        {iconUrl ? (
          <img src={iconUrl} alt={symbol} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
            {symbol.charAt(0)}
          </div>
        )}
        <span className="font-semibold">{symbol}</span>
        {priceTon && (
          <span className="text-sm text-gray-500 ml-auto">≈ {priceTon} TON</span>
        )}
      </div>
      
      <div className="text-2xl font-semibold">{balance}</div>
      
      {/* Отображаем простой риск как и раньше, если нужно */}
      {riskValue !== undefined && (
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white w-fit ${getRiskColor()}`}>
          {getRiskLabel()}
        </div>
      )}
    </motion.div>
  );
};

// export default TokenCard; // Если экспорт по умолчанию не нужен, можно убрать 