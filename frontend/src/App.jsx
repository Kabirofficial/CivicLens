import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import CitizenHome from "./pages/CitizenHome";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import ReportsManager from "./pages/admin/ReportsManager";
import UserManager from "./pages/admin/UserManager";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Preloader from "./components/ui/Preloader";
import { ToastProvider } from "./components/ui/Toast";

const isAuthenticated = () => !!localStorage.getItem("token");

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) return <Navigate to="/admin" />;
  return children;
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <ToastProvider>
        <AnimatePresence>
          {loading && <Preloader key="preloader" />}
        </AnimatePresence>

        {!loading && (
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <CitizenHome />
                </Layout>
              }
            />
            <Route
              path="/admin"
              element={
                <Layout>
                  <AdminLogin />
                </Layout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="reports" replace />} />
              <Route path="reports" element={<ReportsManager />} />
              <Route path="users" element={<UserManager />} />
            </Route>
            <Route
              path="*"
              element={
                <Layout>
                  <NotFound />
                </Layout>
              }
            />
          </Routes>
        )}
      </ToastProvider>
    </Router>
  );
}

export default App;
