import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setNetwork } from '../store/slices/wallet/walletSlice';
import { useState, useCallback } from 'react';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { Link } from 'react-router-dom';
import useNotify from '@/hooks/useNotify';

const Header = () => {
    const dispatch = useDispatch();
    const wallet = useSelector((state: RootState) => state.wallet);
    const { isAuthenticated, address, logout } = useWalletAuth();
    const [menuOpen, setMenuOpen] = useState(false);
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
                <button className="md:hidden" onClick={() => setMenuOpen(true)}>
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
                    <button onClick={handleLogout} className="px-4 py-1.5 rounded-full bg-ton-blue hover:bg-ton-blue/90 text-white font-semibold transition">Войти</button>
                )}
            </div>
            {/* Мобильное меню */}
            {menuOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
                    <div className="w-64 bg-white h-full shadow-lg p-6 flex flex-col gap-4 animate-slide-in-right">
                        <button onClick={() => setMenuOpen(false)} className="self-end text-2xl">&times;</button>
                        <Link to="/" onClick={() => setMenuOpen(false)} className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium transition">Дашборд</Link>
                        <Link to="/swap" onClick={() => setMenuOpen(false)} className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium transition">Своп</Link>
                        <Link to="/settings" onClick={() => setMenuOpen(false)} className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium transition">Настройки</Link>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ml-2 ${wallet.network === 'testnet' ? 'bg-yellow-400 text-white' : 'bg-green-500 text-white'}`}>{wallet.network === 'testnet' ? 'Testnet' : 'Mainnet'}</span>
                        <button onClick={handleNetworkChange} className="ml-2 text-xs px-2 py-0.5 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 font-medium transition">Сменить сеть</button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;