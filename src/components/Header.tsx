import { useTonConnectUI } from '@tonconnect/ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setCreateWalletModalOpen, setConnectWalletModalOpen } from '../store/slices/ui/uiSlice';
import { resetWallet, setNetwork, setAddress, setMnemonic, setStatus } from '../store/slices/wallet/walletSlice';
import { mnemonicToWalletKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';
import { useState, useEffect, useCallback } from 'react';
import { AuroraText } from './magicui/aurora-text';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { useNavigate } from 'react-router-dom';
import { useNotify } from '@/hooks/useNotify';

const Header = () => {
  const [tonConnectUI] = useTonConnectUI();
  const dispatch = useDispatch();
  const wallet = useSelector((state: RootState) => state.wallet);
  const [showImport, setShowImport] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const { isAuthenticated, address, login, logout } = useWalletAuth();
  const notify = useNotify();
  const navigate = useNavigate();

  useEffect(() => {
    if (tonConnectUI.account?.address) {
      dispatch(setAddress(tonConnectUI.account.address));
    }
  }, [tonConnectUI.account?.address, dispatch]);


  const handleDisconnect = async () => {
    try {
      dispatch(resetWallet());
      if (tonConnectUI.account) {
        await tonConnectUI.disconnect();
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const handleNetworkChange = () => {
    const newNetwork = wallet.network === 'testnet' ? 'mainnet' : 'testnet';
    dispatch(setNetwork(newNetwork));
  };

  const handleCopyAddress = useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address);
      notify('success', 'Адрес скопирован в буфер');
    }
  }, [address]);


  const handleOpenConnectModal = () => {
    dispatch(setConnectWalletModalOpen(true));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/connect-wallet');
  };

  return (
    <header className="sticky top-0 w-full bg-white/70 dark:bg-[#14172b]/70 backdrop-blur supports-backdrop-blur:bg-white/70 border-b border-gray-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between z-20 relative">
      <div className="flex items-center gap-6">
        <div className="text-2xl font-extrabold tracking-tight select-none bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Wallet</div>
        <nav className="flex gap-4 ml-4">
          <a href="/" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium transition">Дашборд</a>
          <a href="/swap" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium transition">Своп</a>
          <a href="/settings" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium transition">Настройки</a>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ml-2 ${wallet.network === 'testnet' ? 'bg-yellow-400 text-white' : 'bg-green-500 text-white'}`}>{wallet.network === 'testnet' ? 'Testnet' : 'Mainnet'}</span>
          <button onClick={handleNetworkChange} className="ml-2 text-xs px-2 py-0.5 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 font-medium transition">Сменить сеть</button>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-mono backdrop-blur-lg bg-white/10 dark:bg-white/5 px-3 py-1 rounded-lg shadow-sm" onClick={handleCopyAddress}>
              {address ? `${address.slice(0, 4)}…${address.slice(-4)}` : ''}
            </span>
            <button onClick={handleLogout} className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold transition">Выйти</button>
          </>
        ) : (
          <button onClick={handleOpenConnectModal} className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold transition">Войти</button>
        )}
      </div>
    </header>
  );
};

export default Header;