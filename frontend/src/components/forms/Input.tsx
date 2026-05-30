import React from "react";

export type InputProps = {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
};

export default function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  disabled = false,
  autoComplete,
}: InputProps) {
  const inputEl = (
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder || label}
      disabled={disabled}
      autoComplete={autoComplete}
      className={`form-control ${error ? "is-invalid" : ""}`}
    />
  );

  if (!label) {
    return (
      <div className="mb-3">
        {inputEl}
        {error && <div className="invalid-feedback d-block">{error}</div>}
      </div>
    );
  }

  return (
    <div className="form-floating mb-3">
      {inputEl}
      <label htmlFor={name}>{label}</label>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}
