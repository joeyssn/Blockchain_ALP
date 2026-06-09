import { useState } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { ErrorMessage } from "./components/ErrorMessage.jsx";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppRoutes } from "./routes/AppRoutes";

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { authError, setAuthError } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return <AppRoutes />;
  }

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 lg:p-6">
            <div className="mx-auto grid max-w-7xl gap-6">
              <ErrorMessage message={authError} onDismiss={() => setAuthError("")} />
              <AppRoutes />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
