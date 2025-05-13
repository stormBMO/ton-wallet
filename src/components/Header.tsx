import { useTonConnectUI } from '@tonconnect/ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setCreateWalletModalOpen } from '../store/slices/uiSlice';
import { resetWallet, setNetwork, setAddress, setMnemonic, setStatus } from '../store/slices/walletSlice';
import { mnemonicToWalletKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';
import styled from '@emotion/styled';
import { useState, useEffect } from 'react';

const HeaderContainer = styled.header`
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const ConnectButton = styled.button`
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  &:hover {
    background-color: #2563eb;
  }
`;

interface NetworkBadgeProps {
  isTestnet: boolean;
}

const NetworkBadge = styled.span<NetworkBadgeProps>`
  background-color: ${props => props.isTestnet ? '#f59e0b' : '#10b981'};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
`;

const ImportInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  margin-right: 0.5rem;
  width: 300px;
`;

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
      
      // Генерируем ключ из мнемоники
      const key = await mnemonicToWalletKey(words);
      
      // Создаем кошелек
      const wallet = WalletContractV4.create({ 
        publicKey: key.publicKey, 
        workchain: 0 
      });
      
      // Получаем адрес кошелька
      const address = wallet.address.toString();
      
      // Сохраняем данные в Redux
      dispatch(setMnemonic(mnemonicPhrase));
      dispatch(setAddress(address));
      dispatch(setStatus('connected'));
      
      // Очищаем форму
      setShowImport(false);
      setImportMnemonic('');
    } catch (error) {
      console.error('Failed to import wallet:', error);
      setImportError('Ошибка при импорте кошелька. Проверьте правильность мнемоники.');
      dispatch(setStatus('error'));
    }
  };

  return (
    <HeaderContainer>
      <Nav>
        <a href="/" className="text-gray-900 dark:text-white">Дашборд</a>
        <a href="/swap" className="text-gray-900 dark:text-white">Своп</a>
        <NetworkBadge isTestnet={wallet.network === 'testnet'}>
          {wallet.network === 'testnet' ? 'Testnet' : 'Mainnet'}
        </NetworkBadge>
        <button onClick={handleNetworkChange}>
          Сменить сеть
        </button>
      </Nav>
      <div className="flex items-center gap-4">
        {wallet.address ? (
          <>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </div>
            <ConnectButton onClick={handleDisconnect}>
              Отключить
            </ConnectButton>
          </>
        ) : (
          <div className="flex gap-2">
            {showImport ? (
              <>
                <div className="flex flex-col gap-2">
                  <ImportInput
                    type="text"
                    placeholder="Введите 24 слова мнемоники"
                    value={importMnemonic}
                    onChange={(e) => setImportMnemonic(e.target.value)}
                  />
                  {importError && (
                    <div className="text-red-500 text-sm">
                      {importError}
                    </div>
                  )}
                </div>
                <ConnectButton onClick={handleImportWallet}>
                  Импорт
                </ConnectButton>
                <button
                  onClick={() => {
                    setShowImport(false);
                    setImportMnemonic('');
                    setImportError(null);
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Отмена
                </button>
              </>
            ) : (
              <>
                <ConnectButton 
                  onClick={handleConnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Подключение...' : 'Подключить кошелек'}
                </ConnectButton>
                <ConnectButton onClick={handleCreateWallet}>
                  Создать кошелек
                </ConnectButton>
                <button
                  onClick={() => setShowImport(true)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Импорт кошелька
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </HeaderContainer>
  );
};

export default Header;