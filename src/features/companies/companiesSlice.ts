import { createSlice, createSelector, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CompanyRequired } from "../../types/shared";
import type { 
  CompaniesState, 
  CompanyFilter, 
  CompanySortBy, 
  CompanySortOrder, 
  CompanyViewMode
} from "./types";
import type { RootState } from "../../store";

// Helper function to compute stats
const computeStats = (companies: CompanyRequired[]) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const recentlyAdded = companies.filter(company => {
    if (!company.createdAt) return false;
    const createdDate = new Date(company.createdAt);
    return createdDate >= thirtyDaysAgo;
  }).length;

  return {
    totalCompanies: companies.length,
    activeCompanies: companies.filter(c => c.isActive).length,
    recentlyAdded,
  };
};

const initialState: CompaniesState = {
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
    isActive: 'all',
  },
  sortBy: 'name',
  sortOrder: 'asc',
  viewMode: 'list',
  
  // Form state
  isFormOpen: false,
  editingCompanyId: null,
  formStep: 0,
  
  // Validation state
  validationErrors: {},
  
  // Bulk operations
  bulkOperationInProgress: false,
  
  // Stats
  stats: {
    totalCompanies: 0,
    activeCompanies: 0,
    recentlyAdded: 0,
  },
};

export const companiesSlice = createSlice({
  name: "companies",
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
    addCompany(state, action: PayloadAction<Omit<CompanyRequired, 'id'>>) {
      const company = { 
        ...action.payload, 
        id: nanoid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.list.push(company);
      state.stats = computeStats(state.list);
      state.totalItems = state.list.length;
      state.error = null;
    },
    
    updateCompany(state, action: PayloadAction<CompanyRequired>) {
      const idx = state.list.findIndex((x) => x.id === action.payload.id);
      if (idx >= 0) {
        state.list[idx] = {
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
        state.stats = computeStats(state.list);
        state.error = null;
      } else {
        state.error = 'Company not found';
      }
    },
    
    deleteCompany(state, action: PayloadAction<string>) {
      const initialLength = state.list.length;
      state.list = state.list.filter((c) => c.id !== action.payload);
      
      if (state.list.length === initialLength) {
        state.error = 'Company not found';
      } else {
        state.stats = computeStats(state.list);
        state.totalItems = state.list.length;
        state.selectedIds = state.selectedIds.filter(id => id !== action.payload);
        state.error = null;
      }
    },
    
    // Bulk operations
    deleteMultipleCompanies(state, action: PayloadAction<string[]>) {
      const idsToDelete = new Set(action.payload);
      state.list = state.list.filter((c) => !idsToDelete.has(c.id!));
      state.selectedIds = state.selectedIds.filter(id => !idsToDelete.has(id));
      state.stats = computeStats(state.list);
      state.totalItems = state.list.length;
      state.error = null;
    },
    
    // Selection management
    selectCompany(state, action: PayloadAction<string>) {
      if (!state.selectedIds.includes(action.payload)) {
        state.selectedIds.push(action.payload);
      }
    },
    
    deselectCompany(state, action: PayloadAction<string>) {
      state.selectedIds = state.selectedIds.filter(id => id !== action.payload);
    },
    
    selectAllCompaniesAction(state) {
      state.selectedIds = state.list.map(c => c.id!);
    },
    
    clearSelection(state) {
      state.selectedIds = [];
    },
    
    // Filtering and sorting
    setFilters(state, action: PayloadAction<Partial<CompanyFilter>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },
    
    clearFilters(state) {
      state.filters = {
        search: '',
        isActive: 'all',
      };
      state.currentPage = 1;
    },
    
    setSorting(state, action: PayloadAction<{ sortBy: CompanySortBy; sortOrder: CompanySortOrder }>) {
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
    setViewMode(state, action: PayloadAction<CompanyViewMode>) {
      state.viewMode = action.payload;
    },
    
    // Form state management
    openCompanyForm(state, action: PayloadAction<string | null>) {
      state.isFormOpen = true;
      state.editingCompanyId = action.payload;
      state.formStep = 0;
      state.validationErrors = {};
    },
    
    closeCompanyForm(state) {
      state.isFormOpen = false;
      state.editingCompanyId = null;
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
    
    // Import companies (for data migration)
    importCompanies(state, action: PayloadAction<CompanyRequired[]>) {
      // Merge with existing, avoiding duplicates by ID
      const existingIds = new Set(state.list.map(c => c.id));
      const newCompanies = action.payload.filter(c => !existingIds.has(c.id!));
      
      state.list.push(...newCompanies);
      state.stats = computeStats(state.list);
      state.totalItems = state.list.length;
      state.error = null;
    },
    
    // Reset all state
    resetCompaniesState() {
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
export const selectCompaniesState = (state: RootState) => state.companies;
export const selectAllCompanies = (state: RootState) => state.companies.list;
export const selectCompaniesLoading = (state: RootState) => state.companies.loading;
export const selectCompaniesError = (state: RootState) => state.companies.error;
export const selectSelectedCompanyIds = (state: RootState) => state.companies.selectedIds;
export const selectCompanyFilters = (state: RootState) => state.companies.filters;
export const selectCompanySorting = (state: RootState) => ({ 
  sortBy: state.companies.sortBy, 
  sortOrder: state.companies.sortOrder 
});
export const selectCompanyViewMode = (state: RootState) => state.companies.viewMode;
export const selectCompanyStats = (state: RootState) => state.companies.stats;
export const selectIsFormOpen = (state: RootState) => state.companies.isFormOpen;
export const selectEditingCompanyId = (state: RootState) => state.companies.editingCompanyId;
export const selectFormStep = (state: RootState) => state.companies.formStep;
export const selectValidationErrors = (state: RootState) => state.companies.validationErrors;

// Complex selectors
export const selectCompanyById = createSelector(
  [selectAllCompanies, (_state: RootState, id: string) => id],
  (companies, id) => companies.find(company => company.id === id)
);

export const selectFilteredCompanies = createSelector(
  [selectAllCompanies, selectCompanyFilters],
  (companies, filters) => {
    return companies.filter(company => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          company.name.toLowerCase().includes(searchLower) ||
          company.gstin?.toLowerCase().includes(searchLower) ||
          company.email?.toLowerCase().includes(searchLower) ||
          company.phone?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Active filter
      if (filters.isActive !== 'all') {
        if (company.isActive !== filters.isActive) return false;
      }
      
      return true;
    });
  }
);

export const selectSortedCompanies = createSelector(
  [selectFilteredCompanies, selectCompanySorting],
  (companies, { sortBy, sortOrder }) => {
    const sorted = [...companies].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      
      switch (sortBy) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'gstin':
          aVal = a.gstin || '';
          bVal = b.gstin || '';
          break;
        case 'createdAt':
          aVal = a.createdAt || '';
          bVal = b.createdAt || '';
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

export const selectPaginatedCompanies = createSelector(
  [selectSortedCompanies, (state: RootState) => state.companies.currentPage, (state: RootState) => state.companies.itemsPerPage],
  (companies, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return companies.slice(startIndex, endIndex);
  }
);

export const selectSelectedCompanies = createSelector(
  [selectAllCompanies, selectSelectedCompanyIds],
  (companies, selectedIds) => companies.filter(company => selectedIds.includes(company.id!))
);

export const selectEditingCompany = createSelector(
  [selectAllCompanies, selectEditingCompanyId],
  (companies, editingId) => editingId ? companies.find(company => company.id === editingId) : null
);

// Action exports
export const {
  setLoading,
  setError,
  addCompany,
  updateCompany,
  deleteCompany,
  deleteMultipleCompanies,
  selectCompany,
  deselectCompany,
  selectAllCompaniesAction,
  clearSelection,
  setFilters,
  clearFilters,
  setSorting,
  setCurrentPage,
  setItemsPerPage,
  setViewMode,
  openCompanyForm,
  closeCompanyForm,
  setFormStep,
  setValidationErrors,
  clearValidationErrors,
  setBulkOperationInProgress,
  importCompanies,
  resetCompaniesState,
  refreshStats,
} = companiesSlice.actions;

export default companiesSlice.reducer;