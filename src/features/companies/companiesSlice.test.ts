import companiesReducer, {
  addCompany,
  updateCompany,
  deleteCompany,
} from './companiesSlice';
import type { CompaniesState } from './types';

describe('companies reducer', () => {
  const initialState: CompaniesState = {
    list: [],
    loading: false,
    error: null,
    selectedIds: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    filters: {
      search: '',
      isActive: 'all',
    },
    sortBy: 'name',
    sortOrder: 'asc',
    viewMode: 'list',
    isFormOpen: false,
    editingCompanyId: null,
    formStep: 0,
    validationErrors: {},
    bulkOperationInProgress: false,
    stats: {
      totalCompanies: 0,
      activeCompanies: 0,
      recentlyAdded: 0,
    },
  };

  const sampleCompany = {
    name: 'Test Company Ltd',
    addresses: [{
      id: '1',
      line1: '123 Main St',
      line2: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      isPrimary: true,
    }],
    gstin: '27ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    email: 'info@testcompany.com',
    phone: '9876543210',
    isActive: true,
  };

  it('adds company and assigns id when missing', () => {
    const action = addCompany(sampleCompany);
    const state = companiesReducer(initialState, action);
    
    expect(state.list).toHaveLength(1);
    expect(state.list[0].id).toBeDefined();
    expect(state.list[0].name).toBe('Test Company Ltd');
    expect(state.list[0].createdAt).toBeDefined();
    expect(state.stats.totalCompanies).toBe(1);
    expect(state.stats.activeCompanies).toBe(1);
  });

  it('updates an existing company', () => {
    const stateWithCompany = companiesReducer(initialState, addCompany(sampleCompany));
    
    const updatedCompany = {
      ...stateWithCompany.list[0],
      name: 'Updated Company Name',
    };
    
    const action = updateCompany(updatedCompany);
    const state = companiesReducer(stateWithCompany, action);
    
    expect(state.list[0].name).toBe('Updated Company Name');
    expect(state.list[0].updatedAt).toBeDefined();
  });

  it('deletes a company by id', () => {
    const stateWithCompany = companiesReducer(initialState, addCompany(sampleCompany));
    const companyId = stateWithCompany.list[0].id!;
    
    const action = deleteCompany(companyId);
    const state = companiesReducer(stateWithCompany, action);
    
    expect(state.list).toHaveLength(0);
    expect(state.stats.totalCompanies).toBe(0);
  });

  it('handles company with multiple addresses', () => {
    const companyWithMultipleAddresses = {
      ...sampleCompany,
      addresses: [
        {
          id: '1',
          line1: '123 Main St',
          line2: '',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
          isPrimary: true,
        },
        {
          id: '2',
          line1: '456 Secondary St',
          line2: 'Suite 200',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India',
          isPrimary: false,
        },
      ],
    };
    
    const action = addCompany(companyWithMultipleAddresses);
    const state = companiesReducer(initialState, action);
    
    expect(state.list[0].addresses).toHaveLength(2);
    expect(state.list[0].addresses[0].isPrimary).toBe(true);
    expect(state.list[0].addresses[1].isPrimary).toBe(false);
  });

  it('handles inactive company status correctly', () => {
    const inactiveCompany = {
      ...sampleCompany,
      isActive: false,
    };
    
    const action = addCompany(inactiveCompany);
    const state = companiesReducer(initialState, action);
    
    expect(state.stats.totalCompanies).toBe(1);
    expect(state.stats.activeCompanies).toBe(0);
  });
});