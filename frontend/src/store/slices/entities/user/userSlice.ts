import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../../../@types/user";

export interface UserState {
  id: number | null;
  user_id: number | null;
  default_company_choice: number | null;
  default_color: string;
  current_role: string;
  name_for_admin: string;
  isLoading: boolean;
}

const initialState: UserState = {
  id: null,
  user_id: null,
  default_company_choice: null,
  current_role: "",
  name_for_admin: "",
  default_color: "",
  isLoading: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setIsLoadingUserProfile: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUserProfile: (state, action: PayloadAction<User>) => {
      const {
        id,
        user_id,
        default_company_choice,
        default_color,
        current_role,
        name_for_admin,
      } = action.payload;
      state.id = id;
      state.user_id = user_id;
      state.default_company_choice = default_company_choice;
      state.current_role = current_role;
      state.name_for_admin = name_for_admin;
      state.default_color = default_color;
      state.isLoading = false;
    },
  },
});

export const { setUserProfile, setIsLoadingUserProfile } = userSlice.actions;

export default userSlice.reducer;
