import axios from "axios";

import { RECEIVE_CONFIG_LIST, CONFIG_CHANGE, RECEIVE_CONFIG, RECEIVE_STATIC, CONFIG_LOCK } from "./types";
import { reboot } from "./menuActions";

export const downloadConfig = name => {
  window.location.href = "/downloadConfig?file=" + name;
};

export const changeConfig = (address, value, options) => dispatch => {
  if (options && options.numeric) {
    value = Number(value);
  }
  dispatch({ type: CONFIG_CHANGE, payload: { address, value } });
};

export const getConfigList = () => (dispatch, getState, { emit }) => {
  emit("getConfigList", null, list => {
    dispatch({ type: RECEIVE_CONFIG_LIST, payload: list });
  });
};

export const deleteConfig = name => (dispatch, getState, { emit }) => {
  if (window.confirm("Do you really want to delete " + name + "?")) {
    emit("deleteConfig", name);
    dispatch(getConfigList());
  }
};

export const loadConfig = name => (dispatch, getState, { emit }) => {
  if (name) {
    emit("loadConfig", name, config => {
      dispatch({ type: RECEIVE_CONFIG, payload: JSON.parse(config) });
    });
  } else {
    axios
      .get("/config")
      .then(result => {
        console.log("Got config");
        dispatch({ type: RECEIVE_CONFIG, payload: result.data });
      })
      .catch(err => console.log("/config", err));
  }
};

export const loadStatic = () => dispatch => {
  axios.get("/static").then(result => {
    dispatch({ type: RECEIVE_STATIC, payload: result.data });
    document.title = result.data.name;
  });
};

export const configExists = name => (dispatch, getState, { emit }) => {
  return new Promise(resolve => {
    emit("configExists", name, ({ result }) => resolve(result));
  });
};

export const saveConfig = name => (dispatch, getState, { emit }) => {
  const newConfig = JSON.parse(JSON.stringify(getState().config));
  delete newConfig.loaded;
  delete newConfig.locked;
  delete newConfig.hasChanged;

  if (name) {
    dispatch(configExists(name)).then(result => {
      if (!result || window.confirm("File already exists, do you want to overwrite?")) {
        emit("saveConfig", { name: name, config: newConfig });
      }
    });
    return;
  }

  if (getState().config.hasChanged) {
    emit("checkConfigConsistency", newConfig, consistent => {
      if (
        (consistent || window.confirm("This will reset the log, continue?")) &&
        window.confirm("Are you sure you want to save these changes?")
      ) {
        emit("settings", newConfig);
        dispatch({ type: CONFIG_LOCK });
        dispatch(reboot());
      } else {
        window.location.reload();
      }
    });
  } else {
    dispatch({ type: CONFIG_LOCK });
  }
};

export const uploadConfig = currentVersion => dispatch => {
  const uploadFunction = event => {
    const file = event.target.files[0];

    const versionName = file.name.match(/V[0-9.]+\.json$/);
    if (!versionName) {
      alert("Config does not have a valid name");
      return;
    }
    const mayorVersion = versionName[0].slice(1, -3).split(".")[0];

    const currentMayorVersion = currentVersion.split(".")[0];

    if (mayorVersion !== currentMayorVersion) {
      alert("Version of new config does not match the current one");
      return;
    }

    dispatch(configExists(file.name)).then(result => {
      if (result && !window.confirm("Config already exists. Overwrite?")) return;

      const data = new FormData();
      data.append("configFile", file);
      axios
        .post("/uploadConfig", data)
        .then(() => {
          window.alert("Successfully uploaded new config.");
          dispatch(getConfigList());
        })
        .catch(() => window.alert("Error uploading new config."));
    });
  };

  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = uploadFunction;
  input.click();
};
