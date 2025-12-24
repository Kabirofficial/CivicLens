import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FileText, Users, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../components/ui/toast-context";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const role = localStorage.getItem("role");
  const department = localStorage.getItem("department");

  const userDept =
    department || (role === "super_admin" ? "Central Command" : "Admin");

  const handleLogout = () => {
    localStorage.clear();
    toast.info("Logged out successfully.");
    navigate("/admin");
  };

  const navItems = [
    { name: "Reports", path: "/dashboard/reports", icon: FileText, end: false },
    { name: "Team", path: "/dashboard/users", icon: Users, end: false },
  ];

  return (
    <div className="flex h-screen bg-[#F5F5F5] overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 bg-[#006DB7]/95 backdrop-blur-xl text-white w-64 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:relative md:translate-x-0 z-50 shadow-2xl overflow-hidden flex flex-col`}
      >
        <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />

        <div className="p-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg shadow-lg">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CivicLens</h1>
              <p className="text-blue-200 text-xs tracking-wide uppercase">
                Admin Portal
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 relative z-10">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? "bg-white text-[#006DB7] shadow-lg translate-x-1"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10 bg-[#005a9c] z-10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck size={20} className="text-blue-100" />
            </div>
            <div>
              <p className="text-sm font-semibold truncate w-32">
                {userDept || "Admin"}
              </p>
              <div className="flex items-center gap-1 text-xs text-green-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />{" "}
                Online
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-lg py-2 transition-colors text-sm font-medium"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center px-4 justify-between md:justify-end shrink-0 sticky top-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-gray-600 hover:text-[#006DB7] transition-colors"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#333333]">
                {role === "super_admin" ? "Central Command" : department}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                {role === "super_admin" ? "Administrator" : "Dept. Head"}
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 text-[#006DB7]">
              <ShieldCheck size={20} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
