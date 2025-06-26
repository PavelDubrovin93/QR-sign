import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../../../api/types";
import type { AxiosResponse } from "axios";

const initialState: User = {
  id: null,
  tg_id: null,
  photo_url: "",
  name: "",
  ui_settings: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<AxiosResponse<User>>) => {},
  },
});

export const { setUserProfile } = userSlice.actions;

export default userSlice.reducer;
