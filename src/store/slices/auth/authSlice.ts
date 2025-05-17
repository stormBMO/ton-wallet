import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '@/api/axios';

export interface AuthState {
  jwt: string | null;
  address: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: AuthState = {
  jwt: localStorage.getItem('jwt'),
  address: localStorage.getItem('address'),
  status: 'idle',
  error: null,
};

// Заглушка для функции подписи кошельком
// В реальном приложении здесь будет интеграция с TonConnect или другим SDK
const signNonceWithWallet = async (nonce: string, address: string, publicKey: string): Promise<string> => {
  console.warn('signNonceWithWallet is a stub. Implement actual wallet signing.');
  // Это просто для примера, реальная подпись будет другой
  return `signed:${nonce}:${address}:${publicKey}`;
};

export const loginWithWallet = createAsyncThunk(
  'auth/loginWithWallet',
  async (payload: { address: string; publicKey: string }, { rejectWithValue }) => {
    try {
      const nonceResponse = await apiClient.get('/api/auth/request_nonce');
      const { nonce } = nonceResponse.data;

      const signature = await signNonceWithWallet(nonce, payload.address, payload.publicKey);

      const verifyResponse = await apiClient.post('/api/auth/verify_signature', {
        address: payload.address,
        public_key: payload.publicKey,
        nonce,
        signature,
      });

      const { access_token } = verifyResponse.data;
      localStorage.setItem('jwt', access_token);
      localStorage.setItem('address', payload.address);
      return { jwt: access_token, address: payload.address };
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<{ jwt: string; address: string }>) => {
      state.jwt = action.payload.jwt;
      state.address = action.payload.address;
      localStorage.setItem('jwt', action.payload.jwt);
      localStorage.setItem('address', action.payload.address);
    },
    clearToken: (state) => {
      state.jwt = null;
      state.address = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('jwt');
      localStorage.removeItem('address');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithWallet.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithWallet.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jwt = action.payload.jwt;
        state.address = action.payload.address;
      })
      .addCase(loginWithWallet.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.jwt = null;
        state.address = null;
        localStorage.removeItem('jwt');
        localStorage.removeItem('address');
      });
  },
});

export const { setToken, clearToken } = authSlice.actions;
export const authReducer = authSlice.reducer; 