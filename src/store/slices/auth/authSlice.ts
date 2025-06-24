import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '@/api/axios';
import { AuthStatus } from './types';
import { sign, signVerify } from '@ton/crypto';

export interface AuthState {
  jwt: string | null;
  address: string | null;
  status: AuthStatus;
  error: string | null | undefined;
}

const initialState: AuthState = {
    jwt: localStorage.getItem('jwt'),
    address: localStorage.getItem('address'),
    status: AuthStatus.IDLE,
    error: null,
};

export const loginWithWallet = createAsyncThunk(
    'auth/loginWithWallet',
    async (payload: {
        address: string;
        publicKey: string;
        privateKey?: Buffer;
        signature?: string;
        nonce?: string;
        timestamp?: number;
        domain?: string;
    }, { rejectWithValue }) => {
        try {
            let signatureBase64: string;
            let nonce: string;
            if (payload.signature && payload.nonce) {
                signatureBase64 = payload.signature;
                nonce = payload.nonce;
            } else if (payload.privateKey) {
                const nonceResponse = await apiClient.get('/api/auth/request_nonce');
                nonce = nonceResponse.data.nonce;
                const signature = sign(Buffer.from(nonce, 'hex'), payload.privateKey);
                signatureBase64 = Buffer.from(signature).toString('base64');
            } else {
                throw new Error('Не передан ни privateKey, ни signature');
            }

            const endpoint = (payload.signature && payload.nonce) 
                ? '/api/auth/verify_ton_connect' 
                : '/api/auth/verify_signature';  

            const requestData = {
                address: payload.address,
                public_key: payload.publicKey,
                nonce,
                signature: signatureBase64,
                ...(payload.timestamp && { timestamp: payload.timestamp }),
                ...(payload.domain && { domain: payload.domain })
            };

            const verifyResponse = await apiClient.post(endpoint, requestData);

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
            state.status = AuthStatus.IDLE;
            state.error = null;
            localStorage.removeItem('jwt');
            localStorage.removeItem('address');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginWithWallet.pending, (state) => {
                state.status = AuthStatus.LOADING;
                state.error = null;
            })
            .addCase(loginWithWallet.fulfilled, (state, action) => {
                state.status = AuthStatus.SUCCEEDED;
                state.jwt = action.payload.jwt;
                state.address = action.payload.address;
            })
            .addCase(loginWithWallet.rejected, (state, action) => {
                state.status = AuthStatus.FAILED;
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