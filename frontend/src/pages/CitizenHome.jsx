/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Camera,
  MapPin,
  Upload,
  AlertTriangle,
  CheckCircle,
  Navigation,
  ShieldCheck,
  FileText,
  RotateCw,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const API_URL = "http://127.0.0.1:8000";

export default function CitizenHome() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("Initializing...");
  const [nearbyReports, setNearbyReports] = useState([]);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setLocationStatus("Acquiring GPS Signal...");
    if (!navigator.geolocation) {
      setLocationStatus("GPS Not Supported");
      setError("Your browser does not support geolocation.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLocationStatus("GPS Locked");
        fetchNearbyReports(latitude, longitude);
      },
      (err) => {
        console.error("Location access denied", err);
        if (window.location.protocol === "http:") {
          setLocationStatus("GPS Blocked (HTTP)");
          setError(
            "Mobile browsers block GPS on insecure (HTTP) connections. Please use HTTPS (Ngrok) or enable 'Insecure Origins' in Chrome flags."
          );
        } else {
          setLocationStatus("GPS Permission Denied");
          setError("Please allow location access to submit reports.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const fetchNearbyReports = async (lat, lon) => {
    try {
      const res = await axios.get(
        `${API_URL}/public/nearby?lat=${lat}&lon=${lon}`
      );
      setNearbyReports(res.data);
    } catch {
      console.error("Could not fetch nearby reports");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selected) => {
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    const lat = location ? location.latitude : 0.0;
    const lon = location ? location.longitude : 0.0;

    if (!location) {
      if (
        !window.confirm(
          "GPS location is missing. Report will be marked as 'Unknown Location'. Continue?"
        )
      ) {
        return;
      }
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("latitude", lat);
    formData.append("longitude", lon);

    try {
      const res = await axios.post(`${API_URL}/report`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.status === "rejected") {
        setError("No significant issue detected by AI analysis.");
      } else {
        setResult(res.data);
        if (location) fetchNearbyReports(location.latitude, location.longitude);
      }
    } catch (err) {
      setError("Submission failed. Ensure backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#006DB7] text-white pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-[#006DB7] to-[#0B4F83] opacity-90" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full px-4 md:px-12 pt-12 pb-6 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium mb-4 backdrop-blur-sm border border-white/20">
            <ShieldCheck size={14} className="text-blue-200" />
            <span className="tracking-wide uppercase">
              Official Civic Portal
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Report. Resolve. <span className="text-blue-200">Rebuild.</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mb-8 leading-relaxed">
            Directly connect with municipal services to report infrastructure
            issues in your neighborhood. AI-powered for faster resolution.
          </p>

          <div className="inline-flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-full px-5 py-2.5 border border-white/10  transition-all hover:bg-black/30">
            <div
              className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                location ? "bg-green-400" : "bg-amber-400"
              }`}
            />
            <span className="text-sm font-medium">
              {location
                ? `GPS Active: ${location.latitude.toFixed(
                    4
                  )}, ${location.longitude.toFixed(4)}`
                : `${locationStatus}`}
            </span>
            {!location && (
              <button
                onClick={getLocation}
                className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                title="Retry GPS"
              >
                <RotateCw size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-4 md:px-12 -mt-16 pb-12 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8 w-full">
          <div className="lg:col-span-7">
            <Card className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full flex flex-col">
              <div className="p-1.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2 px-6 py-4">
                <div className="p-2 bg-blue-100 text-[#006DB7] rounded-lg">
                  <Camera size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Submit New Report</h2>
                  <p className="text-xs text-gray-500">
                    Photo evidence required for verification
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex-1 flex flex-col items-center justify-center text-center py-6"
                    >
                      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6 ring-8 ring-green-50/50">
                        <CheckCircle className="text-green-600 w-10 h-10" />
                      </div>

                      <h3 className="text-2xl font-bold text-[#333333] mb-2">
                        {result.status === "duplicate"
                          ? "Merged Duplicate"
                          : "Report Submitted"}
                      </h3>
                      <p className="text-gray-500 max-w-xs mx-auto mb-8">
                        Your report ID{" "}
                        <span className="font-mono font-bold text-gray-800">
                          #{result.id.slice(0, 6)}
                        </span>{" "}
                        has been forwarded to the{" "}
                        <span className="font-semibold text-[#006DB7]">
                          {result.assigned_to}
                        </span>
                        .
                      </p>

                      <div className="flex gap-4 w-full max-w-md">
                        <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <span className="block text-xs uppercase text-gray-400 font-bold tracking-wider mb-1">
                            Issue
                          </span>
                          <span className="font-semibold text-gray-800 capitalize">
                            {result.issue}
                          </span>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <span className="block text-xs uppercase text-gray-400 font-bold tracking-wider mb-1">
                            Status
                          </span>
                          <span className="font-semibold text-[#006DB7] capitalize">
                            {result.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-8">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setFile(null);
                            setPreview(null);
                            setResult(null);
                          }}
                        >
                          Submit Another Report
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3">
                          <AlertTriangle
                            size={20}
                            className="shrink-0 mt-0.5"
                          />
                          <span className="font-medium text-sm leading-relaxed">
                            {error}
                          </span>
                        </div>
                      )}

                      {preview ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 group shadow-inner">
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-all flex justify-center">
                            <button
                              onClick={() => {
                                setFile(null);
                                setPreview(null);
                              }}
                              className="bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
                            >
                              <RotateCw size={14} /> Retake Photo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`grid grid-cols-2 gap-4 ${
                            dragActive ? "opacity-50" : ""
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <div className="relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#006DB7] hover:bg-blue-50/50 transition-all bg-gray-50/50 aspect-square flex flex-col items-center justify-center text-center p-4">
                            <div className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-[#006DB7] group-hover:scale-110 transition-transform">
                              <Camera size={28} />
                            </div>
                            <span className="font-bold text-gray-700">
                              Take Photo
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                              Open Camera
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </div>

                          <div className="relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#006DB7] hover:bg-blue-50/50 transition-all bg-gray-50/50 aspect-square flex flex-col items-center justify-center text-center p-4">
                            <div className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-[#006DB7] group-hover:scale-110 transition-transform">
                              <Upload size={28} />
                            </div>
                            <span className="font-bold text-gray-700">
                              Upload File
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                              Drag & Drop
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={handleSubmit}
                        disabled={!file || loading}
                        isLoading={loading}
                        size="lg"
                        className="w-full shadow-lg shadow-blue-500/20 group"
                      >
                        {!loading && (
                          <>
                            Submit Report{" "}
                            <ArrowRight
                              size={18}
                              className="ml-2 group-hover:translate-x-1 transition-transform"
                            />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-6 sticky top-6">
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-[#006DB7]" /> Nearby Reports
              </h3>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {nearbyReports.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm font-medium">
                      No active reports found in your immediate vicinity.
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Be the first to report an issue!
                    </p>
                  </div>
                ) : (
                  nearbyReports.map((report) => (
                    <div
                      key={report.id}
                      className="group p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-blue-100 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-800 capitalize flex items-center gap-2">
                          {report.category}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            report.status === "Fixed"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : report.status === "Fixing"
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                        <MapPin size={10} />
                        <span className="truncate">
                          {report.city || "Unknown Location"}
                        </span>
                        <span className="mx-1">•</span>
                        <span className="font-mono text-[10px] bg-gray-100 px-1 rounded">
                          #{report.id.slice(0, 4)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-linear-to-br from-[#006DB7] to-[#0B4F83] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <ShieldCheck size={28} className="mb-3 text-blue-200" />
              <h4 className="font-bold text-lg mb-2">Citizen's Charter</h4>
              <p className="text-blue-100 text-sm leading-relaxed opacity-90">
                Our commitment is to resolve 90% of verified critical
                infrastructure issues within 48 hours. Thank you for being a
                responsible citizen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
