import "./Body.css";
import React from "react";
import { useLocation } from "react-router-dom";

interface BodyProps {
  children: React.ReactNode;
}

export default function Body({ children }: BodyProps) {
  const location = useLocation();
  const isHomePage = location.pathname === "/home";

  if (isHomePage) {
    return <main className="body-container">{children}</main>;
  }

  return (
    <main className="body-container">
      <div className="container py-4 h-100">{children}</div>
    </main>
  );
}

