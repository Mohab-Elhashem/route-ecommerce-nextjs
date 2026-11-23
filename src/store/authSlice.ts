import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user?: AuthUser | null }>,
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user ?? null;
      state.hydrated = true;
    },
    hydrateAuth(state, action: PayloadAction<AuthState>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.hydrated = true;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.hydrated = true;
    },
  },
});

export const { setCredentials, hydrateAuth, logout } = authSlice.actions;
export default authSlice.reducer;
