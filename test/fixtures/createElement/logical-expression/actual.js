import React from "react";

export default class extends React.Component {
  render() {
    const conservative = ["good", "luck"];

    return React.createElement(
      "div",
      {className: "yup" || conservative.join(" ")},
      [
        "Base test.",
        conservative.map(c => c)
      ]
    );
  }
};

