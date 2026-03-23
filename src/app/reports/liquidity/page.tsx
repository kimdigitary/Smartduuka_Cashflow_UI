"use client";

import { useLedger } from "@/context/LedgerContext";
import { formatMoney, calculateNet } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function LiquidityReportPage() {
  const { transactions, accounts, settings, isLoaded } = useLedger();

  if (!isLoaded) return null;

  const accountBalances = accounts.map(acc => {
    let balance = 0;
    transactions.filter(t => t.status === "cleared" && t.accountId === acc.id).forEach(t => {
      balance += t.type === "in" ? calculateNet(t) : -calculateNet(t);
    });
    return { ...acc, balance };
  }).sort((a, b) => b.balance - a.balance);

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Account Liquidity</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time cleared balances across all accounts.</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="w-full sm:w-auto dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Export / Print PDF
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide">Liquidity / Account Balances</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Current Cleared Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountBalances.map((acc, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{acc.name}</TableCell>
                  <TableCell className="capitalize text-slate-500">{acc.type}</TableCell>
                  <TableCell className={`text-right font-bold ${acc.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(acc.balance, settings.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}