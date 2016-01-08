import React from "react";

export default class extends React.Component {
  render() {
    const arrayIdentifier = ["good", "luck"];
    const beConservative = ["good", "luck"];

    return React.createElement(
      "div",
      {className: ["hello", "world"].join(" ")},
      React.createElement(
        "div",
        {className: arrayIdentifier.join(" ")},
        React.createElement(
          "div",
          {className: beConservative.join(" ")},
          [
            "Base test.",
            beConservative.join(" ")
          ]
        )
      )
    );
  }
};

