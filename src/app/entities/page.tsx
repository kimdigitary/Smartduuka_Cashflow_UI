"use client";

import { useState } from "react";
import { useLedger } from "@/context/LedgerContext";
import { formatMoney, calculateNet } from "@/lib/utils";
import { Entity, EntityType } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import { mockTransactions, mockEntities, mockSettings } from "@/types"; // <-- Imported Dummy Data

export default function EntitiesPage() {
  const { addEntity, updateEntity, deleteEntity, isLoaded } = useLedger(); // Kept for hydration and actions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnt, setEditingEnt] = useState<Partial<Entity>>({ type: "client" });

  if (!isLoaded) return null;

  // ========================================================================
  // INJECTING DUMMY DATA HERE
  // ========================================================================
  const transactions = mockTransactions;
  const entities = mockEntities;
  const settings = mockSettings;

  const handleSave = () => {
    if (!editingEnt.name) return toast.error("Entity name is required");
    if (editingEnt.id) updateEntity(editingEnt as Entity);
    else addEntity({ ...editingEnt, id: `e_${Date.now()}` } as Entity);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (transactions.some((t) => t.entityId === id)) return toast.error("Cannot delete entity: It has linked transactions.");
    if (confirm("Delete this entity?")) deleteEntity(id);
  };

  const openModal = (ent?: Entity) => {
    setEditingEnt(ent || { type: "client" });
    setIsModalOpen(true);
  };

  // Note: Print styles kept as light mode specifically for physical/PDF output.
  const printStatement = (ent: Entity) => {
    const entTxs = transactions.filter((t) => t.entityId === ent.id && t.status === "cleared");
    let total = 0;
    const rows = entTxs.map((t) => {
      const net = calculateNet(t);
      total += t.type === "in" ? net : -net;
      const formattedDate = new Date(t.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
      return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px;">${formattedDate}</td>
          <td style="padding: 10px;">${t.category || "Uncategorized"} - ${t.desc}</td>
          <td style="padding: 10px; text-align: right; color: ${t.type === "in" ? "#16a34a" : "#dc2626"}">${t.type === "in" ? "+" : "-"}${formatMoney(net, settings.currency)}</td>
        </tr>`;
    }).join("");

    const html = `
      <div style="font-family: sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #ea580c; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">${settings.companyName || "Ledger Pro"}</h1>
        <h2>Account Statement: ${ent.name}</h2>
        <p>Date Generated: ${new Date().toLocaleDateString()}</p>
        <table style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 20px;">
          <tr style="background: #f8fafc; border-bottom: 1px solid #cbd5e1;">
            <th style="padding: 10px;">Date</th><th style="padding: 10px;">Desc</th><th style="padding: 10px; text-align: right;">Amount</th>
          </tr>
          ${rows}
        </table>
        <h3 style="text-align: right; margin-top: 20px;">Net Cleared Balance: ${formatMoney(Math.abs(total), settings.currency)} ${total > 0 ? "(Received)" : "(Paid)"}</h3>
      </div>
    `;
    const printSection = document.getElementById("print-section");
    if (printSection) {
      printSection.innerHTML = html;
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center transition-colors duration-200">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Entities Registry</h3>
          <Button onClick={() => openModal()} variant="secondary" size="sm" className="shadow-sm dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-700">
            <Plus className="w-4 h-4 mr-1" /> Add Entity
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="dark:border-slate-800 hover:bg-transparent">
                <TableHead className="dark:text-slate-400">Entity Name</TableHead>
                <TableHead className="dark:text-slate-400">Type</TableHead>
                <TableHead className="text-right dark:text-slate-400">Cleared Value</TableHead>
                <TableHead className="text-right dark:text-slate-400">Outstanding (AR/AP)</TableHead>
                <TableHead className="text-right dark:text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entities.length === 0 ? (
                <TableRow className="dark:border-slate-800 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No entities registered.
                  </TableCell>
                </TableRow>
              ) : (
                entities.map((ent) => {
                  let cleared = 0, outstanding = 0;
                  transactions.filter((t) => t.entityId === ent.id).forEach((t) => {
                    const signedNet = t.type === "in" ? calculateNet(t) : -calculateNet(t);
                    if (t.status === "cleared") cleared += signedNet; else outstanding += signedNet;
                  });

                  return (
                    <TableRow key={ent.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 dark:border-slate-800 transition-colors">
                      <TableCell className="font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">{ent.name}</TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 capitalize">{ent.type}</TableCell>
                      <TableCell className="text-right text-slate-600 dark:text-slate-300 whitespace-nowrap">{formatMoney(Math.abs(cleared), settings.currency)}</TableCell>
                      <TableCell className={`text-right font-bold whitespace-nowrap ${outstanding > 0 ? "text-green-600 dark:text-green-400" : outstanding < 0 ? "text-red-600 dark:text-red-400" : "text-slate-400 dark:text-slate-500"}`}>
                        {formatMoney(Math.abs(outstanding), settings.currency)} {outstanding !== 0 && (outstanding > 0 ? "(AR)" : "(AP)")}
                      </TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => printStatement(ent)} className="text-slate-400 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors p-1">
                          <Printer className="w-4 h-4 inline" />
                        </button>
                        <button onClick={() => openModal(ent)} className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1">
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button onClick={() => handleDelete(ent.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1">
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-sm bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">{editingEnt.id ? "Edit Entity" : "Add Entity"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <Input 
                value={editingEnt.name || ""} 
                onChange={(e) => setEditingEnt({ ...editingEnt, name: e.target.value })} 
                className="focus-visible:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
              <Select value={editingEnt.type} onValueChange={(val: EntityType) => setEditingEnt({ ...editingEnt, type: val })}>
                <SelectTrigger className="focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                  <SelectItem value="client">Client / Customer</SelectItem>
                  <SelectItem value="vendor">Vendor / Supplier</SelectItem>
                  <SelectItem value="internal">Internal / General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</Button>
            <Button onClick={handleSave} className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}