"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useLedger } from "@/context/LedgerContext";
import { formatMoney, calculateNet } from "@/lib/utils";
import { ApexOptions } from "apexcharts";
import { mockTransactions, mockSettings } from "@/types"; // <-- Imported Dummy Data

// Dynamically import ApexCharts to prevent Next.js SSR "window is not defined" errors
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function DashboardCharts() {
  const { isLoaded } = useLedger(); // Keep this just to ensure client hydration timing matches
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!isLoaded || !mounted) {
    return <div className="h-[400px] w-full animate-pulse bg-slate-100 dark:bg-slate-800/50 rounded-xl mt-6"></div>;
  }

  // ========================================================================
  // INJECTING DUMMY DATA HERE
  // ========================================================================
  const transactions = mockTransactions;
  const settings = mockSettings;

  const isDark = resolvedTheme === "dark";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";
  const labelColor = isDark ? "#94a3b8" : "#64748b";

  // ========================================================================
  // 1. DATA PROCESSING: Historical Cash Flow
  // ========================================================================
  const generateLast6Months = () => {
    const result = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = d.toISOString().substring(0, 7);
      const label = d.toLocaleDateString("default", { month: "short", year: "2-digit" });
      result.push({ id: monthStr, name: label, in: 0, out: 0 });
    }
    return result;
  };

  const barData = generateLast6Months();
  
  transactions
    .filter((t) => t.status === "cleared")
    .forEach((t) => {
      const monthStr = t.date.substring(0, 7);
      const targetMonth = barData.find(m => m.id === monthStr);
      if (targetMonth) {
        const net = calculateNet(t);
        if (t.type === "in") targetMonth.in += net;
        else targetMonth.out += net;
      }
    });

  const barSeries = [
    { name: "Cash In", data: barData.map(d => d.in) },
    { name: "Cash Out", data: barData.map(d => d.out) }
  ];

  const barOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent", fontFamily: "inherit" },
    theme: { mode: isDark ? "dark" : "light" },
    colors: ["#22c55e", "#ef4444"],
    plotOptions: { bar: { borderRadius: 4, columnWidth: "50%" } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: { 
      categories: barData.map(d => d.name),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: labelColor } }
    },
    yaxis: {
      labels: { 
        style: { colors: labelColor },
        formatter: (val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toString() 
      }
    },
    grid: { borderColor: gridColor, strokeDashArray: 4, yaxis: { lines: { show: true } } },
    tooltip: {
      y: { formatter: (val) => formatMoney(val, settings.currency) }
    },
    legend: { position: "top", labels: { colors: labelColor } }
  };

  // ========================================================================
  // 2. DATA PROCESSING: Expense Breakdown
  // ========================================================================
  const expenseCategories: Record<string, number> = {};
  transactions
    .filter((t) => t.status === "cleared" && t.type === "out")
    .forEach((t) => {
      const cat = t.category || "Uncategorized";
      expenseCategories[cat] = (expenseCategories[cat] || 0) + calculateNet(t);
    });

  const sortedExpenses = Object.entries(expenseCategories).sort((a, b) => b[1] - a[1]);
  const topExpenses = sortedExpenses.slice(0, 4).map(([name, value]) => ({ name, value }));
  const otherExpensesValue = sortedExpenses.slice(4).reduce((sum, [_, val]) => sum + val, 0);
  
  if (otherExpensesValue > 0) {
    topExpenses.push({ name: "Other", value: otherExpensesValue });
  }

  const pieSeries = topExpenses.map(e => e.value);
  const pieLabels = topExpenses.map(e => e.name);
  const PIE_COLORS = ["#ea580c", "#3b82f6", "#14b8a6", "#8b5cf6", "#64748b"];

  const pieOptions: ApexOptions = {
    chart: { type: "donut", background: "transparent", fontFamily: "inherit" },
    theme: { mode: isDark ? "dark" : "light" },
    labels: pieLabels,
    colors: PIE_COLORS,
    dataLabels: { enabled: false },
    stroke: { show: isDark, colors: ["#0f172a"] },
    plotOptions: { pie: { donut: { size: "75%" } } },
    tooltip: {
      y: { formatter: (val) => formatMoney(val, settings.currency) }
    },
    legend: { position: "bottom", labels: { colors: labelColor } }
  };

  // ========================================================================
  // 3. DATA PROCESSING: Predictive Runway
  // ========================================================================
  let currentBalance = 0;
  transactions.filter(t => t.status === "cleared").forEach(t => {
    currentBalance += t.type === "in" ? calculateNet(t) : -calculateNet(t);
  });

  const futureTxs = transactions
    .filter(t => t.status !== "cleared")
    .sort((a, b) => new Date(a.expectedDate || a.date).getTime() - new Date(b.expectedDate || b.date).getTime());
  
  const runwayData = [{ name: "Today", balance: currentBalance }];
  let runningBal = currentBalance;
  
  futureTxs.forEach(t => {
    runningBal += t.type === "in" ? calculateNet(t) : -calculateNet(t);
    const dateLabel = new Date(t.expectedDate || t.date).toLocaleDateString("default", { month: "short", day: "numeric" });
    runwayData.push({ name: dateLabel, balance: runningBal });
  });

  const runwaySeries = [{ name: "Projected Balance", data: runwayData.map(d => d.balance) }];

  const runwayOptions: ApexOptions = {
    chart: { type: "area", toolbar: { show: false }, background: "transparent", fontFamily: "inherit" },
    theme: { mode: isDark ? "dark" : "light" },
    colors: ["#ea580c"],
    fill: { 
      type: "gradient", 
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] } 
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    xaxis: { 
      categories: runwayData.map(d => d.name),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: labelColor } }
    },
    yaxis: {
      labels: { 
        style: { colors: labelColor },
        formatter: (val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toString() 
      }
    },
    grid: { borderColor: gridColor, strokeDashArray: 4 },
    tooltip: {
      y: { formatter: (val) => formatMoney(val, settings.currency) }
    }
  };

  return (
    <div className="space-y-6 mt-6 fade-in">
      {/* Top Row: Historical Trend & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Bar Chart */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 transition-colors duration-200">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-2">Historical Cash Flow</h3>
          <div className="h-72 w-full">
            <Chart options={barOptions} series={barSeries} type="bar" height="100%" />
          </div>
        </div>
        
        {/* Expense Breakdown Donut Chart */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-2">Expense Breakdown</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Cleared transactions only</p>
          <div className="flex-1 w-full flex justify-center items-center min-h-[250px]">
            {pieSeries.length > 0 ? (
              <Chart options={pieOptions} series={pieSeries} type="donut" height="100%" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm h-full">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center mb-3">
                  <span className="text-xl">📊</span>
                </div>
                No expense data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Predictive Runway Area Chart */}
      <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-full transition-colors duration-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Predictive Cash Runway</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Current cleared balance + Pending Drafts/Approvals</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Live Forecast</span>
          </div>
        </div>
        
        <div className="h-72 w-full">
          {runwayData.length > 1 ? (
            <Chart options={runwayOptions} series={runwaySeries} type="area" height="100%" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full mt-4 text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/20 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm">Add some drafted or approved future transactions to see your forecast here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}