// ==========================================
// 1. TYPE DEFINITIONS
// ==========================================

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
  expectedDate?: string; 
  currency?: string;     
  exchangeRate?: number; 
  desc: string;
  status: TransactionStatus;
  recurring: RecurringSchedule;
  lastProcessed?: string | null;
  attachmentName?: string | null;
  attachmentData?: string | null; 
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

export interface Entity { 
  id: string; 
  name: string; 
  type: EntityType; 
}

export interface Account { 
  id: string; 
  name: string; 
  type: AccountType; 
}

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

// ==========================================
// 2. MOCK DATA (Ugandan Wholesale Context)
// ==========================================

export const mockSettings: SystemSettings = {
  companyName: "Kikuubo Bulk Grains & Foods Ltd",
  companyEmail: "finance@kikuubograins.co.ug",
  companyPhone: "+256 700 123 456",
  companyAddress: "Store 42, Kikuubo Lane, Kampala, Uganda",
  currency: "UGX",
  fiscalYear: "July-June",
  dateFormat: "DD/MM/YYYY",
  pageSize: "25",
  enableRecon: true,
  strictMode: true,
  approvalThreshold: 5000000,
  dispatchEmail: "admin@kikuubograins.co.ug"
};

export const mockAccounts: Account[] = [
  { id: "ACC-001", name: "Stanbic Main Operations", type: "bank" },
  { id: "ACC-002", name: "Centenary Collections", type: "bank" },
  { id: "ACC-003", name: "Equity Supplier Payments", type: "bank" },
  { id: "ACC-004", name: "KCB USD Account", type: "bank" },
  { id: "ACC-005", name: "Standard Chartered Reserve", type: "bank" },
  { id: "ACC-006", name: "MTN MoMo Merchant Main", type: "mobile" },
  { id: "ACC-007", name: "Airtel Money Merchant Main", type: "mobile" },
  { id: "ACC-008", name: "MTN MoMo Petty Cash", type: "mobile" },
  { id: "ACC-009", name: "Warehouse Safe (Kikuubo)", type: "cash" },
  { id: "ACC-010", name: "Warehouse Safe (Ndeeba)", type: "cash" },
  { id: "ACC-011", name: "Store Register 1", type: "cash" },
  { id: "ACC-012", name: "Store Register 2", type: "cash" },
  { id: "ACC-013", name: "Director's Float", type: "cash" },
  { id: "ACC-014", name: "Delivery Float - Truck UBA", type: "cash" },
  { id: "ACC-015", name: "Delivery Float - Truck UBB", type: "cash" },
  { id: "ACC-016", name: "Delivery Float - Truck UBC", type: "cash" },
  { id: "ACC-017", name: "Delivery Float - Truck UBD", type: "cash" },
  { id: "ACC-018", name: "Delivery Float - Truck UBE", type: "cash" },
  { id: "ACC-019", name: "Delivery Float - Truck UBF", type: "cash" },
  { id: "ACC-020", name: "Delivery Float - Truck UBG", type: "cash" },
  { id: "ACC-021", name: "Housing Finance Payroll", type: "bank" },
  { id: "ACC-022", name: "DTB Importer Account", type: "bank" },
  { id: "ACC-023", name: "PostBank Farmer Escrow", type: "bank" },
  { id: "ACC-024", name: "Absa Tax Reserve", type: "bank" },
  { id: "ACC-025", name: "MTN MoMo Agent Line 1", type: "mobile" },
  { id: "ACC-026", name: "MTN MoMo Agent Line 2", type: "mobile" },
  { id: "ACC-027", name: "Airtel Money Agent Line 1", type: "mobile" },
  { id: "ACC-028", name: "Airtel Money Agent Line 2", type: "mobile" },
  { id: "ACC-029", name: "Warehouse Safe (Bwaise)", type: "cash" },
  { id: "ACC-030", name: "Warehouse Safe (Nalukolongo)", type: "cash" },
  { id: "ACC-031", name: "Regional Float - Jinja", type: "cash" },
  { id: "ACC-032", name: "Regional Float - Mbarara", type: "cash" },
  { id: "ACC-033", name: "Regional Float - Mbale", type: "cash" },
  { id: "ACC-034", name: "Regional Float - Gulu", type: "cash" },
  { id: "ACC-035", name: "Regional Float - Arua", type: "cash" },
  { id: "ACC-036", name: "Procurement Cash Reserve", type: "cash" },
  { id: "ACC-037", name: "Marketing Budget Float", type: "cash" },
  { id: "ACC-038", name: "Fuel & Transport Float", type: "cash" },
  { id: "ACC-039", name: "Maintenance Float", type: "cash" },
  { id: "ACC-040", name: "Security & Escort Float", type: "cash" },
  { id: "ACC-041", name: "UBA Transit Account", type: "bank" },
  { id: "ACC-042", name: "Bank of Africa Collections", type: "bank" },
  { id: "ACC-043", name: "DFCU Corporate Account", type: "bank" },
  { id: "ACC-044", name: "Ecobank Regional Trading", type: "bank" },
  { id: "ACC-045", name: "NCBA Fixed Deposit", type: "bank" },
  { id: "ACC-046", name: "MTN MoMo Bulk Disbursements", type: "mobile" },
  { id: "ACC-047", name: "Airtel Pay Business", type: "mobile" },
  { id: "ACC-048", name: "CEO Emergency Fund", type: "cash" },
  { id: "ACC-049", name: "Cross-Border KES Account", type: "bank" },
  { id: "ACC-050", name: "Cross-Border RWF Account", type: "bank" },
];

export const mockEntities: Entity[] = [
  { id: "ENT-001", name: "Mbarara Maize Millers", type: "vendor" },
  { id: "ENT-002", name: "Kasese Beans Growers Union", type: "vendor" },
  { id: "ENT-003", name: "Mbale Premium Rice Scheme", type: "vendor" },
  { id: "ENT-004", name: "Tororo Grains & Produce", type: "vendor" },
  { id: "ENT-005", name: "Kakira Sugar Corporation", type: "vendor" },
  { id: "ENT-006", name: "Rwenzori Salt Packers", type: "vendor" },
  { id: "ENT-007", name: "Lira Millet Farmers Assoc.", type: "vendor" },
  { id: "ENT-008", name: "Kapchorwa Wheat Importers", type: "vendor" },
  { id: "ENT-009", name: "Mukwano Industries", type: "vendor" },
  { id: "ENT-010", name: "Mutukula Cross-Border Traders", type: "vendor" },
  { id: "ENT-011", name: "Bidco Uganda Ltd", type: "vendor" },
  { id: "ENT-012", name: "Kampala Packaging Bags Ltd", type: "vendor" },
  { id: "ENT-013", name: "Vivo Energy (Fuel)", type: "vendor" },
  { id: "ENT-014", name: "Umeme Ltd (Electricity)", type: "vendor" },
  { id: "ENT-015", name: "URA (Taxes)", type: "vendor" },
  { id: "ENT-016", name: "Soroti Cassava Flour Mills", type: "vendor" },
  { id: "ENT-017", name: "Jinja Processing Mills", type: "vendor" },
  { id: "ENT-018", name: "Gulu Simsim & Groundnuts Ltd", type: "vendor" },
  { id: "ENT-019", name: "Busia Produce Hub", type: "vendor" },
  { id: "ENT-020", name: "Mombasa Port Freight", type: "vendor" },
  { id: "ENT-021", name: "Makerere University Dining", type: "client" },
  { id: "ENT-022", name: "Mengo Hospital Catering", type: "client" },
  { id: "ENT-023", name: "Kibuli Secondary School", type: "client" },
  { id: "ENT-024", name: "Capital Shoppers Ntinda", type: "client" },
  { id: "ENT-025", name: "Quality Supermarket Naalya", type: "client" },
  { id: "ENT-026", name: "Nakasero Market Bulk Buyers", type: "client" },
  { id: "ENT-027", name: "Kalerwe Produce Dealers", type: "client" },
  { id: "ENT-028", name: "Owino Market Syndicate", type: "client" },
  { id: "ENT-029", name: "Nabisunsa Girls School", type: "client" },
  { id: "ENT-030", name: "St. Mary's College Kisubi", type: "client" },
  { id: "ENT-031", name: "King's College Budo", type: "client" },
  { id: "ENT-032", name: "Gayaza High School", type: "client" },
  { id: "ENT-033", name: "Mulago National Referral", type: "client" },
  { id: "ENT-034", name: "Jinja Main Market Traders", type: "client" },
  { id: "ENT-035", name: "Gulu Town Retailers", type: "client" },
  { id: "ENT-036", name: "Mega Standard Supermarket", type: "client" },
  { id: "ENT-037", name: "Kenjoy Supermarket", type: "client" },
  { id: "ENT-038", name: "Luzira Prisons Commissary", type: "client" },
  { id: "ENT-039", name: "Uganda Police Barracks", type: "client" },
  { id: "ENT-040", name: "Arua Border Exporters", type: "client" },
  { id: "ENT-041", name: "Wandegeya Market Vendors", type: "client" },
  { id: "ENT-042", name: "Mbarara University (MUST)", type: "client" },
  { id: "ENT-043", name: "Logistics & Fleet Dept", type: "internal" },
  { id: "ENT-044", name: "Ndeeba Warehouse Management", type: "internal" },
  { id: "ENT-045", name: "Kikuubo Store Operations", type: "internal" },
  { id: "ENT-046", name: "Administration & HR", type: "internal" },
  { id: "ENT-047", name: "Sales & Marketing Team", type: "internal" },
  { id: "ENT-048", name: "Maintenance & Repairs", type: "internal" },
  { id: "ENT-049", name: "Tax & Compliance Dept", type: "internal" },
  { id: "ENT-050", name: "Executive Board", type: "internal" },
];

export const mockTransactions: Transaction[] = [
  // --- 2023 Transactions ---
  { id: "TXN-001", type: "in", entityId: "ENT-021", category: "Wholesale Sales", amount: 15500000, fee: 25000, accountId: "ACC-001", date: "2023-01-15T08:30:00Z", desc: "Sale of 5000kg Posho to Makerere", status: "cleared", recurring: "none", tags: ["Revenue", "Posho"] },
  { id: "TXN-002", type: "in", entityId: "ENT-022", category: "Institutional Contracts", amount: 8200000, fee: 15000, accountId: "ACC-002", date: "2023-02-10T10:15:00Z", desc: "Supply of 2000kg Nambale Beans", status: "cleared", recurring: "monthly", tags: ["Revenue", "Beans"] },
  { id: "TXN-003", type: "out", entityId: "ENT-001", category: "Grain Purchasing", amount: 12000000, fee: 35000, accountId: "ACC-003", date: "2023-03-05T14:20:00Z", desc: "Bulk purchase of Maize from Mbarara", status: "cleared", recurring: "none", tags: ["Expense", "Maize"] },
  { id: "TXN-004", type: "out", entityId: "ENT-013", category: "Transport & Fuel", amount: 2500000, fee: 0, accountId: "ACC-038", date: "2023-04-12T09:00:00Z", desc: "Monthly fuel bill for 5 delivery trucks", status: "cleared", recurring: "monthly", tags: ["Expense", "Logistics"] },
  { id: "TXN-005", type: "in", entityId: "ENT-024", category: "Wholesale Sales", amount: 6400000, fee: 10000, accountId: "ACC-006", date: "2023-05-20T11:45:00Z", desc: "Super Rice and Sugar for Capital Shoppers", status: "cleared", recurring: "none", tags: ["Revenue", "Rice", "Sugar"] },
  { id: "TXN-006", type: "out", entityId: "ENT-015", category: "Taxes", amount: 4800000, fee: 5000, accountId: "ACC-024", date: "2023-06-15T15:30:00Z", desc: "Q2 VAT Remittance", status: "cleared", recurring: "none", tags: ["Expense", "Tax"] },
  { id: "TXN-007", type: "out", entityId: "ENT-003", category: "Grain Purchasing", amount: 18500000, fee: 40000, accountId: "ACC-001", date: "2023-07-08T08:00:00Z", desc: "Premium Rice from Mbale Scheme", status: "cleared", recurring: "none", tags: ["Expense", "Rice"] },
  { id: "TXN-008", type: "in", entityId: "ENT-028", category: "Wholesale Sales", amount: 3200000, fee: 0, accountId: "ACC-009", date: "2023-08-22T13:10:00Z", desc: "Cash sale of Yellow Beans to Owino Traders", status: "cleared", recurring: "none", tags: ["Revenue", "Beans", "Cash"] },
  { id: "TXN-009", type: "out", entityId: "ENT-046", category: "Salaries", amount: 14000000, fee: 75000, accountId: "ACC-021", date: "2023-09-28T16:00:00Z", desc: "September Payroll Distribution", status: "cleared", recurring: "monthly", tags: ["Expense", "Payroll"] },
  { id: "TXN-010", type: "in", entityId: "ENT-038", category: "Institutional Contracts", amount: 22000000, fee: 50000, accountId: "ACC-001", date: "2023-10-15T09:20:00Z", desc: "Luzira Prisons Posho & Beans Supply", status: "cleared", recurring: "monthly", tags: ["Revenue", "Posho", "Beans"] },
  { id: "TXN-011", type: "out", entityId: "ENT-012", category: "Packaging", amount: 1500000, fee: 2000, accountId: "ACC-008", date: "2023-11-05T10:30:00Z", desc: "Branded sacks (100kg & 50kg)", status: "cleared", recurring: "none", tags: ["Expense", "Packaging"] },
  { id: "TXN-012", type: "in", entityId: "ENT-040", category: "Export Sales", amount: 45000000, fee: 120000, accountId: "ACC-004", date: "2023-12-18T14:45:00Z", desc: "Export of Maize Flour to South Sudan via Arua", status: "cleared", recurring: "none", tags: ["Revenue", "Export", "Posho"] },

  // --- 2024 Transactions ---
  { id: "TXN-013", type: "in", entityId: "ENT-030", category: "Institutional Contracts", amount: 9500000, fee: 15000, accountId: "ACC-002", date: "2024-01-12T08:15:00Z", desc: "Term 1 Food Supply (Rice, Posho, Beans)", status: "cleared", recurring: "none", tags: ["Revenue", "Schools"] },
  { id: "TXN-014", type: "out", entityId: "ENT-007", category: "Grain Purchasing", amount: 5600000, fee: 10000, accountId: "ACC-003", date: "2024-02-08T11:20:00Z", desc: "Millet grain from Lira Farmers", status: "cleared", recurring: "none", tags: ["Expense", "Millet"] },
  { id: "TXN-015", type: "in", entityId: "ENT-036", category: "Wholesale Sales", amount: 7800000, fee: 5000, accountId: "ACC-006", date: "2024-03-20T13:40:00Z", desc: "Assorted grains for Mega Standard", status: "cleared", recurring: "none", tags: ["Revenue", "Retail"] },
  { id: "TXN-016", type: "out", entityId: "ENT-014", category: "Warehouse Rent", amount: 3500000, fee: 0, accountId: "ACC-010", date: "2024-04-05T09:00:00Z", desc: "Umeme Power bill for Ndeeba Mills", status: "cleared", recurring: "monthly", tags: ["Expense", "Utilities"] },
  { id: "TXN-017", type: "out", entityId: "ENT-006", category: "Grain Purchasing", amount: 4200000, fee: 8000, accountId: "ACC-001", date: "2024-05-15T10:10:00Z", desc: "Bulk Salt from Rwenzori Packers", status: "cleared", recurring: "none", tags: ["Expense", "Salt"] },
  { id: "TXN-018", type: "in", entityId: "ENT-027", category: "Wholesale Sales", amount: 2100000, fee: 0, accountId: "ACC-011", date: "2024-06-22T14:30:00Z", desc: "Cash purchase of Rice by Kalerwe Dealers", status: "cleared", recurring: "none", tags: ["Revenue", "Rice", "Cash"] },
  { id: "TXN-019", type: "out", entityId: "ENT-044", category: "Maintenance", amount: 1800000, fee: 2000, accountId: "ACC-039", date: "2024-07-10T16:15:00Z", desc: "Milling machine repairs in Ndeeba", status: "cleared", recurring: "none", tags: ["Expense", "Repairs"] },
  { id: "TXN-020", type: "in", entityId: "ENT-033", category: "Institutional Contracts", amount: 16500000, fee: 30000, accountId: "ACC-002", date: "2024-08-05T09:45:00Z", desc: "Mulago Hospital Q3 Supply", status: "cleared", recurring: "none", tags: ["Revenue", "Hospitals"] },
  { id: "TXN-021", type: "out", entityId: "ENT-008", category: "Grain Purchasing", amount: 28000000, fee: 55000, accountId: "ACC-022", date: "2024-09-18T11:00:00Z", desc: "Imported Wheat from Kapchorwa border", status: "cleared", recurring: "none", tags: ["Expense", "Wheat", "Import"] },
  { id: "TXN-022", type: "in", entityId: "ENT-026", category: "Wholesale Sales", amount: 5400000, fee: 0, accountId: "ACC-009", date: "2024-10-12T13:20:00Z", desc: "Nakasero traders bulk Sugar & Salt", status: "cleared", recurring: "none", tags: ["Revenue", "Cash"] },
  { id: "TXN-023", type: "out", entityId: "ENT-011", category: "Grain Purchasing", amount: 11000000, fee: 20000, accountId: "ACC-003", date: "2024-11-20T10:00:00Z", desc: "Cooking Oil from Bidco", status: "cleared", recurring: "none", tags: ["Expense", "Oil"] },
  { id: "TXN-024", type: "in", entityId: "ENT-039", category: "Institutional Contracts", amount: 35000000, fee: 80000, accountId: "ACC-001", date: "2024-12-05T08:30:00Z", desc: "Police Barracks Annual Food Allocation", status: "cleared", recurring: "none", tags: ["Revenue", "Government"] },

  // --- 2025 Transactions ---
  { id: "TXN-025", type: "in", entityId: "ENT-031", category: "Institutional Contracts", amount: 12000000, fee: 25000, accountId: "ACC-002", date: "2025-01-14T09:10:00Z", desc: "King's College Budo Term 1 Delivery", status: "cleared", recurring: "none", tags: ["Revenue", "Schools"] },
  { id: "TXN-026", type: "out", entityId: "ENT-016", category: "Grain Purchasing", amount: 6500000, fee: 12000, accountId: "ACC-003", date: "2025-02-18T11:45:00Z", desc: "Cassava Flour from Soroti Mills", status: "cleared", recurring: "none", tags: ["Expense", "Cassava"] },
  { id: "TXN-027", type: "in", entityId: "ENT-034", category: "Wholesale Sales", amount: 4800000, fee: 0, accountId: "ACC-031", date: "2025-03-22T14:15:00Z", desc: "Jinja Market bulk posho sales", status: "cleared", recurring: "none", tags: ["Revenue", "Regional"] },
  { id: "TXN-028", type: "out", entityId: "ENT-043", category: "Transport & Fuel", amount: 3200000, fee: 0, accountId: "ACC-038", date: "2025-04-10T10:30:00Z", desc: "Truck Servicing & Tyres", status: "cleared", recurring: "none", tags: ["Expense", "Logistics"] },
  { id: "TXN-029", type: "in", entityId: "ENT-025", category: "Wholesale Sales", amount: 8900000, fee: 15000, accountId: "ACC-006", date: "2025-05-05T13:00:00Z", desc: "Quality Supermarket Restock", status: "cleared", recurring: "none", tags: ["Revenue", "Retail"] },
  { id: "TXN-030", type: "out", entityId: "ENT-015", category: "Taxes", amount: 5100000, fee: 5000, accountId: "ACC-024", date: "2025-06-15T09:00:00Z", desc: "Q2 VAT & Withholding Tax", status: "cleared", recurring: "none", tags: ["Expense", "Tax"] },
  { id: "TXN-031", type: "out", entityId: "ENT-002", category: "Grain Purchasing", amount: 14500000, fee: 30000, accountId: "ACC-023", date: "2025-07-20T11:20:00Z", desc: "Kasese Beans Harvest Purchase", status: "cleared", recurring: "none", tags: ["Expense", "Beans"] },
  { id: "TXN-032", type: "in", entityId: "ENT-023", category: "Institutional Contracts", amount: 7200000, fee: 12000, accountId: "ACC-002", date: "2025-08-12T14:40:00Z", desc: "Kibuli SS Term 3 Provisions", status: "cleared", recurring: "none", tags: ["Revenue", "Schools"] },
  { id: "TXN-033", type: "out", entityId: "ENT-046", category: "Salaries", amount: 15500000, fee: 80000, accountId: "ACC-021", date: "2025-09-28T16:00:00Z", desc: "September Payroll & Bonuses", status: "cleared", recurring: "monthly", tags: ["Expense", "Payroll"] },
  { id: "TXN-034", type: "in", entityId: "ENT-040", category: "Export Sales", amount: 52000000, fee: 150000, accountId: "ACC-004", date: "2025-10-15T10:15:00Z", desc: "Export of Mixed Beans to DRC", status: "cleared", recurring: "none", tags: ["Revenue", "Export"] },
  { id: "TXN-035", type: "out", entityId: "ENT-012", category: "Packaging", amount: 1800000, fee: 3000, accountId: "ACC-008", date: "2025-11-08T09:30:00Z", desc: "Polythene and woven sacks refill", status: "cleared", recurring: "none", tags: ["Expense", "Packaging"] },
  { id: "TXN-036", type: "in", entityId: "ENT-029", category: "Institutional Contracts", amount: 6400000, fee: 10000, accountId: "ACC-001", date: "2025-12-02T13:00:00Z", desc: "Nabisunsa Girls Food Supply", status: "cleared", recurring: "none", tags: ["Revenue", "Schools"] },

  // --- Early 2026 Transactions ---
  { id: "TXN-037", type: "in", entityId: "ENT-021", category: "Wholesale Sales", amount: 18000000, fee: 30000, accountId: "ACC-001", date: "2026-01-10T08:00:00Z", desc: "Makerere University Semester 1 Posho", status: "cleared", recurring: "none", tags: ["Revenue", "Posho"] },
  { id: "TXN-038", type: "out", entityId: "ENT-004", category: "Grain Purchasing", amount: 9500000, fee: 15000, accountId: "ACC-003", date: "2026-01-22T11:15:00Z", desc: "Tororo Maize bulk purchase", status: "cleared", recurring: "none", tags: ["Expense", "Maize"] },
  { id: "TXN-039", type: "in", entityId: "ENT-026", category: "Wholesale Sales", amount: 4200000, fee: 0, accountId: "ACC-009", date: "2026-02-05T14:30:00Z", desc: "Nakasero cash sales (Beans & Rice)", status: "cleared", recurring: "none", tags: ["Revenue", "Cash"] },
  { id: "TXN-040", type: "out", entityId: "ENT-013", category: "Transport & Fuel", amount: 4000000, fee: 0, accountId: "ACC-038", date: "2026-02-18T09:45:00Z", desc: "Vivo Energy Monthly Fuel Bill", status: "cleared", recurring: "monthly", tags: ["Expense", "Logistics"] },
  { id: "TXN-041", type: "in", entityId: "ENT-036", category: "Wholesale Sales", amount: 11000000, fee: 20000, accountId: "ACC-006", date: "2026-03-01T10:00:00Z", desc: "Mega Standard Supermarket Restock", status: "cleared", recurring: "none", tags: ["Revenue", "Retail"] },
  { id: "TXN-042", type: "out", entityId: "ENT-001", category: "Grain Purchasing", amount: 22000000, fee: 45000, accountId: "ACC-001", date: "2026-03-08T11:30:00Z", desc: "Pending payment for Mbarara Maize", status: "approved", recurring: "none", tags: ["Expense", "Maize"] },
  { id: "TXN-043", type: "in", entityId: "ENT-033", category: "Institutional Contracts", amount: 15000000, fee: 25000, accountId: "ACC-002", date: "2026-03-09T09:20:00Z", desc: "Mulago Hospital Q1 Invoice", status: "approved", recurring: "none", tags: ["Revenue", "Hospitals"] },
  { id: "TXN-044", type: "out", entityId: "ENT-015", category: "Taxes", amount: 6000000, fee: 5000, accountId: "ACC-024", date: "2026-03-10T14:10:00Z", desc: "Q1 Provisional Tax", status: "draft", recurring: "none", tags: ["Expense", "Tax"] },
  { id: "TXN-045", type: "in", entityId: "ENT-040", category: "Export Sales", amount: 38000000, fee: 90000, accountId: "ACC-004", date: "2026-03-11T15:45:00Z", desc: "Draft Export Invoice - South Sudan", status: "draft", recurring: "none", tags: ["Revenue", "Export"] },
  { id: "TXN-046", type: "out", entityId: "ENT-048", category: "Maintenance", amount: 2500000, fee: 3000, accountId: "ACC-039", date: "2026-03-12T10:00:00Z", desc: "Warehouse Roof Repairs Ndeeba", status: "draft", recurring: "none", tags: ["Expense", "Repairs"] },
  { id: "TXN-047", type: "in", entityId: "ENT-022", category: "Institutional Contracts", amount: 9800000, fee: 18000, accountId: "ACC-002", date: "2026-03-12T13:20:00Z", desc: "Mengo Hospital Catering Supply", status: "draft", recurring: "none", tags: ["Revenue", "Hospitals"] },
  { id: "TXN-048", type: "out", entityId: "ENT-008", category: "Grain Purchasing", amount: 16500000, fee: 32000, accountId: "ACC-022", date: "2026-03-12T16:00:00Z", desc: "Wheat Import Clearance", status: "approved", recurring: "none", tags: ["Expense", "Wheat", "Import"] },
  { id: "TXN-049", type: "in", entityId: "ENT-038", category: "Institutional Contracts", amount: 24000000, fee: 50000, accountId: "ACC-001", date: "2026-03-13T08:30:00Z", desc: "Luzira Prisons March Delivery", status: "draft", recurring: "none", tags: ["Revenue", "Government"] },
  { id: "TXN-050", type: "out", entityId: "ENT-043", category: "Transport & Fuel", amount: 1500000, fee: 0, accountId: "ACC-038", date: "2026-03-13T09:15:00Z", desc: "Driver Allowance & Tolls", status: "draft", recurring: "none", tags: ["Expense", "Logistics"] },
];

export const mockAuditLogs: AuditLog[] = [
  { id: "LOG-001", timestamp: "2023-01-15T08:30:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-001 for 15,500,000 UGX was recorded and cleared.", user: "Admin (System)" },
  { id: "LOG-002", timestamp: "2023-02-10T10:15:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-002 for 8,200,000 UGX was recorded and cleared.", user: "Sarah (Cashier)" },
  { id: "LOG-003", timestamp: "2023-03-05T14:20:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-003 for 12,000,000 UGX was recorded and cleared.", user: "John (Finance Manager)" },
  { id: "LOG-004", timestamp: "2023-04-12T09:00:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-004 for 2,500,000 UGX was recorded and cleared.", user: "Admin (System)" },
  { id: "LOG-005", timestamp: "2023-05-20T11:45:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-005 for 6,400,000 UGX was recorded and cleared.", user: "Sarah (Cashier)" },
  { id: "LOG-006", timestamp: "2023-06-15T15:30:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-006 for 4,800,000 UGX was recorded and cleared.", user: "John (Finance Manager)" },
  { id: "LOG-007", timestamp: "2023-07-08T08:00:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-007 for 18,500,000 UGX was recorded and cleared.", user: "Admin (System)" },
  { id: "LOG-008", timestamp: "2023-08-22T13:10:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-008 for 3,200,000 UGX was recorded and cleared.", user: "Sarah (Cashier)" },
  { id: "LOG-009", timestamp: "2023-09-28T16:00:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-009 for 14,000,000 UGX was recorded and cleared.", user: "John (Finance Manager)" },
  { id: "LOG-010", timestamp: "2023-10-15T09:20:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-010 for 22,000,000 UGX was recorded and cleared.", user: "Admin (System)" },
  { id: "LOG-011", timestamp: "2024-01-12T08:15:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-013 for 9,500,000 UGX was recorded and cleared.", user: "Sarah (Cashier)" },
  { id: "LOG-012", timestamp: "2024-05-15T10:10:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-017 for 4,200,000 UGX was recorded and cleared.", user: "John (Finance Manager)" },
  { id: "LOG-013", timestamp: "2024-09-18T11:00:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-021 for 28,000,000 UGX was recorded and cleared.", user: "Admin (System)" },
  { id: "LOG-014", timestamp: "2025-01-14T09:10:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-025 for 12,000,000 UGX was recorded and cleared.", user: "Sarah (Cashier)" },
  { id: "LOG-015", timestamp: "2025-07-20T11:20:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-031 for 14,500,000 UGX was recorded and cleared.", user: "John (Finance Manager)" },
  { id: "LOG-016", timestamp: "2026-03-08T11:30:00Z", action: "STATUS_CHANGED", entityName: "Transaction", details: "Transaction TXN-042 for 22,000,000 UGX was created as approved.", user: "Admin (System)" },
  { id: "LOG-017", timestamp: "2026-03-09T09:20:00Z", action: "STATUS_CHANGED", entityName: "Transaction", details: "Transaction TXN-043 for 15,000,000 UGX was created as approved.", user: "Sarah (Cashier)" },
  { id: "LOG-018", timestamp: "2026-03-10T14:10:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-044 for 6,000,000 UGX was created as draft.", user: "John (Finance Manager)" },
  { id: "LOG-019", timestamp: "2026-03-11T15:45:00Z", action: "CREATED", entityName: "Transaction", details: "Transaction TXN-045 for 38,000,000 UGX was created as draft.", user: "Admin (System)" },
  { id: "LOG-020", timestamp: "2026-03-12T07:00:00Z", action: "SYSTEM_ACTION", entityName: "Settings", details: "End of day dispatch completed.", user: "System" },
  { id: "LOG-021", timestamp: "2026-03-11T18:30:00Z", action: "UPDATED", entityName: "Account", details: "Updated limits for MTN MoMo Merchant Main.", user: "Admin (System)" },
  { id: "LOG-022", timestamp: "2026-03-10T09:15:00Z", action: "CREATED", entityName: "Entity", details: "Added new vendor: Tororo Maize bulk purchase.", user: "John (Finance Manager)" }
];