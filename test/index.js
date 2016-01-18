/* global describe, it */
/* eslint no-invalid-this: 0 */
process.env.NODE_ENV = "test";

const assertTransform = require("assert-transform");
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
  ["jsx", "createElement", "compiled"].forEach((type) => {
    describe(type, () => {
      it("should transform simple literals", test(type)("string"));
      it("should transform multiple-class string literals", test(type)("string-multiple"));
      it("should transform JSXExpressionContainer values", test(type)("string-jsx-expression"));
      it("should transform *.join(\" \") expressions", test(type)("array-join"));
      it("should transform simple identifier expressions", test(type)("identifier"));
      it("should transform a simple call expression", test(type)("call-expression"));
      it("should transform a classnames call", test(type)("classnames"));
      it("should transform a spread assignment", test(type)("jsx-spread"));
    });
  });
});

