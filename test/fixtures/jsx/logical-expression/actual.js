import React from "react";

export default class extends React.Component {
  render() {
    const conservative = ["good", "luck"];

    return (
      <div className={"yup" || conservative.join(" ")}>
        Base test.
        {conservative.map(c => c)}
      </div>
    );
  }
};

