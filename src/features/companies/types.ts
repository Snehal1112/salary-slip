// Company type moved to src/types/shared.ts
import type { Company, CompanyRequired, CompanyAddress, CompanyBankDetails } from '../../types/shared';

export type CompanyFilter = {
  search?: string;
  isActive?: boolean | 'all';
};

export type CompanySortBy = 'name' | 'gstin' | 'createdAt';
export type CompanySortOrder = 'asc' | 'desc';

export type CompanyViewMode = 'list' | 'grid' | 'card';

export type CompaniesState = {
  list: CompanyRequired[];
  loading: boolean;
  error: string | null;
  
  // UI State
  selectedIds: string[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  
  // Filters & Search
  filters: CompanyFilter;
  sortBy: CompanySortBy;
  sortOrder: CompanySortOrder;
  viewMode: CompanyViewMode;
  
  // Form state
  isFormOpen: boolean;
  editingCompanyId: string | null;
  formStep: number;
  
  // Validation state
  validationErrors: Record<string, string[]>;
  
  // Bulk operations
  bulkOperationInProgress: boolean;
  
  // Stats
  stats: {
    totalCompanies: number;
    activeCompanies: number;
    recentlyAdded: number;
  };
};

export type BulkCompanyOperation = 'delete' | 'export' | 'updateStatus';

export type { Company, CompanyRequired, CompanyAddress, CompanyBankDetails };