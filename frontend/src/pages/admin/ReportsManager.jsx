import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useToast } from "../../components/ui/toast-context";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  ExternalLink,
  ChevronDown,
  LayoutList,
  RefreshCw,
} from "lucide-react";
import Card from "../../components/ui/Card";

const API_URL = "http://127.0.0.1:8000";

export default function ReportsManager() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();
  const token = localStorage.getItem("token");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch {
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(
        `${API_URL}/admin/report/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      toast.success("Report status updated.");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      filterStatus === "All" || report.status === filterStatus;
    const matchesCategory =
      filterCategory === "All" || report.category === filterCategory;
    const matchesSearch =
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.city &&
        report.city.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const categories = ["All", ...new Set(reports.map((r) => r.category))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#333333] tracking-tight">
            Reports Management
          </h2>
          <p className="text-gray-500 text-sm">
            Review and update incoming citizen reports.
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 text-sm text-[#006DB7] hover:bg-blue-50 px-3 py-2 rounded-md transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      <Card className="p-4 bg-white border border-gray-200 shadow-sm rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <input
            type="text"
            placeholder="Search by Report ID or City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#006DB7] focus:ring-1 focus:ring-[#006DB7]"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg text-sm appearance-none focus:outline-none focus:border-[#006DB7]"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Pending</option>
            <option value="Fixing">In Progress</option>
            <option value="Fixed">Resolved</option>
            <option value="False Alarm">Invalid</option>
          </select>
          <Filter className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg text-sm appearance-none focus:outline-none focus:border-[#006DB7]"
          >
            <option value="All">All Categories</option>
            {categories
              .filter((c) => c !== "All")
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
          <LayoutList className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </Card>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No reports match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600">ID</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Category
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Location
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-gray-500">
                      #{report.id.slice(0, 6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 capitalize font-medium text-[#333333]">
                      {report.category}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[#006DB7] hover:underline"
                      >
                        <MapPin size={14} />
                        {report.city || "View Map"}
                        <ExternalLink size={10} />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {new Date(report.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative w-40">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                            report.status === "Fixed"
                              ? "bg-green-50 text-green-700 border-green-200 shadow-sm"
                              : report.status === "Fixing"
                              ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                              : report.status === "False Alarm"
                              ? "bg-gray-50 text-gray-700 border-gray-200"
                              : "bg-amber-50 text-amber-700 border-amber-200 shadow-sm"
                          }`}
                        >
                          {report.status}
                        </span>
                        <select
                          value={report.status}
                          onChange={(e) =>
                            handleStatusChange(report.id, e.target.value)
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                          <option value="Submitted">Pending</option>
                          <option value="Fixing">In Progress</option>
                          <option value="Fixed">Resolved</option>
                          <option value="False Alarm">Invalid</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2 w-3 h-3 text-gray-500 pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
