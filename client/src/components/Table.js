import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "react-modal";

import TableCell from "./TableCell";
import { makeForm } from "../helpers";
import { changeConfig } from "../actions/configActions";
import { tableManual } from "../actions/internalActions";
import "../styles/table.scss";

Modal.setAppElement("#root");

const configurationValues = {
  table: {
    cells: [
      {
        name: {
          name: "Name of cell",
          type: "text"
        },
        visible: {
          name: "Visible",
          type: "checkbox"
        },
        showInLog: {
          name: "Show in log",
          type: "checkbox"
        },
        type: {
          name: "Type of content",
          type: "select",
          options: {
            normal: "Normal",
            date: "Date",
            manual: "Input",
            menu: "Menu",
            reader: "Reader"
          }
        },
        readerPort: {
          name: "Reader port",
          type: "number",
          min: 0,
          step: 1,
          condition: (config, index) => config.table.cells[index].type === "reader"
        },
        numeric: {
          name: "Treat value as a number",
          type: "checkbox",
          condition: (config, index) => config.table.cells[index].type !== "date"
        },
        formula: {
          name: "Formula for cell value",
          type: "text",
          condition: (config, index) =>
            ["normal", "date"].includes(config.table.cells[index].type) && !config.table.cells[index].readerPort
        },
        menuOptions: {
          name: "Options and values for menu",
          type: "keyValue",
          condition: (config, index) => config.table.cells[index].type === "menu"
        },
        digits: {
          name: "Number of digits",
          type: "number",
          min: 0,
          step: 1,
          condition: (config, index) => ["normal", "reader"].includes(config.table.cells[index].type)
        },
        resetOnExe: {
          name: "Reset value after execute",
          type: "checkbox"
        },
        colorConditions: {
          name: "Conditions for cell colors",
          type: "keyValue",
          options: {
            "#3fd35d": "Green",
            yellow: "Yellow",
            "#ffc000": "Orange"
          }
        }
      }
    ]
  }
};

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = { configModalIsOpen: false, configCellIndex: -1 };
  }

  openConfigModal = index => {
    this.setState({ configModalIsOpen: true, configCellIndex: index });
  };

  closeConfigModal = () => {
    this.setState({ configModalIsOpen: false });
  };

  render() {
    const cells = this.props.cells
      .map((cell, index) => ({
        index,
        ...cell,
        ...this.props.cellConfig[index]
      }))
      .filter(cell => !this.props.configLocked || cell.visible);

    return (
      <>
        <Modal
          isOpen={this.state.configModalIsOpen}
          onRequestClose={this.closeConfigModal}
          overlayClassName="modalOverlay"
          className="modalContent"
          contentLabel="Table Configuration Modal"
        >
          {this.state.configModalIsOpen && (
            <form>
              <h2>
                Configuration for cell {String.fromCharCode(65 + Math.floor(this.state.configCellIndex / 5))}
                {(this.state.configCellIndex % 5) + 1}
              </h2>
              {makeForm(configurationValues, this.props.config, this.props.changeConfig, this.state.configCellIndex)}
            </form>
          )}
        </Modal>
        <div className={`table--grid table--grid--${cells.length}`}>
          {cells.map(cell => (
            <TableCell
              key={cell.index}
              cell={cell}
              index={cell.index}
              notFound={this.props.notFound}
              manualFunction={this.props.tableManual}
              openModal={this.props.configLocked ? this.props.openLog : () => this.openConfigModal(cell.index)}
            />
          ))}
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  const cells = state.internal.cells.map((cell, index) => ({
    ...cell,
    name: state.config.table.cells[index].name
  }));

  return {
    cells,
    configLocked: state.config.locked,
    config: state.config,
    cellConfig: state.config.table.cells,
    notFound: state.internal.tableNotFound
  };
}

export default connect(
  mapStateToProps,
  { tableManual, changeConfig }
)(Table);
