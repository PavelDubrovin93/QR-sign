import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AxiosResponse } from "axios";
import type { User } from "../../../../@types/user";

export interface UserState {
  id: number | null;
  user_id: number | null;
  default_company_choice: string | null;
  default_color: string;
  isLoading: boolean;
}

const initialState: UserState = {
  id: null,
  user_id: null,
  default_company_choice: null,
  default_color: "",
  isLoading: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<User>) => {
      state.id = action.payload.id;
      state.user_id = action.payload.user_id;
      state.default_company_choice = action.payload.default_company_choice;
      state.default_color = action.payload.default_color;
      state.isLoading = false;
    },
  },
});

export const { setUserProfile } = userSlice.actions;

export default userSlice.reducer;
