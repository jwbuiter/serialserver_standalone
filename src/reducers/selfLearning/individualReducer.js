const {
  SL_ENTRY,
  SL_INDIVIDUAL_UPGRADE,
  SL_INDIVIDUAL_DOWNGRADE,
  SL_INDIVIDUAL_LOAD,
  SL_INDIVIDUAL_INCREMENT,
  SL_INDIVIDUAL_DELETE_GENERAL,
  SL_INDIVIDUAL_DELETE_INDIVIDUAL,
  SL_INDIVIDUAL_ACTIVITY,
  SL_INDIVIDUAL_HEADERS
} = require("../../actions/types");

const { selfLearning } = require("../../configs/current");

function initialStateIndividual() {
  return {
    generalEntries: {},
    individualEntries: {},
    individualColumnHeaders: []
  };
}

function average(arr){
  return arr.reduce((acc,cur)=>acc+cur)/arr.length;
}

function calculateEntry(measurements){
  const {
    individualTolerance,
    individualToleranceAbs,
    individualCorrectionIncrement
  } = selfLearning;

  const calibration = average(measurements.map(elem=>elem.value));
  const increments = average(measurements.map(elem=>Math.max(0, elem.age - 1)));

  const tolerance =
    ((calibration * individualTolerance) / 100 +
      individualToleranceAbs) *
    (1 + (increments * individualCorrectionIncrement) / 100); 

  return {
    tolerance,
    increments,
    calibration
  }
}

module.exports = function individualReducer(
  state = initialStateIndividual(),
  action = { type: null, payload: null }
) {
  switch (action.type) {
    case SL_ENTRY: {
      const { entry, key, extra } = action.payload;

      const newGeneralEntries = Object.assign({}, state.generalEntries);
      const newIndividualEntries = Object.assign({}, state.individualEntries);

      if (key in state.individualEntries) {
        const newMeasurement = {
          value: entry, 
          age: 0
        }
        const measurements = [
          newMeasurement, 
          ...newIndividualEntries[key].measurements
        ].slice(0, selfLearning.individualAverageNumber);

        newIndividualEntries[key] = {
          ...newIndividualEntries[key],
          measurements,
          extra,
          numUpdates: newIndividualEntries[key].numUpdates + 1,
          ...calculateEntry(measurements)
        };
      } else if (key in state.generalEntries) {
        newGeneralEntries[key] = {
          ...newGeneralEntries[key],
          entries: [entry]
            .concat(Array.from(newGeneralEntries[key].entries))
            .slice(0, 5),
          extra
        };
      } else {
        newGeneralEntries[key] = {
          entries: [entry],
          extra,
          activity: 1,
          activityHistory: []
        };
      }

      return {
        ...state,
        individualEntries: newIndividualEntries,
        generalEntries: newGeneralEntries
      };
    }
    case SL_INDIVIDUAL_UPGRADE: {
      const { calibration, key } = action.payload;

      const newGeneralEntries = Object.assign({}, state.generalEntries);
      const newIndividualEntries = Object.assign({}, state.individualEntries);

      delete newGeneralEntries[key];

      const newMeasurement = {
        value: calibration, 
        age: 0
      }

      const measurements = Array(selfLearning.individualAverageNumber).fill(newMeasurement);

      newIndividualEntries[key] = {
        ...calculateEntry(measurements),
        measurements,
        extra: state.generalEntries[key].extra,
        numUpdates: 1,
        numUpdatesHistory: [],
        activity: 1,
        activityHistory: [],
      };
      return {
        ...state,
        individualEntries: newIndividualEntries,
        generalEntries: newGeneralEntries
      };
    }
    case SL_INDIVIDUAL_DOWNGRADE: {
      const key = action.payload;

      const newIndividualEntries = Object.assign({}, state.individualEntries);

      delete newIndividualEntries[key];
      return {
        ...state,
        individualEntries: newIndividualEntries
      };
    }
    case SL_INDIVIDUAL_LOAD: {
      const { individualEntries, generalEntries } = action.payload;

      return {
        ...state,
        individualEntries,
        generalEntries
      };
    }
    case SL_INDIVIDUAL_INCREMENT: {
      const newIndividualEntries = {};
      const newGeneralEntries = {};
      const {
        individualCorrectionLimit
      } = selfLearning;

      for (let key in state.individualEntries) {
        const oldEntry = state.individualEntries[key];
        const measurements = oldEntry.measurements
          .map(elem => ({...elem, age: elem.age + 1}))
          .filter(elem => elem.age <= individualCorrectionLimit + 1);

        if(measurements.length == 0)
          continue;

        newIndividualEntries[key] = {
          ...oldEntry,
          measurements,
          ...calculateEntry(measurements),
          numUpdatesHistory: [
            oldEntry.numUpdates,
            ...oldEntry.numUpdatesHistory
          ].slice(0, 3),
          activityHistory: [
            oldEntry.activity,
            ...oldEntry.activityHistory
          ].slice(0, 3),
          numUpdates: 0,
          activity: 0,
        };
      }

      for (let key in state.generalEntries) {
        const oldEntry = state.generalEntries[key];

        newGeneralEntries[key] = {
          ...oldEntry,
          activityHistory: [
            oldEntry.activity,
            ...oldEntry.activityHistory
          ].slice(0, 3),
          activity: 0
        };
      }

      return {
        ...state,
        individualEntries: newIndividualEntries,
        generalEntries: newGeneralEntries
      };
    }
    case SL_INDIVIDUAL_DELETE_GENERAL: {
      if (action.payload) {
        const key = action.payload;

        const newGeneralEntries = Object.assign({}, state.generalEntries);
        delete newGeneralEntries[key];

        return {
          ...state,
          generalEntries: newGeneralEntries
        };
      } else {
        return {
          ...state,
          generalEntries: {}
        };
      }
    }
    case SL_INDIVIDUAL_DELETE_INDIVIDUAL: {
      const { key } = action.payload;
      if (key) {
        const newIndividualEntries = Object.assign({}, state.individualEntries);
        delete newIndividualEntries[key];

        return {
          ...state,
          individualEntries: newIndividualEntries
        };
      } else {
        return {
          ...state,
          individualEntries: {}
        };
      }
    }
    case SL_INDIVIDUAL_ACTIVITY: {
      const key = action.payload;

      const newIndividualEntries = Object.assign({}, state.individualEntries);
      const newGeneralEntries = Object.assign({}, state.generalEntries);

      if (key in newIndividualEntries) {
        newIndividualEntries[key].activity++;
      } else if (key in newGeneralEntries) {
        newGeneralEntries[key].activity++;
      } else {
        newGeneralEntries[key] = {
          entries: [],
          extra: [],
          activity: 1,
          activityHistory: []
        };
      }

      return {
        ...state,
        individualEntries: newIndividualEntries,
        generalEntries: newGeneralEntries
      };
    }
    case SL_INDIVIDUAL_HEADERS: {
      return {
        ...state,
        individualColumnHeaders: action.payload
      };
    }
    default:
      return state;
  }
};
