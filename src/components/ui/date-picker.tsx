"use client";

import { useState } from "react";
import { format, isValid, parseISO, startOfDay } from "date-fns";
import { enGB } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    placeholder?: string;
    disableDates?: "past" | "future" | "none";
}

export function DatePicker({ date, setDate, placeholder, disableDates = "none" }: DatePickerProps) {
    const [open, setOpen] = useState(false);

    let selectedDate: Date | undefined = undefined;

    if (date instanceof Date) {
        selectedDate = date;
    } else if (typeof date === "string") {
        const parsed = parseISO(date);
        if (isValid(parsed)) selectedDate = parsed;
    }

    // logic to determine disabled dates
    const today = startOfDay(new Date());
    const isDisabled = (d: Date) => {
        if (disableDates === "future") return d > today;
        if (disableDates === "past") return d < today;
        return false;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full pl-3 text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                    )}
                >
                    {selectedDate ? (
                        format(selectedDate, "dd/MM/yyyy")
                    ) : (
                        <span>{placeholder || "Pick a date"}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0 z-[70]" align="start">
                <Calendar
                    mode="single"
                    locale={enGB}
                    selected={selectedDate}
                    onSelect={(d) => {
                        setDate(d);
                        setOpen(false);
                    }}
                    disabled={isDisabled}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
