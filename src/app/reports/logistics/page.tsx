"use client";

import { useLedger } from "@/context/LedgerContext";
import { formatMoney, calculateNet } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function LogisticsReportPage() {
  const { transactions, settings, isLoaded } = useLedger();

  if (!isLoaded) return null;

  const logisticsTxs = transactions.filter(t => 
    t.status === "cleared" && 
    (t.category.toLowerCase().includes("transport") || t.category.toLowerCase().includes("fuel") || t.category.toLowerCase().includes("warehouse") || t.category.toLowerCase().includes("packaging"))
  );

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Logistics & Fuel</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review expenses related to transportation and warehousing.</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="w-full sm:w-auto dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Export / Print PDF
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Logistics, Fuel & Warehouse Expenses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logisticsTxs.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8">No logistics expenses found.</TableCell></TableRow> : 
                logisticsTxs.map((t, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell>{t.desc}</TableCell>
                    <TableCell className="text-right font-bold text-red-600">{formatMoney(calculateNet(t), settings.currency)}</TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}