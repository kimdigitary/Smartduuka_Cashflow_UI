"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  CheckCircle2, 
  WalletCards, 
  Users, 
  Settings,
  DownloadCloud,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  PieChart,
  History,
  X,
  FileText,
  TrendingUp,
  TrendingDown,
  Landmark,
  Scale,
  Truck
} from "lucide-react";
import { useLedger } from "@/context/LedgerContext";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isMobileOpen: boolean;
  isCollapsed: boolean;
  onMobileClose: () => void;
  onToggleCollapse: () => void;
}

export function Sidebar({ isMobileOpen, isCollapsed, onMobileClose, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { transactions, isLoaded } = useLedger();
  const [reportsOpen, setReportsOpen] = useState(false);

  // Keep dropdown open if we are inside a report route
  useEffect(() => {
    if (pathname.startsWith("/reports") && !isCollapsed) {
      setReportsOpen(true);
    }
  }, [pathname, isCollapsed]);
  
  const pendingCount = isLoaded 
    ? transactions.filter((t: any) => t.status !== "cleared").length 
    : 0;

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
    { name: "Reconciliation", href: "/reconciliation", icon: CheckCircle2, badge: pendingCount },
    { name: "Bank Import", href: "/bank-import", icon: DownloadCloud },
    { name: "Accounts", href: "/accounts", icon: WalletCards },
    { name: "Entities", href: "/entities", icon: Users },
    { 
      name: "Reports", 
      icon: PieChart,
      subItems: [
        { name: "Income Statement", href: "/reports/pnl", icon: FileText },
        { name: "A/R Aging", href: "/reports/ar", icon: TrendingUp },
        { name: "A/P Aging", href: "/reports/ap", icon: TrendingDown },
        { name: "Category Breakdown", href: "/reports/categories", icon: PieChart },
        { name: "Account Balances", href: "/reports/liquidity", icon: Landmark },
        { name: "Entity Volume", href: "/reports/entities", icon: Users },
        { name: "Tax & Compliance", href: "/reports/tax", icon: Scale },
        { name: "Logistics/Fuel", href: "/reports/logistics", icon: Truck },
      ]
    },
    { name: "Activity Logs", href: "/activity-logs", icon: History },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleReportsToggle = () => {
    if (isCollapsed) {
      onToggleCollapse(); // Expand sidebar first if it's collapsed
      setReportsOpen(true);
    } else {
      setReportsOpen(!reportsOpen);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 z-40 md:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 shadow-sm transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-20" : "md:w-64"} w-64
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0 transition-colors duration-200">
          <div className="flex items-center overflow-hidden">
            <div className="w-8 h-8 rounded bg-orange-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
              CF
            </div>
            {!isCollapsed && (
              <span className="ml-3 text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap">
                Ledger Pro
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onMobileClose} className="md:hidden text-slate-500 dark:text-slate-400">
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isReportActive = item.subItems?.some(sub => pathname === sub.href);
            const Icon = item.icon;
            
            if (item.subItems) {
              return (
                <div key={item.name} className="flex flex-col space-y-1">
                  <button
                    onClick={handleReportsToggle}
                    title={isCollapsed ? item.name : undefined}
                    className={`relative w-full flex items-center py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                      isCollapsed ? "justify-center" : "justify-between"
                    } ${
                      isReportActive 
                        ? "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 ${!isCollapsed && "mr-3"}`} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${reportsOpen ? "rotate-180" : ""}`} />
                    )}
                  </button>
                  
                  {/* Dropdown Items */}
                  {reportsOpen && !isCollapsed && (
                    <div className="pl-9 pr-2 space-y-1 py-1">
                      {item.subItems.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        const SubIcon = sub.icon;
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={`flex items-center py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                              isSubActive 
                                ? "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400" 
                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
                            }`}
                          >
                            <SubIcon className="w-4 h-4 mr-3 opacity-70" />
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
            return (
              <Link
                key={item.name}
                href={item.href!}
                title={isCollapsed ? item.name : undefined}
                className={`relative w-full flex items-center py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  isCollapsed ? "justify-center" : "justify-between"
                } ${
                  isActive 
                    ? "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <div className="flex items-center">
                  <Icon className={`w-5 h-5 ${!isCollapsed && "mr-3"}`} />
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
                
                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 py-0.5 px-2 rounded-full text-xs font-bold">
                    {item.badge}
                  </span>
                )}
                
                {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500 dark:bg-orange-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 hidden md:flex items-center justify-center shrink-0 transition-colors duration-200">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>
      </aside>
    </>
  );
}