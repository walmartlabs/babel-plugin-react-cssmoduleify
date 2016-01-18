import _cssmodule from "path/to/classnames.css";
import React from "react";

export default class extends React.Component {
  render() {
    const conservative = ["good", "luck"];

    return <div className={_cssmodule["yup"] || conservative.map(i => _cssmodule[i] || i).join(" ")}>
      Base test.
      {conservative.map(c => c)}
    </div>;
  }
};



