import _cssmodule from "path/to/classnames.css";
import React from "react";
import classname from "classnames";
import externalProps from "./props";

export default class extends React.Component {
  render() {
    const classes = classname("hello", {
      "world": true
    }).split(" ").map(i => _cssmodule[i]).join(" ");

    const props = {
      className: classes
    };

    for (const p in this.props) {
      if (/^on/.test(p)) {
        // ignore
      }
    };

    return React.createElement("div", props, React.createElement("div", externalProps, "Base test."));
  }
};


