/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export default function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  ...props
}) {
  const variants = {
    // Primary: Gov Blue background, White text
    primary:
      "bg-[#006DB7] hover:bg-[#0B4F83] text-white shadow-md hover:shadow-lg",

    // Secondary: Dark Cerulean
    secondary: "bg-[#0B4F83] hover:bg-[#003C65] text-white",

    // Outline: Gov Blue border and text
    outline:
      "bg-transparent border-2 border-[#006DB7] text-[#006DB7] hover:bg-[#006DB7]/10",

    ghost: "bg-transparent hover:bg-[#F5F5F5] text-[#333333]",

    // Danger: Red for alerts, keeping high contrast
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm font-semibold",
    md: "px-6 py-3 text-base font-semibold",
    lg: "px-8 py-4 text-lg font-bold",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative rounded-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </motion.button>
  );
}
