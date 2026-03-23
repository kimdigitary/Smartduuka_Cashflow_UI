"use client";
import React from "react";
import { 
    FaChevronLeft, 
    FaChevronRight, 
    FaAngleDoubleLeft, 
    FaAngleDoubleRight 
} from "react-icons/fa";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: string;
    onPageChange: (page: number | ((prev: number) => number)) => void;
    onItemsPerPageChange: (limit: string) => void;
}

const getPageNumbers = (currentPage: number, totalPages: number) => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

export function DataTablePagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange
}: PaginationProps) {
    
    if (totalItems === 0) return null;

    const limit = parseInt(itemsPerPage, 10);
    const startIndex = (currentPage - 1) * limit;
    const pageNumbers = getPageNumbers(currentPage, totalPages);

    return (
        <div className="flex flex-col lg:flex-row items-center justify-between px-6 py-4 border-t border-border bg-muted/10 gap-4">
            {/* Left Side: Rows per page & Details */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="font-medium">Rows per page:</span>
                    <div className="w-20">
                        <CustomSelect 
                            options={[
                                { label: '5', value: '5' },
                                { label: '10', value: '10' },
                                { label: '20', value: '20' },
                                { label: '50', value: '50' }
                            ]} 
                            value={itemsPerPage} 
                            onChange={onItemsPerPageChange} 
                            valueBy="value" 
                            labelBy="label" 
                        />
                    </div>
                </div>
                <span className="hidden sm:inline-block border-l border-border h-4"></span>
                <span>
                    Showing <strong className="text-foreground font-semibold">{startIndex + 1}</strong> to <strong className="text-foreground font-semibold">{Math.min(startIndex + limit, totalItems)}</strong> of <strong className="text-foreground font-semibold">{totalItems}</strong> entries
                </span>
            </div>
            
            {/* Right Side: Navigation Controls */}
            <div className="flex items-center gap-1.5 w-full lg:w-auto justify-center">
                <button 
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-card transition-all"
                >
                    <FaAngleDoubleLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                    onClick={() => onPageChange(prev => Math.max(prev as number - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-card transition-all"
                >
                    <FaChevronLeft className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-1 mx-1 hidden sm:flex">
                    {pageNumbers.map((num, idx) => (
                        num === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground font-medium">...</span>
                        ) : (
                            <button
                                key={`page-${num}`}
                                onClick={() => onPageChange(num as number)}
                                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-semibold transition-all ${
                                    currentPage === num 
                                    ? 'bg-orange-600 text-white border border-orange-600 shadow-sm' 
                                    : 'border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                {num}
                            </button>
                        )
                    ))}
                </div>

                <button 
                    onClick={() => onPageChange(prev => Math.min(prev as number + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-card transition-all"
                >
                    <FaChevronRight className="w-3 h-3" />
                </button>
                <button 
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-card transition-all"
                >
                    <FaAngleDoubleRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}