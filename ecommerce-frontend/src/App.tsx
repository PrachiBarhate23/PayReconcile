import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";

import { DashboardPage } from "./components/pages/DashboardPage";
import { OrdersPage } from "./components/pages/OrdersPage";
import { PaymentsPage } from "./components/pages/PaymentsPage";
import { LedgerPage } from "./components/pages/LedgerPage";
import { ReconciliationPage } from "./components/pages/ReconciliationPage";
import { WebhookLogsPage } from "./components/pages/WebhookLogsPage";

import { LoginPage } from "./components/pages/LoginPage";
import { RegisterPage } from "./components/pages/RegisterPage";
import { ProfilePage } from "./components/pages/ProfilePage";

function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        }
      />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/ledger" element={<LedgerPage />} />
        <Route path="/reconciliation" element={<ReconciliationPage />} />
        <Route path="/webhooks" element={<WebhookLogsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Default */}
      <Route
        path="*"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}
