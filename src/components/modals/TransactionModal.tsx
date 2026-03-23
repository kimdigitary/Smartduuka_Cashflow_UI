"use client";

import { useState, useEffect } from "react";
import { useLedger } from "@/context/LedgerContext";
import { Transaction, TransactionStatus, RecurringSchedule } from "@/types";
import { formatMoney } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, UploadCloud } from "lucide-react";

interface Props { isOpen: boolean; onClose: () => void; editId?: string | null; }

export function TransactionModal({ isOpen, onClose, editId }: Props) {
  const { entities, accounts, settings, addTransaction, updateTransaction, transactions } = useLedger();

  const defaultTx: Partial<Transaction> = {
    type: "in", category: "Uncategorized", amount: 0, fee: 0,
    date: new Date().toISOString().split("T")[0],
    expectedDate: new Date().toISOString().split("T")[0],
    status: "draft", recurring: "none", desc: "", tags: [],
    currency: settings.currency, exchangeRate: 1
  };

  const [txForm, setTxForm] = useState<Partial<Transaction>>(defaultTx);

  useEffect(() => {
    if (isOpen && editId) {
      const tx = transactions.find((t) => t.id === editId);
      if (tx) setTxForm({ ...tx, currency: tx.currency || settings.currency, exchangeRate: tx.exchangeRate || 1 });
    } else if (isOpen) {
      setTxForm({ ...defaultTx, currency: settings.currency });
    }
  }, [isOpen, editId, transactions, settings.currency]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("File too large (Max 2MB for local storage simulation)");
      const reader = new FileReader();
      reader.onloadend = () => {
        setTxForm({ ...txForm, attachmentName: file.name, attachmentData: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.strictMode && (!txForm.entityId || !txForm.accountId)) return;

    const finalTx = {
      ...txForm,
      id: txForm.id || `t_${Date.now()}`,
      amount: Number(txForm.amount),
      fee: Number(txForm.fee),
      exchangeRate: Number(txForm.exchangeRate) || 1,
      tags: txForm.tags || [],
    } as Transaction;

    if (txForm.recurring !== "none" && !txForm.id) finalTx.lastProcessed = finalTx.date;
    if (txForm.id) updateTransaction(finalTx); else addTransaction(finalTx);
    onClose();
  };

  const isForeignCurrency = txForm.currency !== settings.currency;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden flex flex-col max-h-[90vh] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
          <DialogTitle>{editId ? "Edit Transaction" : "Record Transaction"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <form id="tx-form" onSubmit={handleSubmit} className="space-y-5 px-1">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-5">
                <div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <label className="cursor-pointer">
                      <input type="radio" name="type" value="in" checked={txForm.type === "in"} onChange={() => setTxForm({ ...txForm, type: "in" })} className="peer sr-only" />
                      <div className="text-center px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg peer-checked:bg-green-50 dark:peer-checked:bg-green-950/30 peer-checked:border-green-500 dark:peer-checked:border-green-500/50 peer-checked:text-green-700 dark:peer-checked:text-green-400 transition-all font-medium">Cash In</div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="type" value="out" checked={txForm.type === "out"} onChange={() => setTxForm({ ...txForm, type: "out" })} className="peer sr-only" />
                      <div className="text-center px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg peer-checked:bg-red-50 dark:peer-checked:bg-red-950/30 peer-checked:border-red-500 dark:peer-checked:border-red-500/50 peer-checked:text-red-700 dark:peer-checked:text-red-400 transition-all font-medium">Cash Out</div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Entity {settings.strictMode && "*"}</label>
                    <Select required={settings.strictMode} value={txForm.entityId} onValueChange={(val) => setTxForm({ ...txForm, entityId: val })}>
                      <SelectTrigger className="bg-white dark:bg-slate-950 dark:border-slate-800"><SelectValue placeholder="Select Entity" /></SelectTrigger>
                      <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                        {entities.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <Select value={txForm.category} onValueChange={(val) => setTxForm({ ...txForm, category: val })}>
                      <SelectTrigger className="bg-white dark:bg-slate-950 dark:border-slate-800"><SelectValue /></SelectTrigger>
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

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                      <Select value={txForm.currency} onValueChange={(val) => setTxForm({ ...txForm, currency: val })}>
                        <SelectTrigger className="bg-white dark:bg-slate-950 dark:border-slate-800"><SelectValue /></SelectTrigger>
                        <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                          <SelectItem value={settings.currency}>{settings.currency} (Base)</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gross Amount *</label>
                      <Input className="dark:bg-slate-950 dark:border-slate-800" type="number" required min="0" step="0.01" value={txForm.amount || ""} onChange={(e) => setTxForm({ ...txForm, amount: parseFloat(e.target.value) })} />
                    </div>
                    {isForeignCurrency && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">FX Rate (to {settings.currency})</label>
                        <Input className="dark:bg-slate-950 dark:border-slate-800" type="number" required min="0.0001" step="0.0001" value={txForm.exchangeRate || ""} onChange={(e) => setTxForm({ ...txForm, exchangeRate: parseFloat(e.target.value) })} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account {settings.strictMode && "*"}</label>
                    <Select required={settings.strictMode} value={txForm.accountId} onValueChange={(val) => setTxForm({ ...txForm, accountId: val })}>
                      <SelectTrigger className="bg-white dark:bg-slate-950 dark:border-slate-800"><SelectValue placeholder="Select Account" /></SelectTrigger>
                      <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                        {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Invoice Date *</label>
                    <Input className="dark:bg-slate-950 dark:border-slate-800 dark:[color-scheme:dark]" type="date" required value={txForm.date} onChange={(e) => setTxForm({ ...txForm, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expected Cash Date</label>
                    <Input className="dark:bg-slate-950 dark:border-slate-800 dark:[color-scheme:dark]" type="date" value={txForm.expectedDate || txForm.date} onChange={(e) => setTxForm({ ...txForm, expectedDate: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <Textarea className="dark:bg-slate-950 dark:border-slate-800" rows={2} value={txForm.desc || ""} onChange={(e) => setTxForm({ ...txForm, desc: e.target.value })} />
                </div>
              </div>

              {/* Document Vault Dropzone */}
              <div className="md:col-span-1 border-l border-slate-200 dark:border-slate-800 pl-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Document Vault</label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors relative cursor-pointer">
                    <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Click to upload receipt</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">PDF or Image (Max 2MB)</p>
                    <input type="file" accept="image/*,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} />
                  </div>
                  {txForm.attachmentName && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-md text-xs text-blue-700 dark:text-blue-400 truncate">
                      Attached: {txForm.attachmentName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <Select value={txForm.status} onValueChange={(val: TransactionStatus) => setTxForm({ ...txForm, status: val })}>
                    <SelectTrigger className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50 text-orange-900 dark:text-orange-200 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                      <SelectItem value="draft">Draft (Needs Approval)</SelectItem>
                      <SelectItem value="approved">Approved (Awaiting Clearing)</SelectItem>
                      <SelectItem value="cleared">Cleared (Funds Settled)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {txForm.type === "out" && Number(txForm.amount) >= settings.approvalThreshold && !txForm.id && (
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 text-orange-800 dark:text-orange-300 rounded-lg p-3 flex items-start mt-4">
                <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5 text-orange-600 dark:text-orange-500" />
                <p className="text-sm">Amount exceeds threshold. Will be saved as Draft.</p>
              </div>
            )}
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</Button>
          <Button type="submit" form="tx-form" className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500 text-white">Save Record</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}