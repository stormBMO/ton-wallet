import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Placeholder для типа токена, в идеале должен быть импортирован или определен глобально
interface TokenData {
  address: string;
  symbol: string;
  name?: string;
  balance?: string;
  priceTon?: string;
  iconUrl?: string;
  risk?: unknown; // Детальные данные о риске
  // ... другие поля, если есть
}

interface TokenDetailModalProps {
  token: TokenData;
  onClose: () => void;
}

export const TokenDetailModal: React.FC<TokenDetailModalProps> = ({ token, onClose }) => {
    if (!token) return null;

    return (
        <motion.div
            className="fixed inset-0 bg-black rounded-xl bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={onClose} // Закрытие по клику на фон
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                layoutId={`token-card-${token.address || token.symbol}`} // Тот же layoutId, что и у TokenCard
                className="glasscard p-6 rounded-xl shadow-2xl w-full max-w-lg flex flex-col gap-4 relative overflow-hidden"
                style={{ backdropFilter: 'blur(10px)', borderRadius: '18px' }}
                onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие по клику на само модальное окно
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-700 transition-colors"
                    aria-label="Закрыть"
                >
                    <XMarkIcon className="w-6 h-6 text-gray-300" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                    {token.iconUrl ? (
                        <img src={token.iconUrl} alt={token.symbol} className="w-10 h-10 rounded-full" />
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {token.symbol.charAt(0)}
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-semibold text-white">{token.name || token.symbol}</h2>
                        <p className="text-sm text-gray-400">{token.symbol}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
                    <h3 className="text-lg font-medium text-gray-200 mt-2 border-b border-gray-700 pb-1">Аналитика Риска:</h3>
                    {token.risk ? (
                        <pre className="bg-neutral-900 p-3 rounded-md text-xs text-gray-300 whitespace-pre-wrap break-all">
                            {JSON.stringify(token.risk, null, 2)}
                        </pre>
                    ) : (
                        <p className="text-gray-500">Данные о риске отсутствуют.</p>
                    )}
          
                </div>
            </motion.div>
        </motion.div>
    );
}; 