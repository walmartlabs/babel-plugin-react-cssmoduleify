import React from "react";
const base = "base";

export default class extends React.Component {
  render() {
    return (
      <div {...this.props} className={base}>
        Base test.
      </div>
    );
  }
};



