/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  MapPin,
  Clock,
  Shield,
  ChevronDown,
  LayoutDashboard,
  ExternalLink,
  Trash2,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useToast } from "../components/ui/toast-context";

const API_URL = "http://127.0.0.1:8000";

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "dept_admin",
    department: "Roads Dept",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const department = localStorage.getItem("department");
  const token = localStorage.getItem("token");
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users");
    }
  }, [token]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate("/admin");
        }
      }
    };

    fetchReports();
    if (showUserManagement) {
      fetchUsers();
    }
  }, [token, navigate, showUserManagement]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(
        `${API_URL}/admin/report/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports(
        reports.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      toast.success("Report status updated.");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/create-user`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("New personnel added successfully.");
      setNewUser({
        username: "",
        password: "",
        role: "dept_admin",
        department: "Roads Dept",
      });
      fetchUsers();
    } catch {
      toast.error("Failed to create user. ID may exist.");
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;
    try {
      await axios.delete(`${API_URL}/admin/user/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u.username !== username));
      toast.info("User deleted.");
    } catch {
      toast.error("Failed to delete user.");
    }
  };

  const startEditing = (user) => {
    setEditingUser(user.username);
    setEditForm({ ...user, password: "" });
  };

  const handleUpdateUser = async () => {
    try {
      const updateData = {};
      if (editForm.password) updateData.password = editForm.password;
      if (
        editForm.department !==
        users.find((u) => u.username === editingUser).department
      )
        updateData.department = editForm.department;

      await axios.patch(`${API_URL}/admin/user/${editingUser}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingUser(null);
      fetchUsers();
      toast.success("User updated successfully.");
    } catch {
      toast.error("Failed to update user.");
    }
  };

  return (
    <div className="space-y-8 pb-12 px-4 md:px-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-6 pt-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#006DB7]">
            <LayoutDashboard size={20} />
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Official Administration
            </h2>
          </div>
          <h1 className="text-3xl font-bold text-[#333333] tracking-tight">
            Department Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {role === "super_admin"
              ? "Central Command // Level 1 Access"
              : `${department} // Regional Access`}
          </p>
        </div>

        {role === "super_admin" && (
          <Button
            onClick={() => setShowUserManagement(!showUserManagement)}
            className={`bg-[#006DB7] text-white hover:bg-[#0B4F83] ${
              showUserManagement ? "bg-[#0B4F83]" : ""
            }`}
          >
            <Users className="w-4 h-4" /> Manage Team
          </Button>
        )}
      </header>

      <AnimatePresence>
        {showUserManagement && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8 mt-2">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* CREATE USER FORM */}
                <div className="border-r border-gray-100 pr-8">
                  <h3 className="text-[#333333] font-bold text-lg mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Shield size={18} className="text-[#006DB7]" /> Add New
                    Personnel
                  </h3>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">
                        Employee ID
                      </label>
                      <input
                        className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded text-sm outline-none focus:border-[#006DB7]"
                        value={newUser.username}
                        onChange={(e) =>
                          setNewUser({ ...newUser, username: e.target.value })
                        }
                        placeholder="EMP-001"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">
                        Password
                      </label>
                      <input
                        className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded text-sm outline-none focus:border-[#006DB7]"
                        type="password"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                        placeholder="••••••"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">
                        Department
                      </label>
                      <div className="relative">
                        <select
                          className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded text-sm outline-none appearance-none"
                          value={newUser.department}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              department: e.target.value,
                            })
                          }
                        >
                          <option value="Roads Dept">Roads Dept</option>
                          <option value="Sanitation Dept">
                            Sanitation Dept
                          </option>
                          <option value="Parks Dept">Parks Dept</option>
                          <option value="Water Dept">Water Dept</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                    <Button type="submit" size="sm" className="w-full mt-4">
                      Create User
                    </Button>
                  </form>
                </div>

                {/* USER LIST */}
                <div>
                  <h3 className="text-[#333333] font-bold text-lg mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Users size={18} className="text-[#006DB7]" /> Existing
                    Personnel
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {users.map((user) => (
                      <div
                        key={user.username}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100"
                      >
                        {editingUser === user.username ? (
                          <div className="flex-1 grid grid-cols-2 gap-2 mr-2">
                            <input
                              className="bg-white border p-1 rounded text-xs"
                              placeholder="New Pass (Opt)"
                              type="password"
                              value={editForm.password}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  password: e.target.value,
                                })
                              }
                            />
                            <select
                              className="bg-white border p-1 rounded text-xs"
                              value={editForm.department}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  department: e.target.value,
                                })
                              }
                            >
                              <option value="Roads Dept">Roads</option>
                              <option value="Sanitation Dept">
                                Sanitation
                              </option>
                              <option value="Parks Dept">Parks</option>
                              <option value="Water Dept">Water</option>
                            </select>
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold text-sm text-gray-800">
                              {user.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.department || "Super Admin"}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {editingUser === user.username ? (
                            <>
                              <button
                                onClick={handleUpdateUser}
                                className="text-green-600 hover:bg-green-50 p-1 rounded"
                              >
                                <Save size={14} />
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="text-gray-500 hover:bg-gray-100 p-1 rounded"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              {user.role !== "super_admin" && (
                                <>
                                  <button
                                    onClick={() => startEditing(user)}
                                    className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteUser(user.username)
                                    }
                                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="group bg-white border border-gray-200 hover:border-[#006DB7]/50 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg overflow-hidden flex flex-col"
          >
            <div className="p-5 h-full flex flex-col">
              <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-bold capitalize ${
                      report.category === "pothole"
                        ? "text-red-700"
                        : "text-[#006DB7]"
                    }`}
                  >
                    {report.category}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Category
                  </span>
                </div>
                <div className="bg-gray-100 px-2 py-1 rounded">
                  <span className="text-xs text-gray-600 font-mono">
                    #{report.id.slice(0, 6).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 items-start group/location cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded transition-colors"
                >
                  <MapPin className="mt-0.5 w-4 h-4 text-gray-400 group-hover/location:text-[#006DB7]" />
                  <div className="flex-1">
                    <p className="text-base font-semibold text-[#333333] leading-tight group-hover/location:text-[#006DB7] flex items-center gap-1.5">
                      {report.city || "Unknown Location"}
                      <ExternalLink
                        size={12}
                        className="opacity-0 group-hover/location:opacity-100 transition-opacity"
                      />
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">
                      {report.latitude.toFixed(5)},{" "}
                      {report.longitude.toFixed(5)}
                    </p>
                  </div>
                </a>

                <div className="flex gap-3 items-start">
                  <Clock className="mt-0.5 w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-[#333333]">
                      {new Date(report.timestamp).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                  Current Status
                </label>
                <div className="relative">
                  <select
                    value={report.status}
                    onChange={(e) =>
                      handleStatusChange(report.id, e.target.value)
                    }
                    className={`w-full appearance-none p-2.5 pl-3 rounded border text-sm font-semibold outline-none cursor-pointer transition-colors ${
                      report.status === "Fixed"
                        ? "bg-green-50 text-green-700 border-green-200 hover:border-green-300"
                        : report.status === "Fixing"
                        ? "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300"
                        : "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300"
                    }`}
                  >
                    <option value="Submitted">Status: Pending Review</option>
                    <option value="Fixing">Status: In Progress</option>
                    <option value="Fixed">Status: Resolved</option>
                    <option value="False Alarm">Status: Invalid Report</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </Card>
        ))}

        {reports.length === 0 && (
          <div className="col-span-full py-24 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <LayoutDashboard size={40} className="mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-500">
              No reports found in the system.
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
