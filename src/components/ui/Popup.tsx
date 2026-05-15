import { cn } from "@/lib/cn";
import { useEffect, useCallback, type ReactNode } from "react";
import { FiX } from "react-icons/fi";

interface PopupProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

const Popup = ({ open, onClose, title, description, children, className }: PopupProps) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className={cn(
          "relative z-10 w-full max-w-sm rounded-2xl border border-jeton-red/10 bg-canvas-white shadow-lg",
          className,
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-jeton-red/10">
          <h3 className="text-sm font-medium tracking-[0.01em] text-text-black">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="size-7 rounded-lg flex items-center justify-center text-red-velvet/40 hover:text-red-velvet hover:bg-jeton-red/5 transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>
        {description && (
          <div className="px-5 py-4 text-sm text-red-velvet/70 leading-relaxed">
            {description}
          </div>
        )}
        {children && (
          <div className="px-5 py-4 border-t border-jeton-red/10 flex items-center justify-end gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export { Popup };
