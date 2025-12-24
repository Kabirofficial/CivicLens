/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export default function Card({ className, children, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
