import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { notify } from '../store/slices/notifications/notificationsSlice';
import type { ToastType } from '../store/slices/notifications/notificationsSlice';

export const useNotify = () => {
  const dispatch = useDispatch();

  return useCallback(
    (type: ToastType, message: string) => {
      dispatch(notify({ type, message }));
    },
    [dispatch]
  );
};

export default useNotify; 