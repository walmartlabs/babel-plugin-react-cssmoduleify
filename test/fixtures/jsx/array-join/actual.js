import React from "react";

export default class extends React.Component {
  render() {
    return (
      <div className={["hello", "world"].join(" ")}>
        Base test.
      </div>
    );
  }
};

