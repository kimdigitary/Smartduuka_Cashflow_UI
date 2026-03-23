import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"; 

export function TableSkeleton() {
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Generating 6 dummy column headers */}
            {Array.from({ length: 6 }).map((_, i) => (
              <TableHead key={i}>
                <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Generating dummy rows */}
          {Array.from({ length: 20 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: 6 }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                   {/* Make the width vary slightly for a more natural text look */}
                  <div className={`h-4 animate-pulse rounded bg-muted/60 ${colIndex === 0 ? 'w-16' : 'w-full max-w-[150px]'}`}></div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}