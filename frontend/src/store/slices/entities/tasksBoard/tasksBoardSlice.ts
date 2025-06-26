import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TaskBoard } from "../../../../@types/task";

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
    setTasksBoard: (state, action: PayloadAction<any>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setIsLoading, setTasksBoard } = tasksBoardSlice.actions;

export default tasksBoardSlice.reducer;
