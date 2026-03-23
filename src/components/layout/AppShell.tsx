"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-200 w-full">
      <Sidebar 
        isMobileOpen={isMobileOpen}
        isCollapsed={isCollapsed}
        onMobileClose={() => setIsMobileOpen(false)}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header onMenuClick={() => setIsMobileOpen(true)} />
        <div className="flex-1 overflow-auto p-4 sm:p-6 no-scrollbar fade-in text-slate-900 dark:text-slate-100">
          {children}
        </div>
      </main>
    </div>
  );
}