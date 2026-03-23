import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Transaction } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatMoney = (amount: number, currency: string = "UGX") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

// UPDATED: Now handles Multi-Currency FX conversion to base currency
export const calculateNet = (t: Transaction) => {
  const baseNet = t.type === "in" ? t.amount - t.fee : t.amount + t.fee;
  return baseNet * (t.exchangeRate || 1);
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "cleared": return "bg-green-100 text-green-700 hover:bg-green-100";
    case "approved": return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "draft": return "bg-orange-100 text-orange-700 hover:bg-orange-100";
    default: return "bg-slate-100 text-slate-700";
  }
};