"use client";

import { useState, useEffect } from "react";
import { useLedger } from "@/context/LedgerContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/CustomSelect"; // <-- Imported CustomSelect
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { mockAuditLogs } from "@/types";

export default function ActivityLogsPage() {
  const { isLoaded } = useLedger();
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset to first page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (!isLoaded) return null;

  const logs = mockAuditLogs;

  const filteredLogs = logs.filter(log => 
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ========================================================================
  // PAGINATION LOGIC
  // ========================================================================
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
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

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATED":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-100" variant="outline">CREATED</Badge>;
      case "UPDATED":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 hover:bg-blue-100" variant="outline">UPDATED</Badge>;
      case "STATUS_CHANGED":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400 hover:bg-orange-100" variant="outline">STATUS CHANGE</Badge>;
      case "DELETED":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-100" variant="outline">DELETED</Badge>;
      case "SYSTEM_ACTION":
        return <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100" variant="outline">SYSTEM</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors duration-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Audit & Activity Log</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Immutable record of system changes.</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search logs, users, entities..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 focus-visible:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="dark:border-slate-800 hover:bg-transparent">
                <TableHead className="dark:text-slate-400 w-[180px]">Timestamp</TableHead>
                <TableHead className="dark:text-slate-400 w-[150px]">Action</TableHead>
                <TableHead className="dark:text-slate-400 w-[150px]">Module</TableHead>
                <TableHead className="dark:text-slate-400">Details</TableHead>
                <TableHead className="dark:text-slate-400 w-[150px]">User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow className="dark:border-slate-800 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No activity logs found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => { // <-- Using paginated array here
                  const formattedDate = new Date(log.timestamp).toLocaleString("en-GB", { 
                    day: '2-digit', month: 'short', year: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                  });

                  return (
                    <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 dark:border-slate-800 transition-colors text-sm">
                      <TableCell className="text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-xs">
                        {formattedDate}
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 font-medium">
                        {log.entityName}
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {log.details}
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 flex items-center gap-2 whitespace-nowrap">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {log.user.charAt(0)}
                        </div>
                        {log.user}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ======================================================= */}
        {/* PAGINATION & ROW SELECTOR CONTROLS */}
        {/* ======================================================= */}
        {filteredLogs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
            
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
                Showing <span className="font-medium text-slate-900 dark:text-slate-200">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{filteredLogs.length}</span> entries
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
      </div>

    </div>
  );
}