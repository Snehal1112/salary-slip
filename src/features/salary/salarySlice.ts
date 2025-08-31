import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { LineItem, SalaryState, SlipData } from "./types";

const defaultIncome: LineItem[] = [
  { particular: "Basic Salary", amount: 0 },
  { particular: "Dearness Allowance", amount: 0 },
  { particular: "HRA", amount: 0 },
  { particular: "Tiffin Allowance", amount: 0 },
  { particular: "City Compensatory Allowance", amount: 0 },
  { particular: "Assistant Allowance", amount: 0 },
  { particular: "Medical Allowance", amount: 0 },
];

const defaultDeductions: LineItem[] = [
  { particular: "PF", amount: 0 },
  { particular: "Professional Tax", amount: 0 },
  { particular: "TDS", amount: 0 },
];

const initialState: SalaryState = {
  current: {
    company: {
      name: "NUMERIC LABS",
      address: ["abc, street, anand - 388001"],
      email: "@gmail.com",
      mobile: "9999999999",
      gstin: "",
      website: "",
    },
    employee: {
      name: "",
      code: "",
      designation: "",
      pan: "",
      bankAccount: "",
      bankName: "",
      chequeNumber: "",
    },
    month: "Apr-25",
    currency: "INR",
    workingDays: {
      totalWorkingDays: 30,
      daysAttended: 0,
      leavesTaken: 0,
      balanceLeaves: 0,
    },
    income: defaultIncome,
    deductions: defaultDeductions,
    totalIncome: 0,
    totalDeductions: 0,
    netSalary: 0,
    template: {
      titleText: "PAYSLIP",
      titleAlign: "right",
      showCompanyAddress: true,
      showCompanyName: true,
    },
  },
  slips: [],
  error: null,
};

const computeTotals = (state: SalaryState["current"]) => {
  state.totalIncome = state.income.reduce(
    (s, i) => s + (Number(i.amount) || 0),
    0
  );
  state.totalDeductions = state.deductions.reduce(
    (s, i) => s + (Number(i.amount) || 0),
    0
  );
  state.netSalary = state.totalIncome - state.totalDeductions;
};

export const salarySlice = createSlice({
  name: "salary",
  initialState,
  reducers: {
    setCompany(
      state,
      action: PayloadAction<typeof initialState.current.company>
    ) {
      state.current.company = action.payload;
    },
    setEmployee(
      state,
      action: PayloadAction<typeof initialState.current.employee>
    ) {
      state.current.employee = action.payload;
    },
    setMonth(state, action: PayloadAction<string>) {
      state.current.month = action.payload;
    },
    setCurrency(state, action: PayloadAction<"INR" | "USD" | "EUR">) {
      state.current.currency = action.payload;
    },
    setWorkingDays(
      state,
      action: PayloadAction<typeof initialState.current.workingDays>
    ) {
      const w = action.payload;
      const max = Math.max(0, w.totalWorkingDays);
      state.current.workingDays = {
        totalWorkingDays: max,
        daysAttended: Math.min(w.daysAttended, max),
        leavesTaken: Math.max(0, w.leavesTaken),
        balanceLeaves: Math.max(0, w.balanceLeaves),
      };
    },
    setIncome(state, action: PayloadAction<LineItem[]>) {
      state.current.income = action.payload;
      computeTotals(state.current);
    },
    setDeductions(state, action: PayloadAction<LineItem[]>) {
      state.current.deductions = action.payload;
      computeTotals(state.current);
    },
    addIncome(state, action: PayloadAction<LineItem>) {
      state.current.income.push(action.payload);
      computeTotals(state.current);
    },
    removeIncome(state, action: PayloadAction<number>) {
      state.current.income.splice(action.payload, 1);
      computeTotals(state.current);
    },
    addDeduction(state, action: PayloadAction<LineItem>) {
      state.current.deductions.push(action.payload);
      computeTotals(state.current);
    },
    removeDeduction(state, action: PayloadAction<number>) {
      state.current.deductions.splice(action.payload, 1);
      computeTotals(state.current);
    },
    recalc(state) {
      computeTotals(state.current);
    },
    saveSlip(state) {
      const id = nanoid();
      const now = new Date().toISOString();
      const payload: SlipData = {
        id,
        createdAt: now,
        company: state.current.company,
        employee: state.current.employee,
        month: state.current.month,
        currency: state.current.currency,
        workingDays: state.current.workingDays,
        income: state.current.income,
        deductions: state.current.deductions,
        totalIncome: state.current.totalIncome,
        totalDeductions: state.current.totalDeductions,
        netSalary: state.current.netSalary,
        template: state.current.template,
      };
      state.slips.unshift(payload);
      state.current.id = id;
    },
    loadSlip(state, action: PayloadAction<string>) {
      const found = state.slips.find((s) => s.id === action.payload);
      if (found) {
        state.current = { ...found };
      }
    },
    deleteSlip(state, action: PayloadAction<string>) {
      state.slips = state.slips.filter((s) => s.id !== action.payload);
    },
    resetCurrent(state) {
      state.current = {
        ...initialState.current,
        income: [...defaultIncome],
        deductions: [...defaultDeductions],
      };
    },
    setTemplate(
      state,
      action: PayloadAction<typeof initialState.current.template>
    ) {
      state.current.template = action.payload;
    },
    exportState(state) {
      return state;
    },
    importState(_state, action: PayloadAction<SalaryState>) {
      return action.payload;
    },
  },
});

export const {
  setCompany,
  setEmployee,
  setMonth,
  setCurrency,
  setWorkingDays,
  setIncome,
  setDeductions,
  addIncome,
  removeIncome,
  addDeduction,
  removeDeduction,
  recalc,
  saveSlip,
  loadSlip,
  deleteSlip,
  resetCurrent,
  setTemplate,
  exportState,
  importState,
} = salarySlice.actions;

export default salarySlice.reducer;
