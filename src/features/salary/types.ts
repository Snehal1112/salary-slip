export type LineItem = {
  particular: string;
  amount: number;
};

export type Company = {
  name: string;
  address: string;
  email: string;
  mobile: string;
};

export type Employee = {
  id?: string;
  name: string;
  code: string;
  designation: string;
  pan: string;
  bankAccount: string;
  bankName: string;
  chequeNumber: string;
};

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
