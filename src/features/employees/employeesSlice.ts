import { createSlice, createSelector, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { EmployeeRequired } from "../../types/shared";
import type { 
  EmployeesState, 
  EmployeeFilter, 
  EmployeeSortBy, 
  EmployeeSortOrder, 
  EmployeeViewMode
} from "./types";
import type { RootState } from "../../store";

// Helper function to compute stats
const computeStats = (employees: EmployeeRequired[]) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const departmentCounts = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentlyAdded = employees.filter(emp => {
    if (!emp.joiningDate) return false;
    const joiningDate = new Date(emp.joiningDate);
    return joiningDate >= thirtyDaysAgo;
  }).length;

  return {
    totalEmployees: employees.length,
    activeEmployees: employees.length, // For now, assume all are active
    departmentCounts,
    recentlyAdded,
  };
};

const initialState: EmployeesState = {
  list: [],
  loading: false,
  error: null,
  
  // UI State
  selectedIds: [],
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
  
  // Filters & Search
  filters: {
    search: '',
    department: '',
    designation: '',
    status: 'all',
  },
  sortBy: 'name',
  sortOrder: 'asc',
  viewMode: 'list',
  
  // Form state
  isFormOpen: false,
  editingEmployeeId: null,
  formStep: 0,
  
  // Validation state
  validationErrors: {},
  
  // Bulk operations
  bulkOperationInProgress: false,
  
  // Stats
  stats: {
    totalEmployees: 0,
    activeEmployees: 0,
    departmentCounts: {},
    recentlyAdded: 0,
  },
};

export const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    // Loading states
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },

    // CRUD operations
    addEmployee(state, action: PayloadAction<Omit<EmployeeRequired, 'id'>>) {
      const employee = { ...action.payload, id: nanoid() };
      state.list.push(employee);
      state.stats = computeStats(state.list);
      state.totalItems = state.list.length;
      state.error = null;
    },
    
    updateEmployee(state, action: PayloadAction<EmployeeRequired>) {
      const idx = state.list.findIndex((x) => x.id === action.payload.id);
      if (idx >= 0) {
        state.list[idx] = action.payload;
        state.stats = computeStats(state.list);
        state.error = null;
      } else {
        state.error = 'Employee not found';
      }
    },
    
    deleteEmployee(state, action: PayloadAction<string>) {
      const initialLength = state.list.length;
      state.list = state.list.filter((e) => e.id !== action.payload);
      
      if (state.list.length === initialLength) {
        state.error = 'Employee not found';
      } else {
        state.stats = computeStats(state.list);
        state.totalItems = state.list.length;
        state.selectedIds = state.selectedIds.filter(id => id !== action.payload);
        state.error = null;
      }
    },
    
    // Bulk operations
    deleteMultipleEmployees(state, action: PayloadAction<string[]>) {
      const idsToDelete = new Set(action.payload);
      state.list = state.list.filter((e) => !idsToDelete.has(e.id!));
      state.selectedIds = state.selectedIds.filter(id => !idsToDelete.has(id));
      state.stats = computeStats(state.list);
      state.totalItems = state.list.length;
      state.error = null;
    },
    
    // Selection management
    selectEmployee(state, action: PayloadAction<string>) {
      if (!state.selectedIds.includes(action.payload)) {
        state.selectedIds.push(action.payload);
      }
    },
    
    deselectEmployee(state, action: PayloadAction<string>) {
      state.selectedIds = state.selectedIds.filter(id => id !== action.payload);
    },
    
    selectAllEmployeesAction(state) {
      state.selectedIds = state.list.map(e => e.id!);
    },
    
    clearSelection(state) {
      state.selectedIds = [];
    },
    
    // Filtering and sorting
    setFilters(state, action: PayloadAction<Partial<EmployeeFilter>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },
    
    clearFilters(state) {
      state.filters = {
        search: '',
        department: '',
        designation: '',
        status: 'all',
      };
      state.currentPage = 1;
    },
    
    setSorting(state, action: PayloadAction<{ sortBy: EmployeeSortBy; sortOrder: EmployeeSortOrder }>) {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    
    // Pagination
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    
    setItemsPerPage(state, action: PayloadAction<number>) {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when items per page changes
    },
    
    // View mode
    setViewMode(state, action: PayloadAction<EmployeeViewMode>) {
      state.viewMode = action.payload;
    },
    
    // Form state management
    openEmployeeForm(state, action: PayloadAction<string | null>) {
      state.isFormOpen = true;
      state.editingEmployeeId = action.payload;
      state.formStep = 0;
      state.validationErrors = {};
    },
    
    closeEmployeeForm(state) {
      state.isFormOpen = false;
      state.editingEmployeeId = null;
      state.formStep = 0;
      state.validationErrors = {};
    },
    
    setFormStep(state, action: PayloadAction<number>) {
      state.formStep = action.payload;
    },
    
    // Validation
    setValidationErrors(state, action: PayloadAction<Record<string, string[]>>) {
      state.validationErrors = action.payload;
    },
    
    clearValidationErrors(state) {
      state.validationErrors = {};
    },
    
    // Bulk operations state
    setBulkOperationInProgress(state, action: PayloadAction<boolean>) {
      state.bulkOperationInProgress = action.payload;
    },
    
    // Import employees (for data migration)
    importEmployees(state, action: PayloadAction<EmployeeRequired[]>) {
      // Merge with existing, avoiding duplicates by ID
      const existingIds = new Set(state.list.map(e => e.id));
      const newEmployees = action.payload.filter(e => !existingIds.has(e.id!));
      
      state.list.push(...newEmployees);
      state.stats = computeStats(state.list);
      state.totalItems = state.list.length;
      state.error = null;
    },
    
    // Reset all state
    resetEmployeesState() {
      return { ...initialState };
    },
    
    // Initialize stats (useful for hydration)
    refreshStats(state) {
      state.stats = computeStats(state.list);
      state.totalItems = state.list.length;
    },
  },
});

// Selectors
export const selectEmployeesState = (state: RootState) => state.employees;
export const selectAllEmployees = (state: RootState) => state.employees.list;
export const selectEmployeesLoading = (state: RootState) => state.employees.loading;
export const selectEmployeesError = (state: RootState) => state.employees.error;
export const selectSelectedEmployeeIds = (state: RootState) => state.employees.selectedIds;
export const selectEmployeeFilters = (state: RootState) => state.employees.filters;
export const selectEmployeeSorting = (state: RootState) => ({ 
  sortBy: state.employees.sortBy, 
  sortOrder: state.employees.sortOrder 
});
export const selectEmployeeViewMode = (state: RootState) => state.employees.viewMode;
export const selectEmployeeStats = (state: RootState) => state.employees.stats;
export const selectIsFormOpen = (state: RootState) => state.employees.isFormOpen;
export const selectEditingEmployeeId = (state: RootState) => state.employees.editingEmployeeId;
export const selectFormStep = (state: RootState) => state.employees.formStep;
export const selectValidationErrors = (state: RootState) => state.employees.validationErrors;

// Complex selectors
export const selectEmployeeById = createSelector(
  [selectAllEmployees, (_state: RootState, id: string) => id],
  (employees, id) => employees.find(emp => emp.id === id)
);

export const selectFilteredEmployees = createSelector(
  [selectAllEmployees, selectEmployeeFilters],
  (employees, filters) => {
    return employees.filter(emp => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          emp.name.toLowerCase().includes(searchLower) ||
          emp.code.toLowerCase().includes(searchLower) ||
          emp.designation?.toLowerCase().includes(searchLower) ||
          emp.department?.toLowerCase().includes(searchLower) ||
          emp.email?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Department filter
      if (filters.department && filters.department !== '') {
        if (emp.department !== filters.department) return false;
      }
      
      // Designation filter
      if (filters.designation && filters.designation !== '') {
        if (emp.designation !== filters.designation) return false;
      }
      
      // Status filter (assuming all are active for now)
      if (filters.status && filters.status !== 'all') {
        // Could implement active/inactive logic here
      }
      
      return true;
    });
  }
);

export const selectSortedEmployees = createSelector(
  [selectFilteredEmployees, selectEmployeeSorting],
  (employees, { sortBy, sortOrder }) => {
    const sorted = [...employees].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      
      switch (sortBy) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'code':
          aVal = a.code;
          bVal = b.code;
          break;
        case 'designation':
          aVal = a.designation || '';
          bVal = b.designation || '';
          break;
        case 'department':
          aVal = a.department || '';
          bVal = b.department || '';
          break;
        case 'joiningDate':
          aVal = a.joiningDate || '';
          bVal = b.joiningDate || '';
          break;
        default:
          return 0;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    
    return sorted;
  }
);

export const selectPaginatedEmployees = createSelector(
  [selectSortedEmployees, (state: RootState) => state.employees.currentPage, (state: RootState) => state.employees.itemsPerPage],
  (employees, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return employees.slice(startIndex, endIndex);
  }
);

export const selectSelectedEmployees = createSelector(
  [selectAllEmployees, selectSelectedEmployeeIds],
  (employees, selectedIds) => employees.filter(emp => selectedIds.includes(emp.id!))
);

export const selectUniqueDepartments = createSelector(
  [selectAllEmployees],
  (employees) => {
    const departments = new Set(employees.map(emp => emp.department).filter(Boolean));
    return Array.from(departments).sort();
  }
);

export const selectUniqueDesignations = createSelector(
  [selectAllEmployees],
  (employees) => {
    const designations = new Set(employees.map(emp => emp.designation).filter(Boolean));
    return Array.from(designations).sort();
  }
);

export const selectEditingEmployee = createSelector(
  [selectAllEmployees, selectEditingEmployeeId],
  (employees, editingId) => editingId ? employees.find(emp => emp.id === editingId) : null
);

// Action exports
export const {
  setLoading,
  setError,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  deleteMultipleEmployees,
  selectEmployee,
  deselectEmployee,
  selectAllEmployeesAction,
  clearSelection,
  setFilters,
  clearFilters,
  setSorting,
  setCurrentPage,
  setItemsPerPage,
  setViewMode,
  openEmployeeForm,
  closeEmployeeForm,
  setFormStep,
  setValidationErrors,
  clearValidationErrors,
  setBulkOperationInProgress,
  importEmployees,
  resetEmployeesState,
  refreshStats,
} = employeesSlice.actions;

export default employeesSlice.reducer;
