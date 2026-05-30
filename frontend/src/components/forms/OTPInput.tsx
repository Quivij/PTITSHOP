import React, { useRef } from "react";

type OTPInputProps = {
  length: number;
  value: string[];
  onChange: (val: string[]) => void;
};

export default function OTPInput({ length, value, onChange }: OTPInputProps) {
  const refs = useRef<HTMLInputElement[]>([]);

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = [...value];
    newValue[i] = e.target.value;
    onChange(newValue);

    if (e.target.value && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <div className="d-flex gap-2 justify-content-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          className="form-control text-center"
          style={{ width: 48 }}
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
        />
      ))}
    </div>
  );
}
