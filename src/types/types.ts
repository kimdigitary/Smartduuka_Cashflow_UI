export type TransactionType = "in" | "out";
export type TransactionStatus = "draft" | "approved" | "cleared";
export type RecurringSchedule = "none" | "monthly" | "weekly";
export type EntityType = "client" | "vendor" | "internal";
export type AccountType = "bank" | "mobile" | "cash";

export interface Transaction {
  id: string;
  type: TransactionType;
  entityId: string;
  category: string;
  amount: number;
  fee: number;
  accountId: string;
  date: string;
  expectedDate?: string; // NEW: For predictive forecasting
  currency?: string;     // NEW: For Multi-Currency FX
  exchangeRate?: number; // NEW: For Multi-Currency FX
  desc: string;
  status: TransactionStatus;
  recurring: RecurringSchedule;
  lastProcessed?: string | null;
  attachmentName?: string | null;
  attachmentData?: string | null; // NEW: Base64 Document Vault
  tags?: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: "CREATED" | "UPDATED" | "DELETED" | "STATUS_CHANGED" | "SYSTEM_ACTION";
  entityName: string;
  details: string;
  user: string;
}

export interface Entity { id: string; name: string; type: EntityType; }
export interface Account { id: string; name: string; type: AccountType; }

export interface SystemSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  currency: string;
  fiscalYear: string;
  dateFormat: string;
  pageSize: string;
  enableRecon: boolean;
  strictMode: boolean;
  approvalThreshold: number;
  dispatchEmail: string;
}