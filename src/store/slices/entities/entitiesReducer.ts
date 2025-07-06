import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import tasksReducer from "./tasksBoard/tasksBoardSlice";
import user_companiesReducer from "./user_companies/user_companiesSlice";
import usersInCompanyReducer from "./usersInCompany/usersInCompanySlice";

const entitiesReducer = combineReducers({
  user: userReducer,
  tasksBoard: tasksReducer,
  user_companies: user_companiesReducer,
  usersInCompany: usersInCompanyReducer,
});

export default entitiesReducer;
