import { useNavigate } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-blue-50 p-6 rounded-full mb-6">
        <AlertCircle className="w-12 h-12 text-[#006DB7]" />
      </div>

      <h1 className="text-4xl font-bold text-[#333333] mb-2 tracking-tight">
        404 - Page Not Found
      </h1>
      <p className="text-gray-500 max-w-md mb-8">
        The requested resource could not be located on this server. Please check
        the URL or return to the main portal.
      </p>

      <Button onClick={() => navigate("/")} className="flex items-center gap-2">
        <Home className="w-4 h-4" /> Return to Home
      </Button>
    </div>
  );
}
