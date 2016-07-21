/* eslint no-extra-parens: 0 */
type Path<node> = {
  node: node;
  scope: any;
  matchesPattern: (pattern:string) => boolean;
};

type StateOpts = {
  cssmodule: string;
  modules: "commonjs"|"es6";
  path: string;
};

type State = {
  opts: StateOpts
};

import template from "babel-template";
import generate from "babel-generator";
import find from "array-find";
import {join} from "path";

const LOG_CACHE = {};

/**
 * Convenience method to log additional work to do a single time per node type.
 *
 * @param {string} fnName function being called
 * @param {Node} node AST node
 * @param {Path} [path] optional AST Path for printing additional context.
 **/
const LogOnceImplementation = (fnName, node, path) => {
  const name = `${fnName}-${node.type}`;
  if (!LOG_CACHE[name]) {
    LOG_CACHE[name] = true;
    console.log(
      "babel-plugin-react-cssmoduleify WARNING(%s): unhandled node type `%s`.\n%s\n",
      fnName,
      node.type,
      generate(path ? path.node : node).code
    );
  }
};

export default ({types: t}) => { // eslint-disable-line
  // by default logging is a noop, but it is configurable
  let logOnce = () => {};

  const ROOT_CSSNAMES_IDENTIFIER = "cssmodule";
  const BAIL_OUT = "__dontTransformMe";

  const matchesPatterns = (path:Path<any>, patterns:Array<string>) => (
    !!find(patterns, (pattern) => (
      t.isIdentifier(path.node, { name: pattern }) ||
      path.matchesPattern(pattern)
    ))
  );

  /**
   * Updates a ConditionalExpression consequent or alternate node with the most
   * appropriate CSS Module lookup.
   *
   * @param {Path} path consequent or alternate node of a conditional expression
   * @param {Node<Identifier>} cssmodule cssmodule identifier
   */
  const replaceConditionalExpression = (path, cssmodule) => {
    return path.replaceWith(computeClassName(path, cssmodule)); // eslint-disable-line
  };

  /**
   * Generate the string concat version of the following TemplateElements
   * `${ slot } ${ anotherslot }`
   */
  const stringConcat = (cssmodule, values) => {
    const copy = values.slice(0);
    const first = copy.shift();
    const concat = (left, right) => {
      return t.binaryExpression("+", left, right || t.stringLiteral(" "));
    };
    return copy.reduce((expr, v, i) => {
      // short circuit empty strings. this happens with something like:
      // {className: "hello " + "world"}
      if (v === "") {
        return expr;
      }
      const cssModule = t.memberExpression(cssmodule, t.stringLiteral(v), true);
      return concat(expr, (i === copy.length - 1) ? cssModule : concat(cssModule));
    }, concat(t.memberExpression(cssmodule, t.stringLiteral(first), true)));
  };

  const maybeCSSModuleExpression = (node, cssmodule) =>
    t.logicalExpression(
      "||",
      t.memberExpression(cssmodule, node, true),
      node
    );

  const computeClassName = (value, cssmodule) => {
    if (t.isStringLiteral(value)) {
      if (value.node.value === "") {
        return value.node;
      }
      const values = value.node.value.split(" ");
      return values.length === 1
        ? t.memberExpression(cssmodule, t.stringLiteral(values[0]), true)
        : stringConcat(cssmodule, values);
    } else if (t.isIdentifier(value)) {
      // TODO: need to validate what type of node this identifier refers to
      return t.memberExpression(cssmodule, value.node, true);
    } else if (t.isMemberExpression(value)) {
      return t.memberExpression(cssmodule, value.node, true);
    } else if (t.isConditionalExpression(value)) {
      replaceConditionalExpression(value.get("consequent"), cssmodule);
      replaceConditionalExpression(value.get("alternate"), cssmodule);
      return value.node;
    } else {
      logOnce("computeClassName", value.node);
      return value.node;
    }
  };

  const isArrayJoin = (path) => {
    return (
      t.isCallExpression(path.node) &&
      t.isMemberExpression(path.node.callee) &&
      t.isIdentifier(path.node.callee.property, {name: "join"}) && (
        t.isArrayExpression(path.node.callee.object) ||
        t.isIdentifier(path.node.callee.object) // TODO: resolve identifier
      )
    );
  };

  /**
   * Resolves a path to most conservative Path to be converted. If there is only
   * one reference to an Identifier we can mutate that safely, otherwise we
   * return the original node to be transformed.
   *
   * @param {Path} path an Identifier or ArrayExpression Path
   * @return {Path} the conservatively resolved path
   */
  const conservativeResolve = (path) => {
    // if it’s not an identifier we already have what we need
    if (!t.isIdentifier(path.node)) {
      return path;
    }
    const binding = path.scope.getBinding(path.node.name);

    // if there is only one reference, we can mutate that directly
    if (binding.references === 1) {
      if (t.isVariableDeclarator(binding.path)) {
        return binding.path.get("init");
      }
      console.warn("TODO: ensure this branch is tracked");
      return binding.path;
    }

    // else we should probably return conservatively only the one we want and
    // transform inline
    return path;
  };

  /**
   * Replaces [...].join(" ") or identifier.join(" ") with the most appropriate
   * cssmodule lookup hash.
   *
   * @param {Path<Identifier|ArrayExpression>} path an Identifier or ArrayExpression Path
   * @param {Node<Identifier>} cssmodule the root identifier to the cssmodules object
   */
  const replaceArrayJoinElements = (path, cssmodule) => {
    const arrayExpressionPath = conservativeResolve(path.get("callee").get("object"));
    if (t.isIdentifier(arrayExpressionPath)) {
      arrayExpressionPath.parent.object =
        t.callExpression(
          t.memberExpression(
            arrayExpressionPath.node,
            t.identifier("map"),
            false
          ),
          [t.functionExpression(
            null,
            [t.identifier("i")],
            t.blockStatement([
              t.returnStatement(maybeCSSModuleExpression(t.identifier("i"), cssmodule))
            ])
          )]
        );
      return;
    }

    for (let i = 0; i < arrayExpressionPath.node.elements.length; i++) {
      const element = arrayExpressionPath.get("elements", i)[i];
      element.replaceWith(computeClassName(element, cssmodule));
    }
  };

  /**
   * Replaces React.createElement(..., path, ...) with the most appropriate
   * cssmodule lookup hash.
   *
   * @param {Path<Identifier} path an Identifier Path
   * @param {Node<Identifier>} cssmodule the root identifier to the cssmodules object
   */
  const replaceIdentifier = (path, cssmodule) => { // eslint-disable-line
    const binding = path.scope.getBinding(path.node.name);

    const updateProperty = (property) => {
      if (property.node.key.name === "className") {
        updateClassName(property.get("value"), cssmodule); // eslint-disable-line
      }
    };

    if (t.isVariableDeclarator(binding.path)) {
      // if there is only one reference, we can mutate that directly
      // we're assuming a props identifier is only used in local props so this
      // is technically a destructive transform.
      if (binding.references > 1) {
        logOnce("replaceIdentifier", {type: "with multiple references"}, binding.path);
      }

      const sourceNode = binding.path.get("init");
      if (t.isNullLiteral(sourceNode)) {
        return;
      } else if (t.isCallExpression(sourceNode)) {
        sourceNode.get("arguments").forEach((arg) => {
          if (t.isObjectExpression(arg)) {
            arg.get("properties").forEach(updateProperty);
          }
        });
      } else if (t.isObjectExpression(sourceNode)) {
        sourceNode.get("properties").forEach(updateProperty);
      } else if (t.isIdentifier(sourceNode)) {
        replaceIdentifier(sourceNode, cssmodule);
      } else {
        updateClassName(sourceNode, cssmodule); // eslint-disable-line
      }
    } else {
      logOnce("replaceIdentifier[maybe]", binding.path.node, binding.path);
    }
  };

  /**
   * Updates a callExpression value with the most appropriate CSS Module lookup.
   *
   * @param {Path} callExpression <jsx className={value()} />
   * @param {Node<Identifier>} cssmodule cssmodule identifier
   */
  const replaceCallExpression = (callExpression, cssmodule) => {
    if (isArrayJoin(callExpression)) {
      return replaceArrayJoinElements(callExpression, cssmodule);
    }

    // this is just mean
    callExpression.replaceWith(
      t.callExpression(
        t.memberExpression(
          t.callExpression(
            t.memberExpression(
              t.callExpression(
                t.memberExpression(callExpression.node, t.identifier("split"), false),
                [t.stringLiteral(" ")]
              ),
              t.identifier("map")
            ),
            [t.functionExpression(
              null,
              [t.identifier("i")],
              t.blockStatement([
                t.returnStatement(maybeCSSModuleExpression(t.identifier("i"), cssmodule))
              ])
            )]
          ),
          t.identifier("join"),
          false
        ),
        [t.stringLiteral(" ")]
      )
    );
  };

  const updateClassName = (value, cssmodule) => {
    if (t.isStringLiteral(value)) {
      value.replaceWith(computeClassName(value, cssmodule));
    } else if (t.isMemberExpression(value)) {
      value.replaceWith(computeClassName(value, cssmodule));
    } else if (t.isIdentifier(value)) {
      const binding = value.scope.getBinding(value.node.name);

      if (t.isVariableDeclarator(binding.path.node)) {
        updateClassName(binding.path.get("init"), cssmodule);
      } else {
        value.replaceWith(computeClassName(value, cssmodule));
      }
    } else if (t.isCallExpression(value)) {
      replaceCallExpression(value, cssmodule);
    } else if (t.isObjectProperty(value)) {
      updateClassName(value.get("value"), cssmodule);
    } else if (t.isConditionalExpression(value)) {
      updateClassName(value.get("consequent"), cssmodule);
      updateClassName(value.get("alternate"), cssmodule);
    } else if (t.isLogicalExpression(value) || t.isBinaryExpression(value)) {
      updateClassName(value.get("left"), cssmodule);
      updateClassName(value.get("right"), cssmodule);
    } else {
      logOnce("updateClassName", value);
    }
  };

  /**
   * Updates a JSX className value with the most appropriate CSS Module lookup.
   *
   * @param {Path} value <jsx className={value} />
   * @param {Node<Identifier>} cssmodule cssmodule identifier
   */
  const updateJSXClassName = (value, cssmodule) => {
    if (!t.isJSXExpressionContainer(value)) {
      value.replaceWith({
        type: "JSXExpressionContainer",
        expression: value.node
      });
    }
    updateClassName(value.get("expression"), cssmodule);
  };

  const buildRequire = template(`
    var IMPORT_NAME = require(SOURCE);
  `);

  // TODO: template doesn't work for import.
  const buildImport = ({IMPORT_NAME, SOURCE}) =>
    t.importDeclaration(
      [t.importDefaultSpecifier(IMPORT_NAME)], SOURCE
    );

  return {
    visitor: {
      JSXAttribute(path, state) {
        if (state[BAIL_OUT]) {
          return;
        }

        if (path.get("name").node.name !== "className") {
          return;
        }

        if (!state.cssModuleId) {
          state.cssModuleId = path.scope.generateUidIdentifier(ROOT_CSSNAMES_IDENTIFIER);
        }

        updateJSXClassName(path.get("value"), state.cssModuleId);
      },

      CallExpression(path, state) {
        if (state[BAIL_OUT]) {
          return;
        }

        const isCreateElementCall = matchesPatterns(
          path.get("callee"),
          ["React.createElement", "_react2.default.createElement"]
        );

        if (!isCreateElementCall) {
          return;
        }

        if (!state.cssModuleId) {
          state.cssModuleId = path.scope.generateUidIdentifier(ROOT_CSSNAMES_IDENTIFIER);
        }

        const updateProperty = (property) => {
          if (property.node.key.name === "className") {
            updateClassName(property.get("value"), state.cssModuleId);
          }
        };

        const argument = path.get("arguments")[1];
        if (t.isNullLiteral(argument)) {
          return;
        } else if (t.isCallExpression(argument)) {
          argument.get("arguments").forEach((arg) => {
            if (t.isObjectExpression(arg)) {
              arg.get("properties").forEach(updateProperty);
            }
          });
        } else if (t.isObjectExpression(argument)) {
          argument.get("properties").forEach(updateProperty);
        } else if (t.isIdentifier(argument)) {
          replaceIdentifier(argument, state.cssModuleId);
        } else {
          logOnce("CallExpression Visitor", argument.node, path);
        }
      },

      Program: {
        enter(path, state:State) {
          if (state.opts.log) {
            logOnce = LogOnceImplementation;
          }

          if (!state.opts.path || new RegExp(state.opts.path).test(state.file.opts.filename)) {
            // detect if this is likely compiled source
            if (path.scope.getBinding("_interopRequireDefault")) {
              state.transformingOutput = true;
              state.cssModuleId = path.scope.generateUidIdentifier(ROOT_CSSNAMES_IDENTIFIER);
            }
          } else {
            state[BAIL_OUT] = true;
          }
        },

        exit(path, state:State) {
          if (state[BAIL_OUT]) {
            return;
          }

          if (state.cssModuleId) {
            const importOpts = {
              IMPORT_NAME: state.cssModuleId,
              SOURCE: t.stringLiteral(join(
                process.env.NODE_ENV === "test" ? "" : process.cwd(),
                state.opts.cssmodule
              ))
            };

            const firstChild = path.get("body")[0];
            const {leadingComments} = firstChild.node;
            delete firstChild.node.leadingComments;

            // currently we’re using the heuristic if the module system is using
            // commonjs then we'll export as commonjs
            path.get("body")[0].insertBefore(
              state.opts.modules === "commonjs" || state.transformingOutput
                ? buildRequire(importOpts)
                : buildImport(importOpts)
            );
            path.get("body")[0].node.leadingComments = leadingComments;
          }
        }
      }
    }
  };
};

