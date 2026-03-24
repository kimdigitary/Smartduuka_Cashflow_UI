"use client";

import { useState, useMemo } from "react";
import { useLedger } from "@/context/LedgerContext";
import { formatMoney, calculateNet, getStatusColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Edit, Trash2, Paperclip, FileText, LayoutList, Columns } from "lucide-react";
import { toast } from "sonner";
import { mockTransactions, mockEntities, mockAccounts, mockSettings } from "@/types";

export default function TransactionsPage() {
  const { deleteTransaction, isLoaded } = useLedger();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<"standard" | "split">("standard");

  // Vault Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<{name: string, data: string} | null>(null);

  if (!isLoaded) return null;

  // ========================================================================
  // DUMMY DATA
  // ========================================================================
  const transactions = mockTransactions;
  const entities = mockEntities;
  const accounts = mockAccounts;
  const settings = mockSettings;

  // Search & Filter Logic
  const filteredTxs = transactions.filter((t) => {
    const entName = entities.find((e) => e.id === t.entityId)?.name || "";
    const matchTerm = entName.toLowerCase().includes(searchTerm.toLowerCase()) || (t.desc || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchTerm && (filterType === "all" || t.type === filterType);
  });

  // Calculate Running Balances (Sort oldest to newest, calculate, then reverse for display)
  const txsWithBalance = useMemo(() => {
    const sorted = [...filteredTxs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentBalance = 0;
    
    const calculated = sorted.map((t) => {
      const net = calculateNet(t);
      if (t.type === "in") currentBalance += net;
      else if (t.type === "out") currentBalance -= net;
      
      return { ...t, runningBalance: currentBalance };
    });

    return calculated.reverse(); // Show newest at the top
  }, [filteredTxs]);

  // Split view arrays
  const cashInTxs = txsWithBalance.filter(t => t.type === "in");
  const cashOutTxs = txsWithBalance.filter(t => t.type === "out");

  // Updated CSV Export to match new columns
  const exportCSV = () => {
    if (!txsWithBalance.length) return toast.error("No data to export");
    let csv = "Date,Entity,Account,Cash In,Cash Out,Balance,Status,Description\n";
    
    txsWithBalance.forEach(t => {
      const ent = entities.find(e => e.id === t.entityId)?.name || "Unknown";
      const acc = accounts.find(a => a.id === t.accountId)?.name || "Unknown";
      const net = calculateNet(t);
      
      const cashIn = t.type === "in" ? net : "";
      const cashOut = t.type === "out" ? net : "";
      
      csv += `${t.date},"${ent}","${acc}",${cashIn},${cashOut},${t.runningBalance},${t.status},"${(t.desc || "").replace(/"/g, '""')}"\n`;
    });
    
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ledger_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Export successful");
  };

  const openViewer = (name: string, data: string) => {
    setActiveDoc({ name, data });
    setViewerOpen(true);
  };

  // Helper to render standard table rows to keep code DRY between views
  const renderTableRow = (t: any, showActions: boolean = true) => {
    const entName = entities.find((e) => e.id === t.entityId)?.name || "Unknown";
    const accName = accounts.find((a) => a.id === t.accountId)?.name || "Unknown";
    const formattedDate = new Date(t.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    const net = calculateNet(t);

    return (
      <TableRow key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 dark:border-slate-800 transition-colors">
        <TableCell className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {formattedDate}
        </TableCell>

        <TableCell className="font-medium text-slate-900 dark:text-slate-100">
          <div className="flex items-center gap-2">
            <span>{entName}</span>
            {t.attachmentData && (
              <button onClick={() => openViewer(t.attachmentName!, t.attachmentData!)} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded text-[10px] border border-blue-100 dark:border-blue-500/20">
                <Paperclip className="w-3 h-3 mr-1" /> View
              </button>
            )}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate max-w-[180px]">
            {t.desc || "-"}
          </div>
        </TableCell>

        <TableCell className="text-slate-600 dark:text-slate-300">
          {accName}
          <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">
            {t.category || "Uncategorized"}
          </div>
        </TableCell>

        {/* Cash IN Column */}
        <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
          {t.type === "in" ? formatMoney(net, settings.currency) : <span className="text-slate-300 dark:text-slate-700">-</span>}
        </TableCell>

        {/* Cash OUT Column */}
        <TableCell className="text-right font-bold text-red-600 dark:text-red-400">
          {t.type === "out" ? formatMoney(net, settings.currency) : <span className="text-slate-300 dark:text-slate-700">-</span>}
        </TableCell>

        {/* Running Balance */}
        <TableCell className="text-right font-bold text-slate-800 dark:text-slate-200">
          {formatMoney(t.runningBalance, settings.currency)}
        </TableCell>

        <TableCell className="text-center">
          <Badge className={`uppercase text-[10px] font-bold ${getStatusColor(t.status)}`} variant="outline">
            {t.status}
          </Badge>
        </TableCell>

        {showActions && (
          <TableCell className="text-right space-x-2 whitespace-nowrap">
            <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Edit className="w-4 h-4 inline" />
            </button>
            <button onClick={() => { if(confirm("Permanently delete this record?")) deleteTransaction(t.id); }} className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4 inline" />
            </button>
          </TableCell>
        )}
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full max-w-xl">
          <Input 
            placeholder="Search descriptions or entities..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="flex-1 focus-visible:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500" 
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[150px] focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="in">Cash In</SelectItem>
              <SelectItem value="out">Cash Out</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <Button 
              variant={viewMode === "standard" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setViewMode("standard")}
              className={`h-8 px-3 ${viewMode === "standard" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700" : "text-slate-500"}`}
            >
              <LayoutList className="w-4 h-4 mr-1.5" /> Table
            </Button>
            <Button 
              variant={viewMode === "split" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setViewMode("split")}
              className={`h-8 px-3 ${viewMode === "split" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700" : "text-slate-500"}`}
            >
              <Columns className="w-4 h-4 mr-1.5" /> Split
            </Button>
          </div>

          <Button onClick={exportCSV} variant="outline" className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:border-slate-800 transition-colors">
            <Download className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* VIEW: STANDARD TABLE */}
      {viewMode === "standard" && (
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="dark:border-slate-800 hover:bg-transparent">
                <TableHead className="dark:text-slate-400">Date/Time</TableHead>
                <TableHead className="dark:text-slate-400">Entity & Details</TableHead>
                <TableHead className="dark:text-slate-400">Account</TableHead>
                <TableHead className="text-right dark:text-slate-400">Cash IN</TableHead>
                <TableHead className="text-right dark:text-slate-400">Cash OUT</TableHead>
                <TableHead className="text-right dark:text-slate-400 font-semibold">Balance</TableHead>
                <TableHead className="text-center dark:text-slate-400">Status</TableHead>
                <TableHead className="text-right dark:text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txsWithBalance.length === 0 ? (
                <TableRow className="dark:border-slate-800 hover:bg-transparent">
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                txsWithBalance.slice(0, settings.pageSize === "all" ? undefined : parseInt(settings.pageSize)).map(t => renderTableRow(t, true))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* VIEW: SPLIT SECTIONS (CASH IN vs CASH OUT) */}
      {viewMode === "split" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* CASH IN Card */}
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-green-200 dark:border-green-900/30 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-green-50 dark:bg-green-900/10 p-4 border-b border-green-100 dark:border-green-900/20 flex justify-between items-center">
              <h3 className="font-semibold text-green-800 dark:text-green-400 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Cash IN
              </h3>
              <Badge variant="outline" className="bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                {cashInTxs.length} Transactions
              </Badge>
            </div>
            <div className="overflow-x-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-green-100 dark:border-slate-800">
                    <TableHead>Date</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Running Bal.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashInTxs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-400">No Cash IN transactions.</TableCell>
                    </TableRow>
                  ) : (
                    cashInTxs.map(t => (
                      <TableRow key={`split-in-${t.id}`} className="border-green-50 dark:border-slate-800/50">
                        <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{entities.find((e) => e.id === t.entityId)?.name}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{t.desc || accounts.find((a) => a.id === t.accountId)?.name}</div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600 dark:text-green-400 text-sm">
                          {formatMoney(calculateNet(t), settings.currency)}
                        </TableCell>
                        <TableCell className="text-right text-xs font-medium text-slate-600 dark:text-slate-400">
                          {formatMoney(t.runningBalance, settings.currency)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* CASH OUT Card */}
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-red-200 dark:border-red-900/30 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-red-50 dark:bg-red-900/10 p-4 border-b border-red-100 dark:border-red-900/20 flex justify-between items-center">
              <h3 className="font-semibold text-red-800 dark:text-red-400 flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> Cash OUT
              </h3>
              <Badge variant="outline" className="bg-red-100/50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                {cashOutTxs.length} Transactions
              </Badge>
            </div>
            <div className="overflow-x-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-red-100 dark:border-slate-800">
                    <TableHead>Date</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Running Bal.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashOutTxs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-400">No Cash OUT transactions.</TableCell>
                    </TableRow>
                  ) : (
                    cashOutTxs.map(t => (
                      <TableRow key={`split-out-${t.id}`} className="border-red-50 dark:border-slate-800/50">
                        <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{entities.find((e) => e.id === t.entityId)?.name}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{t.desc || accounts.find((a) => a.id === t.accountId)?.name}</div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-red-600 dark:text-red-400 text-sm">
                          {formatMoney(calculateNet(t), settings.currency)}
                        </TableCell>
                        <TableCell className="text-right text-xs font-medium text-slate-600 dark:text-slate-400">
                          {formatMoney(t.runningBalance, settings.currency)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="sm:max-w-3xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center text-slate-900 dark:text-slate-100">
              <FileText className="w-5 h-5 mr-2" /> 
              Document Vault: {activeDoc?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center p-4 min-h-[400px] border border-slate-200 dark:border-slate-800">
            {activeDoc?.data.startsWith("data:image") ? (
              <img src={activeDoc.data} alt="Receipt" className="max-w-full max-h-[60vh] object-contain rounded shadow-sm" />
            ) : (
              <div className="text-slate-500 dark:text-slate-400 flex flex-col items-center">
                <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-2" />
                <p>PDF/File previewer available in production.</p>
                <a href={activeDoc?.data} download={activeDoc?.name} className="mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                  Download File
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}