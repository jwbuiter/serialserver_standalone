const {
  INPUT_PHYSICAL_CHANGED,
  INPUT_FORCED_CHANGED,
  INPUT_FOLLOWING_CHANGED,
  INPUT_BLOCKING_CHANGED,
  INPUT_CALCULATE_STATE,
  EXECUTE_START,
  EXECUTE_STOP
} = require("../actions/types");

const { input } = require("../configs/current");

const initialState = {
  ports: Array.from({ length: input.ports.length }, u => ({
    state: false,
    physical: false,
    isForced: false,
    previousForced: false,
    forcedState: false,
    isFollowing: false,
    blocking: false
  })),
  executing: false
};

function calculateState(port) {
  if (port.isForced) return port.forcedState;

  if (port.isFollowing) return true;

  return port.physical;
}

module.exports = function(state = initialState, action) {
  switch (action.type) {
    case INPUT_PHYSICAL_CHANGED: {
      const { index, physical } = action.payload;
      const newPorts = Array.from(state.ports);
      newPorts[index].physical = physical;
      return {
        ...state,
        ports: newPorts
      };
    }
    case INPUT_FORCED_CHANGED: {
      const { index, previousForced, isForced, forcedState } = action.payload;
      const newPorts = Array.from(state.ports);
      newPorts[index].isForced = isForced;
      newPorts[index].previousForced = previousForced;
      newPorts[index].forcedState = forcedState;
      return {
        ...state,
        ports: newPorts
      };
    }
    case INPUT_FOLLOWING_CHANGED: {
      const { index, isFollowing } = action.payload;
      const newPorts = Array.from(state.ports);
      newPorts[index].isFollowing = isFollowing;
      return {
        ...state,
        ports: newPorts
      };
    }
    case INPUT_BLOCKING_CHANGED: {
      const { index, blocking } = action.payload;
      const newPorts = Array.from(state.ports);
      newPorts[index].blocking = blocking;
      return {
        ...state,
        ports: newPorts
      };
    }
    case INPUT_CALCULATE_STATE: {
      const { index } = action.payload;
      const newPorts = Array.from(state.ports);
      newPorts[index].state = calculateState(newPorts[index], index);
      return {
        ...state,
        ports: newPorts
      };
    }
    case EXECUTE_START: {
      return {
        ...state,
        executing: true
      };
    }
    case EXECUTE_STOP: {
      return {
        ...state,
        executing: false
      };
    }
    default:
      return state;
  }
};
