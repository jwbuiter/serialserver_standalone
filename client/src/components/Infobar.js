import React, { Component } from "react";
import FitText from "react-fittext";
import moment from "moment";
import { connect } from "react-redux";
import Modal from "react-modal";

import {
  changeConfig,
  deleteConfig,
  loadConfig,
  downloadConfig,
  configExists,
  saveConfig,
  getConfigList,
  uploadConfig
} from "../actions/configActions";
import { setDateTime } from "../actions/internalActions";
import { makeForm } from "../helpers";

import "../styles/infobar.scss";

Modal.setAppElement("#root");

class Infobar extends Component {
  constructor(props) {
    super(props);
    this.uploadRef = React.createRef();
    this.state = {
      configModalIsOpen: false,
      listModalIsOpen: false,
      newDate: moment(this.props.time).format("YYYY-MM-DDTHH:mm")
    };
  }

  openConfigModal = () => {
    this.setState({ configModalIsOpen: true });
  };

  closeConfigModal = () => {
    this.setState({ configModalIsOpen: false });
  };

  openListModal = () => {
    this.setState({ listModalIsOpen: true });
  };

  closeListModal = () => {
    this.setState({ listModalIsOpen: false });
  };

  render() {
    let configurationValues = {
      serial: {
        title: {
          name: "Serial",
          type: "title"
        },
        resetTrigger: {
          name: "Reset on zero",
          type: "select",
          options: { off: "Off", on: "On", com0: "Com 0", com1: "Com 1" }
        }
      }
    };

    if (this.props.exposeUpload) {
      configurationValues = {
        ...configurationValues,
        table: {
          title: {
            name: "Table",
            type: "title"
          },
          trigger: {
            name: "Trigger",
            type: "select",
            options: ["Com 0", "Com 1"]
          },
          useFile: { name: "Use imported file", type: "checkbox" },
          waitForOther: { name: "Wait for other com", type: "checkbox" },
          searchColumn: {
            name: "Column to search in",
            type: "select",
            numeric: true,
            options: [...Array(26).keys()].map(i => String.fromCharCode("A".charCodeAt(0) + i))
          }
        }
      };
    }

    if (this.props.exposeUpload) {
      configurationValues = {
        ...configurationValues,
        logger: {
          title: {
            name: "Logger",
            type: "title"
          },
          writeToFile: {
            name: "Write log to file",
            type: "checkbox"
          },
          logID: {
            name: "LogID",
            type: "text"
          },
          unique: {
            name: "Unique log type",
            type: "select",
            options: { off: "Off", com0: "Com 0", com1: "Com 1" }
          },
          resetMode: {
            name: "Reset mode",
            type: "select",
            options: {
              off: "Off",
              time: "Time of day",
              interval: "Time interval"
            }
          },
          resetTime: {
            name: "Reset time",
            type: "time",
            condition: config => config.logger.resetMode === "time"
          },
          resetInterval: {
            name: "Interval (min)",
            type: "number",
            min: 0,
            step: 1,
            condition: config => config.logger.resetMode === "interval"
          }
        }
      };
    }

    if (this.props.exposeUpload) {
      configurationValues = {
        ...configurationValues,
        FTP: {
          title: {
            name: "FTP",
            type: "title"
          },
          automatic: {
            name: "Automatically upload log on FTP",
            type: "checkbox"
          },
          uploadExcel: {
            name: "Include Excel with upload",
            type: "checkbox"
          },
          targets: [1, 2].map(index => ({
            title: {
              name: "Target " + index,
              type: "subtitle"
            },
            address: {
              name: "Address",
              type: "text"
            },
            folder: {
              name: "Folder",
              type: "text"
            },
            username: {
              name: "Username",
              type: "text"
            },
            password: {
              name: "Password",
              type: "text"
            }
          }))
        }
      };
    }
    return (
      <>
        <Modal
          isOpen={this.state.listModalIsOpen}
          onRequestClose={this.closeListModal}
          overlayClassName="modalOverlay"
          className="modalContent"
          contentLabel="List of loadable configurations"
        >
          <h2>List of saved configurations</h2>
          <form>
            {this.props.configList.map(config => {
              return (
                <>
                  {config}
                  <input type="button" value="Delete" onClick={() => this.props.deleteConfig(config)} />
                  <input type="button" value="Load" onClick={() => this.props.loadConfig(config)} />
                  <input type="button" value="Download" onClick={() => this.props.downloadConfig(config)} />
                  <br />
                </>
              );
            })}
            <input type="button" value="Upload" onClick={() => this.props.uploadConfig(this.props.config.version)} />
            <input
              type="button"
              value="Load default"
              onClick={() => {
                this.props.loadConfig("template.json");
              }}
            />
          </form>
        </Modal>
        <Modal
          isOpen={this.state.configModalIsOpen}
          onRequestClose={this.closeConfigModal}
          overlayClassName="modalOverlay"
          className="modalContent"
          contentLabel="General Configuration Modal"
        >
          {this.state.configModalIsOpen && (
            <form>
              <h2>General configuration</h2>
              <div className="infobar--modalButtons">
                <input
                  type="button"
                  value="Save config"
                  onClick={() => {
                    const name = prompt("Please enter the name for the new config file:", "config");
                    if (name) this.props.saveConfig(name);
                  }}
                />
                <input
                  type="button"
                  value="Load config"
                  onClick={() => {
                    this.props.getConfigList();
                    this.openListModal();
                    this.closeConfigModal();
                  }}
                />
              </div>
              <h3>Date and Time</h3>
              <br />
              <form
                onSubmit={event => {
                  event.preventDefault();
                  this.props.setDateTime(this.state.newDate);
                }}
              >
                Change internal time:
                <input type="submit" value="Save" />
                <input
                  type="datetime-local"
                  name="newDate"
                  value={this.state.newDate}
                  onChange={event => this.setState({ newDate: event.target.value })}
                />
              </form>

              {makeForm(configurationValues, this.props.config, this.props.changeConfig)}
            </form>
          )}
        </Modal>

        <div className="infobar" onClick={this.props.configLocked ? null : this.openConfigModal}>
          <FitText compressor={1}>
            <div className="infobar--item">
              <div className="center">{this.props.name}</div>
            </div>
          </FitText>
          <FitText compressor={1}>
            <div className="infobar--item">
              <div className="center">{this.props.ip}</div>
            </div>
          </FitText>
          <FitText compressor={0.8}>
            <div className="infobar--item">
              <div className="center">{moment(this.props.time).format("HH:mm:ss")}</div>
            </div>
          </FitText>
          <FitText compressor={0.8}>
            <div className="infobar--item">
              <div className="center">{moment(this.props.time).format("DD-MM-YYYY")}</div>
            </div>
          </FitText>
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  const name = state.static.name;
  const ip = state.misc.ip;
  const time = state.misc.time;

  const configLocked = state.config.locked;
  const config = state.config;
  const exposeUpload = state.static.exposeUpload;

  const configList = state.misc.configList;

  return {
    name,
    ip,
    time,
    configLocked,
    config,
    configList,
    exposeUpload
  };
}

export default connect(
  mapStateToProps,
  {
    changeConfig,
    deleteConfig,
    loadConfig,
    downloadConfig,
    configExists,
    saveConfig,
    getConfigList,
    uploadConfig,
    setDateTime
  }
)(Infobar);
