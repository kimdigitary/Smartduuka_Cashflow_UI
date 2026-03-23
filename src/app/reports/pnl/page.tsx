"use client";

import { useLedger } from "@/context/LedgerContext";
import { formatMoney } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function PNLReportPage() {
  const { transactions, settings, isLoaded } = useLedger();

  if (!isLoaded) return null;

  let totalRevenue = 0;
  let totalExpenses = 0;
  let totalFees = 0;
  
  const clearedTransactions = transactions.filter(t => t.status === "cleared");
  
  clearedTransactions.forEach(t => {
    if (t.type === "in") totalRevenue += t.amount;
    else totalExpenses += t.amount;
    totalFees += t.fee;
  });
  
  const netProfit = totalRevenue - totalExpenses - totalFees;

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Income Statement (P&L)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review your gross revenue, expenses, and net profit.</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="w-full sm:w-auto dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Export / Print PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="dark:bg-slate-950 dark:border-slate-800">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Gross Revenue</p>
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-500">{formatMoney(totalRevenue, settings.currency)}</h3>
          </CardContent>
        </Card>
        <Card className="dark:bg-slate-950 dark:border-slate-800">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Expenses & Fees</p>
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-500">{formatMoney(totalExpenses + totalFees, settings.currency)}</h3>
          </CardContent>
        </Card>
        <Card className="dark:bg-slate-950 dark:border-slate-800 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">Net Profit</p>
            <h3 className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {formatMoney(netProfit, settings.currency)}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide">P&L Details (Cleared Transactions)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Expense/Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clearedTransactions.map(t => (
                <TableRow key={t.id} className="dark:border-slate-800">
                  <TableCell className="text-slate-500 whitespace-nowrap text-sm">{t.date}</TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{t.desc}</TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">{t.category}</TableCell>
                  <TableCell className="text-right text-green-600">{t.type === "in" ? formatMoney(t.amount, settings.currency) : "-"}</TableCell>
                  <TableCell className="text-right text-red-600">{t.type === "out" ? formatMoney(t.amount + t.fee, settings.currency) : formatMoney(t.fee, settings.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}