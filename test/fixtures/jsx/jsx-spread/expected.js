import _cssmodule from "path/to/classnames.css";
import React from "react";
const base = _cssmodule["base"];

export default class extends React.Component {
  render() {
    return <div {...this.props} className={base}>
      Base test.
    </div>;
  }
};



