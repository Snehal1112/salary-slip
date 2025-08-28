import reducer, {
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "./employeesSlice";
import type { Employee, EmployeesState } from "./types";

describe("employees reducer", () => {
  it("adds employee and assigns id when missing", () => {
    const initial: EmployeesState = { list: [] };
    const payload: Partial<Employee> = { name: "Alice", code: "A01" };
    const next = reducer(initial, addEmployee(payload as Employee));

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
        } as Employee,
      ],
    };
    const updated: Employee = {
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
      list: [{ id: "1", name: "Carol" } as Employee],
    };
    const next = reducer(initial, deleteEmployee("1"));
    expect(next.list).toHaveLength(0);
  });
});
