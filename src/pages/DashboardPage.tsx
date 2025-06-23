import { motion } from 'framer-motion';
import { staggerContainer } from '../lib/motion';
import { TokenCard } from '../components/ui/TokenCard';
import { ReceiveModal } from '@/components/modals/ReceiveModal';
import { SendModal } from '@/components/modals/SendModal';
import '../index.css';
import { useDashboard } from '@/hooks/useDashboard';
import { useReceiveModal } from '@/hooks/useReceiveModal';
import { useSendModal } from '@/hooks/useSendModal';
import { BalanceCard } from '@/components/BalanceCard';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { TokenDetailModal } from '@/components/modals/TokenDetailModal';
import useNotify from '@/hooks/useNotify';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';


export const Dashboard = () => {
    const { isBalancesLoading, dataError, displayTokens, isAuthenticated, authStatus, walletAddress, totalTonValue } = useDashboard();
    const {
        openReceiveModal,
        closeReceiveModal,
        isReceiveModalOpen,
        receiveModalData,
    } = useReceiveModal();
    const {
        openSendModal,
        closeSendModal,
        isSendModalOpen,
        sendModalData,
    } = useSendModal();
    const notify = useNotify();
    const menuOpen = useSelector((state: RootState) => state.ui.isMenuOpen);
    const [selectedTokenAddress, setSelectedTokenAddress] = useState<string | null>(null);

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

    const handleDeposit = () => {
        if (walletAddress) {
            openReceiveModal({ symbol: 'TON' }, walletAddress);
        }
    };

    const handleWithdraw = () => {
        if (walletAddress && tonTokenForDisplay) {
            openSendModal(tonTokenForDisplay, walletAddress);
        } else {
            notify('error', 'Кошелек не подключен или TON токен не найден');
        }
    };

    const handleTokenCardClick = (address: string) => {
        setSelectedTokenAddress(address);
    };

    const handleCloseDetailModal = () => {
        setSelectedTokenAddress(null);
    };



    const selectedTokenData = selectedTokenAddress 
        ? displayTokens.find(token => token.address === selectedTokenAddress) 
        : null;

    return (
        <div className={`min-h-screen px-4 py-10 transition-all duration-300 ${menuOpen ? 'blur-sm scale-95 pointer-events-none' : ''}`}>
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
                </div>

                <BalanceCard
                    balance={totalTonValue}
                    currency="TON"
                    onDeposit={handleDeposit}
                    onWithdraw={handleWithdraw}
                />



                {dataError && (
                    (dataError === 'WALLET_NOT_FOUND' || dataError === 'nonexist') ? (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-2xl mb-4 flex flex-col gap-2 items-start" role="alert">
                            <div className="font-bold mb-1">Кошелёк ещё не активирован</div>
                            <div className="mb-2">Для активации кошелька отправьте на него любую сумму TON. После этого он появится в сети и станет активен.</div>
                            <button
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
                                onClick={handleDeposit}
                            >
                                Пополнить кошелёк
                            </button>
                        </div>
                    ) : (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-4" role="alert">
                            <strong className="font-bold">Ошибка: </strong>
                            <span className="block sm:inline">{dataError}</span>
                        </div>
                    )
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {tonTokenForDisplay && (
                        <TokenCard 
                            key={tonTokenForDisplay.address || 'TON'}
                            symbol={tonTokenForDisplay.symbol} 
                            balance={tonTokenForDisplay?.balance || (isBalancesLoading ? '...' : '0')}
                            priceTon={tonTokenForDisplay.priceTon}
                            riskData={tonTokenForDisplay.risk}
                            address={tonTokenForDisplay.address || 'TON'}
                            onClick={handleTokenCardClick}
                        />
                    )}
          
                    {displayTokens.length === 0 && !tonTokenForDisplay ? (
                        <div className="glasscard p-10 text-center text-gray-600 dark:text-gray-400">
              Нет активов
                        </div>
                    ) : (
                        otherTokensForDisplay.map((token) => (
                            <TokenCard 
                                key={token.address || token.symbol}
                                symbol={token.symbol}
                                balance={token.balance || '0'}
                                priceTon={token.priceTon?.toString()}
                                riskData={token.risk}
                                address={token.address}
                                onClick={handleTokenCardClick}
                            />
                        ))
                    )}
                </div>
                {isReceiveModalOpen && receiveModalData && (
                    <ReceiveModal
                        token={receiveModalData.token}
                        userAddress={receiveModalData.userAddress}
                        onClose={closeReceiveModal}
                    />
                )}

                {isSendModalOpen && sendModalData && (
                    <SendModal
                        token={sendModalData.token}
                        userAddress={sendModalData.userAddress}
                        onClose={closeSendModal}
                        onSuccess={(txHash) => {
                            notify('success', `Транзакция отправлена! Hash: ${txHash.slice(0, 8)}...`);
                        }}
                    />
                )}
            </motion.div>

            <AnimatePresence>
                {selectedTokenData && (
                    <TokenDetailModal 
                        token={selectedTokenData} 
                        onClose={handleCloseDetailModal} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};