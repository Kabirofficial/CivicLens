import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useToast } from "../../components/ui/toast-context";
import {
  Users,
  Shield,
  Pencil,
  Trash2,
  Save,
  X,
  ChevronDown,
} from "lucide-react";
import Button from "../../components/ui/Button";

const API_URL = "http://127.0.0.1:8000";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "dept_admin",
    department: "Roads Dept",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { toast } = useToast();
  const token = localStorage.getItem("token");

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users.");
    }
  }, [token, toast]);

  useEffect(() => {
    const initUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch {
        toast.error("Failed to load users.");
      }
    };
    initUsers();
  }, [token, toast]);

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#333333] tracking-tight">
          Personnel Management
        </h2>
        <p className="text-gray-500 text-sm">
          Manage system access, departments, and roles.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h3 className="text-[#333333] font-bold text-lg mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Shield size={18} className="text-[#006DB7]" /> Add New Personnel
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
                  <option value="Sanitation Dept">Sanitation Dept</option>
                  <option value="Parks Dept">Parks Dept</option>
                  <option value="Water Dept">Water Dept</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <Button type="submit" size="sm" className="w-full mt-4">
              <Users size={16} /> Create User Account
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-[#333333] font-bold text-lg flex items-center gap-2">
              <Users size={18} className="text-[#006DB7]" /> Active Personnel
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">User / ID</th>
                  <th className="px-6 py-3 font-semibold">Department</th>
                  <th className="px-6 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.username} className="group hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {editingUser === user.username ? (
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-gray-400">
                            {user.username}
                          </span>
                          <input
                            type="password"
                            placeholder="New Password"
                            className="text-xs border rounded p-1"
                            value={editForm.password}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                password: e.target.value,
                              })
                            }
                          />
                        </div>
                      ) : (
                        <span className="font-bold text-gray-800">
                          {user.username}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingUser === user.username ? (
                        <select
                          className="bg-white border p-1 rounded text-xs w-full"
                          value={editForm.department}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
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
                      ) : (
                        <span className="inline-block px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold">
                          {user.department || "Super Admin"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingUser === user.username ? (
                          <>
                            <button
                              onClick={handleUpdateUser}
                              className="text-green-600 hover:bg-green-100 p-1.5 rounded transition-colors"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="text-gray-500 hover:bg-gray-100 p-1.5 rounded transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            {user.role !== "super_admin" && (
                              <>
                                <button
                                  onClick={() => startEditing(user)}
                                  className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteUser(user.username)
                                  }
                                  className="text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
