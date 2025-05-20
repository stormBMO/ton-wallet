import { FC, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import copy from 'copy-to-clipboard';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion'; // Предполагается, что fadeIn находится здесь
import { XMarkIcon } from '@heroicons/react/24/outline'; // Пример иконки
import { getTonLink } from '@/lib/deeplink'; // Добавлено
import useNotify from '@/hooks/useNotify';

// Предполагается, что тип Token определен где-то глобально или импортирован
// Для примера, определим его здесь, если он еще не определен:
interface Token {
  symbol: string;
  address?: string; // Адрес контракта токена, если это не TON
  // другие поля, если есть, например, decimals, name и т.д.
}

interface ReceiveModalProps {
  token: Token;
  userAddress: string; // Адрес кошелька пользователя
  onClose: () => void;
}

export const ReceiveModal: FC<ReceiveModalProps> = ({ token, userAddress, onClose }) => {
    const notify = useNotify();
    const deeplink = useMemo(() => {
        return getTonLink(userAddress, token); // Используем getTonLink
    }, [token, userAddress]);

    const handleCopy = () => {
        copy(deeplink);
        notify('success', 'Ссылка скопирована!');
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
                onClick={(e) => e.stopPropagation()} // Предотвращение закрытия при клике на само модальное окно
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Пополнить {token.symbol}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center gap-4">
                    <QRCodeSVG value={deeplink} size={220} level="H" />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="deeplink-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ссылка для пополнения:
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            id="deeplink-input"
                            type="text"
                            readOnly={true}
                            value={deeplink}
                            className="input flex-grow" // Предполагается, что класс .input уже определен
                        />
                        <button onClick={handleCopy} className="btn-primary px-4 py-2"> {/* Предполагается, что класс .btn-primary уже определен */}
              Копировать
                        </button>
                    </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Отправьте эту ссылку или отсканируйте QR-код, чтобы пополнить кошелек.
                </p>
            </motion.div>
        </motion.div>
    );
}; 