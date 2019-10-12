import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "react-modal";
import FitText from "react-fittext";

import { makeForm } from "../helpers";
import { changeConfig } from "../actions/configActions";
import { forceInput } from "../actions/internalActions";
import "../styles/inputList.scss";

Modal.setAppElement("#root");

const configurationValues = {
  input: {
    ports: [
      {
        name: {
          name: "Name of cell",
          type: "text"
        },
        hardwareInput: {
          name: "Hardware input",
          type: "select",
          numeric: true,
          options: {
            "-1": "None",
            "0": "HW Input 1",
            "1": "HW Input 2",
            "2": "HW Input 3",
            "3": "HW Input 4",
            "4": "HW Input 5"
          }
        },
        visible: {
          name: "Visible",
          type: "checkbox"
        },
        formula: {
          name: "Command for input",
          type: "select",
          options: {
            "": "",
            exe: "Execute",
            exebl: "Execute Block",
            reset: "Reset Table",
            teach: "SL Teach",
            restart: "Restart",
            shutdown: "Shutdown",
            command: "COM command"
          }
        },
        commandCom: {
          name: "COM to send command",
          type: "select",
          options: {
            com0: "COM 0",
            com1: "COM 1"
          },
          condition: (config, index) => config.input.ports[index].formula === "command"
        },
        commandValue: {
          name: "Value to send on COM",
          type: "text",
          condition: (config, index) => config.input.ports[index].formula === "command"
        },
        invert: {
          name: "Invert follow",
          type: "checkbox"
        },
        follow: {
          name: "Follow output",
          type: "select",
          numeric: true,
          options: {
            "-1": "None",
            "0": "Follow ouput 1",
            "1": "Follow ouput 2",
            "2": "Follow ouput 3",
            "3": "Follow ouput 4",
            "4": "Follow ouput 5",
            "5": "Follow ouput 6",
            "6": "Follow ouput 7",
            "7": "Follow ouput 8",
            "8": "Follow ouput 9",
            "9": "Follow ouput 10"
          }
        },
        timeout: {
          name: "Debounce timeout (ms)",
          type: "number",
          min: 0,
          step: 1
        },
        manualTimeout: {
          name: "Manual timeout (s)",
          type: "number",
          min: 0,
          step: 1
        },
        manualConfirmation: {
          name: "Manual requires confirmation",
          type: "checkbox"
        }
      }
    ]
  }
};

class InputList extends Component {
  constructor(props) {
    super(props);
    this.state = { configModalIsOpen: false, configPortIndex: -1 };
  }

  openConfigModal = index => {
    this.setState({ configModalIsOpen: true, configPortIndex: index });
  };

  closeConfigModal = () => {
    this.setState({ configModalIsOpen: false });
  };

  render() {
    return (
      <>
        <Modal
          isOpen={this.state.configModalIsOpen}
          onRequestClose={this.closeConfigModal}
          overlayClassName="modalOverlay"
          className="modalContent"
          contentLabel="Input Configuration Modal"
        >
          {this.state.configModalIsOpen && (
            <form>
              <h2>Configuration for input {this.state.configPortIndex + 1}</h2>
              {makeForm(configurationValues, this.props.config, this.props.changeConfig, this.state.configPortIndex)}
            </form>
          )}
        </Modal>
        <div className="buttonList inputList">
          <div className="buttonList--title">
            <div className="center">
              <FitText>
                <div>Inputs</div>
              </FitText>
            </div>
          </div>
          {this.props.inputs
            .map((port, index) => ({ ...port, index }))
            .filter((port, index) => this.props.portsEnabled[index] || !this.props.configLocked)
            .map(port => {
              let indicator = "buttonList--list--indicator--input";
              if (port.isForced) indicator += "Forced";

              indicator += port.state ? "On" : "Off";

              return (
                <div
                  key={port.index}
                  className="buttonList--list--item"
                  onClick={
                    this.props.configLocked
                      ? () => this.props.forceInput(port.index)
                      : () => this.openConfigModal(port.index)
                  }
                >
                  <div className={"buttonList--list--indicator " + indicator}>
                    <div className="center">
                      <FitText compressor={1.05}>
                        <div>{port.name}</div>
                      </FitText>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  const inputs = state.internal.inputs.map((input, index) => ({
    ...input,
    name: state.config.input.ports[index].name
  }));

  const configLocked = state.config.locked;
  const config = state.config;

  const portsEnabled = state.config.input.ports.map(port => port.visible);

  return {
    inputs,
    configLocked,
    config,
    portsEnabled
  };
}

export default connect(
  mapStateToProps,
  { forceInput, changeConfig }
)(InputList);
