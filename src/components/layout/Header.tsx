"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Plus, Search, Bell, User, Settings, LogOut, ChevronDown, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { useLedger } from "@/context/LedgerContext";

const routeTitles: Record<string, string> = {
  "/": "Overview",
  "/transactions": "Transactions",
  "/reconciliation": "Reconciliation Center",
  "/bank-import": "Bank Import",
  "/accounts": "Account Statements",
  "/entities": "Entities Registry",
  "/settings": "System Configuration",
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const title = routeTitles[pathname] || "Ledger Pro";
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const { transactions, settings, isLoaded } = useLedger();

  // Prevent hydration mismatch for the theme toggle
  useEffect(() => setMounted(true), []);

  const pendingCount = isLoaded 
    ? transactions.filter((t: any) => t.status !== "cleared").length 
    : 0;

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-10 gap-4 transition-colors duration-200">
        
        {/* Left Section: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuClick} 
            className="md:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight truncate max-w-[150px] sm:max-w-none">
            {title}
          </h1>
        </div>

        {/* Center Section: Global Search */}
        <div className="flex-1 max-w-md hidden md:flex items-center mx-auto">
          <div className="relative w-full text-slate-500 dark:text-slate-400 focus-within:text-orange-600 dark:focus-within:text-orange-500 transition-colors">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 currentColor" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-slate-100 pl-9 focus-visible:ring-orange-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 rounded-full h-9 text-sm transition-all"
            />
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center justify-end shrink-0 gap-2 sm:gap-4">
          
          {/* Theme Toggle Button */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full h-9 w-9 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          )}

          {/* Record Entry Buttons */}
          <Button 
            onClick={() => setIsTxModalOpen(true)} 
            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500 text-white shadow-sm transition-all active:scale-95 h-9 px-4 text-sm hidden sm:flex"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Record Entry
          </Button>

          <Button 
            onClick={() => setIsTxModalOpen(true)} 
            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500 text-white shadow-sm h-9 w-9 p-0 flex sm:hidden rounded-full shrink-0"
          >
            <Plus className="w-5 h-5" />
          </Button>

          {/* Notification Center */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full h-9 w-9 transition-colors">
                <Bell className="w-5 h-5" />
                {pendingCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-600 border-2 border-white dark:border-slate-950"></span>
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 mt-2 dark:bg-slate-950 dark:border-slate-800">
              <DropdownMenuLabel className="font-semibold dark:text-slate-100">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="dark:bg-slate-800" />
              {pendingCount > 0 ? (
                <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer focus:bg-orange-50 dark:focus:bg-slate-900 transition-colors">
                  <div className="flex items-center w-full justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Action Required</span>
                    <span className="text-[10px] font-bold bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full">{pendingCount}</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">You have transactions awaiting approval or clearing in the Reconciliation Center.</span>
                </DropdownMenuItem>
              ) : (
                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  <Bell className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                  All caught up! No new notifications.
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="pl-1.5 pr-1 sm:pr-2 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shrink-0">
                <Avatar className="h-7 w-7 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-[10px] font-bold">
                    {settings?.companyName ? settings.companyName.substring(0, 2).toUpperCase() : "AD"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden lg:block max-w-[120px] truncate">
                  {settings?.companyName || "System Admin"}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 mt-2 dark:bg-slate-950 dark:border-slate-800">
              <DropdownMenuLabel className="font-normal p-3 bg-slate-50 dark:bg-slate-900 rounded-t-md border-b border-slate-100 dark:border-slate-800 -mx-1 -mt-1 mb-1">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">{settings?.companyName || "System Admin"}</p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400">{settings?.companyEmail || "admin@ledgerpro.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer py-2 text-slate-600 dark:text-slate-300 dark:focus:bg-slate-900">
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2 text-slate-600 dark:text-slate-300 dark:focus:bg-slate-900">
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="dark:bg-slate-800" />
              <DropdownMenuItem className="cursor-pointer py-2 text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/50 transition-colors">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-medium">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      <TransactionModal 
        isOpen={isTxModalOpen} 
        onClose={() => setIsTxModalOpen(false)} 
      />
    </>
  );
}