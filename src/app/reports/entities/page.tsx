"use client";

import { useLedger } from "@/context/LedgerContext";
import { formatMoney, calculateNet } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function EntitiesReportPage() {
  const { transactions, entities, settings, isLoaded } = useLedger();

  if (!isLoaded) return null;

  const entityVolumes: Record<string, { volume: number, type: string }> = {};
  
  transactions.filter(t => t.status === "cleared").forEach(t => {
    const ent = entities.find(e => e.id === t.entityId);
    if (!ent) return;
    if (!entityVolumes[ent.name]) entityVolumes[ent.name] = { volume: 0, type: ent.type };
    entityVolumes[ent.name].volume += calculateNet(t);
  });
  
  const entityArray = Object.entries(entityVolumes)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.volume - a.volume);

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Entity Volume</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review the top transacting clients and vendors.</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="w-full sm:w-auto dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Export / Print PDF
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide">Top Transacting Entities</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity Name</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead className="text-right">Total Cleared Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entityArray.map((ent, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{ent.name}</TableCell>
                  <TableCell className="capitalize text-slate-500">
                    <Badge variant="outline">{ent.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">{formatMoney(ent.volume, settings.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}