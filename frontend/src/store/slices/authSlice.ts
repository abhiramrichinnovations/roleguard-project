import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'manager' | 'user';
  isActive?: boolean;
  lastLogin?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const register = createAsyncThunk(
  'auth/register',
  async (data: { email: string; username: string; password: string; confirmPassword: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, data, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('authTokens', JSON.stringify(action.payload));
    },
    restoreFromLocalStorage: (state) => {
      const stored = localStorage.getItem('authTokens');
      if (stored) {
        try {
          const tokens = JSON.parse(stored);
          state.tokens = tokens;
          state.isAuthenticated = true;
        } catch {
          localStorage.removeItem('authTokens');
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.lastUpdated = Date.now();
        localStorage.setItem('authTokens', JSON.stringify(action.payload.tokens));
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.lastUpdated = Date.now();
        localStorage.setItem('authTokens', JSON.stringify(action.payload.tokens));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
        state.lastUpdated = null;
        localStorage.removeItem('authTokens');
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        localStorage.removeItem('authTokens');
      });

    // Refresh Token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.tokens = action.payload.tokens;
        localStorage.setItem('authTokens', JSON.stringify(action.payload.tokens));
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = null;
        localStorage.removeItem('authTokens');
      });

    // Fetch Current User
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = null;
        localStorage.removeItem('authTokens');
      });
  },
});

export const { clearError, setTokens, restoreFromLocalStorage } = authSlice.actions;
export default authSlice.reducer;