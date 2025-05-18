import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setMnemonic, setAddress, setStatus } from '../../store/slices/wallet/walletSlice';
import { setCreateWalletModalOpen } from '../../store/slices/ui/uiSlice';
import { mnemonicToWalletKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';
import { wordlist } from '@scure/bip39/wordlists/english';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { AuthStatus } from '@/store/slices/auth/types';
import { toHex } from '@/lib/utils';

const CreateWalletModal = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.ui.isCreateWalletModalOpen);
  const [step, setStep] = useState<'generate' | 'confirm'>('generate');
  const [generatedMnemonic, setGeneratedMnemonic] = useState<string[]>([]);
  const [confirmedMnemonic, setConfirmedMnemonic] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const { login, isAuthenticated, authStatus } = useWalletAuth();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && authStatus === AuthStatus.SUCCEEDED) {
        dispatch(setCreateWalletModalOpen(false));
    }
  }, [isAuthenticated]);

  const generateMnemonic = () => {
    const words = Array.from({ length: 24 }, () => {
      const randomIndex = Math.floor(Math.random() * wordlist.length);
      return wordlist[randomIndex];
    });
    setGeneratedMnemonic(words);
  };

  const generateAddressFromMnemonic = async (mnemonicPhrase: string) => {
    try {
      dispatch(setStatus('loading'));
      const key = await mnemonicToWalletKey(mnemonicPhrase.split(' '));
      const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
      const address = wallet.address.toString();
      dispatch(setAddress(address));
      
      await login({ address, publicKey: Buffer.from(key.publicKey).toString('hex'), privateKey: key.secretKey });
      dispatch(setStatus('connected'));
    } catch (error) {
      console.error('Failed to generate address:', error);
      setError('Failed to generate wallet address');
      dispatch(setStatus('error'));
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateMnemonic();
    }
  }, [isOpen]);

  const handleCopyMnemonic = async () => {
    try {
      await navigator.clipboard.writeText(generatedMnemonic.join(' '));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy mnemonic to clipboard');
    }
  };

  const handlePasteMnemonic = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const words = pastedText.trim().split(/\s+/);
    
    if (words.length === 24) {
      setConfirmedMnemonic(words);
    } else {
      setError('Invalid mnemonic phrase. Please paste 24 words.');
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const newConfirmed = [...confirmedMnemonic];
    newConfirmed[index] = value;
    setConfirmedMnemonic(newConfirmed);
    setError(null);

    if (value.includes(' ') && index < 23) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' && index < 23) {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    } else if (e.key === 'Backspace' && !confirmedMnemonic[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleConfirm = () => {
    const isCorrect = confirmedMnemonic.every((word, index) => word === generatedMnemonic[index]);
    if (isCorrect) {
      const mnemonicPhrase = generatedMnemonic.join(' ');
      dispatch(setMnemonic(mnemonicPhrase));
      generateAddressFromMnemonic(mnemonicPhrase);
      dispatch(setCreateWalletModalOpen(false));
      setStep('generate');
      setConfirmedMnemonic([]);
      setError(null);
    } else {
      setError('Incorrect mnemonic phrase. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[600px]">
        <h2 className="text-xl font-bold mb-4">Create New Wallet</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {step === 'generate' ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p>Your recovery phrase:</p>
              <button
                onClick={handleCopyMnemonic}
                className="text-blue-500 hover:text-blue-600"
              >
                {copySuccess ? 'Copied!' : 'Copy to clipboard'}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {generatedMnemonic.map((word, index) => (
                <div key={index} className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <span className="text-gray-500 text-sm mr-1">{index + 1}.</span>
                  {word}
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep('confirm')}
              className="w-full bg-blue-500 text-white p-2 rounded"
            >
              I've written it down
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4">Confirm your recovery phrase:</p>
            <div 
              className="grid grid-cols-4 gap-2 mb-4"
              onPaste={handlePasteMnemonic}
            >
              {Array(24).fill('').map((_, index) => (
                <div key={index} className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    {index + 1}.
                  </span>
                  <input
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    value={confirmedMnemonic[index] || ''}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded pl-8"
                    placeholder={`Word ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep('generate')}
                className="w-1/2 bg-gray-500 text-white p-2 rounded"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                className="w-1/2 bg-blue-500 text-white p-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateWalletModal; 