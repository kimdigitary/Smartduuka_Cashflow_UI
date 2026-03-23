"use client";

import { useLedger } from "@/context/LedgerContext";
import { formatMoney, calculateNet, getStatusColor } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard/Charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { mockTransactions, mockEntities, mockAccounts, mockSettings } from "@/types"; // <-- Imported Dummy Data

export default function DashboardPage() {
  const { isLoaded } = useLedger(); // Kept for hydration timing

  if (!isLoaded) return null;

  // ========================================================================
  // INJECTING DUMMY DATA HERE
  // ========================================================================
  const transactions = mockTransactions;
  const entities = mockEntities;
  const accounts = mockAccounts;
  const settings = mockSettings;

  let clearedBalance = 0;
  let arExpected = 0;
  let apOwed = 0;
  let pendingCount = 0;

  transactions.forEach((t) => {
    const net = calculateNet(t);
    if (t.status === "cleared") {
      if (t.type === "in") clearedBalance += net;
      else clearedBalance -= net;
    } else {
      pendingCount++;
      if (t.type === "in") arExpected += net;
      else apOwed += net;
    }
  });

  // Sort transactions by date descending so the newest items show up first in the table
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cleared Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${clearedBalance >= 0 ? "text-slate-900 dark:text-slate-100" : "text-red-600 dark:text-red-500"}`}>
              {formatMoney(clearedBalance, settings.currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Actual funds in bank/cash</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accounts Receivable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">{formatMoney(arExpected, settings.currency)}</div>
            <p className="text-xs text-slate-400 mt-1">Expected from Clients</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accounts Payable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-500">{formatMoney(apOwed, settings.currency)}</div>
            <p className="text-xs text-slate-400 mt-1">Owed to Vendors</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500 dark:text-orange-400">{pendingCount}</div>
            <p className="text-xs text-slate-400 mt-1">Awaiting reconciliation</p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts />

      <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Recent Activity</h3>
          <Link href="/transactions" className="text-sm text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 font-medium">View All</Link>
        </div>
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
            <TableRow className="dark:border-slate-800">
              <TableHead>Date</TableHead>
              <TableHead>Entity / Account</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Net Impact</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white dark:bg-slate-950">
            {recentTransactions.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No recent transactions.</TableCell></TableRow>
            ) : (
              recentTransactions.map((t) => {
                const entName = entities.find(e => e.id === t.entityId)?.name || "Unknown";
                const accName = accounts.find(a => a.id === t.accountId)?.name || "Unknown";
                // Format the date to look a bit nicer visually
                const formattedDate = new Date(t.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
                
                return (
                  <TableRow key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 dark:border-slate-800">
                    <TableCell className="text-slate-500 dark:text-slate-400 whitespace-nowrap">{formattedDate}</TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-200">
                      {entName} <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1">via {accName}</span>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400 text-xs">{t.category || "-"}</TableCell>
                    <TableCell className={`text-right font-bold ${t.type === "in" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                      {t.type === "in" ? "+" : "-"}{formatMoney(calculateNet(t), settings.currency)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`uppercase text-[10px] font-bold ${getStatusColor(t.status)}`} variant="outline">
                        {t.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}