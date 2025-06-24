import styled from '@emotion/styled';
import { ToastType } from '../store/slices/notifications/notificationsSlice';

export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
export const ModalBox = styled.div`
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
export const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 24px;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
`;
export const BigBtn = styled.button`
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

export const MnemonicCell = styled.div<{ editable?: boolean }>`
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

export const ToastWrapper = styled.div`
  position: fixed;
  top: 3rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

export const ToastContainer = styled.div`
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  animation: slideIn 0.3s ease-in-out forwards;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &.removing {
    opacity: 0;
    transform: translateY(-20px);
  }
`;

export const getBackgroundColor = (type: ToastType) => {
    switch (type) {
    case 'success':
        return '#10B981';
    case 'error':
        return '#EF4444';
    case 'warning':
        return '#F59E0B';
    case 'info':
        return '#3B82F6';
    default:
        return '#3B82F6';
    }
};

export const NotificationToastContainer = styled.div<{ type: ToastType }>`
  background-color: ${props => getBackgroundColor(props.type)};
  color: white;
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
  max-width: 500px;
  margin-bottom: 0.5rem;
`;

export const Message = styled.span`
flex: 1;
margin-right: 1rem;
`;

export const CloseButton = styled.button`
background: none;
border: none;
color: white;
cursor: pointer;
padding: 0.25rem;
opacity: 0.7;
transition: opacity 0.2s;

&:hover {
  opacity: 1;
}
`;