import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setConnectWalletModalOpen, setCreateWalletModalOpen, setImportWalletModalOpen } from '../../store/slices/ui/uiSlice';
import { useWalletAuth } from '../../hooks/useWalletAuth';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { AuthStatus } from '@/store/slices/auth/types';
import { setAddress, setMnemonic } from '@/store/slices/wallet/walletSlice';
import { setStatus } from '@/store/slices/wallet/walletSlice';
import { mnemonicToWalletKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalBox = styled.div`
  width: 820px;
  padding: 32px;
  border-radius: 16px;
  background: #fff;
  color: #222;
  position: relative;
  @media (prefers-color-scheme: dark) {
    background: #1A1A1A;
    color: #fff;
  }
`;
const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 24px;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
`;
const TabBtn = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 0;
  background: ${({ active }) => (active ? '#e0e7ff' : 'transparent')};
  color: ${({ active }) => (active ? '#1d4ed8' : 'inherit')};
  border: none;
  border-bottom: 2px solid ${({ active }) => (active ? '#6366f1' : 'transparent')};
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  @media (prefers-color-scheme: dark) {
    background: ${({ active }) => (active ? '#232a4a' : 'transparent')};
    color: ${({ active }) => (active ? '#a5b4fc' : 'inherit')};
  }
`;

const ConnectWalletModal: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authStatus, login } = useWalletAuth();
  const isOpen = useSelector((s: RootState) => s.ui.isConnectWalletModalOpen);
  const [tab, setTab] = useState<'telegram' | 'create' | 'import'>();
  const [importMnemonic, setImportMnemonic] = useState('');
  const [mnemonicError, setMnemonicError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    if (authStatus === AuthStatus.SUCCEEDED) {
      handleClose();
    }
  }, [authStatus]);

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(setConnectWalletModalOpen(false));
    setMnemonic('');
    setMnemonicError(null);
  };

  const handleTonConnect = async () => {
    setIsSubmitting(true);
    try {
      await tonConnectUI.connectWallet();
      const account = tonConnectUI.account;
      if (account?.address && account?.publicKey) {
        await login({ address: account.address, publicKey: account.publicKey });
        handleClose();
        navigate('/dashboard');
      } else {
        setMnemonicError('Не удалось получить адрес и публичный ключ');
      }
    } catch (e) {
      setMnemonicError('Ошибка подключения TonConnect');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabsChange = (tab: 'telegram' | 'import' | 'create') => {
    switch (tab) {
      case 'create':
        dispatch(setCreateWalletModalOpen(true));
        handleClose();
        break;
      case 'import':
        dispatch(setImportWalletModalOpen(true));
        handleClose();
        break;
      case 'telegram':
        handleTonConnect()
    }
  };

  return ReactDOM.createPortal(
    <ModalBackdrop>
      <ModalBox>
        <CloseBtn onClick={handleClose} aria-label="Закрыть">×</CloseBtn>
        <div style={{ display: 'flex', marginBottom: 24 }}>
          <TabBtn active={tab === 'telegram'} onClick={() => handleTabsChange('telegram')}>Подключить Telegram-кошелёк</TabBtn>
          <TabBtn active={tab === 'create'} onClick={() => handleTabsChange('create')}>Создать кошелек</TabBtn>
          <TabBtn active={tab === 'import'} onClick={() => handleTabsChange('import')}>Импортировать кошелек</TabBtn>
        </div>
      </ModalBox>
    </ModalBackdrop>,
    document.getElementById('modal-root') as HTMLElement
  );
};

export default ConnectWalletModal; 