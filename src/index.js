type StateOpts = {
  cssmodule: string;
  modules: "commonjs"|"es6";
};

type State = {
  opts: StateOpts
};

import template from "babel-template";

/**
 * TemplateElement value nodes must be of the shape {raw: string; value: string}
 */
const templateElementValue = (value) => ({raw: value, cooked: value});


export default ({types: t}) => {
  const ROOT_CSSNAMES_IDENTIFIER = "cssmodule";

  /**
   * Generate the required TemplateElements for the following type of template:
   * `${ slot } ${ anotherslot }`
   */
  const spacedTemplateElements = (count) =>
    Array.apply(0, Array(count)).map((_, i) =>
      i === 0 || i === count - 1
        ? t.templateElement(templateElementValue(""), i === count)
        : t.templateElement(templateElementValue(" "), false)
    );

  const updateJSXClassName = (value, cssmodule) => {
    if (t.isStringLiteral(value)) {
      const values = value.node.value.split(" ");
      return value.replaceWith(
        { type: "JSXExpressionContainer",
          expression: t.templateLiteral(
            spacedTemplateElements(values.length + 1),
            values.map((v) => t.memberExpression(
              cssmodule,
              t.stringLiteral(v),
              true
            ))
          )
        }
      );
    } else {
      console.log("TODO: updateJSXClassName");
    }
  };

  const buildRequire = template(`
    const IMPORT_NAME = require(SOURCE);
  `);

  // TODO: template doesn't work for import.
  const buildImport = ({IMPORT_NAME, SOURCE}) =>
    t.importDeclaration(
      [t.importDefaultSpecifier(IMPORT_NAME)], SOURCE
    );

  return {
    visitor: {
      JSXAttribute(path, state) {
        if (path.get("name").node.name !== "className") {
          return;
        }

        if (!state.cssModuleId) {
          state.cssModuleId = path.scope.generateUidIdentifier(ROOT_CSSNAMES_IDENTIFIER);
        }

        updateJSXClassName(path.get("value"), state.cssModuleId);
      },

      Program: {
        exit(path, state:State) {
          if (state.cssModuleId) {
            const importOpts = {
              IMPORT_NAME: state.cssModuleId,
              SOURCE: t.stringLiteral(state.opts.cssmodule)
            };

            path.get("body")[0].insertBefore(
              state.opts.modules === "commonjs"
                ? buildRequire(importOpts)
                : buildImport(importOpts)
            );
          }
        }
      }
    }
  };
};

