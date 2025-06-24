import { FC, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Toast } from './Toast';
import { removeToast } from '../../store/slices/notifications/notificationsSlice';
import type { RootState } from '../../store';
import { ToastWrapper, ToastContainer } from '../styles';

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