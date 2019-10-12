import io from "socket.io-client";
import messageTypes from "./messageTypes.js";

const socket = io();

export const init = store => {
  for (const type in messageTypes) {
    socket.on(type, payload => store.dispatch({ type: messageTypes[type], payload }));
  }
  socket.on("error", payload => window.alert(payload));
};

export const emit = (type, payload, callback) => socket.emit(type, payload, callback);
