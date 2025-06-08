import { useState } from 'react';

interface Token {
  symbol: string;
  address?: string;
  balance: string;
}

interface SendModalData {
  token: Token;
  userAddress: string;
}

export const useSendModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalData, setModalData] = useState<SendModalData | null>(null);

    const openSendModal = (token: Token, userAddress: string) => {
        setModalData({ token, userAddress });
        setIsOpen(true);
    };

    const closeSendModal = () => {
        setIsOpen(false);
        setModalData(null);
    };

    return {
        isSendModalOpen: isOpen,
        sendModalData: modalData,
        openSendModal,
        closeSendModal,
    };
}; 