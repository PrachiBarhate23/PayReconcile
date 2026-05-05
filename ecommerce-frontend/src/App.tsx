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
import { LandingPage } from "./components/pages/LandingPage";
import { ForgotPasswordPage } from "./components/pages/ForgotPasswordPage";
import { UserManagementPage } from "./components/pages/UserManagementPage";
import { SettlementReportsPage } from "./components/pages/SettlementReportsPage";
import { ChargebackManagementPage } from "./components/pages/ChargebackManagementPage";
import { AccountBalancePage } from "./components/pages/AccountBalancePage";
import { TransactionExportPage } from "./components/pages/TransactionExportPage";

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

function AdminRoute() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "ROLE_ADMIN";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
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
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />
        }
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/ledger" element={<LedgerPage />} />
        <Route path="/reconciliation" element={<ReconciliationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/balance" element={<AccountBalancePage />} />
        <Route path="/export" element={<TransactionExportPage />} />
      </Route>

      {/* Admin-Only Routes */}
      <Route element={<AdminRoute />}>
        <Route path="/webhooks" element={<WebhookLogsPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/settlements" element={<SettlementReportsPage />} />
        <Route path="/chargebacks" element={<ChargebackManagementPage />} />
      </Route>

      {/* Default Route */}
      <Route
        path="*"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}
