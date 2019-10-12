const {
  RECEIVE_IP,
  RECEIVE_TIME,
  TOGGLE_MENU,
  OPEN_MENU,
  CLOSE_MENU,
  RECEIVE_CONFIG_LIST,
  RECEIVE_LOG_LIST
} = require("../actions/types");

const initialState = {
  ip: "",
  time: new Date().getTime(),
  isMenuOpen: false,
  configList: [],
  logList: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_IP: {
      return {
        ...state,
        ip: action.payload
      };
    }
    case RECEIVE_TIME: {
      return {
        ...state,
        time: action.payload
      };
    }
    case TOGGLE_MENU: {
      return {
        ...state,
        isMenuOpen: !state.isMenuOpen
      };
    }
    case OPEN_MENU: {
      return { ...state, isMenuOpen: true };
    }
    case CLOSE_MENU: {
      return { ...state, isMenuOpen: false };
    }
    case RECEIVE_CONFIG_LIST: {
      return {
        ...state,
        configList: action.payload
      };
    }
    case RECEIVE_LOG_LIST: {
      return {
        ...state,
        logList: action.payload
      };
    }
    default:
      return state;
  }
};
