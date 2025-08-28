import salaryReducer, { recalc, saveSlip } from "./salarySlice";
import type { SalaryState } from "./types";

describe("salary slice", () => {
  let state: SalaryState;

  beforeEach(() => {
    state = {
      current: {
        company: {
          name: "X",
          address: [""],
          email: "",
          mobile: "",
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
        income: [{ particular: "Basic", amount: 100 }],
        deductions: [{ particular: "PF", amount: 10 }],
        totalIncome: 0,
        totalDeductions: 0,
        netSalary: 0,
      },
      slips: [],
      error: null,
    };
  });

  it("recalc totals", () => {
    const s = salaryReducer(state, recalc());
    expect(s.current.totalIncome).toBe(100);
    expect(s.current.totalDeductions).toBe(10);
    expect(s.current.netSalary).toBe(90);
  });

  it("save slip adds to slips", () => {
    let s = salaryReducer(state, recalc());
    s = salaryReducer(s, saveSlip());
    expect(s.slips.length).toBe(1);
  });
});
