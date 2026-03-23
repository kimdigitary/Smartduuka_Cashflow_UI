"use client";

import { useLedger } from "@/context/LedgerContext";
import { formatMoney, calculateNet, getStatusColor } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockTransactions, mockEntities, mockSettings } from "@/types"; // <-- Imported Dummy Data

export default function ReconciliationPage() {
  // We keep the action handlers from context so the buttons still try to fire, 
  // but we will override the display data with the mocks.
  const { advanceTransactionStatus, bulkClearApproved, isLoaded } = useLedger();

  if (!isLoaded) return null;

  // ========================================================================
  // INJECTING DUMMY DATA HERE
  // ========================================================================
  const transactions = mockTransactions;
  const entities = mockEntities;
  const settings = mockSettings;

  if (!settings.enableRecon) {
    return <div className="text-center mt-20 text-slate-500 dark:text-slate-400">Reconciliation module is disabled in settings.</div>;
  }

  // Filter out cleared transactions to only show drafts and approvals
  const actionTxs = transactions.filter((t) => t.status !== "cleared");

  return (
    <div className="space-y-6">
      
      {/* Top Action Banner */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-4 transition-colors duration-200">
        <div>
          <h2 className="text-orange-800 dark:text-orange-300 font-semibold text-lg tracking-tight">Reconciliation Center</h2>
          <p className="text-orange-600 dark:text-orange-400/80 text-sm mt-1">Approve drafted invoices/bills, or mark approved transactions as cleared in the bank.</p>
        </div>
        <Button 
          onClick={bulkClearApproved} 
          className="bg-white dark:bg-slate-900 border border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 shadow-sm transition-colors w-full sm:w-auto"
        >
          Bulk Clear Approved
        </Button>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
            <TableRow className="dark:border-slate-800 hover:bg-transparent">
              <TableHead className="dark:text-slate-400">Date</TableHead>
              <TableHead className="dark:text-slate-400">Entity</TableHead>
              <TableHead className="dark:text-slate-400">Reference</TableHead>
              <TableHead className="text-right dark:text-slate-400">Amount</TableHead>
              <TableHead className="text-center dark:text-slate-400">Action Required</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actionTxs.length === 0 ? (
              <TableRow className="dark:border-slate-800 hover:bg-transparent">
                <TableCell colSpan={5} className="text-center py-12 text-slate-500 dark:text-slate-400">
                  All caught up! No approvals or clearings pending.
                </TableCell>
              </TableRow>
            ) : (
              actionTxs.map((t) => {
                const entName = entities.find((e) => e.id === t.entityId)?.name || "Unknown";
                // Formatting the date nicely just like in the dashboard
                const formattedDate = new Date(t.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });

                return (
                  <TableRow key={t.id} className="hover:bg-orange-50/30 dark:hover:bg-orange-900/10 dark:border-slate-800 transition-colors">
                    <TableCell className="text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                      {formattedDate}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {entName}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                      {t.desc || "-"}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${t.type === "in" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {formatMoney(calculateNet(t), settings.currency)}
                    </TableCell>
                    <TableCell className="text-center space-x-2 whitespace-nowrap">
                      <Badge className={`uppercase text-[10px] font-bold mr-2 ${getStatusColor(t.status)}`} variant="outline">
                        {t.status}
                      </Badge>
                      
                      {t.status === "draft" ? (
                        <Button 
                          size="sm" 
                          onClick={() => advanceTransactionStatus(t.id, "approved")} 
                          className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/50 shadow-sm h-7 text-xs transition-colors"
                        >
                          Approve
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => advanceTransactionStatus(t.id, "cleared")} 
                          className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800/50 shadow-sm h-7 text-xs transition-colors"
                        >
                          Mark Cleared
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
    </div>
  );
}