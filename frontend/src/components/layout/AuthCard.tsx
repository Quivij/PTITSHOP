import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function AuthCard({ children, className = "", style }: Props) {
  return (
    <div className="auth-wrapper">
      <div className={`auth-card ${className}`} style={style}>
        {children}
      </div>
    </div>
  );
}
