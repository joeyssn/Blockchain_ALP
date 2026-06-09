import React from "react";
import { Role } from "../config/roles";
import { useAuth } from "../context/AuthContext";

type RoleGuardProps = {
  allowedRoles: Role[];
  children: React.ReactNode;
};

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
