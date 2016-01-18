import _cssmodule from "path/to/classnames.css";
import React from "react";

export default class extends React.Component {
  render() {
    const arrayIdentifier = [_cssmodule["good"], _cssmodule[this.props.luck]];
    const beConservative = ["good", "luck"];

    return <div className={[_cssmodule["hello"], _cssmodule["world"]].join(" ")}>
      <div className={arrayIdentifier.join(" ")}>
        <div className={beConservative.map(i => _cssmodule[i] || i).join(" ")}>
          Base test.
          {beConservative.join(" ")}
        </div>
      </div>
    </div>;
  }
};



