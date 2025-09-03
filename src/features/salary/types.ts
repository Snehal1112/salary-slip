// Employee and Company types imported from shared location
import type { Employee, Company as CompanyManagement } from "../../types/shared";

export type IncomeItem = LineItem;
export type DeductionItem = LineItem;

export interface FormValues {
  company: SalaryCompany;
  employee: Employee;
  workingDays: WorkingDays;
  income: IncomeItem[];
  deductions: DeductionItem[];
  template: TemplateSettings;
}
export type LineItem = {
  particular: string;
  amount: number;
};

// Salary-specific company type for backward compatibility
export type SalaryCompany = {
  name: string;
  address: string[];
  email?: string;
  mobile?: string;
  gstin?: string;
  website?: string;
  contactNumber?: string;
};

// Helper function to convert Company management type to Salary company type
export const convertCompanyToSalaryCompany = (company: CompanyManagement): SalaryCompany => {
  const primaryAddress = company.addresses.find(addr => addr.isPrimary) || company.addresses[0];
  const addressLines = [];
  
  if (primaryAddress) {
    addressLines.push(primaryAddress.line1);
    if (primaryAddress.line2) addressLines.push(primaryAddress.line2);
    addressLines.push(`${primaryAddress.city}, ${primaryAddress.state} - ${primaryAddress.pincode}`);
    if (primaryAddress.country !== 'India') addressLines.push(primaryAddress.country);
  }

  return {
    name: company.name,
    address: addressLines,
    email: company.email,
    mobile: company.phone,
    gstin: company.gstin,
    website: company.website,
  };
};

// Employee type now imported from shared location above

export type WorkingDays = {
  totalWorkingDays: number;
  daysAttended: number;
  leavesTaken: number;
  balanceLeaves: number;
};

export type TemplateSettings = {
  titleText?: string;
  titleAlign?: "left" | "center" | "right";
  showCompanyAddress?: boolean;
  showCompanyName?: boolean;
};

export type SlipData = {
  id: string;
  createdAt: string;
} & {
  company: SalaryCompany;
  employee: Employee;
  month: string;
  currency: string;
  workingDays: WorkingDays;
  income: LineItem[];
  deductions: LineItem[];
  totalIncome: number;
  totalDeductions: number;
  netSalary: number;
  template?: TemplateSettings;
};

export type SalaryCurrent = {
  company: SalaryCompany;
  employee: Employee;
  month: string;
  currency: string;
  workingDays: WorkingDays;
  income: LineItem[];
  deductions: LineItem[];
  totalIncome: number;
  totalDeductions: number;
  netSalary: number;
  id?: string;
  template?: TemplateSettings;
};

export type SalaryState = {
  current: SalaryCurrent;
  slips: SlipData[];
  error: string | null;
};
