import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "react-modal";
import classNames from "classnames";

import { loadConfig, loadStatic } from "../actions/configActions";
import { getLog } from "../actions/logActions";
import { openMenu, getLogo } from "../actions/menuActions";

import LogModal from "./modals/LogModal";
import ComList from "./ComList";
import OutputList from "./OutputList";
import InputList from "./InputList";
import Table from "./Table";
import SelfLearning from "./SelfLearning";
import Logo from "./Logo";

import MBDC from "../assets/Logo-MBDC.jpg";
import Infobar from "./Infobar";

import "../styles/main.scss";
import "react-toggle/style.css";

Modal.setAppElement("#root");

class Main extends Component {
  constructor(props) {
    super(props);

    this.props.loadConfig();
    this.props.loadStatic();

    getLogo().then(result => {
      if (result) {
        this.setState({ logo: result });
      }
    });

    this.state = {
      logModalIsOpen: false,
      logModalFilterType: "none",
      logEntries: [],
      logTableColumns: [],
      logo: MBDC,
      reloadInterval: null
    };
  }

  openLogModal = () => {
    this.setState({
      logModalIsOpen: true,
      reloadInterval: setInterval(this.props.getLog, 1000)
    });
    this.props.getLog();
  };

  closeLogModal = () => {
    clearInterval(this.state.reloadInterval);
    this.setState({ logModalIsOpen: false });
  };

  render() {
    if (!this.props.loaded) {
      return <div className="loadingScreen">Loading</div>;
    }

    return (
      <div id="page-wrap">
        <div
          className={classNames(
            "main",
            { "main--noinputs": !this.props.showInputs },
            { "main--notable": !this.props.showTable },
            { "main--nooutputs": !this.props.showOutputs }
          )}
        >
          <LogModal isOpen={this.state.logModalIsOpen} onClose={this.closeLogModal} />
          <div className="info">
            <Infobar />
          </div>

          <div className="logo">
            <Logo image={this.state.logo} alt="LOGO" onClick={this.props.openMenu} />
          </div>

          <div
            className={classNames("coms", {
              "coms--noselfLearning": !this.props.showSelfLearning
            })}
          >
            {this.props.showSelfLearning && <SelfLearning />}
            <ComList />
          </div>

          {this.props.showOutputs && <div className="outputs">{this.props.showOutputs && <OutputList />} </div>}
          {this.props.showInputs && <div className="inputs">{this.props.showInputs && <InputList />}</div>}
          {this.props.showTable && (
            <div className="table">
              <Table openLog={this.openLogModal} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const configLocked = state.config.locked;

  if (!state.config.loaded || !state.static.loaded) {
    return { loaded: false };
  }

  const showTable = state.static.exposeUpload && (!configLocked || state.config.table.cells.some(cell => cell.visible));

  const showInputs =
    state.static.exposeUpload && (!configLocked || state.config.input.ports.some(port => port.visible));

  const showOutputs =
    state.static.exposeUpload && (!configLocked || state.config.output.ports.some(port => port.visible));

  const showSelfLearning =
    state.static.enabledModules.selfLearning && (!configLocked || state.internal.selfLearning.enabled);

  const uniqueLogEnabled = state.config.logger.unique !== "off";

  const { activityCounter } = state.config.selfLearning;

  return {
    loaded: true,
    showTable,
    showInputs,
    showOutputs,
    showSelfLearning,
    configLocked,
    uniqueLogEnabled,
    activityCounter
  };
}

export default connect(
  mapStateToProps,
  { loadConfig, loadStatic, openMenu, getLog }
)(Main);
