import React from "react";
import classnames from "classnames";

export default class extends React.Component {
  render() {
    return React.createElement(
      "div",
      { className: classnames(
          "hello",
          this.hideable(),
          {
            "a": true,
            "b": false
          })
      },
      "Base test."
    );
  }
};




