"use client";

import { useState } from "react";
import { useLedger } from "@/context/LedgerContext";
import { formatMoney, calculateNet } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import { mockTransactions, mockSettings } from "@/types"; // <-- Imported Dummy Data

interface ImportedRow {
  date: string;
  desc: string;
  amount: number;
  matchedId?: string;
}

export default function BankImportPage() {
  const { advanceTransactionStatus, isLoaded } = useLedger();
  const [csvData, setCsvData] = useState("");
  const [importedRows, setImportedRows] = useState<ImportedRow[]>([]);

  if (!isLoaded) return null;

  // ========================================================================
  // INJECTING DUMMY DATA HERE
  // ========================================================================
  const transactions = mockTransactions;
  const settings = mockSettings;

  const handleParse = () => {
    if (!csvData.trim()) return;

    const lines = csvData.split("\n").filter(l => l.trim().length > 0);
    const parsed: ImportedRow[] = lines.map(line => {
      // Handles basic CSV parsing, allowing spaces after commas
      const parts = line.split(",").map(part => part.trim());
      const parsedAmount = parseFloat(parts[2] || "0");
      
      return {
        date: parts[0] || "Unknown Date",
        desc: parts[1] || "Unknown Description",
        amount: isNaN(parsedAmount) ? 0 : parsedAmount
      };
    });

    // Only try to match against transactions that are awaiting bank clearance
    const approvedTxs = transactions.filter(t => t.status === "approved");
    const matchedIds = new Set<string>();
    
    // Improved matching algorithm
    parsed.forEach(row => {
      // Find a transaction with the exact same net amount that hasn't already been matched
      const match = approvedTxs.find(t => {
        const netAmount = calculateNet(t);
        // Bank statements might have negatives for cash out, or just absolute values. We check absolute match.
        return Math.abs(netAmount) === Math.abs(row.amount) && !matchedIds.has(t.id);
      });

      if (match) {
        row.matchedId = match.id;
        matchedIds.add(match.id); // Prevent one system transaction from matching multiple bank rows
      }
    });

    setImportedRows(parsed);
  };

  const clearMatches = () => {
    let clearedCount = 0;
    importedRows.forEach(row => {
      if (row.matchedId) {
        advanceTransactionStatus(row.matchedId, "cleared");
        clearedCount++;
      }
    });
    
    // Keep rows that weren't matched so the user can see what's left over
    const remainingRows = importedRows.filter(row => !row.matchedId);
    setImportedRows(remainingRows);
    
    if (clearedCount > 0) {
      // You could add a toast here: toast.success(`Successfully cleared ${clearedCount} transactions`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Import Card */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors duration-200">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center">
          <UploadCloud className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400" /> 
          Bank Statement Import
        </h2>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Paste your bank CSV data here. <br className="sm:hidden" />
          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded ml-1 sm:ml-0">Format: YYYY-MM-DD, Description, Amount</span>
        </p>
        
        <Textarea 
          rows={5} 
          value={csvData} 
          onChange={e => setCsvData(e.target.value)} 
          placeholder={`2026-03-05, Client Wire Transfer, 1500000\n2026-03-06, Office Supplies, -45000`} 
          className="mb-4 focus-visible:ring-orange-500 font-mono text-sm bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600" 
        />
        
        <Button 
          onClick={handleParse} 
          className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-sm"
          disabled={!csvData.trim()}
        >
          Parse & Match Data
        </Button>
      </div>

      {/* Results Table */}
      {importedRows.length > 0 && (
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200 fade-in">
          
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors duration-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Reconciliation Matches</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Found {importedRows.filter(r => r.matchedId).length} matches out of {importedRows.length} rows.
              </p>
            </div>
            
            {importedRows.some(row => row.matchedId) && (
              <Button 
                onClick={clearMatches} 
                className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white shadow-sm h-9 text-sm w-full sm:w-auto"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> 
                Clear Matched Transactions
              </Button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow className="dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="dark:text-slate-400">Bank Date</TableHead>
                  <TableHead className="dark:text-slate-400">Bank Description</TableHead>
                  <TableHead className="text-right dark:text-slate-400">Bank Amount</TableHead>
                  <TableHead className="text-center dark:text-slate-400">System Match Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importedRows.map((row, idx) => (
                  <TableRow 
                    key={idx} 
                    className={`
                      dark:border-slate-800 transition-colors
                      ${row.matchedId 
                        ? "bg-green-50/50 hover:bg-green-50 dark:bg-green-500/10 dark:hover:bg-green-500/20" 
                        : "hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                      }
                    `}
                  >
                    <TableCell className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {row.date}
                    </TableCell>
                    
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {row.desc}
                    </TableCell>
                    
                    <TableCell className={`text-right font-bold ${row.amount > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {formatMoney(Math.abs(row.amount), settings.currency)}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {row.matchedId ? (
                        <span className="text-xs font-bold text-green-700 dark:text-green-400 flex items-center justify-center bg-green-100 dark:bg-green-500/20 px-2 py-1 rounded-full w-fit mx-auto border border-green-200 dark:border-green-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 
                          Ready to Clear
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center">
                          <AlertCircle className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          No Approved Match
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      
    </div>
  );
}