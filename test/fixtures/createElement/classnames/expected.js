import _cssmodule from "path/to/classnames.css";
import React from "react";
import classnames from "classnames";

export default class extends React.Component {
  render() {
    return React.createElement("div", { className: classnames("hello", this.hideable(), {
      "a": true,
      "b": false
        }).split(" ").map(i => _cssmodule[i]).join(" ")
      }, "Base test.");
  }
};





