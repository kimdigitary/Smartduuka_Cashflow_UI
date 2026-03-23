"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Transaction, Entity, Account, SystemSettings, AuditLog } from "@/types";
import { toast } from "sonner";
import { formatMoney, calculateNet } from "@/lib/utils";
import { mockTransactions, mockEntities, mockAccounts, mockSettings, mockAuditLogs } from "@/types";

interface LedgerContextType {
  transactions: Transaction[];
  entities: Entity[];
  accounts: Account[];
  settings: SystemSettings;
  auditLogs: AuditLog[];
  isLoaded: boolean;
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  advanceTransactionStatus: (id: string, newStatus: Transaction["status"]) => void;
  bulkClearApproved: () => void;
  addEntity: (entity: Entity) => void;
  updateEntity: (entity: Entity) => void;
  deleteEntity: (id: string) => void;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  updateSettings: (newSettings: SystemSettings) => void;
  simulateDispatch: () => void;
  factoryReset: () => void;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(mockSettings);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Read from local storage
    const storedSettings = JSON.parse(localStorage.getItem("cf_settings") || "null");
    const storedTxs = JSON.parse(localStorage.getItem("cf_transactions") || "null");
    const storedEntities = JSON.parse(localStorage.getItem("cf_entities") || "null");
    const storedAccounts = JSON.parse(localStorage.getItem("cf_accounts") || "null");
    const storedLogs = JSON.parse(localStorage.getItem("cf_audit") || "null");

    setSettings(storedSettings || mockSettings);

    // If no data exists (or if it's empty from previous testing), inject the rich dummy data
    if (!storedTxs || storedTxs.length === 0 || !storedEntities || !storedAccounts) {
      setAccounts(mockAccounts);
      setEntities(mockEntities);
      setTransactions(mockTransactions);
      setAuditLogs(mockAuditLogs);
    } else {
      setAccounts(storedAccounts);
      setEntities(storedEntities);
      setTransactions(storedTxs);
      setAuditLogs(storedLogs || []);
    }
    
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cf_transactions", JSON.stringify(transactions));
      localStorage.setItem("cf_entities", JSON.stringify(entities));
      localStorage.setItem("cf_accounts", JSON.stringify(accounts));
      localStorage.setItem("cf_settings", JSON.stringify(settings));
      localStorage.setItem("cf_audit", JSON.stringify(auditLogs));
    }
  }, [transactions, entities, accounts, settings, auditLogs, isLoaded]);

  const logAction = (action: AuditLog["action"], entityName: string, details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`, timestamp: new Date().toISOString(),
      action, entityName, details, user: "System Admin"
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addTransaction = (tx: Transaction) => {
    let finalTx = { ...tx };
    if (finalTx.type === "out" && finalTx.amount >= settings.approvalThreshold && finalTx.status !== "draft") {
      finalTx.status = "draft";
      toast.warning(`Amount exceeds threshold. Sent to drafts for approval.`);
    }
    setTransactions((prev) => [finalTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    logAction("CREATED", `Transaction ${finalTx.id}`, `Recorded ${finalTx.type} for ${finalTx.amount}`);
    toast.success("Transaction recorded");
  };

  const updateTransaction = (tx: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));
    logAction("UPDATED", `Transaction ${tx.id}`, `Modified record parameters.`);
    toast.success("Transaction updated");
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    logAction("DELETED", `Transaction ${id}`, `Record permanently removed.`);
    toast.error("Record deleted");
  };

  const advanceTransactionStatus = (id: string, newStatus: Transaction["status"]) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    logAction("STATUS_CHANGED", `Transaction ${id}`, `Status moved to ${newStatus}.`);
    toast.success(`Marked as ${newStatus}`);
  };

  const bulkClearApproved = () => {
    let count = 0;
    setTransactions((prev) => prev.map((t) => {
      if (t.status === "approved") { count++; return { ...t, status: "cleared" }; }
      return t;
    }));
    if (count > 0) {
      logAction("SYSTEM_ACTION", "Bulk Action", `Cleared ${count} approved transactions.`);
      toast.success(`${count} records cleared.`);
    } else {
      toast.info("No approved records to clear");
    }
  };

  const addEntity = (entity: Entity) => { setEntities((prev) => [...prev, entity]); logAction("CREATED", `Entity ${entity.name}`, "New entity added."); toast.success("Entity created"); };
  const updateEntity = (entity: Entity) => { setEntities((prev) => prev.map((e) => (e.id === entity.id ? entity : e))); logAction("UPDATED", `Entity ${entity.name}`, "Entity details updated."); toast.success("Entity updated"); };
  const deleteEntity = (id: string) => { setEntities((prev) => prev.filter((e) => e.id !== id)); logAction("DELETED", `Entity ${id}`, "Entity deleted."); toast.error("Entity deleted"); };

  const addAccount = (account: Account) => { setAccounts((prev) => [...prev, account]); logAction("CREATED", `Account ${account.name}`, "New account added."); toast.success("Account created"); };
  const updateAccount = (account: Account) => { setAccounts((prev) => prev.map((a) => (a.id === account.id ? account : a))); logAction("UPDATED", `Account ${account.name}`, "Account details updated."); toast.success("Account updated"); };
  const deleteAccount = (id: string) => { setAccounts((prev) => prev.filter((a) => a.id !== id)); logAction("DELETED", `Account ${id}`, "Account deleted."); toast.error("Account deleted"); };

  const updateSettings = (newSettings: SystemSettings) => { setSettings(newSettings); logAction("UPDATED", "System Settings", "Configuration changed."); toast.success("System configuration saved"); };
  
  const simulateDispatch = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayTxs = transactions.filter(t => t.date === today && t.status === "cleared");
    let inTotal = 0; let outTotal = 0;
    todayTxs.forEach(t => { if(t.type === "in") inTotal += calculateNet(t); else outTotal += calculateNet(t); });
    
    logAction("SYSTEM_ACTION", "Dispatch Report", `EOD Dispatch to ${settings.dispatchEmail}`);
    toast.success(`Report Dispatched to ${settings.dispatchEmail}`, {
      description: `In: ${formatMoney(inTotal, settings.currency)} | Out: ${formatMoney(outTotal, settings.currency)}`
    });
  };

  const factoryReset = () => {
    // Instead of emptying the system out, we reset it back to the rich dummy data!
    setTransactions(mockTransactions); 
    setEntities(mockEntities); 
    setAccounts(mockAccounts); 
    setSettings(mockSettings); 
    setAuditLogs(mockAuditLogs);
    localStorage.clear();
    toast.error("System reset back to default dataset");
  };

  return (
    <LedgerContext.Provider value={{
      transactions, entities, accounts, settings, auditLogs, isLoaded,
      addTransaction, updateTransaction, deleteTransaction, advanceTransactionStatus, bulkClearApproved,
      addEntity, updateEntity, deleteEntity, addAccount, updateAccount, deleteAccount,
      updateSettings, simulateDispatch, factoryReset
    }}>
      {children}
    </LedgerContext.Provider>
  );
}

export function useLedger() {
  const context = useContext(LedgerContext);
  if (context === undefined) throw new Error("useLedger must be used within a LedgerProvider");
  return context;
}