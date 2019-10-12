const dateformat = require("dateformat");

const {
  INPUT_PORT_STATE,
  OUTPUT_PORT_STATE,
  SERIAL_COM_STATE,
  TABLE_CELL_STATE,
  TABLE_CELL_COLOR,
  SELFLEARNING_STATE,
  LOGGER_STATE,
  TABLE_FOUND_STATE,
  SERIAL_CLEAR
} = require("../actions/types");

const initialState = {
  coms: [],
  outputs: [],
  inputs: [],
  cells: [],
  selfLearning: {
    enabled: false,
    formula: "",
    formulaResults: []
  },
  logger: {
    entries: [],
    legend: [],
    accessors: [],
    digits: [],
    visible: []
  },
  tableNotFound: false
};

export default function(fullState = initialState, action) {
  switch (action.type) {
    case INPUT_PORT_STATE: {
      const { index, state, isForced } = action.payload;

      const newInputs = Array.from(fullState.inputs);
      newInputs[index] = { state, isForced };

      return { ...fullState, inputs: newInputs };
    }
    case OUTPUT_PORT_STATE: {
      const { index, state, result, isForced } = action.payload;

      const newOutputs = Array.from(fullState.outputs);
      newOutputs[index] = { state, result, isForced };

      return { ...fullState, outputs: newOutputs };
    }
    case SERIAL_COM_STATE: {
      const { index, entry, entryTime } = action.payload;

      const newComs = Array.from(fullState.coms);
      let newHistory;
      if (!fullState.coms[index]) fullState.coms[index] = { history: [] };

      if (!entry) {
        newHistory = fullState.coms[index].history;
      } else {
        newHistory = [
          {
            entry,
            entryTime,
            timeString: dateformat(new Date(entryTime), "HH:MM:ss")
          },
          ...fullState.coms[index].history
        ];
      }

      newComs[index] = {
        entry,
        entryTime,
        history: newHistory
      };

      return { ...fullState, coms: newComs };
    }
    case SERIAL_CLEAR: {
      const newComs = fullState.coms.map(com => ({
        entry: "",
        entryTime: new Date(),
        history: com.history
      }));

      return { ...fullState, coms: newComs };
    }
    case TABLE_CELL_STATE: {
      const { index, value, manual } = action.payload;

      const newCells = Array.from(fullState.cells);
      newCells[index] = { ...newCells[index], value, manual };

      return { ...fullState, cells: newCells };
    }
    case TABLE_CELL_COLOR: {
      const { index, color } = action.payload;

      const newCells = Array.from(fullState.cells);
      newCells[index] = { ...newCells[index], color };

      return { ...fullState, cells: newCells };
    }
    case SELFLEARNING_STATE: {
      return {
        ...fullState,
        selfLearning: { enabled: true, ...action.payload }
      };
    }
    case TABLE_FOUND_STATE: {
      return {
        ...fullState,
        tableNotFound: action.payload
      };
    }
    case LOGGER_STATE: {
      return {
        ...fullState,
        logger: action.payload
      };
    }
    default:
      return fullState;
  }
}
