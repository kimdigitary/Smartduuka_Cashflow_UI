"use client";

import { useState, useEffect } from "react";
import { useLedger } from "@/context/LedgerContext";
import { Transaction, TransactionStatus } from "@/types";
import { formatMoney } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, UploadCloud, Building2, Calendar as CalendarIcon } from "lucide-react";

interface Props { isOpen: boolean; onClose: () => void; editId?: string | null; }

interface TxFormState extends Omit<Partial<Transaction>, "amount" | "fee"> {
  amount?: string | number;
  fee?: string | number;
}

export function TransactionModal({ isOpen, onClose, editId }: Props) {
  const { entities, accounts, settings, addTransaction, updateTransaction, transactions } = useLedger();

  const defaultTx: TxFormState = {
    type: "in", 
    category: "Uncategorized", 
    amount: "", 
    fee: "",    
    date: new Date().toISOString().split("T")[0],
    status: "cleared", 
    recurring: "none", 
    desc: "", 
    tags: [],
    currency: settings.currency, 
    exchangeRate: 1,
    accountId: accounts.length === 0 ? "mother_account" : "" 
  };

  const [txForm, setTxForm] = useState<TxFormState>(defaultTx);

  useEffect(() => {
    if (isOpen && editId) {
      const tx = transactions.find((t) => t.id === editId);
      if (tx) {
        setTxForm({ 
          ...tx, 
          amount: tx.amount.toString(), 
          fee: tx.fee.toString(),       
          currency: tx.currency || settings.currency, 
          exchangeRate: tx.exchangeRate || 1 
        });
      }
    } else if (isOpen) {
      setTxForm({ 
        ...defaultTx, 
        currency: settings.currency,
        accountId: accounts.length === 0 ? "mother_account" : ""
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editId, transactions, settings.currency, accounts.length]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("File too large (Max 2MB)");
      const reader = new FileReader();
      reader.onloadend = () => {
        setTxForm({ ...txForm, attachmentName: file.name, attachmentData: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatWithCommas = (val: number | string | undefined) => {
    if (val === undefined || val === null || val === "") return "";
    const parts = val.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: "amount" | "fee" | "exchangeRate") => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (rawValue === "" || /^\d*\.?\d*$/.test(rawValue)) {
      setTxForm({ ...txForm, [field]: rawValue });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.strictMode && !txForm.entityId) return;
    if (settings.strictMode && accounts.length > 0 && !txForm.accountId) return;

    const finalTx = {
      ...txForm,
      id: txForm.id || `t_${Date.now()}`,
      amount: Number(txForm.amount) || 0,
      fee: Number(txForm.fee) || 0,
      exchangeRate: Number(txForm.exchangeRate) || 1,
      accountId: txForm.accountId || "mother_account",
      tags: txForm.tags || [],
    } as Transaction;

    if (txForm.recurring !== "none" && !txForm.id) finalTx.lastProcessed = finalTx.date;
    if (txForm.id) updateTransaction(finalTx); else addTransaction(finalTx);
    onClose();
  };

  const isForeignCurrency = txForm.currency !== settings.currency;
  const totalAmount = (Number(txForm.amount) || 0) + (Number(txForm.fee) || 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* FIX 1: Increased max-w-3xl to max-w-5xl to stop horizontal squeezing */}
      <DialogContent className="sm:max-w-5xl w-[95vw] p-0 overflow-hidden flex flex-col max-h-[90vh] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl rounded-xl">
        
        {/* FIX 2: Added shrink-0 so the header never squishes */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center">
            {editId ? "Edit Transaction" : "Record New Transaction"}
          </DialogTitle>
        </DialogHeader>

        {/* FIX 3: Replaced ScrollArea with standard div. min-h-0 is the magic property that forces the scrollbar instead of pushing the footer off screen */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6">
          <form id="tx-form" onSubmit={handleSubmit} className="space-y-6 px-1">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2 text-slate-500" />
                    Transaction Date *
                  </label>
                  <Input 
                    className="w-full sm:w-1/2 dark:bg-slate-950 dark:border-slate-700 shadow-sm" 
                    type="date" 
                    required 
                    value={txForm.date || ""} 
                    onChange={(e) => setTxForm({ ...txForm, date: e.target.value })} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <label className="cursor-pointer">
                    <input type="radio" name="type" value="in" checked={txForm.type === "in"} onChange={() => setTxForm({ ...txForm, type: "in" })} className="peer sr-only" />
                    <div className="text-center px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg peer-checked:bg-green-50 dark:peer-checked:bg-green-950/30 peer-checked:border-green-500 peer-checked:text-green-700 dark:peer-checked:text-green-400 transition-all font-semibold shadow-sm">
                      Cash In
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="type" value="out" checked={txForm.type === "out"} onChange={() => setTxForm({ ...txForm, type: "out" })} className="peer sr-only" />
                    <div className="text-center px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg peer-checked:bg-red-50 dark:peer-checked:bg-red-950/30 peer-checked:border-red-500 peer-checked:text-red-700 dark:peer-checked:text-red-400 transition-all font-semibold shadow-sm">
                      Cash Out
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Entity {settings.strictMode && "*"}</label>
                    <Select required={settings.strictMode} value={txForm.entityId} onValueChange={(val) => setTxForm({ ...txForm, entityId: val })}>
                      <SelectTrigger className="bg-white dark:bg-slate-950 dark:border-slate-800 shadow-sm"><SelectValue placeholder="Select Entity" /></SelectTrigger>
                      <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                        {entities.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category (Optional)</label>
                    <Select value={txForm.category} onValueChange={(val) => setTxForm({ ...txForm, category: val })}>
                      <SelectTrigger className="bg-white dark:bg-slate-950 dark:border-slate-800 shadow-sm"><SelectValue placeholder="Select Category" /></SelectTrigger>
                      <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                        <SelectItem value="Sales Revenue">Sales Revenue</SelectItem>
                        <SelectItem value="Consulting Services">Consulting Services</SelectItem>
                        <SelectItem value="Software/Subscriptions">Software/Subscriptions</SelectItem>
                        <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                        <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                      <Select value={txForm.currency} onValueChange={(val) => setTxForm({ ...txForm, currency: val })}>
                        <SelectTrigger className="bg-white dark:bg-slate-950 dark:border-slate-700 shadow-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                          <SelectItem value={settings.currency}>{settings.currency} (Base)</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gross Amount *</label>
                      <Input 
                        className="dark:bg-slate-950 dark:border-slate-700 shadow-sm font-semibold" 
                        type="text" 
                        required 
                        value={formatWithCommas(txForm.amount)} 
                        onChange={(e) => handleNumberChange(e, "amount")} 
                        placeholder="0.00"
                      />
                    </div>
                    {isForeignCurrency && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">FX Rate</label>
                        <Input 
                          className="dark:bg-slate-950 dark:border-slate-700 shadow-sm" 
                          type="text" 
                          required 
                          value={formatWithCommas(txForm.exchangeRate)} 
                          onChange={(e) => handleNumberChange(e, "exchangeRate")} 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 items-center pt-4 border-t border-slate-200 dark:border-slate-700/50">
                     <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Transaction Fee (Optional)</label>
                      <Input 
                        className="dark:bg-slate-950 dark:border-slate-700 shadow-sm" 
                        type="text" 
                        value={formatWithCommas(txForm.fee)} 
                        onChange={(e) => handleNumberChange(e, "fee")} 
                        placeholder="0.00" 
                      />
                    </div>
                    <div className="text-right">
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Figure</label>
                        <div className={`text-2xl font-black tracking-tight ${txForm.type === 'in' ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-slate-100"}`}>
                             {formatMoney(totalAmount, settings.currency)}
                        </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account {settings.strictMode && "*"}</label>
                    {accounts.length === 0 ? (
                      <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-sm text-slate-600 dark:text-slate-400 shadow-inner cursor-not-allowed">
                        <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                        Business Mother Account (Default)
                      </div>
                    ) : (
                      <Select required={settings.strictMode} value={txForm.accountId} onValueChange={(val) => setTxForm({ ...txForm, accountId: val })}>
                        <SelectTrigger className="bg-white dark:bg-slate-950 dark:border-slate-800 shadow-sm"><SelectValue placeholder="Select Account" /></SelectTrigger>
                        <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                          <SelectItem value="mother_account" className="font-semibold text-orange-600 dark:text-orange-400">Mother Account</SelectItem>
                          {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <Textarea className="dark:bg-slate-950 dark:border-slate-800 shadow-sm resize-none" rows={3} value={txForm.desc || ""} onChange={(e) => setTxForm({ ...txForm, desc: e.target.value })} placeholder="Add notes about this transaction..." />
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-6 md:pt-0 md:pl-8 space-y-6">
                
                <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Transaction Status</label>
                  <Select value={txForm.status} onValueChange={(val: TransactionStatus) => setTxForm({ ...txForm, status: val })}>
                    <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 shadow-sm font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                      <SelectItem value="cleared">Cleared (Funds Settled)</SelectItem>
                      <SelectItem value="approved">Approved (Awaiting Clearing)</SelectItem>
                      <SelectItem value="draft">Draft (Needs Approval)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Document Vault</label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors relative cursor-pointer group bg-white dark:bg-slate-950">
                    <UploadCloud className="w-10 h-10 text-slate-300 dark:text-slate-600 group-hover:text-orange-500 transition-colors mb-3" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Click to attach receipt</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PDF or Image (Max 2MB)</p>
                    <input type="file" accept="image/*,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} />
                  </div>
                  {txForm.attachmentName && (
                    <div className="mt-3 p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg text-xs text-blue-700 dark:text-blue-300 truncate shadow-sm flex items-center">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shrink-0"></span>
                      {txForm.attachmentName}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {txForm.type === "out" && totalAmount >= settings.approvalThreshold && !txForm.id && txForm.status === "cleared" && (
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 text-orange-800 dark:text-orange-300 rounded-lg p-3 flex items-start mt-6 shadow-sm">
                <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5 text-orange-600 dark:text-orange-500" />
                <p className="text-sm">Amount exceeds threshold. Are you sure you want to bypass Draft mode and mark as Cleared?</p>
              </div>
            )}
          </form>
        </div>

        {/* FIX 4: Added shrink-0 so the footer is always visible at the bottom of the modal */}
        <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 shrink-0 sm:justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 bg-white dark:bg-slate-950 shadow-sm">
            Cancel
          </Button>
          <Button type="submit" form="tx-form" className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-sm font-semibold px-6">
            Save Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}