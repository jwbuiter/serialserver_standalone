export const forceInput = index => (dispatch, getState, { emit }) => {
  const state = getState();
  const port = {
    ...state.config.input.ports[index],
    ...state.internal.inputs[index]
  };

  const askForConfirmation = port.manualConfirmation && !port.isForced;

  if (askForConfirmation && !window.confirm(`Are you sure you want to manually change ${port.name}?`)) return;

  emit("forceInput", index);
};

export const forceOutput = index => (dispatch, getState, { emit }) => {
  const state = getState();
  const port = {
    ...state.config.output.ports[index],
    ...state.internal.outputs[index]
  };

  const askForConfirmation = port.manualConfirmation && !port.isForced;

  if (askForConfirmation && !window.confirm(`Are you sure you want to manually change ${port.name}?`)) return;

  emit("forceOutput", index);
};

export const tableManual = (index, value) => (dispatch, getState, { emit }) => {
  emit("manual", { index, value });
};

export const setDateTime = date => (dispatch, getState, { emit }) => {
  emit("setDateTime", date);
};
