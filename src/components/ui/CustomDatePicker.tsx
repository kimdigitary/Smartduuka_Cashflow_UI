"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Props {
    label?: string;
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
}

export default function CustomDatePicker({ label, value, onChange, placeholder = "Select Date" }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Initialize with a fallback to avoid SSR mismatch
    // We'll update this to the real date inside useEffect
    const [viewDate, setViewDate] = useState<Date>(new Date(2000, 0, 1));
    const [todayString, setTodayString] = useState<string>("");

    const containerRef = useRef<HTMLDivElement>(null);

    // Handle Initial Mount and "Today" logic
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        const now = new Date();
        setTodayString(now.toDateString());

        // Set initial view to selected value or current month
        if (value) {
            setViewDate(new Date(value));
        } else {
            setViewDate(now);
        }
    }, []);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Update view if value changes externally
    useEffect(() => {
        if (value && mounted) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setViewDate(new Date(value));
        }
    }, [value, mounted]);

    // Calendar Logic
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(year, month + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(formatted);
        setIsOpen(false);
    };

    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Prevent rendering parts that rely on "current time" until after hydration
    if (!mounted) {
        return (
            <div className="relative">
                {label && <label className="block text-sm font-medium text-foreground mb-1">{label}</label>}
                <div className="flex items-center justify-between w-full border-b-2 border-border py-2 px-1">
                    <span className="text-sm text-muted-foreground">{placeholder}</span>
                    <FaCalendarAlt className="text-sm text-muted-foreground" />
                </div>
            </div>
        );
    }

    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="block text-sm font-medium text-foreground mb-1">{label}</label>}

            {/* Input Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
            flex items-center justify-between w-full border-b-2 border-border py-2 px-1 cursor-pointer transition-colors
            ${isOpen ? 'border-[#FF7F00]' : 'hover:border-foreground/50'}
        `}
            >
        <span className={`text-sm ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
          {value ? formatDateDisplay(value) : placeholder}
        </span>
                <FaCalendarAlt className={`text-sm ${isOpen ? 'text-[#FF7F00]' : 'text-muted-foreground'}`} />
            </div>

            {/* Dropdown Calendar */}
            {isOpen && (
                <div className="absolute top-[calc(100%+5px)] left-0 z-50 w-72 bg-card rounded-xl shadow-2xl border border-border p-4 animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition">
                            <FaChevronLeft size={12} />
                        </button>
                        <span className="font-bold text-foreground">{monthNames[month]} {year}</span>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition">
                            <FaChevronRight size={12} />
                        </button>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-[10px] uppercase font-bold text-muted-foreground">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = value === dateString;
                            const isToday = todayString === new Date(year, month, day).toDateString();

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleDateClick(day); }}
                                    className={`
                        h-8 w-8 rounded-full text-sm flex items-center justify-center transition-all
                        ${isSelected
                                        ? 'bg-[#FF7F00] text-white shadow-md'
                                        : isToday
                                            ? 'bg-muted text-[#FF7F00] font-bold border border-[#FF7F00]/20'
                                            : 'text-foreground hover:bg-muted'
                                    }
                      `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
