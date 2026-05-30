import React, { useState } from "react";
import { Link } from "react-router-dom";
import PasswordField from "../../components/forms/PasswordField.tsx";
import AuthCard from "../../components/layout/AuthCard.tsx";
import "../../components/layout/Auth.css";
import TextField from "../../components/forms/TextField.tsx";

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({
    email: "",
    repassword: "",
    password: "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sendOtp = async () => {
    if (!form.email) {
      setError("Please enter your email before requesting OTP.!");
      return;
    }

    setError(null);
    setSuccess(null);
    setOtpLoading(true);
    try {
      const response = await fetch("http://localhost:6969/v1/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      setSuccess("OTP sent to your email!");
    } catch (err) {
      console.error("Send OTP error:", err);
      setError("Failed to send OTP due to network/server error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.password !== form.repassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:6969/v1/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          newPassword: form.password,
          otp: form.otp,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Password reset failed");
        return;
      }

      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError("Password reset failed due to network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthCard className="auth-card">
        {/* Header */}
        <h3 className="text-center mb-1 auth-title">Reset Password</h3>

        {/* Subtitle */}
        <p className="text-center auth-subtitle mb-4">
          Enter your email, OTP and new password.
        </p>

        {/* Form */}
        <form onSubmit={submit}>
          {/* Email */}
          <label className="form-label fw-semibold">Email *</label>
          <div className="d-flex gap-2">
            <TextField
              label="Email address *"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            <button
              type="button"
              className="btn btn-outline-purple"
              onClick={sendOtp}
              disabled={otpLoading}
            >
              {otpLoading ? "Sending..." : "Send OTP"}
            </button>
          </div>

          {/* OTP */}
          <label className="form-label fw-semibold mt-3">OTP *</label>
          <TextField
            label="Enter OTP *"
            name="otp"
            type="text"
            value={form.otp}
            onChange={handleChange}
          />

          {/* New Password */}
          <label className="form-label fw-semibold">New password *</label>
          <PasswordField
            label="New password *"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          {/* Confirm Password */}
          <label className="form-label fw-semibold">Confirm password *</label>
          <PasswordField
            label="Confirm password *"
            name="repassword"
            value={form.repassword}
            onChange={handleChange}
          />

          {/* Messages */}
          {error && <div className="text-danger mb-2">{error}</div>}
          {success && <div className="text-success mb-2">{success}</div>}

          <button className="btn btn-purple w-100" type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="text-center mt-3">
            <Link to="/login" className="forgot-link">Back to login</Link>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}
