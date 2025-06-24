import { FC } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';

interface TokenCardProps {
  iconUrl?: string;
  symbol: string;
  balance: string;
  priceTon?: string;
  riskData?: unknown;
  address: string;
  onClick?: (address: string) => void;
}

function isRiskData(obj: unknown): obj is { overall_risk_score: number } {
    return typeof obj === 'object' && obj !== null && 'overall_risk_score' in obj;
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
    const riskValue = isRiskData(riskData) ? riskData.overall_risk_score : undefined;

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
            layoutId={`token-card-${address || symbol}`}
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="p-5 flex flex-col gap-3 cursor-pointer border border-gray-200 dark:border-[#2d375a] bg-white/80 dark:bg-[#232a4a]/80 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            style={{ backdropFilter: 'blur(10px)', borderRadius: '18px' }}
            onClick={() => onClick && address && onClick(address)}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 10, mass: 0.5, restDelta: 0.01 }}
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
      
            {riskValue !== undefined && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium text-white w-fit ${getRiskColor()}`}>
                    {getRiskLabel()}
                </div>
            )}
        </motion.div>
    );
};