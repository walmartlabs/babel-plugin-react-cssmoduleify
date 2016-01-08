import React from "react";
const base = _ => "base"

export default class extends React.Component {
  render() {
    return React.createElement(
      "div",
      {className: base()},
      "Base Test."
    );
  }
};



