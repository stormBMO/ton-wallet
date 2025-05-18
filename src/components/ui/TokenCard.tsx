import { FC } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';

interface TokenCardProps {
  iconUrl?: string;
  symbol: string;
  balance: string;
  priceTon?: string;
  risk?: number;
}

export const TokenCard: FC<TokenCardProps> = ({ 
  iconUrl, 
  symbol, 
  balance, 
  priceTon, 
  risk 
}) => {
  // Определим цвет риска (градиент от зеленого к красному)
  const getRiskColor = () => {
    if (risk === undefined || risk === null) return "bg-gray-300";
    if (risk < 0.3) return "bg-gradient-to-r from-green-400 to-green-500";
    if (risk < 0.6) return "bg-gradient-to-r from-yellow-400 to-orange-400";
    return "bg-gradient-to-r from-orange-500 to-red-500";
  };

  const getRiskLabel = () => {
    if (risk === undefined || risk === null) return "Нет данных";
    if (risk < 0.3) return "Низкий риск";
    if (risk < 0.6) return "Средний риск";
    return "Высокий риск";
  };

  return (
    <motion.div 
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="glasscard p-5 flex flex-col gap-3"
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
      
      {risk !== undefined && (
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white w-fit ${getRiskColor()}`}>
          {getRiskLabel()}
        </div>
      )}
    </motion.div>
  );
};

export default TokenCard; 