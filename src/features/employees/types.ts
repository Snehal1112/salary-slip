// Employee type moved to src/types/shared.ts
import type { Employee, EmployeeRequired } from '../../types/shared';

export type EmployeesState = {
  list: EmployeeRequired[];
};

export type { Employee, EmployeeRequired };
