import axios from "axios";
import { RECEIVE_LOG_LIST, LOGGER_STATE } from "./types";

export const downloadLog = name => {
  window.location.href = "/downloadLog?file=" + name;
};

export const downloadAllLogs = () => (dispatch, getState) => {
  window.location.href = "/downloadLog?multiFile=" + getState().misc.logList;
};

export const getLogList = () => (dispatch, getState, { emit }) => {
  emit("getLogList", null, list => {
    dispatch({ type: RECEIVE_LOG_LIST, payload: list });
  });
};

export const uploadLog = (name, index) => (dispatch, getState, { emit }) => {
  emit("uploadLog", { name, index }, msg => window.alert(msg));
};

export const deleteAllLogs = () => (dispatch, getState, { emit }) => {
  const fileList = getState().misc.logList;
  for (let i = 0; i < fileList.length; i++) {
    emit("deleteLog", fileList[i]);
  }
  dispatch(getLogList());
};

export const deleteLog = name => (dispatch, getState, { emit }) => {
  emit("deleteLog", name);
  dispatch(getLogList());
};

export const getLog = () => dispatch => {
  axios.get("/comlog").then(result => {
    dispatch({ type: LOGGER_STATE, payload: result.data });
  });
};
