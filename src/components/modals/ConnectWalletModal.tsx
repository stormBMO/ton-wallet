import React, { useEffect, useState, useRef } from 'react';
import '@fontsource/inter';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setConnectWalletModalOpen } from '../../store/slices/ui/uiSlice';
import { setMnemonic, setAddress, setStatus } from '@/store/slices/wallet/walletSlice';
import { mnemonicToWalletKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { wordlist } from '@scure/bip39/wordlists/english';

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
  width: 420px;
  padding: 32px;
  border-radius: 16px;
  background: #fff;
  color: #222;
  position: relative;
  font-family: 'Inter', Arial, sans-serif;
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
const BigBtn = styled.button`
  font-family: 'Inter', Arial, sans-serif;
  width: 100%;
  padding: 18px 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  background: #e0e7ff;
  color: #1d4ed8;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #c7d2fe;
  }
  @media (prefers-color-scheme: dark) {
    background: #232a4a;
    color: #a5b4fc;
    &:hover {
      background: #334155;
    }
  }
`;

// Добавляю компонент для ячейки мнемоники
const MnemonicCell = styled.div<{ editable?: boolean }>`
  background: #f3f4f6;
  border-radius: 6px;
  padding: 6px;
  font-size: 15px;
  color: #222;
  font-family: 'Inter', Arial, sans-serif;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  min-width: 0;
  box-sizing: border-box;
  @media (prefers-color-scheme: dark) {
    background: #232a4a;
    color: #fff;
    border: 1px solid #444;
  }
  input {
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    font-size: 15px;
    color: inherit;
    font-family: inherit;
    padding: 0;
    margin: 0;
    text-align: left;
  }
`;

const ConnectWalletModal: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { login } = useWalletAuth();
    const isOpen = useSelector((s: RootState) => s.ui.isConnectWalletModalOpen);
    const wallet = useTonWallet();
    const [mode, setMode] = useState<'select' | 'import' | 'create' | 'tonconnect'>('select');
    // Импорт
    const [mnemonic, setMnemonicInput] = useState('');
    const [importError, setImportError] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    // Создание
    const [step, setStep] = useState<'generate' | 'confirm'>('generate');
    const [generatedMnemonic, setGeneratedMnemonic] = useState<string[]>([]);
    const [confirmedMnemonic, setConfirmedMnemonic] = useState<string[]>([]);
    const [copySuccess, setCopySuccess] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (wallet && wallet.account?.address) {
            login({
                address: wallet.account.address,
                publicKey: wallet.account.publicKey || '',
                privateKey: Buffer.from('')
            }).finally(() => {
                dispatch(setConnectWalletModalOpen(false));
                navigate('/');
            });
        }
    }, [wallet]);


    const handleClose = () => {
        dispatch(setConnectWalletModalOpen(false));
        setMode('select');
        setMnemonicInput('');
        setImportError(null);
        setStep('generate');
        setGeneratedMnemonic([]);
        setConfirmedMnemonic([]);
        setCopySuccess(false);
        setCreateError(null);
    };

    // Импорт кошелька
    const handleImport = async () => {
        setImportError(null);
        setIsImporting(true);
        try {
            const words = mnemonic.trim().split(/\s+/);
            if (words.length !== 24) {
                setImportError('Мнемоника должна содержать 24 слова');
                setIsImporting(false);
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
                privateKey: key.secretKey
            });
            handleClose();
            navigate('/');
        } catch (e) {
            setImportError('Ошибка при импорте кошелька. Проверьте правильность мнемоники.');
            dispatch(setStatus('error'));
        } finally {
            setIsImporting(false);
        }
    };

    // Создание кошелька
    const generateMnemonic = () => {
        const words = Array.from({ length: 24 }, () => {
            const randomIndex = Math.floor(Math.random() * wordlist.length);
            return wordlist[randomIndex];
        });
        setGeneratedMnemonic(words);
    };
    useEffect(() => {
        if (mode === 'create' && step === 'generate') {
            generateMnemonic();
        }
    }, [mode, step]);

    const handleCopyMnemonic = async () => {
        try {
            await navigator.clipboard.writeText(generatedMnemonic.join(' '));
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            setCreateError('Не удалось скопировать фразу');
        }
    };
    const handleInputChange = (index: number, value: string) => {
        const newConfirmed = [...confirmedMnemonic];
        newConfirmed[index] = value;
        setConfirmedMnemonic(newConfirmed);
        setCreateError(null);
        if (value.includes(' ') && index < 23) {
            const nextInput = inputRefs.current[index + 1];
            if (nextInput) nextInput.focus();
        }
    };
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ' ' && index < 23) {
            e.preventDefault();
            const nextInput = inputRefs.current[index + 1];
            if (nextInput) nextInput.focus();
        } else if (e.key === 'Backspace' && !confirmedMnemonic[index] && index > 0) {
            const prevInput = inputRefs.current[index - 1];
            if (prevInput) prevInput.focus();
        }
    };
    const handleConfirm = async () => {
        const isCorrect = confirmedMnemonic.every((word, index) => word === generatedMnemonic[index]);
        if (isCorrect) {
            const mnemonicPhrase = generatedMnemonic.join(' ');
            dispatch(setMnemonic(mnemonicPhrase));
            try {
                dispatch(setStatus('loading'));
                const key = await mnemonicToWalletKey(generatedMnemonic);
                const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
                const address = wallet.address.toString();
                dispatch(setAddress(address));
                await login({ address, publicKey: Buffer.from(key.publicKey).toString('hex'), privateKey: key.secretKey });
                dispatch(setStatus('connected'));
                handleClose();
                navigate('/');
            } catch (error) {
                setCreateError('Ошибка при создании кошелька');
                dispatch(setStatus('error'));
            }
        } else {
            setCreateError('Фраза не совпадает. Попробуйте ещё раз.');
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <ModalBackdrop>
            <ModalBox>
                <CloseBtn onClick={handleClose} aria-label="Закрыть">×</CloseBtn>
                {mode === 'select' && (
                    <>
                        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Войти в кошелек</h2>
                        <BigBtn onClick={() => setMode('tonconnect')}>Войти через Telegram-кошелек (TonConnect)</BigBtn>
                        <BigBtn onClick={() => setMode('import')}>Импортировать кошелек</BigBtn>
                        <BigBtn onClick={() => setMode('create')}>Создать новый кошелек</BigBtn>
                    </>
                )}
                {mode === 'tonconnect' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <TonConnectButton />
                        <BigBtn style={{ marginTop: 24 }} onClick={() => setMode('select')}>Назад</BigBtn>
                    </div>
                )}
                {mode === 'import' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Импортировать кошелек</h2>
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
                                fontFamily: 'Inter, Arial, sans-serif',
                            }}
                            disabled={isImporting}
                        />
                        <BigBtn onClick={handleImport} disabled={isImporting} style={{ background: '#6366f1', color: '#fff' }}>
                            {isImporting ? 'Импорт...' : 'Импортировать'}
                        </BigBtn>
                        {importError && <div style={{ color: 'red', fontSize: 14 }}>{importError}</div>}
                        <BigBtn style={{ background: '#eee', color: '#222' }} onClick={() => setMode('select')}>Назад</BigBtn>
                    </div>
                )}
                {mode === 'create' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Создать новый кошелек</h2>
                        {step === 'generate' ? (
                            <>
                                <div style={{ marginBottom: 8 }}>Ваша секретная фраза (запишите и сохраните):</div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: 8,
                                    marginBottom: 12
                                }}>
                                    {generatedMnemonic.map((word, index) => (
                                        <MnemonicCell key={index}>
                                            <span style={{ color: '#888', fontSize: 13, marginRight: 4 }}>{index + 1}.</span>
                                            <span style={{ wordBreak: 'break-all' }}>{word}</span>
                                        </MnemonicCell>
                                    ))}
                                </div>
                                <BigBtn onClick={handleCopyMnemonic} style={{ background: '#6366f1', color: '#fff', marginBottom: 8 }}>
                                    {copySuccess ? 'Скопировано!' : 'Скопировать фразу'}
                                </BigBtn>
                                <BigBtn onClick={() => setStep('confirm')} style={{ background: '#6366f1', color: '#fff' }}>
                                    Я записал(а) фразу
                                </BigBtn>
                                <BigBtn style={{ background: '#eee', color: '#222' }} onClick={() => setMode('select')}>Назад</BigBtn>
                                {createError && <div style={{ color: 'red', fontSize: 14 }}>{createError}</div>}
                            </>
                        ) : (
                            <>
                                <div style={{ marginBottom: 8 }}>Подтвердите фразу (введите слова по порядку):</div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: 8,
                                    marginBottom: 12
                                }}>
                                    {Array(24).fill('').map((_, index) => (
                                        <MnemonicCell key={index} editable>
                                            <span style={{ color: '#888', fontSize: 13, marginRight: 4 }}>{index + 1}.</span>
                                            <input
                                                ref={el => inputRefs.current[index] = el}
                                                type="text"
                                                value={confirmedMnemonic[index] || ''}
                                                onChange={e => handleInputChange(index, e.target.value)}
                                                onKeyDown={e => handleKeyDown(index, e)}
                                                onPaste={e => {
                                                    const paste = e.clipboardData.getData('text');
                                                    const words = paste.trim().split(/\s+/);
                                                    if (words.length > 1) {
                                                        e.preventDefault();
                                                        const newConfirmed = [...confirmedMnemonic];
                                                        for (let i = 0; i < 24; i++) {
                                                            newConfirmed[i] = words[i] || '';
                                                        }
                                                        setConfirmedMnemonic(newConfirmed);
                                                        // Фокус на последний заполненный
                                                        const lastIdx = Math.min(words.length - 1, 23);
                                                        setTimeout(() => {
                                                            if (inputRefs.current[lastIdx]) inputRefs.current[lastIdx].focus();
                                                        }, 0);
                                                    }
                                                }}
                                                placeholder={`${index + 1}`}
                                                style={{ width: '100%', background: 'transparent', border: 'none', color: 'inherit', fontFamily: 'inherit', fontSize: 15 }}
                                            />
                                        </MnemonicCell>
                                    ))}
                                </div>
                                <BigBtn onClick={handleConfirm} style={{ background: '#6366f1', color: '#fff', marginBottom: 8 }}>
                                    Подтвердить
                                </BigBtn>
                                <BigBtn style={{ background: '#eee', color: '#222' }} onClick={() => { setStep('generate'); setConfirmedMnemonic([]); }}>Назад</BigBtn>
                                {createError && <div style={{ color: 'red', fontSize: 14 }}>{createError}</div>}
                            </>
                        )}
                    </div>
                )}
            </ModalBox>
        </ModalBackdrop>,
        document.getElementById('modal-root') as HTMLElement
    );
};

export default ConnectWalletModal; 