const { RECEIVE_STATIC } = require("../actions/types");

const initialState = { loaded: false };

export default function(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_STATIC: {
      return { loaded: true, ...action.payload };
    }
    default:
      return state;
  }
}
