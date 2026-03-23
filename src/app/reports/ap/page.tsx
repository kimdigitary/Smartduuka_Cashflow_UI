"use client";

import { useLedger } from "@/context/LedgerContext";
import { formatMoney, calculateNet } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function APReportPage() {
  const { transactions, entities, settings, isLoaded } = useLedger();

  if (!isLoaded) return null;

  const apData: Record<string, number> = {};
  
  transactions.filter(t => t.status !== "cleared").forEach(t => {
    const entName = entities.find(e => e.id === t.entityId)?.name || "Unknown";
    const net = calculateNet(t);
    if (t.type === "out") apData[entName] = (apData[entName] || 0) + net;
  });

  const apArray = Object.entries(apData).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Accounts Payable</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track pending outflows and vendor obligations.</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="w-full sm:w-auto dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Export / Print PDF
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-red-50/50 dark:bg-red-500/5">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-red-800 dark:text-red-400">Accounts Payable (Pending Outflow)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor / Entity</TableHead>
                <TableHead className="text-right">Total We Owe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apArray.length === 0 ? <TableRow><TableCell colSpan={2} className="text-center py-8">No pending payables.</TableCell></TableRow> : 
                apArray.map(([name, amount], idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell className="text-right font-bold text-red-600">{formatMoney(amount, settings.currency)}</TableCell>
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