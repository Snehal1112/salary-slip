import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { EmployeeRequired } from "../../types/shared";
import type { EmployeesState } from "./types";

const initialState: EmployeesState = { list: [] };

export const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    addEmployee(state, action: PayloadAction<EmployeeRequired>) {
      const e = { ...action.payload, id: action.payload.id ?? nanoid() };
      state.list.push(e);
    },
    updateEmployee(state, action: PayloadAction<EmployeeRequired>) {
      const idx = state.list.findIndex((x) => x.id === action.payload.id);
      if (idx >= 0) state.list[idx] = action.payload;
    },
    deleteEmployee(state, action: PayloadAction<string>) {
      state.list = state.list.filter((e) => e.id !== action.payload);
    },
  },
});

export const { addEmployee, updateEmployee, deleteEmployee } =
  employeesSlice.actions;
export default employeesSlice.reducer;
