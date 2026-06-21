import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mmkvStorage } from '../mmkvStorage';

export interface User {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
}

export interface UserState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Hydrate from MMKV storage if available
const savedUser = mmkvStorage.getItem('auth_user');
const savedToken = mmkvStorage.getItem('auth_token');

const initialState: UserState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  accessToken: savedToken,
  isAuthenticated: !!savedToken,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    signInSuccess: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;

      // Save to MMKV
      mmkvStorage.setItem('auth_user', JSON.stringify(action.payload.user));
      mmkvStorage.setItem('auth_token', action.payload.accessToken);
    },
    signInFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    signOutSuccess: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      // Remove from MMKV
      mmkvStorage.removeItem('auth_user');
      mmkvStorage.removeItem('auth_token');
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      mmkvStorage.setItem('auth_token', action.payload);
    }
  },
});

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  signOutSuccess,
  updateAccessToken,
} = userSlice.actions;

export default userSlice.reducer;
