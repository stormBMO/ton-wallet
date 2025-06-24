import { FC } from 'react';
import { ToastType } from '../../store/slices/notifications/notificationsSlice';
import { NotificationToastContainer, Message, CloseButton } from '../styles';
interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

export const Toast: FC<ToastProps> = ({ type, message, onClose }) => {
    return (
        <NotificationToastContainer type={type}>
            <Message>{message}</Message>
            <CloseButton onClick={onClose}>×</CloseButton>
        </NotificationToastContainer>
    );
}; 