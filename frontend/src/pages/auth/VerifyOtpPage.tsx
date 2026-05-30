import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import OTPInput from "../../components/forms/OTPInput.tsx";
import AuthCard from "../../components/layout/AuthCard.tsx";
import TextField from "../../components/forms/TextField.tsx";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:6969/v1/api/verify-otp", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          email, 
          otp: otpCode 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          setError(data.message || "Invalid OTP code");
        } else {
          setError(data.message || "OTP verification failed");
        }
        return;
      }

      if (!data.success) {
        setError(data.message || "OTP verification failed");
        return;
      }

      setSuccess("OTP verified successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      console.error("OTP verification error:", err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Cannot connect to server. Please check your internet connection.");
      } else {
        setError("OTP verification failed due to network error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError("Email is required to resend OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:6969/v1/api/resend-otp", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("OTP has been resent to your email");
        setOtp(Array(6).fill("")); // Reset OTP input
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (err: any) {
      console.error("Resend OTP error:", err);
      setError("Failed to resend OTP due to network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthCard className="auth-card">
        <h4 className="text-center mb-3">Verify OTP</h4>
        <p className="text-center text-muted mb-3">
          Enter the 6-digit code sent to {email}
        </p>
        <form onSubmit={submit}>
          <TextField
            label="Email address"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="mb-3">
            <label className="form-label">Enter 6-digit code</label>
            <OTPInput length={6} value={otp} onChange={setOtp} />
          </div>

          {error && <div className="text-danger mb-2">{error}</div>}
          {success && <div className="text-success mb-2">{success}</div>}

          <button
            className="btn btn-purple w-100 mb-2"
            type="submit"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={handleResendOTP}
            disabled={loading}
          >
            Resend OTP
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
