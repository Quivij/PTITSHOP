import React, { useState } from "react";
import { Eye, EyeSlash } from "react-bootstrap-icons"; 

type Props = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
};

export default function PasswordField({
  label,
  name,
  value,
  onChange,
  error,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="mb-3 position-relative">
      <div className="input-group">
        <input
          id={name}
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className={`form-control ${error ? "is-invalid" : ""}`}
          placeholder={label}
        />
        <span
          className="input-group-text bg-transparent border-start-0"
          style={{ cursor: "pointer" }}
          onClick={() => setShow((s) => !s)}
        >
          {show ? <EyeSlash /> : <Eye />}
        </span>
        {error && <div className="invalid-feedback d-block">{error}</div>}
      </div>
    </div>
  );
}
