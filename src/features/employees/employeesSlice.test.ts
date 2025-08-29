import reducer, {
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "./employeesSlice";
import type { EmployeeRequired } from "../../types/shared";
import type { EmployeesState } from "./types";

describe("employees reducer", () => {
  it("adds employee and assigns id when missing", () => {
    const initial: EmployeesState = { list: [] };
    const payload: EmployeeRequired = { 
      name: "Alice", 
      code: "A01",
      designation: "Developer",
      pan: "ABCDE1234F",
      bankAccount: "123456789",
      bankName: "Test Bank",
      chequeNumber: "001" 
    };
    const next = reducer(initial, addEmployee(payload));

    expect(next.list.length).toBe(1);
    expect(next.list[0].name).toBe("Alice");
    expect(next.list[0].id).toBeDefined();
  });

  it("updates an existing employee", () => {
    const initial: EmployeesState = {
      list: [
        {
          id: "1",
          name: "Bob",
          code: "B1",
          designation: "",
          pan: "",
          bankAccount: "",
          bankName: "",
          chequeNumber: "",
        } as EmployeeRequired,
      ],
    };
    const updated: EmployeeRequired = {
      id: "1",
      name: "Bobby",
      code: "B1",
      designation: "",
      pan: "",
      bankAccount: "",
      bankName: "",
      chequeNumber: "",
    };
    const next = reducer(initial, updateEmployee(updated));
    expect(next.list.length).toBe(1);
    expect(next.list[0].name).toBe("Bobby");
  });

  it("deletes an employee by id", () => {
    const initial: EmployeesState = {
      list: [{ 
        id: "1", 
        name: "Carol",
        code: "C01",
        designation: "Manager",
        pan: "CCCCC1234C",
        bankAccount: "987654321",
        bankName: "Carol Bank",
        chequeNumber: "002"
      } as EmployeeRequired],
    };
    const next = reducer(initial, deleteEmployee("1"));
    expect(next.list).toHaveLength(0);
  });
});
