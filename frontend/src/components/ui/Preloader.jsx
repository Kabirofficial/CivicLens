/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

export default function Preloader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-white"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border-4 border-gray-100 border-t-[#006DB7]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/preloader.png"
            alt="CivicLens Logo"
            className="w-12 h-12 object-contain"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-center"
      >
        <h1 className="text-xl font-bold text-[#006DB7] tracking-tight">
          CivicLens
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
          Official Portal
        </p>
      </motion.div>
    </motion.div>
  );
}
