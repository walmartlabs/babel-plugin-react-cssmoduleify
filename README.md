# babel-plugin-react-cssmoduleify

For those who have tasted [CSS Modules](https://github.com/css-modules/css-modules)
it is hard to imagine life without it. At Walmart we have a large number of core
components that still use traditional CSS classNames and global CSS. To allow
for teams to take advantage of CSS Modules, this babel plugin is used to convert
all global styles into CSS Modules.

Please note this is a work in progress and does not account for all JavaScript
constructs yet. It is undergoing the “trial-by-fire” support methodology. If we
detect a currently-unsupported construct we will print a warning to the console
with a link to report it at our issue tracker. Please include as much code as
possible to make it easier for us to add support.


## Usage

* `npm install --save babel-plugin-react-cssmoduleify`

.babelrc

```js
{
  "plugins": [
    "react-cssmoduleify",
  ],
  "extra": {
    "react-cssmoduleify": {
      "path": "node_modules/@walmart/wmreact-",
      "cssmodule": "client/styles/base.styl"
    }
  },
}
```

#### Options:

* `path`: Regex to test if a file should be transformed.
* `cssmodule`: path from `process.cwd()` to global CSS file

## Example

This currently works on only the babel compiled JavaScript and not the original
 source. Adding support the original source would likely be fairly trivial. The
 following example demonstrates the modifications on the babel output of a
 React component.

### Before

```js
"use strict";

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var MyComponent = (function (_React$Component) {
  _inherits(MyComponent, _React$Component);

  function MyComponent(props) {
    _classCallCheck(this, MyComponent);

    _get(Object.getPrototypeOf(MyComponent.prototype), "constructor", this).call(this, props);
  }

  _createClass(MyComponent, [{
    key: "_renderFlyoutConent",
    value: function _renderFlyoutConent() {
      if (this.state.loading) {
        return _react2["default"].createElement(
          "div",
          { className: "lists-spinner" },
          _react2["default"].createElement(_walmartWmreactContainers.Spinner, { loading: true })
        );
      }
      return _react2["default"].createElement(_addToListFlyout2["default"], { lists: this.state.lists, isSignedIn: this.props.isSignedIn });
    }
  }, {
    key: "render",
    value: function render() {
      var addToListTrigger = _react2["default"].createElement(
        _walmartWmreactInteractive.Button,
        {
          className: (0, _classnames2["default"])("btn-inverse")
        },
        this.props.label
      );
      if (this.props.addToListTrigger) {
        addToListTrigger = cloneElement(this.props.addToListTrigger, {});
      }
      return _react2["default"].createElement(
        "div",
        { className: (0, _classnames2["default"])(this.props.className) },
        _react2["default"].createElement(
          _walmartWmreactContainers.Flyout,
          {
            trigger: addToListTrigger,
            direction: this.props.direction,
            onActiveChange: this._onAddToListClicked.bind(this)
          },
          this._renderFlyoutConent()
        )
      );
    }
  }]);

  return MyComponent;
})(_react2["default"].Component);

MyComponent.propTypes = {
  className: _react2["default"].PropTypes.string,
  label: _react2["default"].PropTypes.string,
  direction: _react2["default"].PropTypes.string,
  isSignedIn: _react2["default"].PropTypes.bool,
  addToListTrigger: _react2["default"].PropTypes.func
};

exports["default"] = MyComponent;
module.exports = exports["default"];
```

### After

```js
"use strict";

var _react = require("react");
var _cssmodules = require("/Users/dkasten/project/client/styles/base.styl");

var _react2 = _interopRequireDefault(_react);

var MyComponent = (function (_React$Component) {
  _inherits(MyComponent, _React$Component);

  function MyComponent(props) {
    _classCallCheck(this, MyComponent);

    _get(Object.getPrototypeOf(MyComponent.prototype), "constructor", this).call(this, props);
  }

  _createClass(MyComponent, [{
    key: "_renderFlyoutConent",
    value: function _renderFlyoutConent() {
      if (this.state.loading) {
        return _react2["default"].createElement(
          "div",
          { className: _cssmodules["lists-spinner"] },
          _react2["default"].createElement(_walmartWmreactContainers.Spinner, { loading: true })
        );
      }
      return _react2["default"].createElement(_addToListFlyout2["default"], { lists: this.state.lists, isSignedIn: this.props.isSignedIn });
    }
  }, {
    key: "render",
    value: function render() {
      var addToListTrigger = _react2["default"].createElement(
        _walmartWmreactInteractive.Button,
        {
          className: (0, _classnames2["default"])(_cssmodules["btn-inverse"])
        },
        this.props.label
      );
      if (this.props.addToListTrigger) {
        addToListTrigger = cloneElement(this.props.addToListTrigger, {});
      }
      return _react2["default"].createElement(
        "div",
        { className: (0, _classnames2["default"])(this.props.className) },
        _react2["default"].createElement(
          _walmartWmreactContainers.Flyout,
          {
            trigger: addToListTrigger,
            direction: this.props.direction,
            onActiveChange: this._onAddToListClicked.bind(this)
          },
          this._renderFlyoutConent()
        )
      );
    }
  }]);

  return MyComponent;
})(_react2["default"].Component);

MyComponent.propTypes = {
  className: _react2["default"].PropTypes.string,
  label: _react2["default"].PropTypes.string,
  direction: _react2["default"].PropTypes.string,
  isSignedIn: _react2["default"].PropTypes.bool,
  addToListTrigger: _react2["default"].PropTypes.func
};

exports["default"] = MyComponent;
module.exports = exports["default"];
```


## Caveats

This assumes that you can get all exports into one file. Most CSS Preprocessors
build on the global nature of CSS and have their own internal global worlds.
Importing all of your traditional files into a single file in Stylus or Sass
will likely accomplish this.


## License

The MIT License (MIT)

Copyright (c) 2015 Walmart Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

