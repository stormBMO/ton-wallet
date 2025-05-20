import notificationsReducer, { notify, removeToast } from '../store/slices/notifications/notificationsSlice';

describe('notificationsSlice', () => {
    it('should handle initial state', () => {
        expect(notificationsReducer(undefined, { type: 'unknown' })).toEqual({
            toasts: [],
        });
    });

    it('should handle notify', () => {
        const initialState = { toasts: [] };
        const action = notify({ type: 'success', message: 'Test message' });
        const nextState = notificationsReducer(initialState, action);

        expect(nextState.toasts).toHaveLength(1);
        expect(nextState.toasts[0]).toMatchObject({
            type: 'success',
            message: 'Test message',
        });
        expect(nextState.toasts[0].id).toBeDefined();
    });

    it('should handle removeToast', () => {
        const initialState = {
            toasts: [
                { id: '1', type: 'success', message: 'Test message' },
                { id: '2', type: 'error', message: 'Another message' },
            ],
        };
        const action = removeToast('1');
        const nextState = notificationsReducer(initialState, action);

        expect(nextState.toasts).toHaveLength(1);
        expect(nextState.toasts[0].id).toBe('2');
    });
}); 