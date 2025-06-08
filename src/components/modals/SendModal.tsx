import { FC, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FaArrowUp, FaPaperPlane, FaWallet } from 'react-icons/fa';
import useNotify from '@/hooks/useNotify';
import { validateTonAddress, estimateTransactionFee } from '@/api/sendApi';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { sendTonTransaction } from '@/api/sendApi';

interface Token {
  symbol: string;
  address?: string;
  balance: string;
}

interface SendModalProps {
  token: Token;
  userAddress: string;
  onClose: () => void;
  onSuccess?: (txHash: string) => void;
}

export const SendModal: FC<SendModalProps> = ({ 
    token, 
    userAddress: _userAddress, 
    onClose, 
    onSuccess 
}) => {
    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const notify = useNotify();
    
    // Проверяем подключение кошелька
    const isWalletConnected = !!wallet;

    // Валидация
    const isValidAddress = useMemo(() => {
        if (!recipientAddress.trim()) return null;
        return validateTonAddress(recipientAddress.trim());
    }, [recipientAddress]);

    const isValidAmount = useMemo(() => {
        if (!amount.trim()) return null;
        const numAmount = parseFloat(amount);
        const numBalance = parseFloat(token.balance);
        return numAmount > 0 && numAmount <= numBalance;
    }, [amount, token.balance]);

    const estimatedFee = useMemo(() => {
        return estimateTransactionFee({
            to: recipientAddress,
            amount,
            comment,
            jettonAddress: token.address
        });
    }, [recipientAddress, amount, comment, token.address]);

    const canSend = isValidAddress === true && isValidAmount === true && !isLoading && isWalletConnected;

    const handleSend = async () => {
        if (!canSend || !tonConnectUI) return;
        
        if (!isWalletConnected) {
            notify('error', 'Подключите кошелек для отправки транзакций');
            return;
        }

        setIsLoading(true);
    
        try {
            let result;
      
            if (token.symbol === 'TON') {
                // Отправка TON
                result = await sendTonTransaction({
                    to: recipientAddress.trim(),
                    amount: amount.trim(),
                    comment: comment.trim()
                }, tonConnectUI);
            } else if (token.address) {
                // Отправка Jetton (требуется jetton wallet address пользователя)
                // В реальном приложении нужно получить jetton wallet address для этого токена
                notify('error', 'Отправка jetton токенов будет реализована в следующей версии');
                return;
            } else {
                notify('error', 'Неподдерживаемый тип токена');
                return;
            }

            if (result.success) {
                notify('success', 'Транзакция отправлена успешно!');
                onSuccess?.(result.txHash || '');
                onClose();
            } else {
                notify('error', result.error || 'Ошибка отправки транзакции');
            }
        } catch (error) {
            console.error('Ошибка отправки:', error);
            notify('error', 'Неожиданная ошибка при отправке');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMaxAmount = () => {
        if (token.symbol === 'TON') {
            // Оставляем немного для комиссии
            const maxAmount = Math.max(0, parseFloat(token.balance) - parseFloat(estimatedFee));
            setAmount(maxAmount.toString());
        } else {
            setAmount(token.balance);
        }
    };

    return (
        <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                className="glasscard p-6 rounded-lg shadow-xl w-full max-w-md flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Заголовок */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FaArrowUp className="text-lg" />
                        <h2 className="text-xl font-semibold">Отправить {token.symbol}</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Форма */}
                <div className="flex flex-col gap-4">
                    {/* Адрес получателя */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Адрес получателя:
                        </label>
                        <input
                            type="text"
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                            placeholder="EQ... или UQ... или 0Q..."
                            className={`input ${
                                isValidAddress === false ? 'border-red-500' : 
                                    isValidAddress === true ? 'border-green-500' : ''
                            }`}
                        />
                        {isValidAddress === false && (
                            <p className="text-xs text-red-500">Неверный формат адреса</p>
                        )}
                    </div>

                    {/* Сумма */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Сумма:
                            </label>
                            <span className="text-xs text-gray-500">
                Баланс: {token.balance} {token.symbol}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.0"
                                step="0.001"
                                min="0"
                                max={token.balance}
                                className={`input flex-grow ${
                                    isValidAmount === false ? 'border-red-500' : 
                                        isValidAmount === true ? 'border-green-500' : ''
                                }`}
                            />
                            <button
                                onClick={handleMaxAmount}
                                className="btn-secondary px-3 py-2 text-sm"
                            >
                MAX
                            </button>
                        </div>
                        {isValidAmount === false && (
                            <p className="text-xs text-red-500">
                Недостаточно средств или неверная сумма
                            </p>
                        )}
                    </div>

                    {/* Комментарий */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Комментарий (опционально):
                        </label>
                        <input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Комментарий к переводу..."
                            maxLength={120}
                            className="input"
                        />
                        <p className="text-xs text-gray-500">
                            {comment.length}/120 символов
                        </p>
                    </div>

                    {/* Комиссия */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="flex justify-between text-sm">
                            <span>Примерная комиссия:</span>
                            <span className="font-medium">~{estimatedFee} TON</span>
                        </div>
                    </div>

                    {/* Предупреждение о неподключенном кошельке */}
                    {!isWalletConnected && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                                <FaWallet className="text-sm" />
                                <span className="text-sm font-medium">Кошелек не подключен</span>
                            </div>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                Подключите кошелек через TonConnect для отправки транзакций
                            </p>
                        </div>
                    )}

                    {/* Кнопка отправки */}
                    <button
                        onClick={handleSend}
                        disabled={!canSend}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
                            canSend 
                                ? 'bg-ton-blue text-white hover:bg-ton-blue/90' 
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Отправка...
                            </>
                        ) : (
                            <>
                                <FaPaperPlane />
                Отправить {amount} {token.symbol}
                            </>
                        )}
                    </button>
                </div>

                {/* Предупреждение */}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Проверьте адрес получателя. Транзакции в блокчейне необратимы.
                </p>
            </motion.div>
        </motion.div>
    );
}; 