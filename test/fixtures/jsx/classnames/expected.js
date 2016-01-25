import _cssmodule from "path/to/classnames.css";
import React from "react";
import classnames from "classnames";

export default class extends React.Component {
  render() {
    return <div className={classnames("hello", this.hideable(), {
      "a": true,
      "b": false
    }).split(" ").map(function (i) {
      return _cssmodule[i] || i;
    }).join(" ")}>
      Base test.
    </div>;
  }
};
