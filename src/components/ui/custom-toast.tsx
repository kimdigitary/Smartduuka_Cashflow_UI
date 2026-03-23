"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (title: string, message: string, type?: ToastType) => void;
}

// --- Context ---
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- Component ---
export function CustomToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((title: string, message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto remove after animation (5s total: 0.5s in + 4.5s wait + 0.5s out)
    setTimeout(() => {
        // eslint-disable-next-line react-hooks/immutability
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ title, message, type, onClose }: Toast & { onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsExiting(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  const styles = {
    success: { bg: "bg-green-600", progress: "bg-green-400", icon: CheckCircle },
    error: { bg: "bg-red-600", progress: "bg-red-400", icon: AlertTriangle },
    info: { bg: "bg-blue-600", progress: "bg-blue-400", icon: Info },
  };

  const currentStyle = styles[type];
  const Icon = currentStyle.icon;

  return (
    <div 
      className={cn(
        "relative flex items-start p-4 rounded-lg shadow-lg text-white w-full pointer-events-auto overflow-hidden",
        currentStyle.bg,
        isExiting ? "animate-toast-fade-out" : "animate-toast-slide-in"
      )}
    >
      <div className="mr-4 text-2xl animate-icon-pop">
        <Icon className="w-8 h-8" />
      </div>
      <div className="flex-grow">
        <p className="font-bold text-base">{title}</p>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="absolute top-2 right-2 p-1 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Progress Bar */}
      <div className={cn(
        "absolute bottom-0 left-0 h-1 animate-progress-shrink", 
        currentStyle.progress
      )} />
    </div>
  );
}

// --- Hook ---
export const useCustomToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useCustomToast must be used within a CustomToastProvider");
  return context;
};

export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a CustomToastProvider");
  }
  
  return context;
}
