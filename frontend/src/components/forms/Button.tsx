import React from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "outline" | "purple";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export default function Button({
  children,
  variant = "purple",
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const sizeCls = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
  const variantCls =
    variant === "purple"
      ? "btn-purple"
      : variant === "primary"
      ? "btn btn-primary"
      : variant === "secondary"
      ? "btn btn-secondary"
      : variant === "danger"
      ? "btn btn-danger"
      : "btn btn-outline-secondary";

  return (
    <button
      className={`${variantCls} ${sizeCls} ${className}`.trim()}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
