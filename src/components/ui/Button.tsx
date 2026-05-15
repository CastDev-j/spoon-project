import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "default" | "danger" | "ghost" | "outline" | "primary";
type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = ({
  className,
  variant = "primary",
  size = "default",
  type = "button",
  children,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50";

  const sizeStyles = {
    default: "py-2 px-5 gap-1.5",
    sm: "h-7 px-3 text-xs gap-1",
    lg: "h-9 px-6 gap-1.5",
    icon: "size-8 p-0",
  }[size];

  const variantStyles = {
    primary:
      "border border-jeton-red text-jeton-red bg-transparent hover:bg-jeton-red/5 active:bg-jeton-red/10",
    default:
      "bg-neutral-900 text-neutral-50 hover:bg-neutral-800 active:bg-neutral-950",
    danger:
      "border border-fiery-rose text-fiery-rose bg-transparent hover:bg-fiery-rose/5 active:bg-fiery-rose/10",
    ghost: "hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200",
    outline:
      "border border-neutral-300 text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200",
  }[variant];

  return (
    <button
      type={type}
      className={cn(baseStyles, sizeStyles, variantStyles, className)}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
