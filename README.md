# babel-plugin-react-cssmoduleify

[![Build Status](https://travis-ci.org/walmartreact/babel-plugin-react-cssmoduleify.svg)](https://travis-ci.org/walmartreact/babel-plugin-react-cssmoduleify)

> **Note**: this plugin now requires Babel 6. To use the Babel 5 support ensure
> you continue using the pre 1.0 release.

For those who have tasted [CSS Modules](https://github.com/css-modules/css-modules)
it is hard to imagine life without it. At Walmart we have a large number of core
components that still use traditional CSS classNames and global CSS. This babel
plugin is used to convert all global styles into CSS Modules to allow teams to
opt-in to CSS Modules.

Previously this attempted to be rather aggressive in it’s resolving of className
calls. The current implementation is much simpler and therefore should also
support more use cases. Currently `classNames` must be a `string`, so we can
take any complex assignment and do the lookup on the fly.

It detects the correct `className` calls in both JSX, React.createElement, and
compiled JSX output.

## Usage

* `npm install --save babel-plugin-react-cssmoduleify`

.babelrc

```js
{
  "plugins": [
    "babel-plugin-react-cssmoduleify",, {
      "cssmodule": "client/styles/base.styl"
      "modules": "es6"
    }
  ],
}
```

#### Options:

* `cssmodule`: `string`: path from `process.cwd()` to global CSS file
* `modules`: `"es6"|"commonjs"` the type of module system cssmodule should be required as.

## Examples

Look at the unit tests to see what the output is.

## Caveats

This assumes that you can get all exports into one file. Most CSS Preprocessors
build on the global nature of CSS and have their own internal global worlds.
Importing all of your traditional files into a single file in Stylus or Sass
will likely accomplish this.

## MIT License

Copyright (c) 2015 Walmart Labs

