// Employee type moved to src/types/shared.ts
import type { Employee, EmployeeRequired } from '../../types/shared';

export type EmployeeFilter = {
  search?: string;
  department?: string;
  designation?: string;
  status?: 'active' | 'inactive' | 'all';
};

export type EmployeeSortBy = 'name' | 'code' | 'designation' | 'department' | 'joiningDate';
export type EmployeeSortOrder = 'asc' | 'desc';

export type EmployeeViewMode = 'list' | 'grid' | 'card';

export type EmployeesState = {
  list: EmployeeRequired[];
  loading: boolean;
  error: string | null;
  
  // UI State
  selectedIds: string[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  
  // Filters & Search
  filters: EmployeeFilter;
  sortBy: EmployeeSortBy;
  sortOrder: EmployeeSortOrder;
  viewMode: EmployeeViewMode;
  
  // Form state
  isFormOpen: boolean;
  editingEmployeeId: string | null;
  formStep: number;
  
  // Validation state
  validationErrors: Record<string, string[]>;
  
  // Bulk operations
  bulkOperationInProgress: boolean;
  
  // Stats
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    departmentCounts: Record<string, number>;
    recentlyAdded: number;
  };
};

export type BulkEmployeeOperation = 'delete' | 'export' | 'updateStatus';

export type { Employee, EmployeeRequired };
