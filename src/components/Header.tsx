import { useTonConnectUI } from '@tonconnect/ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setCreateWalletModalOpen } from '../store/slices/uiSlice';
import { resetWallet, setNetwork, setAddress, setMnemonic, setStatus } from '../store/slices/walletSlice';
import { mnemonicToWalletKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';
import { useState, useEffect } from 'react';
import { AuroraText } from './magicui/aurora-text';

const Header = () => {
  const [tonConnectUI] = useTonConnectUI();
  const dispatch = useDispatch();
  const wallet = useSelector((state: RootState) => state.wallet);
  const [showImport, setShowImport] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (tonConnectUI.account?.address) {
      dispatch(setAddress(tonConnectUI.account.address));
    }
  }, [tonConnectUI.account?.address, dispatch]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await tonConnectUI.connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

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

  const handleCreateWallet = () => {
    dispatch(setCreateWalletModalOpen(true));
  };

  const handleNetworkChange = () => {
    const newNetwork = wallet.network === 'testnet' ? 'mainnet' : 'testnet';
    dispatch(setNetwork(newNetwork));
  };

  const handleImportWallet = async () => {
    try {
      setImportError(null);
      const words = importMnemonic.trim().split(/\s+/);
      if (words.length !== 24) {
        setImportError('Мнемоника должна содержать 24 слова');
        return;
      }
      dispatch(setStatus('loading'));
      const mnemonicPhrase = importMnemonic.trim();
      const key = await mnemonicToWalletKey(words);
      const walletObj = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
      const address = walletObj.address.toString();
      dispatch(setMnemonic(mnemonicPhrase));
      dispatch(setAddress(address));
      dispatch(setStatus('connected'));
      setShowImport(false);
      setImportMnemonic('');
    } catch (error) {
      console.error('Failed to import wallet:', error);
      setImportError('Ошибка при импорте кошелька. Проверьте правильность мнемоники.');
      dispatch(setStatus('error'));
    }
  };

  return (
    <header className="w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-gray-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between z-20 relative">
      <div className="flex items-center gap-6">
        <AuroraText className="text-2xl font-extrabold tracking-tight select-none">Wallet</AuroraText>
        <nav className="flex gap-4 ml-4">
          <a href="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition">Дашборд</a>
          <a href="/swap" className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition">Своп</a>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ml-2 ${wallet.network === 'testnet' ? 'bg-yellow-400 text-white' : 'bg-green-500 text-white'}`}>{wallet.network === 'testnet' ? 'Testnet' : 'Mainnet'}</span>
          <button onClick={handleNetworkChange} className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 font-medium transition">Сменить сеть</button>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {wallet.address ? (
          <>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-neutral-800 px-3 py-1 rounded-lg">
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </span>
            <button onClick={handleDisconnect} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">Отключить</button>
          </>
        ) : (
          <div className="flex gap-2 items-center">
            {showImport ? (
              <>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Введите 24 слова мнемоники"
                    value={importMnemonic}
                    onChange={(e) => setImportMnemonic(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />
                  {importError && (
                    <div className="text-red-500 text-xs">{importError}</div>
                  )}
                </div>
                <button onClick={handleImportWallet} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">Импорт</button>
                <button
                  onClick={() => {
                    setShowImport(false);
                    setImportMnemonic('');
                    setImportError(null);
                  }}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg transition"
                >
                  Отмена
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-60"
                >
                  {isConnecting ? 'Подключение...' : 'Подключить кошелек'}
                </button>
                <button onClick={handleCreateWallet} className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition">Создать кошелек</button>
                <button
                  onClick={() => setShowImport(true)}
                  className="text-blue-600 dark:text-blue-400 hover:underline px-3 py-2 rounded-lg transition"
                >
                  Импорт кошелька
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;