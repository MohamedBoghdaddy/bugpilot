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
import ProfilePage from "./pages/profile/ProfilePage";
import SettingsPage from "./pages/settings/SettingsPage";

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

function RoleProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const userRole = user.role?.toUpperCase();
  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  return children;
}

function App() {
  useEffect(() => {
    // Guard: only connect if not already connected (prevents React StrictMode duplicate connections)
    if (!socket.connected) {
      socket.connect();
    }

    const onBugCreated = () => {}; // placeholder — components subscribe to specific events
    const onBugUpdated = () => {};
    const onCommentAdded = () => {};

    socket.on("bugCreated", onBugCreated);
    socket.on("bugUpdated", onBugUpdated);
    socket.on("commentAdded", onCommentAdded);

    return () => {
      // Remove listeners only — do NOT disconnect here so StrictMode re-mount doesn't create
      // a second connection. The socket stays alive for the session lifetime.
      socket.off("bugCreated", onBugCreated);
      socket.off("bugUpdated", onBugUpdated);
      socket.off("commentAdded", onCommentAdded);
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
                  <Route
                    path="/kanban"
                    element={
                      <RoleProtectedRoute
                        allowedRoles={["ADMIN", "TESTER", "DEVELOPER"]}
                      >
                        <KanbanPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/tasks"
                    element={
                      <RoleProtectedRoute
                        allowedRoles={["ADMIN", "TESTER", "DEVELOPER"]}
                      >
                        <MyTasksPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route
                    path="/users"
                    element={
                      <RoleProtectedRoute allowedRoles={["ADMIN"]}>
                        <UserManagementPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route path="/stories" element={<UserStoriesPage />} />
                  <Route
                    path="/roles"
                    element={
                      <RoleProtectedRoute allowedRoles={["ADMIN"]}>
                        <RolesPermissionsPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
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
