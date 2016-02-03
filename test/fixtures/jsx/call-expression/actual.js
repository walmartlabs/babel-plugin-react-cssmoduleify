import React from "react";
const base = _ => "base"

export default class extends React.Component {
  render() {
    return (
      <div className={base()}>
        Base test.
      </div>
    );
  }
};



