"use client";

import { useLedger } from "@/context/LedgerContext";
import { useState, useEffect } from "react";
import { SystemSettings } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { settings, updateSettings, factoryReset, simulateDispatch, isLoaded } = useLedger();
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);

  useEffect(() => {
    if (isLoaded) setLocalSettings(settings);
  }, [settings, isLoaded]);

  if (!isLoaded) return null;

  const handleSave = () => {
    updateSettings(localSettings);
  };

  return (
    // Outer container handles the exact height of the modal/view
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors duration-200 h-[85vh] min-h-[600px] max-h-[800px]">
      
      {/* Tabs acts purely as state provider, NOT the layout grid */}
      <Tabs defaultValue="company" className="w-full flex-1 flex flex-col min-h-0">
        
        {/* THIS is the guaranteed layout container */}
        <div className="flex flex-col md:flex-row w-full flex-1 min-h-0">
          
          {/* Sidebar - Switched md:w-64 to md:w-56 to give more breathing room on 13" laptops */}
          <div className="w-full md:w-56 shrink-0 bg-slate-50 dark:bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-2 md:p-4 transition-colors duration-200 overflow-x-auto md:overflow-x-visible md:overflow-y-auto no-scrollbar z-10">
            <h3 className="hidden md:block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">Configuration</h3>
            
            {/* Added !h-auto to forcefully strip Shadcn's default 40px height clipping */}
            <TabsList className="flex flex-row md:flex-col !h-auto w-max md:w-full bg-transparent !p-0 gap-1 md:gap-2 justify-start items-stretch">
              
              <TabsTrigger 
                value="company" 
                className="w-auto md:w-full justify-start text-left whitespace-nowrap data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-700 dark:data-[state=active]:text-orange-400 data-[state=active]:border-orange-500 md:border-l-4 md:border-b-0 border-b-4 border-l-0 border-transparent rounded-none px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/50 dark:text-slate-300 transition-colors"
              >
                Company Profile
              </TabsTrigger>
              <TabsTrigger 
                value="finance" 
                className="w-auto md:w-full justify-start text-left whitespace-nowrap data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-700 dark:data-[state=active]:text-orange-400 data-[state=active]:border-orange-500 md:border-l-4 md:border-b-0 border-b-4 border-l-0 border-transparent rounded-none px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/50 dark:text-slate-300 transition-colors"
              >
                Financial Settings
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="w-auto md:w-full justify-start text-left whitespace-nowrap data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-700 dark:data-[state=active]:text-orange-400 data-[state=active]:border-orange-500 md:border-l-4 md:border-b-0 border-b-4 border-l-0 border-transparent rounded-none px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/50 dark:text-slate-300 transition-colors"
              >
                Report Preferences
              </TabsTrigger>
              <TabsTrigger 
                value="modules" 
                className="w-auto md:w-full justify-start text-left whitespace-nowrap data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-700 dark:data-[state=active]:text-orange-400 data-[state=active]:border-orange-500 md:border-l-4 md:border-b-0 border-b-4 border-l-0 border-transparent rounded-none px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/50 dark:text-slate-300 transition-colors"
              >
                Module Toggles
              </TabsTrigger>
              
              <TabsTrigger 
                value="danger" 
                className="w-auto md:w-full justify-start text-left whitespace-nowrap relative md:mt-4 md:before:absolute md:before:-top-2.5 md:before:left-2 md:before:right-2 md:before:h-px md:before:bg-slate-200 dark:md:before:bg-slate-800 data-[state=active]:bg-red-50 dark:data-[state=active]:bg-red-500/10 data-[state=active]:text-red-700 dark:data-[state=active]:text-red-400 data-[state=active]:border-red-600 dark:data-[state=active]:border-red-500 md:border-l-4 md:border-b-0 border-b-4 border-l-0 border-transparent rounded-none px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                Data & Security
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
            
            {/* Scrollable Form Body */}
            <div className="flex-1 p-4 sm:p-6 sm:px-8 overflow-y-auto custom-scrollbar">
              
              <TabsContent value="company" className="m-0 outline-none space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Company Profile</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Business details used across your ledger and exports.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business / Platform Name</label>
                    <Input 
                      value={localSettings.companyName} 
                      onChange={e => setLocalSettings({...localSettings, companyName: e.target.value})} 
                      placeholder="e.g. SmartServe POS" 
                      className="focus-visible:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Support Email</label>
                    <Input 
                      type="email" 
                      value={localSettings.companyEmail} 
                      onChange={e => setLocalSettings({...localSettings, companyEmail: e.target.value})} 
                      placeholder="admin@company.com" 
                      className="focus-visible:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contact Phone</label>
                    <Input 
                      value={localSettings.companyPhone} 
                      onChange={e => setLocalSettings({...localSettings, companyPhone: e.target.value})} 
                      placeholder="+256 700 000 000" 
                      className="focus-visible:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500" 
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="finance" className="m-0 outline-none space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Financial Configuration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">System Base Currency</label>
                    <Select value={localSettings.currency} onValueChange={val => setLocalSettings({...localSettings, currency: val})}>
                      <SelectTrigger className="focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                        <SelectItem value="UGX">UGX (Ugandan Shilling)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Disbursement Approval Threshold</label>
                    <Input 
                      type="number" 
                      value={localSettings.approvalThreshold} 
                      onChange={e => setLocalSettings({...localSettings, approvalThreshold: Number(e.target.value)})} 
                      className="focus-visible:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100" 
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Cash-outs above this amount require manual approval.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="m-0 outline-none space-y-6">
                 <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Report Preferences</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rows Per Page</label>
                    <Select value={localSettings.pageSize} onValueChange={val => setLocalSettings({...localSettings, pageSize: val})}>
                      <SelectTrigger className="focus:ring-orange-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                        <SelectItem value="10">10 Rows</SelectItem>
                        <SelectItem value="25">25 Rows</SelectItem>
                        <SelectItem value="50">50 Rows</SelectItem>
                        <SelectItem value="all">Show All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="modules" className="m-0 outline-none space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Module Toggles</h3>
                </div>
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between p-5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900/20 rounded-lg">
                    <div className="pr-4">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Reconciliation Center</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enable the multi-step approval workflow for transactions.</p>
                    </div>
                    <Switch 
                      checked={localSettings.enableRecon} 
                      onCheckedChange={checked => setLocalSettings({...localSettings, enableRecon: checked})} 
                      className="data-[state=checked]:bg-orange-500 dark:data-[state=unchecked]:bg-slate-700 shrink-0" 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900/20 rounded-lg">
                    <div className="pr-4">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Strict Logging Mode</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Require an Entity and Account for every transaction.</p>
                    </div>
                    <Switch 
                      checked={localSettings.strictMode} 
                      onCheckedChange={checked => setLocalSettings({...localSettings, strictMode: checked})} 
                      className="data-[state=checked]:bg-orange-500 dark:data-[state=unchecked]:bg-slate-700 shrink-0" 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900/20 rounded-lg">
                    <div className="w-full">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">End-of-Day Dispatch</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Email a daily summary of cleared transactions.</p>
                      <div className="flex flex-col xl:flex-row gap-3 w-full xl:max-w-md">
                        <Input 
                          type="email" 
                          placeholder="admin@company.com" 
                          value={localSettings.dispatchEmail} 
                          onChange={e => setLocalSettings({...localSettings, dispatchEmail: e.target.value})} 
                          className="h-10 text-sm focus-visible:ring-orange-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                        />
                        <Button onClick={() => simulateDispatch()} variant="secondary" className="shrink-0 h-10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-700 w-full xl:w-auto">
                          Test Dispatch
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </TabsContent>

              <TabsContent value="danger" className="m-0 outline-none space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 tracking-tight">Data & Security</h3>
                </div>
                <div className="p-5 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded-lg flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-red-900 dark:text-red-300">Factory Reset System</h4>
                    <p className="text-xs text-red-700 dark:text-red-400/80 mt-1 max-w-sm">Permanently delete all transactions, accounts, and entities. Cannot be undone.</p>
                  </div>
                  <Button 
                    onClick={() => { if(confirm("DANGER: Wipe all data?")) factoryReset(); }} 
                    variant="destructive" 
                    className="w-full xl:w-auto dark:bg-red-600 dark:hover:bg-red-700 dark:text-white shrink-0"
                  >
                    Reset System
                  </Button>
                </div>
              </TabsContent>
              
            </div>

            {/* Fixed Footer pinned to the right pane */}
            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end shrink-0 transition-colors duration-200 z-10">
              <Button onClick={handleSave} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500 text-white transition-all shadow-sm">
                Save Configuration
              </Button>
            </div>
            
          </div>
        </div>
      </Tabs>
    </div>
  );
}