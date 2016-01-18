import React from "react";

export default class extends React.Component {
  render() {
    const arrayIdentifier = ["good", "luck"];

    return React.createElement(
      "div",
      { className: this.props.isOpen ? "yup" : arrayIdentifier.join(" ")},
      "Base test."
    );
  }
};

