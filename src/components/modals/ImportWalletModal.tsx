import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setImportWalletModalOpen } from '../../store/slices/ui/uiSlice';
import { setMnemonic, setAddress, setStatus, setError } from '@/store/slices/wallet/walletSlice';
import { mnemonicToWalletKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';
import styled from '@emotion/styled';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { AuthStatus } from '@/store/slices/auth/types';
import { setToken } from '@/store/slices/auth/authSlice';

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
  width: 500px;
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

export const ImportWalletModal: React.FC = () => {
  const dispatch = useDispatch();
  const { isImportWalletModalOpen: isOpen } = useSelector((state: RootState) => state.ui);
  const { login, isAuthenticated, authStatus } = useWalletAuth();
  const [mnemonic, setMnemonicInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(setImportWalletModalOpen(false));
    setMnemonicInput('');
    setError(null);
  }

  const handleImport = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const words = mnemonic.trim().split(/\s+/);
      if (words.length !== 24) {
        setError('Мнемоника должна содержать 24 слова');
        setIsSubmitting(false);
        return;
      }
      dispatch(setStatus('loading'));
      const key = await mnemonicToWalletKey(words);
      const walletObj = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
      const address = walletObj.address.toString();
      dispatch(setMnemonic(mnemonic.trim()));
      dispatch(setAddress(address));
      await login({
          address, publicKey: Buffer.from(key.publicKey).toString('hex'),
          signature: Buffer.from(key.secretKey).toString('base64')
      });
    //   dispatch(setToken({
    //     address,
    //     jwt: Buffer.from(key.secretKey).toString('base64')
    //   }));
      handleClose();
    } catch (e) {
      setError('Ошибка при импорте кошелька. Проверьте правильность мнемоники.');
      dispatch(setStatus('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop>
      <ModalBox>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Импортировать кошелёк</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <textarea
            value={mnemonic}
            onChange={e => setMnemonicInput(e.target.value)}
            rows={3}
            placeholder="Введите 24 слова мнемоники через пробел"
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #ccc',
              fontSize: 16,
              resize: 'none',
            }}
            disabled={isSubmitting}
          />
          <button
            onClick={handleImport}
            disabled={isSubmitting}
            style={{
              padding: '12px',
              borderRadius: 8,
              background: '#6366f1',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginBottom: 8,
            }}
          >
            {isSubmitting ? 'Импорт...' : 'Импортировать'}
          </button>
          {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}
        </div>
      </ModalBox>
    </ModalBackdrop>
    )
};