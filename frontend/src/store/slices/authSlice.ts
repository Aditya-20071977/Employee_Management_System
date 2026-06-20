import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

interface AuthState {
    token: string | null;
    username: string | null;
    loading: boolean;
    error: string | null;
    success: string | null;
}

const initialState: AuthState = {
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
    loading: false,
    error: null,
    success: null
};

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: Record<string, string>, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/login', credentials);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.user.username);
            return res.data; // contains message, token, user { id, username }
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Login failed. Please check credentials.');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (credentials: Record<string, string>, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/register', credentials);
            return res.data; // contains message
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Registration failed. Try a different username.');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            state.token = null;
            state.username = null;
            state.error = null;
            state.success = 'You have been logged out successfully.';
        },
        clearAuthStatus: (state) => {
            state.error = null;
            state.success = null;
        },
        setLogoutSuccess: (state, action: PayloadAction<string>) => {
            state.success = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.username = action.payload.user.username;
                state.success = action.payload.message || 'Login successful! Welcome back.';
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload.message || 'Registration successful! Redirecting to login...';
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { logout, clearAuthStatus, setLogoutSuccess } = authSlice.actions;
export default authSlice.reducer;
