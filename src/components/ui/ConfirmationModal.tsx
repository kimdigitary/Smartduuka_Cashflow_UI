"use client";
import React from "react";
import { FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'danger'
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    // Visual styles based on variant
    const styles = {
        danger: {
            icon: <FaExclamationTriangle size={24} />,
            iconBg: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
            button: "bg-red-600 hover:bg-red-700 text-white"
        },
        warning: {
            icon: <FaExclamationTriangle size={24} />,
            iconBg: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
            button: "bg-orange-600 hover:bg-orange-700 text-white"
        },
        info: {
            icon: <FaInfoCircle size={24} />,
            iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
            button: "bg-blue-600 hover:bg-blue-700 text-white"
        }
    };

    const currentStyle = styles[variant];

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
                
                <div className="p-6 flex gap-4">
                    <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${currentStyle.iconBg}`}>
                        {currentStyle.icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
                    </div>
                </div>

                <div className="p-4 border-t border-border bg-muted/40 flex justify-end gap-3 rounded-b-xl">
                    <Button variant="outline" onClick={onClose} className="border-border">
                        {cancelText}
                    </Button>
                    <Button 
                        onClick={() => { onConfirm(); onClose(); }} 
                        className={currentStyle.button}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}