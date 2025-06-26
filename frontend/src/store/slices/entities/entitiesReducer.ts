import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import tasksReducer from "./tasksBoard/tasksBoardSlice";

const entitiesReducer = combineReducers({
  user: userReducer,
  tasksBoard: tasksReducer,
});

export default entitiesReducer;
