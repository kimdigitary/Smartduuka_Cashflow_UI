"use client";

import * as React from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from "@/components/ui/command";
import {Button} from "@/components/ui/button";
import {Check, ChevronsUpDown} from "lucide-react";
import {cn} from "@/lib/utils";
import {ReactNode} from "react";

interface CustomComboboxProps<G extends object> {
    value: string | number | null | undefined;
    onValueChange: (value: any) => void;
    label?: string;
    labelBy: keyof G;
    valueBy: keyof G;
    options: G[];
    placeholder?: string;
    searchPlaceholder?: string;
    className?: string;
    disabled?: boolean;
    renderOptionsTemplate?: (value: G) => ReactNode;
}

export default function SelectInput<G extends object>({
                                                          value,
                                                          onValueChange,
                                                          label,
                                                          labelBy,
                                                          valueBy,
                                                          options,
                                                          placeholder = "Select option...",
                                                          searchPlaceholder = "Search...",
                                                          className,
                                                          disabled = false,
                                                          renderOptionsTemplate
                                                      }: CustomComboboxProps<G>) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    // Filter options based on search
    const filteredOptions = options?.filter((option) => {
        const labelValue = option[labelBy];
        if (labelValue === undefined || labelValue === null) return false;
        return String(labelValue).toLowerCase().includes(search.toLowerCase().trim());
    });

    const selected = options.find((o) => String(o[valueBy]) === String(value));

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                </label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className={cn("w-full justify-between", !selected && "text-muted-foreground")}
                    >
                        {selected ? (renderOptionsTemplate ? renderOptionsTemplate(selected) : String(selected[labelBy])) : placeholder}
                        <ChevronsUpDown className="opacity-50 h-4 w-4 shrink-0 ml-2"/>
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    align="start"
                    className="w-[var(--radix-popover-trigger-width)] p-0 z-[70]">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={searchPlaceholder}
                            value={search}
                            onValueChange={(val) => setSearch(val.trim())}
                            className="h-9"
                        />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {filteredOptions.map((option) => (
                                    <CommandItem
                                        key={String(option[valueBy])}
                                        value={String(option[valueBy])}
                                        onSelect={() => {
                                            onValueChange(option[valueBy]);
                                            setOpen(false);
                                            setSearch("");
                                        }}>
                                        {renderOptionsTemplate ? renderOptionsTemplate(option) : String(option[labelBy])}
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                String(option[valueBy]) === String(value) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
