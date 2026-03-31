"use client";

import { useState } from "react";
import { useLedger } from "@/context/LedgerContext";
import { formatMoney } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/CustomSelect"; // <-- Imported CustomSelect
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

export default function PNLReportPage() {
  const { transactions, settings, isLoaded } = useLedger();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  if (!isLoaded) return null;

  let totalRevenue = 0;
  let totalExpenses = 0;
  let totalFees = 0;
  
  const clearedTransactions = transactions.filter(t => t.status === "cleared");
  
  clearedTransactions.forEach(t => {
    if (t.type === "in") totalRevenue += t.amount;
    else totalExpenses += t.amount;
    totalFees += t.fee;
  });
  
  const netProfit = totalRevenue - totalExpenses - totalFees;

  // ========================================================================
  // PAGINATION LOGIC
  // ========================================================================
  const totalPages = Math.ceil(clearedTransactions.length / itemsPerPage);
  const paginatedTransactions = clearedTransactions.slice(
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Income Statement (P&L)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review your gross revenue, expenses, and net profit.</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="w-full sm:w-auto dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Export / Print PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="dark:bg-slate-950 dark:border-slate-800">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Gross Revenue</p>
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-500">{formatMoney(totalRevenue, settings.currency)}</h3>
          </CardContent>
        </Card>
        <Card className="dark:bg-slate-950 dark:border-slate-800">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Expenses & Fees</p>
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-500">{formatMoney(totalExpenses + totalFees, settings.currency)}</h3>
          </CardContent>
        </Card>
        <Card className="dark:bg-slate-950 dark:border-slate-800 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">Net Profit</p>
            <h3 className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {formatMoney(netProfit, settings.currency)}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide">P&L Details (Cleared Transactions)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Expense/Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow className="dark:border-slate-800 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No cleared transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map(t => (
                  <TableRow key={t.id} className="dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <TableCell className="text-slate-500 whitespace-nowrap text-sm">{t.date}</TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">{t.desc}</TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">{t.category}</TableCell>
                    <TableCell className="text-right text-green-600 dark:text-green-400">{t.type === "in" ? formatMoney(t.amount, settings.currency) : "-"}</TableCell>
                    <TableCell className="text-right text-red-600 dark:text-red-400">{t.type === "out" ? formatMoney(t.amount + t.fee, settings.currency) : formatMoney(t.fee, settings.currency)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        {/* ======================================================= */}
        {/* PAGINATION & ROW SELECTOR CONTROLS */}
        {/* ======================================================= */}
        {clearedTransactions.length > 0 && (
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
                Showing <span className="font-medium text-slate-900 dark:text-slate-200">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, clearedTransactions.length)}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{clearedTransactions.length}</span> entries
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