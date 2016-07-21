import _cssmodule from "path/to/classnames.css";
import React from "react";

export default class extends React.Component {
  render() {
    return <div className={_cssmodule["base"] + " " + _cssmodule["world"]}>
      Base test.
    </div>;
  }
};

