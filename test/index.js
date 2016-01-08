/* global describe, before, it */
/* eslint no-invalid-this: 0 */
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

const test = (type, babelOptions) => (testCase) => () =>
  assertTransform(
    path.join(__dirname, "fixtures", type, testCase, "actual.js"),
    path.join(__dirname, "fixtures", type, testCase, "expected.js"),
    babelOptions || BABEL_OPTIONS
  );

describe("babel-plugin-react-cssmoduleify", () => {
  before(function () {
    // TODO: lol @baer babel does push ups!
    this.timeout(10000);
    babel.transform("const x = 1;", BABEL_OPTIONS);
  });

  it("should transform simple literals", test("jsx")("string"));
  it("should transform multiple-class string literals", test("jsx")("string-multiple"));
  it("should transform JSXExpressionContainer values", test("jsx")("string-multiple"));
  it("should transform *.join(\" \") expressions", test("jsx")("array-join"));
  it("should transform simple identifier expressions", test("jsx")("identifier"));
});

