import _cssmodule from "path/to/classnames.css";
import React from "react";

export default class extends React.Component {
  render() {
    const arrayIdentifier = [_cssmodule["good"], _cssmodule["luck"]];

    return React.createElement("div", { className: this.props.isOpen ? _cssmodule["yup"] : arrayIdentifier.join(" ") }, "Base test.");
  }
};



