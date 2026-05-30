// src/components/layout/AdminBody.tsx
import React from "react";
import { useLocation } from "react-router-dom";
import "./AdminBody.css";

interface AdminBodyProps {
  children: React.ReactNode;
}

export default function AdminBody({ children }: AdminBodyProps) {
  const location = useLocation();
  const isDashboard = location.pathname === "/admin/dashboard";

  return (
    <main className={`admin-body ${isDashboard ? "dashboard" : ""}`}>
      <div className="admin-content">{children}</div>
    </main>
  );
}
