import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const AdminRoute = ({ children }: Props) => {
  const { role } = useAuth();
  return role !== "admin" ? <Navigate to="/" replace /> : children;
};