import _cssmodule from "path/to/classnames.css";
import React from "react";
const base = _ => "base";

export default class extends React.Component {
  render() {
    return <div className={base().split(" ").map(function (i) {
      return _cssmodule[i] || i;
    }).join(" ")}>
      Base test.
    </div>;
  }
};
