import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, registerApi, getMeApi, updateMeApi, logoutApi } from '../api/auth.api';
import { createLogger, setUserId } from '@/lib/logger';

const log = createLogger('auth');

const savedUser = (() => {
  try {
    const item = localStorage.getItem('user');
    return item && item !== 'undefined' ? JSON.parse(item) : null;
  } catch {
    return null;
  }
})();

const initialState = {
  user: savedUser || null,
  isAuthenticated: !!savedUser,
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk('auth/login', async (credentials, { dispatch, rejectWithValue }) => {
  try {
    const result = await loginApi(credentials);
    dispatch(login(result.user));
    return result.user;
  } catch (err) {
    return rejectWithValue(err.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const result = await registerApi(payload);
    dispatch(login(result.user));
    return result.user;
  } catch (err) {
    return rejectWithValue(err.message || 'Registration failed');
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { dispatch, rejectWithValue }) => {
  try {
    const result = await getMeApi();
    dispatch(login(result.user));
    return result.user;
  } catch (err) {
    dispatch(logout());
    return rejectWithValue(err.message || 'Failed to fetch user');
  }
});

export const updateUser = createAsyncThunk('auth/updateUser', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const result = await updateMeApi(payload);
    dispatch(completeProfile(result.user));
    return result.user;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to update profile');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { dispatch, rejectWithValue }) => {
  try {
    await logoutApi();
    dispatch(logout());
  } catch (err) {
    dispatch(logout());
    return rejectWithValue(err.message || 'Logout failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(state.user));
      setUserId(action.payload?.id);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUserId(null);
    },
    completeProfile: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    switchRole: (state, action) => {
      state.user.activeRole = action.payload;
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        log.info('Login succeeded', { meta: { userId: action.payload?.id } });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.error('Login failed', { meta: { message: action.payload } });
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        log.info('Registration succeeded', { meta: { userId: action.payload?.id } });
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.error('Registration failed', { meta: { message: action.payload } });
      })
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.warn('Session restore failed', { meta: { message: action.payload } });
      })
      .addCase(updateUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.error('Profile update failed', { meta: { message: action.payload } });
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'succeeded';
        log.info('Logout succeeded');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        log.warn('Logout API call failed', { meta: { message: action.payload } });
      });
  },
});

export const { login, logout, completeProfile, switchRole } = authSlice.actions;
export default authSlice.reducer;