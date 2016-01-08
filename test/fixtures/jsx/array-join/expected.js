import _cssmodule from "path/to/classnames.css";
import React from "react";

export default class extends React.Component {
  render() {
    const arrayIdentifier = [_cssmodule["good"], _cssmodule["luck"]];
    const beConservative = ["good", "luck"];

    return <div className={[_cssmodule["hello"], _cssmodule["world"]].join(" ")}>
      <div className={arrayIdentifier.join(" ")}>
        <div className={beConservative.map(i => _cssmodule[i]).join(" ")}>
          Base test.
          {beConservative.join(" ")}
        </div>
      </div>
    </div>;
  }
};



