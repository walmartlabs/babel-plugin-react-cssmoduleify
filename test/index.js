const assertTransform = require("assert-transform");
const babel = require("babel-core");
const path = require("path");

const BABEL_OPTIONS = {
  presets: [],
  plugins: [
    "syntax-jsx",
    ["../lib/index.js", {
      "cssmodule": "path/to/classnames.css"
    }]
  ]
};

const file = (a, b) => path.join(__dirname, "fixtures", a, b + ".js");

describe("babel-plugin-react-cssmoduleify", function() {
  before(function () {
    // TODO: lol @baer babel does push ups!
    this.timeout(10000);
    babel.transform("const x = 1;", BABEL_OPTIONS);
  });

  it("should transform some sheesh", () => (
    assertTransform(
      file("base", "actual"),
      file("base", "expected"),
      BABEL_OPTIONS
    )
  ));
});
