"use client";

import { useState } from "react";
import { useLedger } from "@/context/LedgerContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { mockAuditLogs } from "@/types";

export default function ActivityLogsPage() {
  const { isLoaded } = useLedger();
  const [searchTerm, setSearchTerm] = useState("");

  if (!isLoaded) return null;

  const logs = mockAuditLogs;

  const filteredLogs = logs.filter(log => 
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATED":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-100" variant="outline">CREATED</Badge>;
      case "UPDATED":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 hover:bg-blue-100" variant="outline">UPDATED</Badge>;
      case "STATUS_CHANGED":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400 hover:bg-orange-100" variant="outline">STATUS CHANGE</Badge>;
      case "DELETED":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-100" variant="outline">DELETED</Badge>;
      case "SYSTEM_ACTION":
        return <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100" variant="outline">SYSTEM</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors duration-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Audit & Activity Log</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Immutable record of system changes.</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search logs, users, entities..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 focus-visible:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="dark:border-slate-800 hover:bg-transparent">
                <TableHead className="dark:text-slate-400 w-[180px]">Timestamp</TableHead>
                <TableHead className="dark:text-slate-400 w-[150px]">Action</TableHead>
                <TableHead className="dark:text-slate-400 w-[150px]">Module</TableHead>
                <TableHead className="dark:text-slate-400">Details</TableHead>
                <TableHead className="dark:text-slate-400 w-[150px]">User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow className="dark:border-slate-800 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No activity logs found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const formattedDate = new Date(log.timestamp).toLocaleString("en-GB", { 
                    day: '2-digit', month: 'short', year: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                  });

                  return (
                    <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 dark:border-slate-800 transition-colors text-sm">
                      <TableCell className="text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-xs">
                        {formattedDate}
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 font-medium">
                        {log.entityName}
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {log.details}
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 flex items-center gap-2 whitespace-nowrap">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {log.user.charAt(0)}
                        </div>
                        {log.user}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

    </div>
  );
}