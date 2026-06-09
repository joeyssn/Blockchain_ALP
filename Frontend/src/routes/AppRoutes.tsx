import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Role } from "../config/roles";
import { AdminDashboard } from "../pages/AdminDashboard";
import { CompanyDashboard } from "../pages/CompanyDashboard";
import { Home } from "../pages/Home.jsx";
import { Login } from "../pages/Login";
import { Profile } from "../pages/Profile";
import { VerifyShoe } from "../pages/VerifyShoe";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Login />} path="/login" />
      <Route element={<ProtectedRoute />}>
        <Route element={<Home />} path="/" />
        <Route element={<VerifyShoe />} path="/verify" />
        <Route element={<Profile />} path="/profile" />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={[Role.COMPANY, Role.ADMIN]} />}>
        <Route element={<CompanyDashboard />} path="/company-dashboard" />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
        <Route element={<AdminDashboard />} path="/admin-dashboard" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="/company" />
      <Route element={<Navigate replace to="/" />} path="/admin" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
