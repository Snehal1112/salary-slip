// Unified Employee type for use across all features
// Base required fields for all contexts
export type EmployeeBase = {
  id?: string;
  name: string;
};

// Full employee type with all optional fields except name
export type Employee = EmployeeBase & {
  code?: string;
  designation?: string;
  pan?: string;
  bankAccount?: string;
  bankName?: string;
  chequeNumber?: string;
  pfNumber?: string;
  esiNumber?: string;
  joiningDate?: string;
  email?: string;
  mobile?: string;
  address?: string;
  phone?: string;
  dob?: string;
  govId?: string;
  maritalStatus?: string;
  spouseName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  department?: string;
  supervisor?: string;
  workLocation?: string;
  salary?: string;
  education?: string;
  taxInfo?: string;
  healthConditions?: string;
};

// Required employee for full employee management
export type EmployeeRequired = EmployeeBase & {
  code: string;
  designation: string;
  pan: string;
  bankAccount: string;
  bankName: string;
  chequeNumber: string;
  pfNumber?: string;
  esiNumber?: string;
  joiningDate?: string;
  email?: string;
  mobile?: string;
  address?: string;
  phone?: string;
  dob?: string;
  govId?: string;
  maritalStatus?: string;
  spouseName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  department?: string;
  supervisor?: string;
  workLocation?: string;
  salary?: string;
  education?: string;
  taxInfo?: string;
  healthConditions?: string;
};
