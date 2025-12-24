import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Lock,
  User,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import Button from "../components/ui/Button";

const API_URL = "http://127.0.0.1:8000";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const res = await axios.post(`${API_URL}/token`, formData);

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("department", res.data.department || "");

      navigate("/dashboard");
    } catch {
      setError("Access denied. Verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white lg:overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#006DB7] flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-linear-to-br from-[#006DB7] via-[#0B4F83] to-[#003366] opacity-90" />

        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-8 h-8 object-contain brightness-0 invert"
              />
            </div>
            <span className="text-white font-bold tracking-wide text-lg">
              CivicLens
            </span>
          </div>

          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Secure Infrastructure
            <br />
            <span className="text-blue-200">Management System</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed">
            Authorized personnel portal for monitoring, analyzing, and resolving
            civic infrastructure reports in real-time.
          </p>
        </div>

        <div className="relative z-10 flex gap-4 text-xs text-blue-200 font-medium tracking-wider uppercase">
          <span>• Encrypted Connection</span>
          <span>• 24/7 Monitoring</span>
          <span>• Official Use Only</span>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16 relative">
        <div className="w-full max-w-xl space-y-8">
          <div className="text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="bg-[#006DB7]/10 p-3 rounded-xl inline-block">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#333333] tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-500 mt-2">
              Please enter your credentials to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3 text-red-700 text-sm animate-shake">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Official ID
              </label>
              <div className="relative group">
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pl-10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006DB7]/20 focus:border-[#006DB7] transition-all"
                  placeholder="admin@civic.gov"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-[#006DB7] transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pl-10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006DB7]/20 focus:border-[#006DB7] transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-[#006DB7] transition-colors" />
              </div>
            </div>

            <Button
              className="w-full py-3 text-base flex justify-center items-center gap-2 group"
              size="lg"
              isLoading={loading}
              type="submit"
            >
              Sign In to Portal{" "}
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </form>

          <div className="pt-6 text-center">
            <p className="text-xs text-gray-400">
              © 2025 CivicLens Municipal System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
