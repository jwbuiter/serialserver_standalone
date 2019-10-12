import React, { Component } from "react";
import { connect } from "react-redux";
import { slide as Menu } from "react-burger-menu";
import Toggle from "react-toggle";
import Modal from "react-modal";

import { downloadExcel, uploadExcel } from "../actions/excelActions";
import { downloadAllLogs, downloadLog, deleteLog, deleteAllLogs, getLogList, uploadLog } from "../actions/logActions";
import { saveConfig } from "../actions/configActions";
import { unlockConfig, toggleMenu, openMenu, closeMenu, reboot, shutdown } from "../actions/menuActions";

import "../styles/sidebar.scss";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = { uploadModalIsOpen: false, logModalIsOpen: false };
  }

  toggleConfigLock = () => {
    if (!this.props.isMenuOpen) return;

    if (this.props.configLocked) {
      this.props.unlockConfig();
    } else {
      this.props.saveConfig();
    }
  };

  openUploadModal = () => {
    this.setState({ uploadModalIsOpen: true });
    this.props.closeMenu();
  };

  closeUploadModal = () => {
    this.setState({ uploadModalIsOpen: false });
  };

  openLogModal = () => {
    this.setState({ logModalIsOpen: true });
    this.props.closeMenu();
  };

  closeLogModal = () => {
    this.setState({ logModalIsOpen: false });
  };

  uploadLog = (log, index) => {
    if (window.confirm("Do you really want to upload " + log + "?")) {
      this.props.uploadLog(log, index);
    }
  };

  deleteLog = log => {
    if (window.confirm("Do you really want to delete " + log + "?")) {
      this.props.deleteLog(log);
    }
  };

  downloadAllLogs = () => {
    if (window.confirm("Do you really want to download all logs?")) {
      this.props.downloadAllLogs();
    }
  };

  deleteAllLogs = () => {
    if (window.confirm("Do you really want to delete all logs?")) {
      this.props.deleteAllLogs();
    }
  };

  render() {
    const closeMenu = this.props.closeMenu;
    return (
      <>
        <Modal
          isOpen={this.state.logModalIsOpen}
          onRequestClose={this.closeLogModal}
          overlayClassName="modalOverlay"
          className="modalContent"
          contentLabel="Log files Modal"
        >
          <h2>Upload and download log files</h2>
          <form className="logForm">
            {this.props.logList.map(log => (
              <>
                {log}
                <input
                  type="button"
                  value="Delete"
                  onClick={() => {
                    this.deleteLog(log);
                  }}
                />
                <input
                  type="button"
                  value="Download"
                  onClick={() => {
                    this.props.downloadLog(log);
                  }}
                />
                {this.props.ftpTargets.map((target, index) => {
                  if (target.address)
                    return (
                      <input
                        type="button"
                        value={`FTP ${index + 1}`}
                        onClick={() => {
                          this.uploadLog(log, index);
                        }}
                      />
                    );
                  return null;
                })}
                <br />
              </>
            ))}
            <input
              type="button"
              value="Delete"
              onClick={() => {
                this.deleteAllLogs();
              }}
            />
            <input
              type="button"
              value="Download"
              onClick={() => {
                this.downloadAllLogs();
              }}
            />
          </form>
        </Modal>
        <Menu
          right
          customBurgerIcon={false}
          pageWrapId="page-wrap"
          outerContainerId="outer-container"
          isOpen={this.props.isMenuOpen}
          onStateChange={newState => !newState.isOpen && closeMenu()}
          width={450}
        >
          <span className="menu-item menu-item--clickable">
            <span
              onClick={() => {
                closeMenu();
                this.toggleConfigLock();
              }}
            >
              Unlock settings
            </span>{" "}
            <Toggle
              checked={!this.props.configLocked}
              onChange={() => {
                closeMenu();
                this.toggleConfigLock();
              }}
            />
          </span>
          {this.props.writeLogs && this.props.exposeUpload && (
            <span
              className="menu-item menu-item--clickable"
              onClick={() => {
                this.props.getLogList();
                this.openLogModal();
                closeMenu();
              }}
            >
              Log files
            </span>
          )}
          {this.props.exposeUpload && (
            <span
              className="menu-item menu-item--clickable"
              onClick={() => {
                uploadExcel();
                //this.openUploadModal();
                //closeMenu();
              }}
            >
              Import Excel
            </span>
          )}
          {this.props.exposeUpload && (
            <span
              className="menu-item menu-item--clickable"
              onClick={() => {
                this.props.downloadExcel();
                closeMenu();
              }}
            >
              Download Excel
            </span>
          )}
          <span
            className="menu-item menu-item--clickable"
            onClick={() => {
              if (window.confirm("Are you sure you want to reboot?")) {
                this.props.reboot();
              }
              closeMenu();
            }}
          >
            Reboot unit
          </span>
          {this.props.exposeShutdown && (
            <span
              className="menu-item menu-item--clickable"
              onClick={() => {
                if (window.confirm("Are you sure you want to shutdown?")) this.props.shutdown();
                closeMenu();
              }}
            >
              Shutdown unit
            </span>
          )}
          <span className="menu-item">QS code: {this.props.QS}</span>
        </Menu>
      </>
    );
  }
}

function mapStateToProps(state) {
  if (!state.config.loaded || !state.static.loaded) {
    return {
      configLocked: false,
      isMenuOpen: false,
      QS: "null",
      writeLogs: false,
      exposeUpload: false,
      exposeShutdown: false,
      logList: []
    };
  }
  return {
    configLocked: state.config.locked,
    isMenuOpen: state.misc.isMenuOpen,
    QS: state.static.QS,
    writeLogs: state.config.logger.writeToFile,
    exposeUpload: state.static.exposeUpload,
    exposeShutdown: state.static.exposeShutdown,
    logList: state.misc.logList,
    ftpTargets: state.config.FTP.targets
  };
}

export default connect(
  mapStateToProps,
  {
    downloadExcel,
    downloadAllLogs,
    deleteLog,
    deleteAllLogs,
    downloadLog,
    getLogList,
    unlockConfig,
    toggleMenu,
    openMenu,
    closeMenu,
    saveConfig,
    reboot,
    shutdown,
    uploadLog
  }
)(Sidebar);
