import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "react-modal";
import ReactTable from "../util/ReactTableWrapper";
import Toggle from "react-toggle";
import dateFormat from "dateformat";
import XLSX from "xlsx";

import { daysToDate } from "../../helpers";
import { deleteGeneralSL, deleteIndividualSL, resetIndividualSL } from "../../actions/selfLearningActions";

const individualColors = ["", "green", "yellow", "orange", "red"];
const textColors = ["black", "white", "black", "black", "white"];

function sum(list) {
  return list.filter(entry => entry).reduce((acc, cur) => acc + cur, 0);
}

class SelfLearningModal extends Component {
  constructor(props) {
    super(props);

    this.UNTable = React.createRef();
    this.SLTable = React.createRef();

    this.state = {
      showIndividualTable: true
    };
  }

  toggleIndividualTable = () => {
    this.setState({
      showIndividualTable: !this.state.showIndividualTable
    });
  };

  getSLModalContent() {
    const comConfigs = this.props.config.serial.coms;
    const comIndex = this.props.comIndex;
    const extraColumnConfigs = this.props.config.selfLearning.extraColumns;

    const keyName = comConfigs[1 - comIndex].name;
    const valueName = comConfigs[comIndex].name;
    const valueRounding = comConfigs[comIndex].digits;

    const firstTopDigits = this.props.config.selfLearning.firstTopDigits;
    const secondTopDigits = this.props.config.selfLearning.secondTopDigits;

    const individualEntries = [];
    const generalEntries = [];
    const individualColumnHeaders = this.props.individualColumnHeaders;
    const headerRoundings = [firstTopDigits, secondTopDigits, ...extraColumnConfigs.map(column => column.digits)];
    const formattedHeaders = individualColumnHeaders.map((header, index) =>
      header ? Number(header).toFixed(headerRoundings[index]) : ""
    );

    for (let key in this.props.generalEntries) {
      generalEntries.push({
        key,
        ...this.props.generalEntries[key]
      });
    }
    for (let key in this.props.individualEntries) {
      individualEntries.push({
        key,
        ...this.props.individualEntries[key]
      });
    }

    const extraColumns = this.props.config.selfLearning.extraColumns.map((column, index) => {
      return {
        Headers: [formattedHeaders[index + 2], column.title],
        accessor: row => row.extra[index],
        Cell: props => {
          switch (column.type) {
            case "text":
              return props.value ? String(props.value).slice(-column.digits) : "";
            case "number":
              return Number(props.value).toFixed(column.digits);
            case "date":
              return Number(props.value) > 0
                ? dateFormat(daysToDate(Number(props.value)), "dd-mm-yyyy")
                : "Invalid date";
            default:
              return props.value;
          }
        },
        width: Math.max(80, 11 * column.title.length),
        generalVisible: column.generalVisible
      };
    });

    const generalTableColumns = [
      {
        Headers: ["", valueName],
        accessor: row => row.entries[0],
        Cell: props => (props.value ? props.value.toFixed(valueRounding) : ""),
        width: 70
      },
      {
        Headers: ["", "-1"],
        accessor: row => row.entries[1] || "",
        Cell: props => (props.value ? props.value.toFixed(valueRounding) : ""),
        width: 70
      },
      {
        Headers: ["", "-2"],
        accessor: row => row.entries[2] || "",
        Cell: props => (props.value ? props.value.toFixed(valueRounding) : ""),
        width: 70
      },
      {
        Headers: ["", "-3"],
        accessor: row => row.entries[3] || "",
        Cell: props => (props.value ? props.value.toFixed(valueRounding) : ""),
        width: 70
      },
      {
        Headers: ["", "-4"],
        accessor: row => row.entries[4] || "",
        Cell: props => (props.value ? props.value.toFixed(valueRounding) : ""),
        width: 70
      },
      {
        Headers: ["", keyName],
        accessor: "key",
        width: 200
      },
      ...extraColumns.filter(column => column.generalVisible),
      {
        Headers: [
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete all general entries?`)) {
                this.props.deleteGeneralSL();
              }
            }}
          >
            <b> Delete </b>
          </button>,
          ""
        ],
        Cell: props => {
          return (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete general entries for ${props.original.key}?`)) {
                  this.props.deleteGeneralSL(props.original.key);
                }
              }}
            >
              Delete
            </button>
          );
        },
        width: 70
      }
    ];

    if (this.props.activityCounter) {
      generalTableColumns.push(
        {
          Headers: [sum(generalEntries.map(entry => entry.activity)), "TA"],
          accessor: "activity",
          width: 50
        },
        {
          Headers: [sum(generalEntries.map(entry => entry.activityHistory[0])), "-1"],
          accessor: row => row.activityHistory[0] || "",
          width: 50,
          style: {
            backgroundColor: "#ddd"
          }
        },
        {
          Headers: [sum(generalEntries.map(entry => entry.activityHistory[1])), "-2"],
          accessor: row => row.activityHistory[1] || "",
          width: 50,
          style: {
            backgroundColor: "#ddd"
          }
        },
        {
          Headers: [sum(generalEntries.map(entry => entry.activityHistory[2])), "-3"],
          accessor: row => row.activityHistory[2] || "",
          width: 50,
          style: {
            backgroundColor: "#ddd"
          }
        }
      );
    }

    const individualTableColumns = [
      {
        Headers: [formattedHeaders[0], valueName],
        accessor: "calibration",
        width: 70,
        Cell: props => props.value.toFixed(valueRounding)
      },
      {
        Headers: [formattedHeaders[1], keyName],
        accessor: "key",
        width: 200
      },
      ...extraColumns,
      {
        Headers: ["", "Tol"],
        accessor: "tolerance",
        Cell: props => {
          const incrementIndex = Math.floor(Math.min(4, props.original.increments));
          return (
            <div
              style={{
                backgroundColor: individualColors[incrementIndex],
                color: textColors[incrementIndex]
              }}
            >
              {props.value.toFixed(1)}{" "}
            </div>
          );
        },
        width: 50
      },
      {
        Headers: [sum(individualEntries.map(entry => entry.numUpdates)), "Num"],
        accessor: "numUpdates",
        width: 50
      },
      {
        Headers: [sum(individualEntries.map(entry => entry.numUpdatesHistory[0])), "-1"],
        accessor: row => row.numUpdatesHistory[0] || "",
        width: 50,
        style: {
          backgroundColor: "#ddd"
        }
      },
      {
        Headers: [sum(individualEntries.map(entry => entry.numUpdatesHistory[1])), "-2"],
        accessor: row => row.numUpdatesHistory[1] || "",
        width: 50,
        style: {
          backgroundColor: "#ddd"
        }
      },
      {
        Headers: [sum(individualEntries.map(entry => entry.numUpdatesHistory[2])), "-3"],
        accessor: row => row.numUpdatesHistory[2] || "",
        width: 50,
        style: {
          backgroundColor: "#ddd"
        }
      }
    ];

    if (this.props.activityCounter) {
      individualTableColumns.push(
        {
          Headers: [sum(individualEntries.map(entry => entry.activity)), "TA"],
          accessor: "activity",
          width: 50
        },
        {
          Headers: [sum(individualEntries.map(entry => entry.activityHistory[0])), "-1"],
          accessor: row => row.activityHistory[0] || "",
          width: 50,
          style: {
            backgroundColor: "#ddd"
          }
        },
        {
          Headers: [sum(individualEntries.map(entry => entry.activityHistory[1])), "-2"],
          accessor: row => row.activityHistory[1] || "",
          width: 50,
          style: {
            backgroundColor: "#ddd"
          }
        },
        {
          Headers: [sum(individualEntries.map(entry => entry.activityHistory[2])), "-3"],
          accessor: row => row.activityHistory[2] || "",
          width: 50,
          style: {
            backgroundColor: "#ddd"
          }
        }
      );
    }

    const exitOptions = this.props.config.selfLearning.exitOptions;

    individualTableColumns.push({
      Headers: [
        <button
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete all individual entries?`)) {
              this.props.deleteIndividualSL();
            }
          }}
        >
          <b> Delete </b>{" "}
        </button>,
        ""
      ],
      Cell: props =>
        exitOptions.length ? (
          <select
            value=""
            onChange={event => {
              if (window.confirm(`Are you sure you want to delete the entry for ${props.original.key}?`)) {
                this.props.deleteIndividualSL(props.original.key, event.target.value);
              }
            }}
          >
            <option value="">Delete</option>
            {exitOptions.map(({ key, value }) => (
              <option value={key}>{value}</option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete the entry for ${props.original.key}?`)) {
                this.props.deleteIndividualSL(props.original.key);
              }
            }}
          >
            Delete
          </button>
        ),
      width: 70
    });

    const tableStyle = { textAlign: "center" };

    const downloadTable = () => {
      const table = [];
      let cols, tableRef, sheetName;

      if (this.state.showIndividualTable) {
        cols = individualTableColumns.slice(0, -1);
        tableRef = this.UNTable;
        sheetName = "UN List";
      } else {
        cols = generalTableColumns;
        cols.splice(8, 1);
        tableRef = this.SLTable;
        sheetName = "SL List";
      }

      table[0] = cols.map(col => col.Headers[0]);
      table[1] = cols.map(col => col.Headers[1]);

      for (let row of tableRef.current.getResolvedState().sortedData) {
        row = Object.values(row);
        const newRow = [];
        for (let i = 0; i < cols.length; i++) newRow.push(row[i]);
        table.push(newRow);
      }

      const ws = XLSX.utils.aoa_to_sheet(table);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      const date = dateFormat(new Date(), "yyyy-mm-dd_HH-MM-ss");

      XLSX.writeFile(wb, `${this.props.name}_${this.props.config.logger.logID}_${date}.xlsx`);
    };

    return (
      <>
        <span>
          <Toggle checked={this.state.showIndividualTable} onChange={this.toggleIndividualTable} />
          {this.state.showIndividualTable ? " Show SL-list" : " Show UN-list"}
        </span>
        <span className="selfLearning--modal--buttons">
          <button style={{ marginRight: "20px" }} onClick={downloadTable}>
            <b> Download </b>
          </button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to reset the data of the individual selfLearning?"))
                this.props.resetIndividualSL();
            }}
          >
            <b> Reset </b>
          </button>
        </span>
        {this.state.showIndividualTable ? (
          <>
            <div className="selfLearning--modal--title"> UN - list </div>
            <ReactTable
              forwardRef={this.UNTable}
              data={individualEntries}
              columns={individualTableColumns}
              style={tableStyle}
            />
          </>
        ) : (
          <>
            <div className="selfLearning--modal--title"> SL - list </div>
            <ReactTable
              forwardRef={this.SLTable}
              style={tableStyle}
              data={generalEntries}
              columns={generalTableColumns}
            />
          </>
        )}
      </>
    );
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onClose}
        overlayClassName="modalOverlay"
        className="modalContent"
        contentLabel="SelfLearning Modal"
      >
        {this.props.isOpen && this.getSLModalContent()}
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  const name = state.static.name;
  const configLocked = state.config.locked;
  const config = state.config;
  const individual = state.internal.selfLearning.individual;
  const tableExtraColumnTitle = state.config.selfLearning.tableExtraColumnTitle;
  const { activityCounter } = state.config.selfLearning;

  return {
    ...state.internal.selfLearning,
    configLocked,
    config,
    individual,
    tableExtraColumnTitle,
    activityCounter,
    name
  };
}

export default connect(
  mapStateToProps,
  { deleteGeneralSL, deleteIndividualSL, resetIndividualSL }
)(SelfLearningModal);
