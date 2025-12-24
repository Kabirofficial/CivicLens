import { Link, useLocation } from "react-router-dom";
import { Camera, ShieldCheck, LogOut, LayoutDashboard } from "lucide-react";
import Button from "./ui/Button";

export default function Layout({ children }) {
  const location = useLocation();
  const isAdmin =
    location.pathname.includes("/admin") ||
    location.pathname.includes("/dashboard");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#333333] font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#006DB7] shadow-md text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-90 transition-opacity"
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold">CivicLens</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAdmin && localStorage.getItem("token") && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0B4F83] rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            {!isAdmin && (
              <Link
                to={localStorage.getItem("token") ? "/dashboard" : "/admin"}
              >
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0B4F83] rounded-md transition-colors">
                  {localStorage.getItem("token") ? (
                    <>
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </>
                  )}
                </button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-8 px-4 sm:px-6 w-full">{children}</main>

      <footer className="bg-[#0B4F83] text-white py-6 text-center text-sm">
        <p>
          &copy; {new Date().getFullYear()} Official Civic Reporting Portal. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}
