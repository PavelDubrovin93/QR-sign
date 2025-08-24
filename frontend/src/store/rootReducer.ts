import { combineReducers } from "@reduxjs/toolkit";
import entitiesReducer from "./slices/entities/entitiesReducer";

const rootReducer = combineReducers({
  entities: entitiesReducer,
  // other redecers...
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
