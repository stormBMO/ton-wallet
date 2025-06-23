import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setNetwork } from '../store/slices/wallet/walletSlice';
import { useCallback } from 'react';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { Link } from 'react-router-dom';
import useNotify from '@/hooks/useNotify';
import { setConnectWalletModalOpen, setMenuOpen } from '@/store/slices/ui/uiSlice';

const Header = () => {
    const dispatch = useDispatch();
    const wallet = useSelector((state: RootState) => state.wallet);
    const { isAuthenticated, address, logout } = useWalletAuth();
    const menuOpen = useSelector((state: RootState) => state.ui.isMenuOpen);
    const notify  = useNotify();

    const handleNetworkChange = async () => {
        const newNetwork = wallet.network === 'testnet' ? 'mainnet' : 'testnet';
        dispatch(setNetwork(newNetwork));
    };

    const handleCopyAddress = useCallback(() => {
        if (address) {
            navigator.clipboard.writeText(address);
        }
        notify('success', 'Адрес успешно скопирован');
    }, [address, notify]);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="sticky top-0 w-full bg-white/70 dark:bg-[#14172b]/70 backdrop-blur supports-backdrop-blur:bg-white/70 border-b border-gray-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between z-20 relative">
            <div className="flex items-center gap-6">
                <div className="text-2xl font-extrabold tracking-tight select-none bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Wallet</div>
                {/* Десктопное меню */}
                <nav className="hidden md:flex gap-6 items-center">
                    <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium transition">Дашборд</Link>
                    <Link to="/swap" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium transition">Своп</Link>
                    <Link to="/settings" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium transition">Настройки</Link>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ml-2 ${wallet.network === 'testnet' ? 'bg-yellow-400 text-white' : 'bg-green-500 text-white'}`}>{wallet.network === 'testnet' ? 'Testnet' : 'Mainnet'}</span>
                    <button onClick={handleNetworkChange} className="ml-2 text-xs px-2 py-0.5 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 font-medium transition">Сменить сеть</button>
                </nav>
                {/* Кнопка-гамбургер для мобилы */}
                <button className="md:hidden" onClick={() => dispatch(setMenuOpen(true))}>
                    <svg width="28" height="28" fill="none"><path d="M4 7h20M4 14h20M4 21h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
            </div>
            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                    <>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-mono backdrop-blur-lg bg-white/10 dark:bg-white/5 px-3 py-1 rounded-lg shadow-sm" onClick={handleCopyAddress}>
                            {address ? `${address.slice(0, 4)}…${address.slice(-4)}` : ''}
                        </span>
                        <button onClick={handleLogout} className="px-4 py-1.5 rounded-full bg-ton-blue hover:bg-ton-blue/90 text-white font-semibold transition">Выйти</button>
                    </>
                ) : (
                    <button 
                        onClick={() => dispatch(setConnectWalletModalOpen(true))} 
                        className="px-4 py-1.5 rounded-full bg-ton-blue hover:bg-ton-blue/90 text-white font-semibold transition"
                    >
                        Войти
                    </button>
                )}
            </div>
            {/* Мобильное меню */}
            {menuOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
                    <div className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl h-full shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col animate-slide-in-right">
                        {/* Заголовок меню */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                            <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Меню
                            </div>
                            <button 
                                onClick={() => dispatch(setMenuOpen(false))} 
                                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-105"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Навигационные ссылки */}
                        <div className="flex-1 p-6 space-y-2">
                            <Link 
                                to="/" 
                                onClick={() => dispatch(setMenuOpen(false))} 
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02] border border-gray-200/80 dark:border-gray-700/80"
                            >
                                <div className="w-5 h-5 text-primary">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 15v-4m4 4v-4m4 4v-4"></path>
                                    </svg>
                                </div>
                                <span>Дашборд</span>
                            </Link>
                            
                            <Link 
                                to="/swap" 
                                onClick={() => dispatch(setMenuOpen(false))} 
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02] border border-gray-200/80 dark:border-gray-700/80"
                            >
                                <div className="w-5 h-5 text-primary">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                                    </svg>
                                </div>
                                <span>Своп</span>
                            </Link>
                            
                            <Link 
                                to="/settings" 
                                onClick={() => dispatch(setMenuOpen(false))} 
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02] border border-gray-200/80 dark:border-gray-700/80"
                            >
                                <div className="w-5 h-5 text-primary">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                </div>
                                <span>Настройки</span>
                            </Link>
                        </div>

                        {/* Сетевые настройки */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Текущая сеть</span>
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 ${
                                        wallet.network === 'testnet' 
                                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg' 
                                            : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                                    }`}>
                                        <div className={`w-2 h-2 rounded-full ${
                                            wallet.network === 'testnet' ? 'bg-yellow-200' : 'bg-green-200'
                                        } animate-pulse`}></div>
                                        {wallet.network === 'testnet' ? 'Testnet' : 'Mainnet'}
                                    </span>
                                </div>
                                
                                <button 
                                    onClick={handleNetworkChange} 
                                    className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                                >
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                    Сменить сеть
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;