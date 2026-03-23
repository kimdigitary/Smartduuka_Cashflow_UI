"use client";

import { useLedger } from "@/context/LedgerContext";
import { formatMoney, calculateNet } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function CategoriesReportPage() {
  const { transactions, settings, isLoaded } = useLedger();

  if (!isLoaded) return null;

  const categoryTotals: Record<string, { in: number; out: number }> = {};
  
  transactions.filter(t => t.status === "cleared").forEach(t => {
    const cat = t.category || "Uncategorized";
    if (!categoryTotals[cat]) categoryTotals[cat] = { in: 0, out: 0 };
    if (t.type === "in") categoryTotals[cat].in += calculateNet(t);
    else categoryTotals[cat].out += calculateNet(t);
  });
  
  const categoryArray = Object.entries(categoryTotals)
    .map(([name, totals]) => ({ name, ...totals, net: totals.in - totals.out }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Category Breakdown</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review cash flow sorted by internal categories.</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="w-full sm:w-auto dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Export / Print PDF
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide">Category Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Cash In</TableHead>
                <TableHead className="text-right">Cash Out</TableHead>
                <TableHead className="text-right">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryArray.map((cat, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-right text-green-600">{formatMoney(cat.in, settings.currency)}</TableCell>
                  <TableCell className="text-right text-slate-600">{formatMoney(cat.out, settings.currency)}</TableCell>
                  <TableCell className={`text-right font-bold ${cat.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(cat.net, settings.currency)}
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