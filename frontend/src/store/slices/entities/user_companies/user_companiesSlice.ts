import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserCompanies } from "../../../../@types/user";

interface UserCompaniesState {
  data: UserCompanies[];
  isLoading: boolean;
}

const initialState: UserCompaniesState = {
  data: [],
  isLoading: true,
};
const user_companiesSlice = createSlice({
  name: "user_companies",
  initialState,
  reducers: {
    setIsLoadingCompanies: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUserCompanies: (state, action: PayloadAction<UserCompanies[]>) => {
      state.data = action.payload;
    },
  },
});

export const { setUserCompanies, setIsLoadingCompanies } = user_companiesSlice.actions;

export default user_companiesSlice.reducer;
