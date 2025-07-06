import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UsersInCompany } from "../../../../@types/user";

interface UsersInCompanyState {
  data: UsersInCompany[];
  isLoading: boolean;
}

const initialState: UsersInCompanyState = {
  data: [],
  isLoading: true,
};
const usersInCompanySlice = createSlice({
  name: "uс_id",
  initialState,
  reducers: {
    setUsersInCompanyLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.data = [];
      }
    },
    setUsersInCompany: (state, action: PayloadAction<UsersInCompany[]>) => {
      state.data = action.payload;
    },
  },
});

export const { setUsersInCompany, setUsersInCompanyLoading } =
  usersInCompanySlice.actions;

export default usersInCompanySlice.reducer;
