import { FC, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from '@emotion/styled';
import { Toast } from './Toast';
import { removeToast } from '../../store/slices/notifications/notificationsSlice';
import type { RootState } from '../../store';

const ToastWrapper = styled.div`
  position: fixed;
  top: 3rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const ToastContainer = styled.div`
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

export const ToastProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch();
    const toasts = useSelector((state: RootState) => state.notifications.toasts);

    useEffect(() => {
        toasts.forEach(toast => {
            const timer = setTimeout(() => {
                const element = document.getElementById(`toast-${toast.id}`);
                if (element) {
                    element.classList.add('removing');
                    setTimeout(() => {
                        dispatch(removeToast(toast.id));
                    }, 300); // Ждем завершения анимации исчезновения
                }
            }, 2000);

            return () => clearTimeout(timer);
        });
    }, [toasts, dispatch]);

    return (
        <>
            {children}
            <ToastWrapper>
                {toasts.map(toast => (
                    <ToastContainer key={toast.id} id={`toast-${toast.id}`}>
                        <Toast
                            type={toast.type}
                            message={toast.message}
                            onClose={() => {
                                const element = document.getElementById(`toast-${toast.id}`);
                                if (element) {
                                    element.classList.add('removing');
                                    setTimeout(() => {
                                        dispatch(removeToast(toast.id));
                                    }, 300);
                                }
                            }}
                        />
                    </ToastContainer>
                ))}
            </ToastWrapper>
        </>
    );
}; 