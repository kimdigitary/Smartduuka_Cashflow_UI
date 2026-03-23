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
            updatePosition(); // Calculate position before opening
        }
        setIsOpen(!isOpen);
    };

    const updatePosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Decide placement based on space (or prop preference)
        // Default logic: if prop is top, try top. If bottom, try bottom.
        // If not enough space, flip.
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
            zIndex: 9999, // Ensure it's above everything (modals usually 50-100)
        });
    };

    // Close on click outside or scroll
    useEffect(() => {
        const handleGlobalEvents = (event: Event) => {
            // If clicking inside the dropdown or trigger, don't close
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
            window.addEventListener("scroll", handleGlobalEvents, true); // Capture scroll to close
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
          relative flex items-center justify-between w-full border rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-all duration-200 outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary
          ${disabled ? 'opacity-60 cursor-not-allowed bg-muted' : 'bg-background hover:border-primary/50'}
          ${isOpen ? 'border-primary ring-1 ring-primary' : 'border-border'}
          ${className}
        `}
                onClick={toggleDropdown}
            >
                <span className={`truncate ${!selectedOption ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {selectedOption ? String(selectedOption[labelBy]) : placeholder}
                </span>
                <FaChevronDown className={`text-xs ml-2 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}/>
            </div>

            {/* DROPDOWN MENU (Rendered in Portal) */}
            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    ref={dropdownRef}
                    style={menuStyle}
                    className="bg-popover border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[300px]"
                >
                    {searchable && (
                        <div className="p-2 border-b border-border sticky top-0 bg-popover z-10">
                            <div className="relative">
                                <FaSearch className="absolute left-2.5 top-2.5 text-muted-foreground text-xs"/>
                                <input
                                    type="text"
                                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-border rounded bg-muted/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    // Make sure input doesn't close dropdown on enter if it's just searching
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
                            filteredOptions.map((option) => (
                                <li
                                    key={String(option[valueBy])}
                                    tabIndex={0}
                                    className={`
                                        px-3 py-2 rounded-md text-sm cursor-pointer transition-colors outline-none
                                        ${option[valueBy] === value
                                            ? 'bg-primary/10 text-primary font-medium focus:bg-primary/20'
                                            : 'text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
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
                            ))
                        ) : (
                            <li className="px-3 py-2 text-xs text-muted-foreground text-center">No results found</li>
                        )}
                    </ul>

                    {onAddNew && (
                        <div
                            tabIndex={0}
                            className="p-2 border-t border-border bg-muted/20 cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none transition-colors sticky bottom-0"
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
                            <div className="flex items-center justify-center text-primary font-bold text-xs">
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