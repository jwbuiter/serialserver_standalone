import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "react-modal";
import ReactTable from "react-table";

import { getColumnWidth } from "../../helpers";

class LogModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterType: "full"
    };
  }

  changeFilterType = event => {
    this.setState({ filterType: event.target.value });
  };

  filterTypes = [
    {
      id: "full",
      name: "Show only complete",
      title: "Complete Log",
      filter: entry => entry.full
    }
  ];

  componentWillMount() {
    if (this.props.uniqueLogEnabled) {
      this.filterTypes.push({
        id: "unique",
        name: "Show only unique",
        title: "Unique Log",
        filter: entry => entry.TU
      });
    }

    if (this.props.activityCounter) {
      this.filterTypes.push({
        id: "activity",
        name: "Show only activity",
        title: "Activity Log",
        filter: entry => entry.TA
      });
    }
    this.filterTypes.push({
      id: "none",
      name: "Show all",
      title: "Normal Log",
      filter: entry => true
    });
  }

  render() {
    const currentFilter = this.filterTypes.find(filter => filter.id === this.state.filterType);

    const { entries, accessors, legend, digits, visible } = this.props.loggerState;
    const columns = legend
      .map((name, index) => ({
        Header: () => <b>{name}</b>,
        accessor: accessors[index],
        width: getColumnWidth(entries, accessors[index]),
        style: { textAlign: "center" },
        Cell: props => {
          if (typeof props.value === "number") {
            return props.value.toFixed(digits[index]);
          }
          return props.value;
        },
        name
      }))
      .filter((_, index) => visible[index])
      .filter(column => this.props.uniqueLogEnabled || column.name !== "TU")
      .filter(column => this.props.activityCounter || column.name !== "TA");

    const filteredEntries = entries.filter(currentFilter.filter);

    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onClose}
        overlayClassName="modalOverlay"
        className="modalContent"
        contentLabel="Log Modal"
      >
        {this.filterTypes.length > 1 && (
          <span>
            <select value={this.state.filterType} onChange={this.changeFilterType}>
              {this.filterTypes.map(filter => (
                <option value={filter.id}>{filter.name}</option>
              ))}
            </select>
          </span>
        )}

        <div className="main--logModal">
          <div>
            <div className="main--logModal--title">
              <b>{currentFilter.title}</b>
            </div>
            <ReactTable style={{ fontSize: 14 }} data={filteredEntries} columns={columns} />
          </div>
        </div>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  const uniqueLogEnabled = state.config.logger.unique !== "off";

  const { activityCounter } = state.config.selfLearning;

  const loggerState = state.internal.logger;

  return {
    uniqueLogEnabled,
    activityCounter,
    loggerState
  };
}

export default connect(mapStateToProps)(LogModal);
