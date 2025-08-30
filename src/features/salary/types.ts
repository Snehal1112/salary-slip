// Employee type imported from shared location
import type { Employee } from "../../types/shared";

export type IncomeItem = LineItem;
export type DeductionItem = LineItem;

export interface FormValues {
  company: Company;
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

export type Company = {
  name: string;
  address: string[];
  email?: string;
  mobile?: string;
  gstin?: string;
  website?: string;
  contactNumber?: string;
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
  company: Company;
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
  company: Company;
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
