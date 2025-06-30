import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Task, TaskBoard } from "../../../../@types/task";

interface TasksBoardState {
  data: TaskBoard[];
  isLoading: boolean;
}

const initialState: TasksBoardState = {
  data: [],
  isLoading: true,
};

const tasksBoardSlice = createSlice({
  name: "tasksBoard",
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTasksBoardByCompany: (state, action: PayloadAction<Task[]>) => {
      state.data = action.payload;
    },
  },
});

export const { setIsLoading, setTasksBoardByCompany } = tasksBoardSlice.actions;

export default tasksBoardSlice.reducer;
