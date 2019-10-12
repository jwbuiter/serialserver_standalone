import axios from "axios";

import { TOGGLE_MENU, OPEN_MENU, CLOSE_MENU, CONFIG_UNLOCK } from "./types";

import { loadConfig } from "./configActions";

export const toggleMenu = () => dispatch => {
  dispatch({ type: TOGGLE_MENU });
};

export const openMenu = () => dispatch => {
  dispatch({ type: OPEN_MENU });
};

export const closeMenu = () => dispatch => {
  dispatch({ type: CLOSE_MENU });
};

export const unlockConfig = () => dispatch => {
  dispatch({ type: CONFIG_UNLOCK });
};

export const reboot = () => dispatch => {
  axios.get("/restart");
  setTimeout(() => {
    dispatch(loadConfig());
  }, 5000);
};

export const shutdown = () => {
  axios.get("/shutdown");
};

export const getLogo = async () => {
  let logo = false;
  try {
    await axios.get("/logo");
    logo = "/logo";
  } finally {
    return logo;
  }
};
