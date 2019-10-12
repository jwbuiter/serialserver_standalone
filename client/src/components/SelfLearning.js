import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "react-modal";
import FitText from "react-fittext";
import classNames from "classnames";

import SelfLearningModal from "./modals/SelfLearningModal";
import { resetSLData } from "../actions/selfLearningActions";
import { downloadExcel, uploadExcelTemplate } from "../actions/excelActions";
import { changeConfig } from "../actions/configActions";

import { makeForm } from "../helpers";
import "../styles/selfLearning.scss";
import "react-table/react-table.css";
import { isUndefined } from "util";

Modal.setAppElement("#root");

class SelfLearning extends Component {
  constructor(props) {
    super(props);
    this.state = {
      SLModalIsOpen: false,
      configModalIsOpen: false,
      showIndividualTable: false
    };
  }

  openSLModal = () => {
    this.setState({ SLModalIsOpen: true });
  };

  closeSLModal = () => {
    this.setState({ SLModalIsOpen: false });
  };

  openConfigModal = () => {
    this.setState({ configModalIsOpen: true });
  };

  closeConfigModal = () => {
    this.setState({ configModalIsOpen: false });
  };

  render() {
    let rounding = 0;
    if (!isUndefined(this.props.comIndex)) rounding = this.props.config.serial.coms[this.props.comIndex].digits;

    const configurationValues = {
      selfLearning: {
        enabled: {
          name: "Enabled type",
          type: "select",
          options: {
            off: "Off",
            com0: "Com 0",
            com1: "Com 1",
            com0ind: "Com 0 Individual",
            com1ind: "Com 1 Individual"
          }
        },
        normal: {
          type: "conditional",
          condition: config => !config.selfLearning.enabled.endsWith("ind") && config.selfLearning.enabled !== "off",
          contents: {
            LogID: {
              name: "LogID",
              type: "external",
              location: "logger.logID",
              configuration: {
                name: "LogID",
                type: "text"
              }
            },
            startCalibration: {
              name: "Calibration",
              type: "number",
              min: 0,
              step: 1,
              rounding
            },
            totalNumber: {
              name: "Total number",
              type: "number",
              min: 0,
              step: 1
            },
            numberPercentage: {
              name: "SL number %",
              type: "number",
              min: 0,
              step: 1
            },
            tolerance: {
              name: "Tolerance %",
              type: "number",
              min: 0,
              step: 1
            },
            startTolerance: {
              name: "Extra tolerance during learning %",
              type: "number",
              min: 0,
              step: 1
            }
          }
        },
        individual: {
          type: "conditional",
          condition: config => config.selfLearning.enabled.endsWith("ind"),
          contents: {
            important: {
              type: "emphasis",
              contents: {
                resetSL: {
                  name: "Reset Self Learning Data",
                  type: "button",
                  onClick: () => {
                    this.props.resetSLData();
                  }
                },
                downloadExcel: {
                  name: "Download Excel file",
                  type: "button",
                  onClick: () => {
                    this.props.downloadExcel();
                  }
                },
                logID: {
                  type: "external",
                  location: "logger.logID",
                  configuration: {
                    name: "LogID",
                    type: "text"
                  }
                },
                startCalibration: {
                  name: "Calibration",
                  type: "number",
                  min: 0,
                  step: 1,
                  rounding
                },
                totalNumber: {
                  name: "Total number",
                  type: "number",
                  min: 0,
                  step: 1
                }
              }
            },
            numberPercentage: {
              name: "SL number %",
              type: "number",
              min: 0,
              step: 1
            },
            tolerance: {
              name: "SL Tolerance %",
              type: "number",
              min: 0,
              step: 1
            },
            individualToleranceAbs: {
              name: "Individual tolerance",
              type: "number",
              min: 0,
              step: 1,
              condition: config => config.selfLearning.enabled.endsWith("ind")
            },
            individualTolerance: {
              name: "Individual tolerance %",
              type: "number",
              min: 0,
              step: 1,
              condition: config => config.selfLearning.enabled.endsWith("ind")
            },
            individualToleranceShift: {
              name: "Individual tolerance shift %",
              type: "number",
              min: 0,
              step: 1,
              condition: config => config.selfLearning.enabled.endsWith("ind")
            },
            individualCorrectionIncrement: {
              name: "Correction %",
              type: "number",
              min: 0,
              step: 1,
              condition: config => config.selfLearning.enabled.endsWith("ind")
            },
            individualCorrectionLimit: {
              name: "Correction limit (1-9)",
              type: "number",
              min: 1,
              max: 9,
              step: 1,
              condition: config => config.selfLearning.enabled.endsWith("ind")
            },
            individualAverageNumber: {
              name: "Average calibration number (1-9)",
              type: "number",
              min: 1,
              max: 9,
              step: 1,
              condition: config => config.selfLearning.enabled.endsWith("ind")
            },
            excelIndividualColumn: {
              type: "external",
              location: "table.individualColumn",
              configuration: {
                name: "Excel column - Com Ind",
                type: "select",
                numeric: true,
                options: [...Array(26).keys()].map(i => String.fromCharCode("A".charCodeAt(0) + i))
              }
            },
            excelDateColumn: {
              type: "external",
              location: "table.dateColumn",
              configuration: {
                name: "Excel column - Date",
                type: "select",
                numeric: true,
                options: [...Array(26).keys()].map(i => String.fromCharCode("A".charCodeAt(0) + i))
              }
            },
            excelExitColumn: {
              type: "external",
              location: "table.exitColumn",
              configuration: {
                name: "Excel column - Exit",
                type: "select",
                numeric: true,
                options: [...Array(26).keys()].map(i => String.fromCharCode("A".charCodeAt(0) + i))
              }
            },
            exitOptions: {
              name: "Exit options",
              type: "keyValue"
            },
            activityCounter: {
              type: "checkbox",
              name: "Activity counter"
            },
            uploadExcelTemplate: {
              name: "Import Excel Template",
              type: "button",
              onClick: uploadExcelTemplate
            },
            title: {
              name: "List column configuration",
              type: "title"
            },
            firstTopFormula: {
              name: "#1 Top Formula",
              type: "text"
            },
            firstTopDigits: {
              name: "#1 Top Digits",
              type: "number",
              min: 0,
              step: 1
            },
            secondTopFormula: {
              name: "#2 Top Formula",
              type: "text"
            },
            secondTopDigits: {
              name: "#2 Top Digits",
              type: "number",
              min: 0,
              step: 1
            },
            extraColumns: {
              name: "Additional columns",
              type: "structArray",
              structure: {
                title: {
                  name: "Title",
                  type: "text"
                },
                topFormula: {
                  name: "Top formula",
                  type: "text"
                },
                formula: {
                  name: "Formula",
                  type: "text"
                },
                type: {
                  name: "Type of content",
                  type: "select",
                  options: {
                    text: "Non-num",
                    number: "Numeric",
                    date: "Date"
                  }
                },
                digits: {
                  name: "Digits",
                  type: "number",
                  min: 0,
                  step: 1
                },
                generalVisible: {
                  name: "Show in SL list",
                  type: "checkbox"
                }
              },
              defaults: {
                title: "",
                topFormula: "",
                formula: "",
                type: "text",
                digits: 0
              }
            }
          }
        }
      }
    };

    const indicators = ["selfLearning--inProgress", "selfLearning--success", "selfLearning--warning"];

    const cells = [
      "Self Learning",
      (this.props.calibration || 0).toFixed(this.props.config.serial.coms[this.props.comIndex || 0].digits) || 0,
      Math.round((this.props.tolerance || 0) * 1000) / 10 + "%"
    ];

    if (!this.props.individual && this.props.success) {
      cells.push(Math.round((this.props.tolerance || 0 - this.props.matchedTolerance || 0) * 1000) / 10 + "%");
    }

    if (this.props.individual && this.props.activityCounter) {
      const activity =
        Object.values(this.props.individualEntries)
          .map(entry => entry.activity)
          .reduce((acc, cur) => acc + cur, 0) +
        Object.values(this.props.generalEntries)
          .map(entry => entry.activity)
          .reduce((acc, cur) => acc + cur, 0);

      cells.push(activity);
    }
    return (
      <>
        <Modal
          isOpen={this.state.configModalIsOpen}
          onRequestClose={this.closeConfigModal}
          overlayClassName="modalOverlay"
          className="modalContent"
          contentLabel="SelfLearning Configuration Modal"
        >
          {this.state.configModalIsOpen && (
            <form>
              <h2>Configuration for SelfLearning</h2>
              {makeForm(configurationValues, this.props.config, this.props.changeConfig)}
            </form>
          )}
        </Modal>
        <SelfLearningModal isOpen={this.state.SLModalIsOpen} onClose={this.closeSLModal} />

        <div
          className={classNames("selfLearning", indicators[this.props.success || 0])}
          onClick={this.props.configLocked ? (this.props.individual ? this.openSLModal : null) : this.openConfigModal}
        >
          {cells.map((cell, index) => (
            <div key={index} className={"selfLearning--cell"}>
              <div className="center">
                <FitText compressor={0.65}>
                  <div>{cell}</div>
                </FitText>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
}
function mapStateToProps(state) {
  const configLocked = state.config.locked;
  const config = state.config;
  const individual = state.internal.selfLearning.individual;
  const tableExtraColumnTitle = state.config.selfLearning.tableExtraColumnTitle;
  const activityCounter = state.config.selfLearning.activityCounter;

  return {
    ...state.internal.selfLearning,
    configLocked,
    config,
    individual,
    tableExtraColumnTitle,
    activityCounter
  };
}

export default connect(
  mapStateToProps,
  { resetSLData, downloadExcel, changeConfig }
)(SelfLearning);
