"use client";

import { useState } from "react";
import { useLedger } from "@/context/LedgerContext";
import { formatMoney } from "@/lib/utils";
import { Account, AccountType } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus, Landmark, Smartphone, Wallet, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { mockTransactions, mockAccounts, mockSettings } from "@/types"; // <-- Imported Dummy Data

export default function AccountsPage() {
  const { addAccount, updateAccount, deleteAccount, isLoaded } = useLedger(); // Kept for hydration and modal actions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<Partial<Account>>({ type: "bank" });

  if (!isLoaded) return null;

  // ========================================================================
  // INJECTING DUMMY DATA HERE
  // ========================================================================
  const transactions = mockTransactions;
  const accounts = mockAccounts;
  const settings = mockSettings;

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
    if (confirm("Delete this account?")) deleteAccount(id);
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
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center transition-colors duration-200">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Account Statements</h3>
          <Button 
            onClick={() => openModal()} 
            variant="secondary" 
            size="sm" 
            className="shadow-sm dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Account
          </Button>
        </div>

        {/* Table Container (Responsive) */}
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
                      <p>No accounts created yet.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((acc) => {
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
                      
                      <TableCell className={`text-right font-bold whitespace-nowrap ${net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {formatMoney(net, settings.currency)}
                      </TableCell>
                      
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => openModal(acc)} 
                          className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button 
                          onClick={() => handleDelete(acc.id)} 
                          className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
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
      </div>

      {/* Account Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-sm bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 transition-colors duration-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              {editingAcc.id ? "Edit Account" : "Add Account"}
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
              <Select 
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
              </Select>
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
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}