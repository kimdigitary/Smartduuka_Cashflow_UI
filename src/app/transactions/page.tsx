"use client";

import { useState } from "react";
import { useLedger } from "@/context/LedgerContext";
import { formatMoney, calculateNet, getStatusColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Edit, Trash2, Paperclip, FileText } from "lucide-react";
import { toast } from "sonner";
import { mockTransactions, mockEntities, mockAccounts, mockSettings } from "@/types"; // <-- Imported Dummy Data

export default function TransactionsPage() {
  const { deleteTransaction, isLoaded } = useLedger(); // Kept for hydration and delete action
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  // Vault Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<{name: string, data: string} | null>(null);

  if (!isLoaded) return null;

  // ========================================================================
  // INJECTING DUMMY DATA HERE
  // ========================================================================
  const transactions = mockTransactions;
  const entities = mockEntities;
  const accounts = mockAccounts;
  const settings = mockSettings;

  // Search & Filter Logic applied to Mock Data
  const filteredTxs = transactions.filter((t) => {
    const entName = entities.find((e) => e.id === t.entityId)?.name || "";
    const matchTerm = entName.toLowerCase().includes(searchTerm.toLowerCase()) || (t.desc || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchTerm && (filterType === "all" || t.type === filterType);
  });

  // Fully restored CSV Export logic
  const exportCSV = () => {
    if (!filteredTxs.length) return toast.error("No data to export");
    let csv = "Date,Type,Entity,Category,Account,Gross Amount,Fee,Net Impact,Status,Description\n";
    filteredTxs.forEach(t => {
      const ent = entities.find(e => e.id === t.entityId)?.name || "Unknown";
      const acc = accounts.find(a => a.id === t.accountId)?.name || "Unknown";
      const net = calculateNet(t);
      csv += `${t.date},${t.type},"${ent}","${t.category || "Uncategorized"}","${acc}",${t.amount},${t.fee},${net},${t.status},"${(t.desc || "").replace(/"/g, '""')}"\n`;
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

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full max-w-lg">
          <Input 
            placeholder="Search descriptions or entities..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="flex-1 focus-visible:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500" 
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px] focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="in">Cash In</SelectItem>
              <SelectItem value="out">Cash Out</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportCSV} variant="outline" className="w-full sm:w-auto text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:border-slate-800 transition-colors">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
            <TableRow className="dark:border-slate-800 hover:bg-transparent">
              <TableHead className="dark:text-slate-400">Date</TableHead>
              <TableHead className="dark:text-slate-400">Type</TableHead>
              <TableHead className="dark:text-slate-400">Entity & Details</TableHead>
              <TableHead className="dark:text-slate-400">Category / Acc</TableHead>
              <TableHead className="text-right dark:text-slate-400">Net Impact</TableHead>
              <TableHead className="text-center dark:text-slate-400">Status</TableHead>
              <TableHead className="text-right dark:text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTxs.length === 0 ? (
              <TableRow className="dark:border-slate-800 hover:bg-transparent">
                <TableCell colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTxs.slice(0, settings.pageSize === "all" ? undefined : parseInt(settings.pageSize)).map((t) => {
                const entName = entities.find((e) => e.id === t.entityId)?.name || "Unknown";
                const accName = accounts.find((a) => a.id === t.accountId)?.name || "Unknown";
                const formattedDate = new Date(t.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
                
                return (
                  <TableRow key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 dark:border-slate-800 transition-colors">
                    <TableCell className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formattedDate}
                    </TableCell>
                    
                    <TableCell>
                      <span className={`font-medium text-xs uppercase px-2 py-1 rounded border ${t.type === "in" ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20" : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"}`}>
                        {t.type}
                      </span>
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
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate max-w-[200px]">
                        {t.desc || "-"}
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-600 dark:text-slate-300">
                      {t.category || "-"}
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">
                        {accName}
                      </div>
                    </TableCell>

                    <TableCell className={`text-right font-bold ${t.type === "in" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {t.currency && t.currency !== settings.currency && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mr-1 border border-slate-200 dark:border-slate-700 rounded px-1">
                          {t.currency}
                        </span>
                      )}
                      {formatMoney(calculateNet(t), settings.currency)}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge className={`uppercase text-[10px] font-bold ${getStatusColor(t.status)}`} variant="outline">
                        {t.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                      <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => { if(confirm("Permanently delete this record?")) deleteTransaction(t.id); }} className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </TableCell>

                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

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