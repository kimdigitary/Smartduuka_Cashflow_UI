"use client";

import { useState, useMemo, useEffect } from "react";
import { useLedger } from "@/context/LedgerContext";
import { formatMoney, calculateNet, getStatusColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomSelect } from "@/components/ui/CustomSelect"; 
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Download, Edit, Trash2, Paperclip, FileText, 
  LayoutList, Columns, ChevronLeft, ChevronRight,
  Receipt, Tags, Plus
} from "lucide-react";
import { toast } from "sonner";
import { mockTransactions, mockEntities, mockAccounts, mockSettings } from "@/types";

export default function TransactionsPage() {
  const { deleteTransaction, isLoaded } = useLedger();
  
  // Page Tabs State
  const [activeTab, setActiveTab] = useState<"transactions" | "categories">("transactions");

  // ========================================================================
  // TRANSACTIONS STATE
  // ========================================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<"standard" | "split">("standard");

  // Transactions Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Vault Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<{name: string, data: string} | null>(null);

  // ========================================================================
  // CATEGORIES STATE (Mocked locally for demonstration)
  // ========================================================================
  const [categories, setCategories] = useState<{id: string, name: string, type: string}[]>([
    { id: "c1", name: "Sales", type: "in" },
    { id: "c2", name: "Rent", type: "out" },
    { id: "c3", name: "Utilities", type: "out" },
    { id: "c4", name: "Salary", type: "out" },
    { id: "c5", name: "Marketing", type: "out" },
  ]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<{id: string, name: string, type: string}>>({ type: "out" });
  
  // Categories Pagination
  const [catCurrentPage, setCatCurrentPage] = useState(1);
  const [catItemsPerPage, setCatItemsPerPage] = useState(10);

  // Reset to first page when searching or filtering transactions
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  if (!isLoaded) return null;

  // ========================================================================
  // DUMMY DATA
  // ========================================================================
  const transactions = mockTransactions;
  const entities = mockEntities;
  const accounts = mockAccounts;
  const settings = mockSettings;

  // ========================================================================
  // TRANSACTIONS LOGIC
  // ========================================================================
  const filteredTxs = transactions.filter((t) => {
    const entName = entities.find((e) => e.id === t.entityId)?.name || "";
    const matchTerm = entName.toLowerCase().includes(searchTerm.toLowerCase()) || (t.desc || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchTerm && (filterType === "all" || t.type === filterType);
  });

  const txsWithBalance = useMemo(() => {
    const sorted = [...filteredTxs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentBalance = 0;
    
    const calculated = sorted.map((t) => {
      const net = calculateNet(t);
      if (t.type === "in") currentBalance += net;
      else if (t.type === "out") currentBalance -= net;
      
      return { ...t, runningBalance: currentBalance };
    });

    return calculated.reverse(); 
  }, [filteredTxs]);

  const totalPages = Math.ceil(txsWithBalance.length / itemsPerPage);
  const paginatedTxs = txsWithBalance.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const cashInTxs = txsWithBalance.filter(t => t.type === "in");
  const cashOutTxs = txsWithBalance.filter(t => t.type === "out");

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

  const handleDeleteTransaction = (id: string) => {
    if(confirm("Permanently delete this record?")) {
      deleteTransaction(id);
      if (paginatedTxs.length === 1 && currentPage > 1) setCurrentPage((prev) => prev - 1);
    }
  };

  const openViewer = (name: string, data: string) => {
    setActiveDoc({ name, data });
    setViewerOpen(true);
  };

  // ========================================================================
  // CATEGORIES LOGIC
  // ========================================================================
  // Calculate stats for each category
  const categoriesWithStats = categories.map(cat => {
    let count = 0;
    let totalVolume = 0;
    transactions.forEach(t => {
      if (t.category === cat.name && t.status === "cleared") {
        count++;
        totalVolume += calculateNet(t);
      }
    });
    return { ...cat, count, totalVolume };
  });

  const catTotalPages = Math.ceil(categoriesWithStats.length / catItemsPerPage);
  const paginatedCategories = categoriesWithStats.slice(
    (catCurrentPage - 1) * catItemsPerPage, 
    catCurrentPage * catItemsPerPage
  );
  const catPageNumbers = Array.from({ length: catTotalPages }, (_, i) => i + 1);

  const handleSaveCategory = () => {
    if (!editingCategory.name) return toast.error("Category name is required");
    if (editingCategory.id) {
      setCategories(categories.map(c => c.id === editingCategory.id ? editingCategory as any : c));
      toast.success("Category updated");
    } else {
      setCategories([...categories, { ...editingCategory, id: `cat_${Date.now()}` } as any]);
      toast.success("Category added");
    }
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (transactions.some(t => t.category === name)) {
      return toast.error("Cannot delete category: It is used in existing transactions.");
    }
    if (confirm("Delete this category?")) {
      setCategories(categories.filter(c => c.id !== id));
      if (paginatedCategories.length === 1 && catCurrentPage > 1) setCatCurrentPage((prev) => prev - 1);
      toast.success("Category deleted");
    }
  };

  const openCategoryModal = (cat?: any) => {
    setEditingCategory(cat || { type: "out", name: "" });
    setIsCategoryModalOpen(true);
  };

  const rowOptions = [
    { value: 5, label: "5 Rows" },
    { value: 10, label: "10 Rows" },
    { value: 20, label: "20 Rows" },
    { value: 50, label: "50 Rows" },
  ];

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================
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
        <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
          {t.type === "in" ? formatMoney(net, settings.currency) : <span className="text-slate-300 dark:text-slate-700">-</span>}
        </TableCell>
        <TableCell className="text-right font-bold text-red-600 dark:text-red-400">
          {t.type === "out" ? formatMoney(net, settings.currency) : <span className="text-slate-300 dark:text-slate-700">-</span>}
        </TableCell>
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
            <button onClick={() => handleDeleteTransaction(t.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4 inline" />
            </button>
          </TableCell>
        )}
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* ======================================================= */}
      {/* TOP TAB NAVIGATION */}
      {/* ======================================================= */}
      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
        <Button 
          variant={activeTab === "transactions" ? "default" : "ghost"} 
          onClick={() => setActiveTab("transactions")}
          className={`h-9 px-4 rounded-lg transition-colors ${activeTab === "transactions" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
        >
          <Receipt className="w-4 h-4 mr-2" /> Transactions
        </Button>
        <Button 
          variant={activeTab === "categories" ? "default" : "ghost"} 
          onClick={() => setActiveTab("categories")}
          className={`h-9 px-4 rounded-lg transition-colors ${activeTab === "categories" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
        >
          <Tags className="w-4 h-4 mr-2" /> Categories
        </Button>
      </div>

      {/* ======================================================= */}
      {/* TRANSACTIONS TAB VIEW */}
      {/* ======================================================= */}
      {activeTab === "transactions" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4 transition-colors duration-200">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full max-w-xl">
              <Input 
                placeholder="Search descriptions or entities..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="flex-1 focus-visible:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500" 
              />
              <UISelect value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[150px] focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="in">Cash In</SelectItem>
                  <SelectItem value="out">Cash Out</SelectItem>
                </SelectContent>
              </UISelect>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
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
              <div className="overflow-x-auto">
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
                      paginatedTxs.map(t => renderTableRow(t, true))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* TRANSACTIONS PAGINATION */}
              {txsWithBalance.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-32">
                      <CustomSelect
                        options={rowOptions}
                        value={itemsPerPage}
                        onChange={(val) => { setItemsPerPage(Number(val)); setCurrentPage(1); }}
                        placement="top" 
                        className="bg-white dark:bg-slate-950"
                      />
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                      Showing <span className="font-medium text-slate-900 dark:text-slate-200">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, txsWithBalance.length)}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{txsWithBalance.length}</span> entries
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 dark:border-orange-900/50 dark:text-orange-500 dark:hover:bg-orange-900/20">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {pageNumbers.map((pageNum) => (
                      <Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} size="icon" onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 transition-colors ${currentPage === pageNum ? "bg-orange-500 text-white border-orange-500 dark:bg-orange-500 dark:text-white" : "border-orange-200 text-orange-500 hover:bg-orange-50 dark:border-orange-900/50 dark:text-orange-500 dark:hover:bg-orange-900/20"}`}>
                        {pageNum}
                    </Button>
                    ))}
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="w-8 h-8 border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 dark:border-orange-900/50 dark:text-orange-500 dark:hover:bg-orange-900/20">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
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
        </div>
      )}

      {/* ======================================================= */}
      {/* CATEGORIES TAB VIEW */}
      {/* ======================================================= */}
      {activeTab === "categories" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center transition-colors duration-200">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Transaction Categories</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage tags used to organize your ledger.</p>
              </div>
              <Button onClick={() => openCategoryModal()} variant="secondary" size="sm" className="shadow-sm dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-700">
                <Plus className="w-4 h-4 mr-1" /> Add Category
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                  <TableRow className="dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="dark:text-slate-400">Category Name</TableHead>
                    <TableHead className="dark:text-slate-400">Default Flow</TableHead>
                    <TableHead className="text-center dark:text-slate-400">Usage Count</TableHead>
                    <TableHead className="text-right dark:text-slate-400">Total Volume</TableHead>
                    <TableHead className="text-right dark:text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCategories.length === 0 ? (
                    <TableRow className="dark:border-slate-800 hover:bg-transparent">
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No categories found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCategories.map((cat) => (
                      <TableRow key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 dark:border-slate-800 transition-colors">
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {cat.name}
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400">
                          <Badge variant="outline" className={cat.type === "in" ? "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" : "text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"}>
                            {cat.type === "in" ? "Cash In" : "Cash Out"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-slate-600 dark:text-slate-300 font-medium">
                          {cat.count}
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-900 dark:text-slate-100">
                          {formatMoney(cat.totalVolume, settings.currency)}
                        </TableCell>
                        <TableCell className="text-right space-x-2 whitespace-nowrap">
                          <button onClick={() => openCategoryModal(cat)} className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1" title="Edit Category">
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1" title="Delete Category">
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* CATEGORIES PAGINATION */}
            {categoriesWithStats.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-32">
                    <CustomSelect
                      options={rowOptions}
                      value={catItemsPerPage}
                      onChange={(val) => { setCatItemsPerPage(Number(val)); setCatCurrentPage(1); }}
                      placement="top" 
                      className="bg-white dark:bg-slate-950"
                    />
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                    Showing <span className="font-medium text-slate-900 dark:text-slate-200">{((catCurrentPage - 1) * catItemsPerPage) + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{Math.min(catCurrentPage * catItemsPerPage, categoriesWithStats.length)}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{categoriesWithStats.length}</span> entries
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="icon" onClick={() => setCatCurrentPage(p => Math.max(1, p - 1))} disabled={catCurrentPage === 1} className="w-8 h-8 border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 dark:border-orange-900/50 dark:text-orange-500 dark:hover:bg-orange-900/20">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {catPageNumbers.map((pageNum) => (
                    <Button key={pageNum} variant={catCurrentPage === pageNum ? "default" : "outline"} size="icon" onClick={() => setCatCurrentPage(pageNum)} className={`w-8 h-8 transition-colors ${catCurrentPage === pageNum ? "bg-orange-500 text-white border-orange-500 dark:bg-orange-500 dark:text-white" : "border-orange-200 text-orange-500 hover:bg-orange-50 dark:border-orange-900/50 dark:text-orange-500 dark:hover:bg-orange-900/20"}`}>
                      {pageNum}
                    </Button>
                  ))}
                  <Button variant="outline" size="icon" onClick={() => setCatCurrentPage(p => Math.min(catTotalPages, p + 1))} disabled={catCurrentPage >= catTotalPages} className="w-8 h-8 border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 dark:border-orange-900/50 dark:text-orange-500 dark:hover:bg-orange-900/20">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODALS */}
      {/* ======================================================= */}
      
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

      {/* Category Editor Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-sm bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              {editingCategory.id ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
              <Input 
                value={editingCategory.name || ""} 
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} 
                placeholder="e.g. Office Supplies"
                className="focus-visible:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Default Cash Flow</label>
              <UISelect value={editingCategory.type} onValueChange={(val: string) => setEditingCategory({ ...editingCategory, type: val })}>
                <SelectTrigger className="focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                  <SelectItem value="in">Cash In (Revenue)</SelectItem>
                  <SelectItem value="out">Cash Out (Expense)</SelectItem>
                </SelectContent>
              </UISelect>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)} className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</Button>
            <Button onClick={handleSaveCategory} className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}