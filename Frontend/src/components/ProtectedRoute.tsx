import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Role } from "../config/roles";
import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = {
  allowedRoles?: Role[];
  children?: React.ReactNode;
};

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate replace to="/" />;
  }

  return children ? <>{children}</> : <Outlet />;
}
