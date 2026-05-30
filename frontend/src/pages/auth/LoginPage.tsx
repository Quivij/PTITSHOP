import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../../redux/authSlice.ts";
import type { AppDispatch, RootState } from "../../redux/store.ts";
import TextField from "../../components/forms/TextField.tsx";
import PasswordField from "../../components/forms/PasswordField.tsx";
import AuthCard from "../../components/layout/AuthCard.tsx";
import "../../components/layout/Auth.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((s: RootState) => s.auth);

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const action = await dispatch(loginThunk({ username: form.email, password: form.password }));
    
    // Debug: Log the action result
    console.log("Login action result:", action);
    
    if (loginThunk.fulfilled.match(action)) {
      console.log("Login successful, payload:", action.payload);
      if (form.remember && action.payload.token) {
        localStorage.setItem("token", action.payload.token);
        if (action.payload.refreshToken) {
          localStorage.setItem("refreshToken", action.payload.refreshToken);
        }
      }
      navigate("/home");
    } else if (loginThunk.rejected.match(action)) {
      console.log("Login failed:", action.payload);
      setLocalError((action.payload as string) || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <AuthCard className="auth-card">
        {/* Header */}
        <h3 className="text-center mb-1 auth-title">
          <span className="active">Login</span>{" | "}
          <Link to="/register" className="inactive">Register</Link>
        </h3>

        {/* Subtitle */}
        <p className="text-center auth-subtitle mb-4">
          If you have an account, sign in with your username or email address.
        </p>

        {/* Form */}
        <form onSubmit={submit}>
          <label className="form-label fw-semibold">Username or Email *</label>
          <TextField
            label="Username or email address *"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <label className="form-label fw-semibold">Password *</label>
          <PasswordField
            label="Password *"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="form-check">
              <input
                id="remember"
                className="form-check-input"
                type="checkbox"
                name="remember"
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="remember">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="forgot-link">
              Lost your password?
            </Link>
          </div>

          {(localError || error) && (
            <div className="text-danger mb-2">{localError || error}</div>
          )}
          <button className="btn btn-purple w-100" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
