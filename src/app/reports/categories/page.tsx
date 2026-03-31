"use client";

import { useState } from "react";
import { useLedger } from "@/context/LedgerContext";
import { formatMoney, calculateNet } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/CustomSelect"; // <-- Imported CustomSelect
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

export default function CategoriesReportPage() {
  const { transactions, settings, isLoaded } = useLedger();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  if (!isLoaded) return null;

  const categoryTotals: Record<string, { in: number; out: number }> = {};
  
  transactions.filter(t => t.status === "cleared").forEach(t => {
    const cat = t.category || "Uncategorized";
    if (!categoryTotals[cat]) categoryTotals[cat] = { in: 0, out: 0 };
    if (t.type === "in") categoryTotals[cat].in += calculateNet(t);
    else categoryTotals[cat].out += calculateNet(t);
  });
  
  const categoryArray = Object.entries(categoryTotals)
    .map(([name, totals]) => ({ name, ...totals, net: totals.in - totals.out }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));

  // ========================================================================
  // PAGINATION LOGIC
  // ========================================================================
  const totalPages = Math.ceil(categoryArray.length / itemsPerPage);
  const paginatedCategories = categoryArray.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const rowOptions = [
    { value: 5, label: "5 Rows" },
    { value: 10, label: "10 Rows" },
    { value: 20, label: "20 Rows" },
    { value: 50, label: "50 Rows" },
  ];

  return (
    <div className="space-y-6 print:space-y-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Category Breakdown</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review cash flow sorted by internal categories.</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="w-full sm:w-auto dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Export / Print PDF
        </Button>
      </div>

      {/* Table Card */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide">Category Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Cash In</TableHead>
                <TableHead className="text-right">Cash Out</TableHead>
                <TableHead className="text-right">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.length === 0 ? (
                <TableRow className="dark:border-slate-800 hover:bg-transparent">
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategories.map((cat, idx) => (
                  <TableRow key={idx} className="dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">{cat.name}</TableCell>
                    <TableCell className="text-right text-green-600 dark:text-green-400">{formatMoney(cat.in, settings.currency)}</TableCell>
                    <TableCell className="text-right text-slate-600 dark:text-slate-400">{formatMoney(cat.out, settings.currency)}</TableCell>
                    <TableCell className={`text-right font-bold ${cat.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatMoney(cat.net, settings.currency)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* ======================================================= */}
        {/* PAGINATION & ROW SELECTOR CONTROLS */}
        {/* ======================================================= */}
        {categoryArray.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 print:hidden">
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-32">
                <CustomSelect
                  options={rowOptions}
                  value={itemsPerPage}
                  onChange={(val) => {
                    setItemsPerPage(Number(val));
                    setCurrentPage(1); // Reset to first page when changing row count
                  }}
                  placement="top" 
                  className="bg-white dark:bg-slate-950"
                />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                Showing <span className="font-medium text-slate-900 dark:text-slate-200">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, categoryArray.length)}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{categoryArray.length}</span> entries
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="w-8 h-8 border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:border-slate-200 disabled:text-slate-400 dark:border-orange-900/50 dark:text-orange-500 dark:hover:bg-orange-900/20 dark:disabled:border-slate-800 dark:disabled:text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {pageNumbers.map((pageNum) => {
                const isActive = currentPage === pageNum;
                return (
                  <Button
                    key={pageNum}
                    variant={isActive ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 transition-colors ${
                      isActive 
                        ? "bg-orange-500 text-white hover:bg-orange-600 border-orange-500 dark:bg-orange-500 dark:text-white dark:hover:bg-orange-600" 
                        : "border-orange-200 text-orange-500 hover:bg-orange-50 dark:border-orange-900/50 dark:text-orange-500 dark:hover:bg-orange-900/20"
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="w-8 h-8 border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:border-slate-200 disabled:text-slate-400 dark:border-orange-900/50 dark:text-orange-500 dark:hover:bg-orange-900/20 dark:disabled:border-slate-800 dark:disabled:text-slate-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

    </div>
  );
}