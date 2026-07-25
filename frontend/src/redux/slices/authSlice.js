import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }
      return rejectWithValue(response.data.message || 'Login failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ userId, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-otp', { userId, otp });
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }
      return rejectWithValue(response.data.message || 'OTP verification failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Still log out locally even if api call fails
    } finally {
      localStorage.removeItem('user');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      return rejectWithValue('Failed to fetch user');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

// Initial State
const savedUser = localStorage.getItem('user');
const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: null,
  loading: false,
  error: null,
  tempUserId: null, // For OTP verification path
  needsVerification: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.tempUserId = null;
      state.needsVerification = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.needsVerification = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload?.includes('verify') || action.meta.arg?.needsVerification) {
          state.needsVerification = true;
        }
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.tempUserId = action.payload.userId;
        state.needsVerification = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // OTP Verification
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.needsVerification = false;
        state.tempUserId = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Me
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.tempUserId = null;
        state.needsVerification = false;
      });
  },
});

export const { clearError, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
