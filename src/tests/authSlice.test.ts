// import { authReducer, setToken, clearToken, loginWithWallet } from '../store/slices/auth/authSlice';
// import type { AuthState } from '../store/slices/auth/authSlice';
// import apiClient from '@/api/axios';
// import { configureStore, EnhancedStore } from '@reduxjs/toolkit';

// // Мокаем apiClient
// jest.mock('../api/axios');
// const mockedAxios = apiClient as jest.Mocked<typeof apiClient>;

// // Определяем тип для RootState внутри тестов, если он не импортируется
// interface TestRootState {
//   auth: AuthState;
// }

// describe('authSlice', () => {
//   // Используем EnhancedStore с определенным RootState
//   let store: EnhancedStore<TestRootState>;

//   beforeEach(() => {
//     store = configureStore({ reducer: { auth: authReducer } }) as EnhancedStore<TestRootState>;
//     localStorage.clear();
//     mockedAxios.get.mockClear();
//     mockedAxios.post.mockClear();
//   });

//   const initialState: AuthState = {
//     jwt: null,
//     status: 'idle',
//     error: null,
//   };

//   it('should handle initial state', () => {
//     expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
//   });

//   it('should handle setToken', () => {
//     const token = 'test-jwt-token';
//     const actual = authReducer(initialState, setToken(token));
//     expect(actual.jwt).toEqual(token);
//     expect(localStorage.getItem('jwt')).toEqual(token);
//   });

//   it('should handle clearToken', () => {
//     localStorage.setItem('jwt', 'test-jwt-token');
//     const stateWithToken: AuthState = { ...initialState, jwt: 'test-jwt-token' };
//     const actual = authReducer(stateWithToken, clearToken());
//     expect(actual.jwt).toBeNull();
//     expect(localStorage.getItem('jwt')).toBeNull();
//   });

//   describe('loginWithWallet thunk', () => {
//     const mockLoginPayload = { address: 'test-address', publicKey: 'test-public-key' };
//     const mockNonceResponse = { data: { nonce: 'test-nonce' } };
//     const mockVerifyResponse = { data: { access_token: 'new-jwt-token' } };

//     it('should successfully login and set token', async () => {
//       mockedAxios.get.mockResolvedValueOnce(mockNonceResponse);
//       mockedAxios.post.mockResolvedValueOnce(mockVerifyResponse);

//       await store.dispatch(loginWithWallet(mockLoginPayload) as any);

//       const state = store.getState().auth;
//       expect(state.status).toBe('succeeded');
//       expect(state.jwt).toBe(mockVerifyResponse.data.access_token);
//       expect(localStorage.getItem('jwt')).toBe(mockVerifyResponse.data.access_token);
//       expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/request_nonce');
//       expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/verify_signature', {
//         address: mockLoginPayload.address,
//         public_key: mockLoginPayload.publicKey,
//         nonce: mockNonceResponse.data.nonce,
//         signature: `signed:${mockNonceResponse.data.nonce}:${mockLoginPayload.address}:${mockLoginPayload.publicKey}`,
//       });
//     });

//     it('should handle login failure from nonce request', async () => {
//       const error = { message: 'Nonce request failed' };
//       mockedAxios.get.mockRejectedValueOnce(error);

//       await store.dispatch(loginWithWallet(mockLoginPayload) as any);

//       const state = store.getState().auth;
//       expect(state.status).toBe('failed');
//       expect(state.error).toBe(error.message);
//       expect(state.jwt).toBeNull();
//       expect(localStorage.getItem('jwt')).toBeNull();
//     });

//     it('should handle login failure from verify signature request', async () => {
//       const error = { response: { data: 'Verify signature failed' } };
//       mockedAxios.get.mockResolvedValueOnce(mockNonceResponse);
//       mockedAxios.post.mockRejectedValueOnce(error);

//       await store.dispatch(loginWithWallet(mockLoginPayload) as any);

//       const state = store.getState().auth;
//       expect(state.status).toBe('failed');
//       expect(state.error).toBe(error.response.data);
//       expect(state.jwt).toBeNull();
//       expect(localStorage.getItem('jwt')).toBeNull();
//     });
//   });
// }); 