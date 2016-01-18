import React from "react";

export default class extends React.Component {
  render() {
    const arrayIdentifier = ["good", this.props.luck];
    const beConservative = ["good", "luck"];

    return (
      <div className={["hello", "world"].join(" ")}>
        <div className={arrayIdentifier.join(" ")}>
          <div className={beConservative.join(" ")}>
            Base test.
            {beConservative.join(" ")}
          </div>
        </div>
      </div>
    );
  }
};

