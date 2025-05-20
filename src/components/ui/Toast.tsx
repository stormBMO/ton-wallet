import { FC } from 'react';
import styled from '@emotion/styled';
import { ToastType } from '../../store/slices/notifications/notificationsSlice';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

const getBackgroundColor = (type: ToastType) => {
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

const ToastContainer = styled.div<{ type: ToastType }>`
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

const Message = styled.span`
  flex: 1;
  margin-right: 1rem;
`;

const CloseButton = styled.button`
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

export const Toast: FC<ToastProps> = ({ type, message, onClose }) => {
    return (
        <ToastContainer type={type}>
            <Message>{message}</Message>
            <CloseButton onClick={onClose}>×</CloseButton>
        </ToastContainer>
    );
}; 