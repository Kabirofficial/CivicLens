/* eslint-disable no-unused-vars */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { ToastContext } from "./toast-context";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (id, type, message) => {
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        removeToast(id);
      }, 3000);
    },
    [removeToast]
  );

  const contextValue = useMemo(
    () => ({
      toast: {
        success: (message) => addToast(Date.now(), "success", message),
        error: (message) => addToast(Date.now(), "error", message),
        info: (message) => addToast(Date.now(), "info", message),
      },
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-4 right-4 z-100 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} {...t} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ type, message, onClose }) {
  const variants = {
    initial: { opacity: 0, y: 20, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, x: 20, scale: 0.9 },
  };

  const styles = {
    success: "bg-white border-l-4 border-green-500 text-gray-800",
    error: "bg-white border-l-4 border-red-500 text-gray-800",
    info: "bg-white border-l-4 border-[#006DB7] text-gray-800",
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-[#006DB7]" />,
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={`pointer-events-auto min-w-[300px] max-w-md p-4 rounded shadow-lg border border-gray-100 flex items-start gap-3 ${styles[type]}`}
    >
      <div className="mt-0.5 shrink-0">{icons[type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
