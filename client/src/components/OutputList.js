import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "react-modal";
import FitText from "react-fittext";

import { changeConfig } from "../actions/configActions";
import { forceOutput } from "../actions/internalActions";
import { makeForm } from "../helpers";
import "../styles/outputList.scss";

Modal.setAppElement("#root");

const configurationValues = {
  output: {
    ports: [
      {
        name: {
          name: "Name of output",
          type: "text"
        },
        hardwareOutput: {
          name: "Hardware output",
          type: "select",
          numeric: true,
          options: {
            "-1": "None",
            "0": "HW Output 1",
            "1": "HW Output 2",
            "2": "HW Output 3",
            "3": "HW Output 4",
            "4": "HW Output 5",
            "5": "HW Output 6",
            "6": "HW Output 7",
            "7": "HW Output 8",
            "8": "HW Output 9",
            "9": "HW Output 10"
          }
        },
        visible: {
          name: "Visible",
          type: "checkbox"
        },
        formula: {
          name: "Formula for output",
          type: "text"
        },
        execute: {
          name: "Only on execute",
          type: "checkbox"
        },
        seconds: {
          name: "Timeout in seconds",
          type: "number",
          min: 0,
          step: 1,
          condition: (config, index) => config.output.ports[index].execute
        },
        manualConfirmation: {
          name: "Manual requires confirmation",
          type: "checkbox"
        }
      }
    ]
  }
};

class OutputList extends Component {
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
          contentLabel="Output Configuration Modal"
        >
          {this.state.configModalIsOpen && (
            <form>
              <h2>Configuration for output {this.state.configPortIndex + 1}</h2>
              {makeForm(configurationValues, this.props.config, this.props.changeConfig, this.state.configPortIndex)}
            </form>
          )}
        </Modal>
        <div className="buttonList">
          <div className="buttonList--title">
            <div className="center">
              <FitText>
                <div>Outputs</div>
              </FitText>
            </div>
          </div>
          {this.props.outputs
            .map((port, index) => ({ ...port, index }))
            .filter((port, index) => this.props.portsEnabled[index] || !this.props.configLocked)
            .map(port => {
              let indicator = "buttonList--list--indicator--output";
              if (port.isForced) indicator += "Forced";

              if (port.state) {
                indicator += "On";
              } else if (port.result && !port.isForced) {
                indicator += "Execute";
              } else {
                indicator += "Off";
              }

              return (
                <div
                  key={port.index}
                  className="buttonList--list--item"
                  onClick={
                    this.props.configLocked
                      ? () => this.props.forceOutput(port.index)
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
  const outputs = state.internal.outputs.map((output, index) => ({
    ...output,
    name: state.config.output.ports[index].name
  }));

  const configLocked = state.config.locked;
  const config = state.config;

  const portsEnabled = state.config.output.ports.map(port => port.visible);

  return {
    outputs,
    configLocked,
    config,
    portsEnabled
  };
}

export default connect(
  mapStateToProps,
  { forceOutput, changeConfig }
)(OutputList);
