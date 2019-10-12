import React from "react";
import "../styles/logo.scss";

const Logo = props => {
  return (
    <div className="logo" onClick={props.onClick}>
      <img className="center" src={props.image} alt={props.alt} />
    </div>
  );
};

export default Logo;
