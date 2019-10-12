import React, { Component } from "react";
import { connect } from "react-redux";
import FitText from "react-fittext";
import Modal from "react-modal";
import classNames from "classnames";

import { changeConfig } from "../actions/configActions";
import { makeForm } from "../helpers";
import "../styles/comElement.scss";

const configurationValues = {
  serial: {
    coms: [
      {
        mode: {
          name: "Mode",
          type: "select",
          options: {
            serial: "Serial",
            reader: "Reader",
            test: "Test"
          }
        },
        testMessage: {
          name: "Test value",
          type: "text",
          condition: (config, index) => config.serial.coms[index].mode === "test"
        },
        readerPort: {
          name: "Port",
          type: "number",
          min: 0,
          step: 1,
          condition: (config, index) => config.serial.coms[index].mode === "reader"
        },
        baudRate: {
          name: "Baudrate",
          type: "number",
          min: 0,
          step: 1,
          condition: (config, index) => config.serial.coms[index].mode === "serial"
        },
        stopBits: {
          name: "Number of stop bits",
          type: "number",
          min: 0,
          step: 1,
          condition: (config, index) => config.serial.coms[index].mode === "serial"
        },
        bits: {
          name: "Number of data bits",
          type: "number",
          min: 0,
          step: 1,
          condition: (config, index) => config.serial.coms[index].mode === "serial"
        },
        parity: {
          name: "Parity of data",
          type: "select",
          options: {
            none: "None",
            even: "Even",
            odd: "Odd",
            mark: "Mark",
            space: "Space"
          },
          condition: (config, index) => config.serial.coms[index].mode === "serial"
        },
        RTSCTS: {
          name: "RTS/CTS",
          type: "checkbox",
          condition: (config, index) => config.serial.coms[index].mode === "serial"
        },
        XONXOFF: {
          name: "XON/XOFF",
          type: "checkbox",
          condition: (config, index) => config.serial.coms[index].mode === "serial"
        },
        name: {
          name: "Name of port",
          type: "text"
        },
        entries: {
          name: "Number of entries",
          type: "number",
          min: 0,
          step: 1
        },
        numeric: {
          name: "Treat value as number",
          type: "checkbox"
        },
        average: {
          name: "Take average",
          type: "checkbox",
          condition: (config, index) => config.serial.coms[index].numeric
        },
        factor: {
          name: "Factor",
          type: "number",
          condition: (config, index) => config.serial.coms[index].numeric
        },
        digits: {
          name: "Digits/rounding",
          type: "number",
          min: 0,
          step: 1
        },
        alwaysPositive: {
          name: "Always positive",
          type: "checkbox",
          condition: (config, index) => config.serial.coms[index].numeric
        },
        timeoutReset: {
          name: "Reset after timeout",
          type: "checkbox"
        },
        timeout: {
          name: "Timeout in seconds",
          type: "number",
          min: 0,
          step: 1
        },
        prefix: {
          name: "Prefix",
          type: "text",
          condition: (config, index) => config.serial.coms[index].mode === "serial"
        },
        postfix: {
          name: "Suffix",
          type: "text",
          condition: (config, index) => config.serial.coms[index].mode === "serial"
        },
        autoCommandEnabled: {
          name: "AutoCommand",
          type: "checkbox",
          condition: (config, index) => config.serial.coms[index].mode === "serial"
        },
        autoCommandMin: {
          name: "Min Value",
          type: "number",
          condition: (config, index) =>
            config.serial.coms[index].mode === "serial" && config.serial.coms[index].autoCommandEnabled
        },
        autoCommandMax: {
          name: "Max Value",
          type: "number",
          condition: (config, index) =>
            config.serial.coms[index].mode === "serial" && config.serial.coms[index].autoCommandEnabled
        },
        autoCommandTime: {
          name: "Time (sec)",
          type: "number",
          condition: (config, index) =>
            config.serial.coms[index].mode === "serial" && config.serial.coms[index].autoCommandEnabled
        },
        autoCommandText: {
          name: "Command",
          type: "text",
          condition: (config, index) =>
            config.serial.coms[index].mode === "serial" && config.serial.coms[index].autoCommandEnabled
        }
      }
    ]
  }
};

class ComList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      configModalIsOpen: false,
      showHistory: props.coms.map(element => false),
      comIndex: -1
    };
  }

  openConfigModal = index => {
    this.setState({ configModalIsOpen: true, comIndex: index });
  };

  closeConfigModal = () => {
    this.setState({ configModalIsOpen: false });
  };

  toggleShowHistory = index => {
    this.setState({
      showHistory: this.state.showHistory.map((element, i) => (i === index ? !element : element))
    });
  };

  render() {
    const coms = this.props.coms
      .map((com, index) => ({ index, ...com }))
      .filter(com => com.name || !this.props.configLocked);

    return (
      <>
        <Modal
          isOpen={this.state.configModalIsOpen}
          onRequestClose={this.closeConfigModal}
          overlayClassName="modalOverlay"
          className="modalContent"
          contentLabel="Serial Configuration Modal"
        >
          {this.state.configModalIsOpen && (
            <form>
              <h2>Configuration for com{this.state.comIndex}</h2>
              {makeForm(configurationValues, this.props.config, this.props.changeConfig, this.state.comIndex)}
            </form>
          )}
        </Modal>
        {coms.map(com => (
          <div
            key={com.index}
            className={classNames("comElement", {
              "comElement--wide": coms.length === 1
            })}
          >
            <div
              className="comElement--title"
              onClick={() => {
                if (!this.props.configLocked) {
                  this.openConfigModal(com.index);
                  return;
                }

                if (!com.average && com.entries > 0) {
                  this.toggleShowHistory(com.index);
                  return;
                }
              }}
            >
              <div className="center">
                <FitText>
                  <div>{com.name}</div>
                </FitText>
                <FitText compressor={2}>
                  <div>{com.average && `Average ${com.entries}`}</div>
                </FitText>
              </div>
            </div>
            <div
              className={classNames("comElement--content", {
                "comElement--content--testMode": com.mode === "test"
              })}
            >
              {this.state.showHistory[com.index] && com.history ? (
                <div className="comElement--content--history">
                  {com.history.slice(0, this.props.config.serial.coms[com.index].entries).map(element => (
                    <>
                      <div>{element.timeString}</div>
                      <div>{element.entry}</div>
                    </>
                  ))}
                </div>
              ) : (
                <div className="center">
                  <FitText compressor={0.9}>
                    <div>{com.entry}</div>
                  </FitText>
                </div>
              )}
            </div>
          </div>
        ))}
      </>
    );
  }
}

function mapStateToProps(state) {
  const coms = state.config.serial.coms.map((com, index) => ({
    ...com,
    ...state.internal.coms[index]
  }));

  return {
    coms,
    configLocked: state.config.locked,
    config: state.config
  };
}

export default connect(
  mapStateToProps,
  { changeConfig }
)(ComList);
