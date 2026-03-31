"use client";

import { useState, useMemo } from "react";
import { useLedger } from "@/context/LedgerContext";
import { formatMoney } from "@/lib/utils";
import { Account, AccountType } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomSelect } from "@/components/ui/CustomSelect"; // <-- Import added here
import { 
  Edit, Trash2, Plus, Landmark, Smartphone, Wallet, 
  WalletCards, Building2, TrendingUp, TrendingDown, Scale,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { mockTransactions, mockAccounts, mockSettings } from "@/types"; 

export default function AccountsPage() {
  const { addAccount, updateAccount, deleteAccount, isLoaded } = useLedger(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<Partial<Account>>({ type: "bank" });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // <-- Now a state variable

  if (!isLoaded) return null;

  // ========================================================================
  // DUMMY DATA INJECTION
  // ========================================================================
  const transactions = mockTransactions;
  const accounts = mockAccounts;
  const settings = mockSettings;

  // ========================================================================
  // MOTHER ACCOUNT (CONSOLIDATED TREASURY) CALCULATIONS
  // ========================================================================
  const motherAccountStats = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    let totalFees = 0;

    transactions.forEach((t) => {
      if (t.status === "cleared") {
        if (t.type === "in") totalIn += t.amount;
        if (t.type === "out") totalOut += t.amount;
        totalFees += t.fee;
      }
    });

    return {
      totalIn,
      totalOut: totalOut + totalFees,
      netBalance: totalIn - (totalOut + totalFees),
    };
  }, [transactions]);

  // ========================================================================
  // PAGINATION LOGIC
  // ========================================================================
  const totalPages = Math.ceil(accounts.length / itemsPerPage);
  const paginatedAccounts = accounts.slice(
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

  // Row selector options
  const rowOptions = [
    { value: 5, label: "5 Rows" },
    { value: 10, label: "10 Rows" },
    { value: 20, label: "20 Rows" },
    { value: 50, label: "50 Rows" },
  ];

  // ========================================================================
  // HANDLERS
  // ========================================================================
  const handleSave = () => {
    if (!editingAcc.name) return toast.error("Account name is required");
    if (editingAcc.id) {
      updateAccount(editingAcc as Account);
    } else {
      addAccount({ ...editingAcc, id: `a_${Date.now()}` } as Account);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (transactions.some((t) => t.accountId === id)) {
      return toast.error("Cannot delete account: It has linked transactions.");
    }
    if (confirm("Delete this account?")) {
      deleteAccount(id);
      if (paginatedAccounts.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    }
  };

  const openModal = (acc?: Account) => {
    setEditingAcc(acc || { type: "bank" });
    setIsModalOpen(true);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank": return <Landmark className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      case "mobile": return <Smartphone className="w-4 h-4 text-green-500 dark:text-green-400" />;
      case "cash": return <Wallet className="w-4 h-4 text-orange-500 dark:text-orange-400" />;
      default: return <WalletCards className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* MOTHER ACCOUNT HERO CARD */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-2xl border border-slate-800 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Building2 className="w-48 h-48 text-white" />
        </div>
        
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                <Building2 className="w-6 h-6 mr-3 text-orange-500" />
                Business Mother Account
              </h2>
              <p className="text-slate-400 text-sm mt-1 max-w-lg">
                The consolidated main treasury. This represents your total business standing, whether kept as one unified account or broken down into multiple sub-accounts below.
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Overall Net Position</p>
              <h1 className={`text-3xl sm:text-4xl font-black ${motherAccountStats.netBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
                {formatMoney(motherAccountStats.netBalance, settings.currency)}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/10 border border-white/10 rounded-xl p-4 flex items-center backdrop-blur-sm">
              <div className="bg-green-500/20 p-3 rounded-lg mr-4">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-0.5">Global Cash In</p>
                <p className="text-xl font-bold text-green-400">{formatMoney(motherAccountStats.totalIn, settings.currency)}</p>
              </div>
            </div>
            
            <div className="bg-white/10 border border-white/10 rounded-xl p-4 flex items-center backdrop-blur-sm">
              <div className="bg-red-500/20 p-3 rounded-lg mr-4">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-0.5">Global Cash Out (inc. fees)</p>
                <p className="text-xl font-bold text-red-400">{formatMoney(motherAccountStats.totalOut, settings.currency)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-ACCOUNTS BREAKDOWN TABLE */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors duration-200">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center">
              <Scale className="w-4 h-4 mr-2 text-slate-500" />
              Sub-Accounts Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage physical banks, mobile money, and cash registers.</p>
          </div>
          <Button 
            onClick={() => openModal()} 
            variant="secondary" 
            size="sm" 
            className="shadow-sm dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-700 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Sub-Account
          </Button>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="dark:border-slate-800 hover:bg-transparent">
                <TableHead className="dark:text-slate-400">Account Name</TableHead>
                <TableHead className="dark:text-slate-400">Type</TableHead>
                <TableHead className="text-right dark:text-slate-400">Gross Cash In</TableHead>
                <TableHead className="text-right dark:text-slate-400">Gross Cash Out</TableHead>
                <TableHead className="text-right dark:text-slate-400">Net Position</TableHead>
                <TableHead className="text-right dark:text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow className="dark:border-slate-800 hover:bg-transparent">
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                      <WalletCards className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-600" />
                      <p>No sub-accounts created yet.</p>
                      <p className="text-xs mt-1">All entries will currently hit the main mother account directly.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAccounts.map((acc) => {
                  let inTotal = 0, outTotal = 0, fees = 0;
                  
                  transactions.filter((t) => t.accountId === acc.id && t.status === "cleared").forEach((t) => {
                    fees += t.fee;
                    if (t.type === "in") inTotal += t.amount; 
                    else outTotal += t.amount;
                  });
                  
                  const net = inTotal - outTotal - fees;

                  return (
                    <TableRow key={acc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 dark:border-slate-800 transition-colors">
                      <TableCell className="font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {acc.name}
                      </TableCell>
                      
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        <div className="flex items-center capitalize bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md w-fit text-xs font-medium shadow-sm">
                          <span className="mr-2">{getAccountIcon(acc.type)}</span>
                          {acc.type}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right text-green-600 dark:text-green-400 whitespace-nowrap">
                        {formatMoney(inTotal, settings.currency)}
                      </TableCell>
                      
                      <TableCell className="text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatMoney(outTotal + fees, settings.currency)}
                      </TableCell>
                      
                      <TableCell className={`text-right font-bold whitespace-nowrap ${net >= 0 ? "text-slate-900 dark:text-white" : "text-red-600 dark:text-red-400"}`}>
                        {formatMoney(net, settings.currency)}
                      </TableCell>
                      
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => openModal(acc)} 
                          className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                          title="Edit Account"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button 
                          onClick={() => handleDelete(acc.id)} 
                          className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                          title="Delete Account"
                        >
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
        
        {/* ======================================================= */}
        {/* PAGINATION & ROW SELECTOR CONTROLS */}
        {/* ======================================================= */}
        {accounts.length > 0 && (
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
                  placement="top" // Prefers opening upwards from the footer
                  className="bg-white dark:bg-slate-950"
                />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                Showing <span className="font-medium text-slate-900 dark:text-slate-200">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, accounts.length)}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{accounts.length}</span> entries
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

      {/* ACCOUNT CREATION/EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-sm bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 transition-colors duration-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100 flex items-center">
              {editingAcc.id ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {editingAcc.id ? "Edit Sub-Account" : "Add Sub-Account"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Account Name
              </label>
              <Input 
                placeholder="e.g. Main Stanbic Acc" 
                value={editingAcc.name || ""} 
                onChange={(e) => setEditingAcc({ ...editingAcc, name: e.target.value })} 
                className="focus-visible:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Account Type
              </label>
              <UISelect 
                value={editingAcc.type} 
                onValueChange={(val: AccountType) => setEditingAcc({ ...editingAcc, type: val })}
              >
                <SelectTrigger className="focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                  <SelectItem value="bank">Bank Account</SelectItem>
                  <SelectItem value="mobile">Mobile Money</SelectItem>
                  <SelectItem value="cash">Cash in Hand</SelectItem>
                </SelectContent>
              </UISelect>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
            >
              Save Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}