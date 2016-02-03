import React from "react";
const base = "base";

export default class extends React.Component {
  render() {
    return React.createElement(
      "div",
      Object.assign({},
        this.props,
        {className: base}
      ),
      "Base test."
    );
  }
};



