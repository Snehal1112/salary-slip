import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { Employee, EmployeesState } from "./types";

const initialState: EmployeesState = { list: [] };

export const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    addEmployee(state, action: { payload: Employee }) {
      const e = { ...action.payload, id: action.payload.id ?? nanoid() };
      state.list.push(e);
    },
    updateEmployee(state, action: { payload: Employee }) {
      const idx = state.list.findIndex((x) => x.id === action.payload.id);
      if (idx >= 0) state.list[idx] = action.payload;
    },
    deleteEmployee(state, action: { payload: string }) {
      state.list = state.list.filter((e) => e.id !== action.payload);
    },
  },
});

export const { addEmployee, updateEmployee, deleteEmployee } =
  employeesSlice.actions;
export default employeesSlice.reducer;
