"use client";

import React, {useState, useRef, useEffect} from "react";
import {createPortal} from "react-dom";
import {FaChevronDown, FaPlus, FaSearch} from "react-icons/fa";

interface CustomSelectProps<T extends object> {
    options: T[];
    value: string | number;
    valueBy?: keyof T;
    labelBy?: keyof T;
    onChange: (value: any) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    searchable?: boolean;
    onAddNew?: (name: string) => void; 
    addNewLabel?: string;
    placement?: "top" | "bottom";
}

export function CustomSelect<T extends { value: any, label: string }>({
    options, value,
    onChange,
    placeholder = "Select...",
    className = "",
    disabled = false,
    searchable = false,
    onAddNew, valueBy = 'value' as keyof T, labelBy = 'label' as keyof T,
    addNewLabel = "Add New",
    placement = "bottom"
}: CustomSelectProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((o) => String(o[valueBy]) === String(value));

    // Toggle Dropdown & Calculate Position
    const toggleDropdown = (e: React.MouseEvent) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();

        if (!isOpen) {
            updatePosition();
        }
        setIsOpen(!isOpen);
    };

    const updatePosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        let finalPlacement = placement;
        if (placement === 'bottom' && spaceBelow < 200 && spaceAbove > spaceBelow) {
            finalPlacement = 'top';
        } else if (placement === 'top' && spaceAbove < 200 && spaceBelow > spaceAbove) {
            finalPlacement = 'bottom';
        }

        setMenuStyle({
            position: 'fixed',
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            top: finalPlacement === 'bottom' ? `${rect.bottom + 4}px` : 'auto',
            bottom: finalPlacement === 'top' ? `${window.innerHeight - rect.top + 4}px` : 'auto',
            zIndex: 9999,
        });
    };

    // Close on click outside or scroll
    useEffect(() => {
        const handleGlobalEvents = (event: Event) => {
            if (
                dropdownRef.current && dropdownRef.current.contains(event.target as Node) ||
                triggerRef.current && triggerRef.current.contains(event.target as Node)
            ) {
                return;
            }
            setIsOpen(false);
        };

        if (isOpen) {
            window.addEventListener("mousedown", handleGlobalEvents);
            window.addEventListener("scroll", handleGlobalEvents, true); 
            window.addEventListener("resize", updatePosition);
        }

        return () => {
            window.removeEventListener("mousedown", handleGlobalEvents);
            window.removeEventListener("scroll", handleGlobalEvents, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [isOpen]);

    const filteredOptions = options.filter((option) => {
        const labelValue = option[labelBy];
        if (labelValue === undefined || labelValue === null) return false;
        return String(labelValue).toLowerCase().includes(searchTerm.toLowerCase().trim());
    });

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <>
            {/* TRIGGER BUTTON */}
            <div
                ref={triggerRef}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleDropdown(e as unknown as React.MouseEvent);
                    }
                }}
                className={`
                    relative flex items-center justify-between w-full rounded-md px-3 py-2.5 text-sm cursor-pointer transition-all duration-200 outline-none
                    border
                    ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}
                    ${isOpen 
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md dark:bg-orange-500 dark:border-orange-500 dark:text-white' 
                        : 'border-orange-200 text-orange-600 bg-transparent hover:bg-orange-50 dark:border-orange-900/50 dark:text-orange-500 dark:hover:bg-orange-900/20'
                    }
                    ${className}
                `}
                onClick={toggleDropdown}
            >
                <span className="truncate font-medium">
                  {selectedOption ? String(selectedOption[labelBy]) : placeholder}
                </span>
                <FaChevronDown className={`text-xs ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-100' : 'text-orange-400 dark:text-orange-600'}`}/>
            </div>

            {/* DROPDOWN MENU (Rendered in Portal) */}
            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    ref={dropdownRef}
                    style={menuStyle}
                    className="bg-white dark:bg-slate-950 border border-orange-200 dark:border-orange-900/50 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[300px]"
                >
                    {searchable && (
                        <div className="p-2 border-b border-orange-100 dark:border-orange-900/30 sticky top-0 bg-white dark:bg-slate-950 z-10">
                            <div className="relative">
                                <FaSearch className="absolute left-2.5 top-2.5 text-orange-400 text-xs"/>
                                <input
                                    type="text"
                                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-orange-200 dark:border-orange-900/50 rounded bg-orange-50/50 dark:bg-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 text-slate-900 dark:text-slate-100 placeholder:text-orange-300 dark:placeholder:text-orange-700 transition-colors"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                        }
                                    }}
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    <ul className="overflow-y-auto custom-scrollbar p-1 flex-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = String(option[valueBy]) === String(value);
                                return (
                                    <li
                                        key={String(option[valueBy])}
                                        tabIndex={0}
                                        className={`
                                            px-3 py-2 rounded-md text-sm cursor-pointer transition-colors outline-none
                                            ${isSelected
                                                ? 'bg-orange-500 text-white font-medium shadow-sm focus:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-orange-50 hover:text-orange-600 focus:bg-orange-50 focus:text-orange-600 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 dark:focus:bg-orange-900/20'
                                            }
                                        `}
                                        onClick={() => handleSelect(String(option[valueBy]))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleSelect(String(option[valueBy]));
                                            }
                                        }}
                                    >
                                        {String(option[labelBy])}
                                    </li>
                                );
                            })
                        ) : (
                            <li className="px-3 py-2 text-xs text-orange-400 dark:text-orange-600 text-center">No results found</li>
                        )}
                    </ul>

                    {onAddNew && (
                        <div
                            tabIndex={0}
                            className="p-2 border-t border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-slate-900/50 cursor-pointer hover:bg-orange-100 hover:text-orange-700 focus:bg-orange-100 focus:text-orange-700 dark:hover:bg-orange-900/40 dark:hover:text-orange-400 outline-none transition-colors sticky bottom-0"
                            onClick={() => {
                                onAddNew(searchTerm); 
                                setIsOpen(false);
                                setSearchTerm(""); 
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onAddNew(searchTerm);
                                    setIsOpen(false);
                                    setSearchTerm("");
                                }
                            }}
                        >
                            <div className="flex items-center justify-center text-orange-500 font-bold text-xs">
                                <FaPlus className="mr-1.5"/> {addNewLabel}
                            </div>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </>
    );
}