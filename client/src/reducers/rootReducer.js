import { combineReducers } from "redux";
import configReducer from "./configReducer";
import staticReducer from "./staticReducer";
import internalReducer from "./internalReducer";
import miscReducer from "./miscReducer";

export default combineReducers({
  config: configReducer,
  static: staticReducer,
  internal: internalReducer,
  misc: miscReducer
});
