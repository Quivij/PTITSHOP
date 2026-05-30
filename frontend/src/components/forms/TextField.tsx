import React from "react";

type Props = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  error?: string;
};

export default function TextField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
}: Props) {
  return (
    <div className="form-floating mb-3">
      <input
        className={`form-control rounded-3 ${error ? "is-invalid" : ""}`}
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
      />
      <label htmlFor={name}>{label}</label>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}
