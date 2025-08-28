export type Employee = {
  id?: string;
  name: string;
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
  // Additional personal fields
  address?: string;
  phone?: string;
  dob?: string;
  govId?: string;
  maritalStatus?: string;
  spouseName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  // Job information
  department?: string;
  supervisor?: string;
  workLocation?: string;
  salary?: string;

  // Other
  education?: string;
  taxInfo?: string;
  healthConditions?: string;
};

export type EmployeesState = {
  list: Employee[];
};
