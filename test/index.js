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

  ["jsx", "createElement"].forEach((type) => {
    describe(type, () => {
      it("should transform simple literals", test(type)("string"));
      it("should transform multiple-class string literals", test(type)("string-multiple"));
      it("should transform JSXExpressionContainer values", test(type)("string-jsx-expression"));
      it("should transform *.join(\" \") expressions", test(type)("array-join"));
      it("should transform simple identifier expressions", test(type)("identifier"));
      it("should transform a simple call expression", test(type)("call-expression"));
      it("should transform a classnames call", test(type)("classnames"));
    });
  });
});

