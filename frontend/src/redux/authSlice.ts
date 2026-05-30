import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User, LoginResponse } from "../types/User";
import { useSelector } from "react-redux";
import { RootState } from "./store";
export type AuthState = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (
    payload: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch("http://localhost:6969/v1/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: LoginResponse = await res.json();

      if (!res.ok || !data.success) {
        return rejectWithValue(data.message || "Login failed");
      }

      const { accessToken, refreshToken, user } = data.data || {};

      console.log("Extracted data:", { accessToken, refreshToken, user }); // Debug log
      localStorage.setItem("userId", user?._id || "");
      localStorage.setItem("isAdmin", user?.isAdmin ? "1" : "0");
      return {
        success: true,
        token: accessToken,
        refreshToken: refreshToken,
        user: user
      } as {
        success: boolean;
        token: string;
        refreshToken?: string;
        user?: User;
      };
    } catch (e: any) {
      return rejectWithValue(
        e?.message?.includes("fetch")
          ? "Cannot connect to server"
          : "Network error"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("isAdmin");
        //    localStorage.removeItem("user");

      }
    },
    setToken(state, action: PayloadAction<{ token: string; refreshToken?: string }>) {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken ?? null;
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      //    localStorage.setItem("user", JSON.stringify(action.payload));
    },
    toggleFavoriteProduct(state, action: PayloadAction<string>) {
      if (state.user) {
        const productId = action.payload;
        const index = state.user.favProducts.indexOf(productId);

        if (index > -1) {
          // Remove from favorites
          state.user.favProducts.splice(index, 1);
        } else {
          // Add to favorites
          state.user.favProducts.push(productId);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken ?? null;
        state.user = action.payload.user ?? null;

        // Save token to localStorage for axios interceptor
        if (typeof localStorage !== "undefined" && action.payload.token) {
          localStorage.setItem("access_token", action.payload.token);
          if (action.payload.refreshToken) {
            localStorage.setItem("refresh_token", action.payload.refreshToken);
          }
          // if (action.payload.user) {
          //   localStorage.setItem("user", JSON.stringify(action.payload.user));
          // }
        }
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Login failed";
      });
  },
});


export const { logout, setToken, updateUser, toggleFavoriteProduct } = authSlice.actions;
export default authSlice.reducer;
