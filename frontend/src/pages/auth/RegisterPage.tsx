import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "../../components/forms/TextField.tsx";
import PasswordField from "../../components/forms/PasswordField.tsx";
import DateField from "../../components/forms/DateField.tsx";
import AuthCard from "../../components/layout/AuthCard.tsx";
import "../../components/layout/Auth.css";

export default function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    repassword: "",
    dateOfBirth: "",
    gender: "male",
    address: "",
    phoneNumber: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validateForm = () => {
    if (!form.fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!form.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!form.password) {
      setError("Password is required");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (form.password !== form.repassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!form.dateOfBirth) {
      setError("Date of birth is required");
      return false;
    }
    if (!form.address.trim()) {
      setError("Address is required");
      return false;
    }
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Gọi API đăng ký để kiểm tra tài khoản đã tồn tại hay có lỗi gì không
      const response = await fetch("http://localhost:6969/v1/api/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          fullName: form.fullName,
          username: form.username,
          email: form.email,
          password: form.password,
          phoneNumber: form.phoneNumber || null,
          gender: form.gender === "male",
          dateOfBirth: form.dateOfBirth,
          address: form.address,
          avt: null, // Add missing field that backend expects
        }),
      });

      // Check if response is JSON (to handle HTML responses from 404 pages)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        setError("Server is not responding correctly. Please check if the backend server is running.");
        return;
      }

      const data = await response.json();
      console.log("Backend response:", data); // Add logging to see the exact error

      if (!response.ok) {
        // Xử lý lỗi từ server
        if (response.status === 400) {
          console.log("400 error details:", data); // Log the specific error
          if (data.errors && Array.isArray(data.errors)) {
            // Display specific validation errors
            console.log("Validation errors:", data.errors); // Log the specific validation errors
            const errorMessages = data.errors.map((err: any) => err.message || err).join(", ");
            setError(`Validation failed: ${errorMessages}`);
          } else {
            setError(data.message || "Registration failed - please check your information");
          }
        } else if (response.status === 409) {
          setError("Username or email already exists");
        } else if (response.status === 404) {
          setError("Registration endpoint not found. Please check if the backend server is running.");
        } else {
          setError(data.message || "Registration failed due to server error");
        }
        return;
      }

      if (!data.success) {
        setError(data.message || "Registration failed");
        return;
      }

      // Nếu đăng ký thành công -> chuyển qua trang nhập OTP
      console.log("Registration successful:", data);
      nav("/verify-otp?email=" + encodeURIComponent(form.email));
      
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Cannot connect to server. Please check your internet connection.");
      } else {
        setError("Registration failed due to network error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthCard className="auth-card">
        <h3 className="text-center mb-1 auth-title">
          <Link to="/login" className="inactive">
            Login
          </Link>
          {" | "}
          <span className="active">Register</span>
        </h3>

        <p className="text-center auth-subtitle mb-4">
          Create a new account to start shopping and selling with us.
        </p>

        <form onSubmit={submit}>
          <TextField
            label="Full Name *"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
          />
          <TextField
            label="Username *"
            name="username"
            value={form.username}
            onChange={handleChange}
          />

          <div className="row">
            <div className="col-md-6">
              <label
                className="form-label fw-semibold mb-1"
                htmlFor="dateOfBirth"
              >
                Date of Birth *
              </label>
              <DateField
                label="Date of Birth"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleDateChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold d-block">Gender</label>
              <div className="d-flex gap-4 align-items-center">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="genderMale"
                    name="gender"
                    value="male"
                    checked={form.gender === "male"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="genderMale">
                    Male
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="genderFemale"
                    name="gender"
                    value="female"
                    checked={form.gender === "female"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="genderFemale">
                    Female
                  </label>
                </div>
              </div>
            </div>
          </div>

          <TextField
            label="Email address *"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            value={form.phoneNumber}
            onChange={handleChange}
          />
          <TextField
            label="Address *"
            name="address"
            value={form.address}
            onChange={handleChange}
          />

          <PasswordField
            label="Password *"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          <PasswordField
            label="Re-password *"
            name="repassword"
            value={form.repassword}
            onChange={handleChange}
          />

          {error && <div className="text-danger mb-2">{error}</div>}

          <button
            className="btn btn-purple w-100"
            type="submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
