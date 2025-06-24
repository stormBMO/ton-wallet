import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TokenData {
  address: string;
  symbol: string;
  name?: string;
  balance?: string;
  priceTon?: string;
  iconUrl?: string;
  risk?: {
    symbol: string;
    volatility_30d: number;
    liquidity_score: number;
    contract_risk_score: number;
    overall_risk_score: number;
    risk_label: string;
    updated_at: string;
  }; 
}

interface TokenDetailModalProps {
  token: TokenData;
  onClose: () => void;
}

function Metric({ label, value, description }: { label: string; value: number | undefined; description: string }) {
    const [show, setShow] = useState(false);
    if (value === undefined || value === null) return null;
    return (
        <div className="flex flex-col gap-0.5 relative">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-200">{label}:</span>
                <span className="text-gray-100">{value}/100</span>
                <span
                    className="ml-1 cursor-pointer text-blue-400 hover:text-blue-300 relative"
                    onMouseEnter={() => setShow(true)}
                    onMouseLeave={() => setShow(false)}
                    tabIndex={0}
                    onFocus={() => setShow(true)}
                    onBlur={() => setShow(false)}
                >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="inline-block align-middle">
                        <circle cx="10" cy="10" r="10" fill="#2563eb" />
                        <text x="10" y="15" textAnchor="middle" fontSize="12" fill="white" fontFamily="Arial" fontWeight="bold">i</text>
                    </svg>
                    {show && (
                        <div className="absolute left-1/2 z-50 -translate-x-1/2 mt-2 w-56 bg-neutral-900 text-gray-100 text-xs rounded-lg shadow-lg p-2 border border-gray-700 whitespace-normal">
                            {description}
                        </div>
                    )}
                </span>
            </div>
        </div>
    );
}

const RiskJsonDropdown = ({ json }: { json: TokenData['risk'] }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="mt-2">
            <button
                className="text-xs text-blue-400 underline hover:text-blue-300 focus:outline-none"
                onClick={() => setOpen(v => !v)}
            >
                {open ? 'Скрыть полный JSON' : 'Показать полный JSON'}
            </button>
            {open && (
                <pre className="bg-neutral-900 p-3 rounded-md text-xs text-gray-300 whitespace-pre-wrap break-all mt-2 border border-gray-700">
                    {JSON.stringify(json, null, 2)}
                </pre>
            )}
        </div>
    );
} 


export const TokenDetailModal: React.FC<TokenDetailModalProps> = ({ token, onClose }) => {
    if (!token) return null;

    return (
        <motion.div
            className="fixed inset-0 bg-black rounded-xl bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                layoutId={`token-card-${token.address || token.symbol}`}
                className="glasscard p-6 rounded-xl shadow-2xl w-full max-w-lg flex flex-col gap-4 relative overflow-hidden"
                style={{ backdropFilter: 'blur(10px)', borderRadius: '18px' }}
                onClick={(e) => e.stopPropagation()}
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
                        <>
                            <div className="bg-neutral-900 p-3 rounded-md text-xs text-gray-300 flex flex-col gap-2">
                                <Metric
                                    label="Волатильность"
                                    value={token.risk.volatility_30d}
                                    description="Изменчивость цены токена за 30 дней. Больше — выше риск."
                                />
                                <Metric
                                    label="Ликвидность"
                                    value={token.risk.liquidity_score}
                                    description="Насколько быстро токен можно продать или купить без сильного влияния на цену. Больше - лучше."
                                />
                                <Metric
                                    label="Риск контракта"
                                    value={token.risk.contract_risk_score}
                                    description="Оценка надёжности смарт-контракта: 0 — безопасно, 100 — крайне рисково."
                                />
                                <Metric
                                    label="Общий риск"
                                    value={token.risk.overall_risk_score}
                                    description="Взвешенная сумма всех рисков: чем выше — тем опаснее."
                                />
                                {token.risk.risk_label && (
                                    <div className="mt-1 text-xs text-gray-400">Метка риска: <span className="text-gray-200">{token.risk.risk_label}</span></div>
                                )}
                                {token.risk.updated_at && (
                                    <div className="text-xs text-gray-500">Обновлено: {token.risk.updated_at}</div>
                                )}
                            </div>
                            <RiskJsonDropdown json={token.risk} />
                        </>
                    ) : (
                        <p className="text-gray-500">Данные о риске отсутствуют.</p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
