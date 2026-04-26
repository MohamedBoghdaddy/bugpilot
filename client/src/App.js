import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import socket from "./socket";
import DashboardLayout from "./components/layout/DashboardLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import BugListPage from "./pages/bugs/BugListPage";
import ReportBugPage from "./pages/bugs/ReportBugPage";
import BugDetailPage from "./pages/bugs/BugDetailPage";
import KanbanPage from "./pages/kanban/KanbanPage";
import MyTasksPage from "./pages/tasks/MyTasksPage";
import ReportsPage from "./pages/reports/ReportsPage";
import UserManagementPage from "./pages/users/UserManagementPage";
import UserStoriesPage from "./pages/stories/UserStoriesPage";
import RolesPermissionsPage from "./pages/roles/RolesPermissionsPage";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/dashboard" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== "ADMIN") return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  useEffect(() => {
    socket.connect();
    socket.on("bugCreated", (payload) => {
      console.info("Real-time bug created:", payload);
    });
    socket.on("bugUpdated", (payload) => {
      console.info("Real-time bug updated:", payload);
    });
    socket.on("commentAdded", (payload) => {
      console.info("Real-time comment added:", payload);
    });

    return () => {
      socket.off("bugCreated");
      socket.off("bugUpdated");
      socket.off("commentAdded");
      socket.disconnect();
    };
  }, []);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<RoleRedirect />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/bugs" element={<BugListPage />} />
                  <Route path="/bugs/new" element={<ReportBugPage />} />
                  <Route path="/bugs/:id" element={<BugDetailPage />} />
                  <Route path="/kanban" element={<KanbanPage />} />
                  <Route path="/tasks" element={<MyTasksPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route
                    path="/users"
                    element={
                      <AdminRoute>
                        <UserManagementPage />
                      </AdminRoute>
                    }
                  />
                  <Route path="/stories" element={<UserStoriesPage />} />
                  <Route
                    path="/roles"
                    element={
                      <AdminRoute>
                        <RolesPermissionsPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
