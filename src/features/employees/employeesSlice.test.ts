import reducer, {
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "./employeesSlice";
import type { EmployeeRequired } from "../../types/shared";
import type { EmployeesState } from "./types";

// Helper to create initial state
const createInitialState = (overrides: Partial<EmployeesState> = {}): EmployeesState => ({
  list: [],
  loading: false,
  error: null,
  selectedIds: [],
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
  filters: {
    search: '',
    department: '',
    designation: '',
    status: 'all',
  },
  sortBy: 'name',
  sortOrder: 'asc',
  viewMode: 'list',
  isFormOpen: false,
  editingEmployeeId: null,
  formStep: 0,
  validationErrors: {},
  bulkOperationInProgress: false,
  stats: {
    totalEmployees: 0,
    activeEmployees: 0,
    departmentCounts: {},
    recentlyAdded: 0,
  },
  ...overrides,
});

describe("employees reducer", () => {
  it("adds employee and assigns id when missing", () => {
    const initial = createInitialState();
    const payload: Omit<EmployeeRequired, 'id'> = { 
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
    expect(next.stats.totalEmployees).toBe(1);
    expect(next.totalItems).toBe(1);
  });

  it("updates an existing employee", () => {
    const initial = createInitialState({
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
      stats: {
        totalEmployees: 1,
        activeEmployees: 1,
        departmentCounts: {},
        recentlyAdded: 0,
      },
      totalItems: 1,
    });
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
    expect(next.error).toBeNull();
  });

  it("deletes an employee by id", () => {
    const initial = createInitialState({
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
      stats: {
        totalEmployees: 1,
        activeEmployees: 1,
        departmentCounts: {},
        recentlyAdded: 0,
      },
      totalItems: 1,
    });
    const next = reducer(initial, deleteEmployee("1"));
    expect(next.list).toHaveLength(0);
    expect(next.stats.totalEmployees).toBe(0);
    expect(next.totalItems).toBe(0);
  });
});
