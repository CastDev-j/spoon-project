import { cn } from "@/lib/cn";
import { forwardRef, type InputHTMLAttributes, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, success, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          className={cn(
            "h-10 py-3 w-full min-w-0 rounded-2xl border bg-jeton-red/5 px-4 text-sm text-red-velvet outline-none transition-colors",
            "placeholder:text-red-velvet/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !error &&
              !success &&
              "border-red-velvet/20 hover:border-jeton-red/50 focus:border-jeton-red focus:ring-2 focus:ring-jeton-red/10",
            error &&
              "border-jeton-red bg-jeton-red/5 focus:border-jeton-red focus:ring-2 focus:ring-jeton-red/10",
            success &&
              "border-mint-green bg-mint-green/5 focus:border-mint-green focus:ring-2 focus:ring-mint-green/10",
            isPassword && "pr-10",
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-velvet/50 hover:text-red-velvet"
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
