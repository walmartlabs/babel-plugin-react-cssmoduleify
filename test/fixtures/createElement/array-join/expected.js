import _cssmodule from "path/to/classnames.css";
import React from "react";

export default class extends React.Component {
  render() {
    const arrayIdentifier = [_cssmodule["good"], _cssmodule[this.props.good]];
    const beConservative = ["good", "luck"];

    return React.createElement("div", { className: [_cssmodule["hello"], _cssmodule["world"]].join(" ") }, React.createElement("div", { className: arrayIdentifier.join(" ") }, React.createElement("div", { className: beConservative.map(i => _cssmodule[i]).join(" ") }, ["Base test.", beConservative.join(" ")])));
  }
};

