import React from "react";

export default class extends React.Component {
  render() {
    return React.createElement(
      "div",
      {className: "base " + "world"},
      "Base test."
    );
  }
};

