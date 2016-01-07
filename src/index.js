/*
type StateOpts = {
  cssmodule: string;
};
*/
import template from "babel-template";

export default function({types: t}) {
  const ROOT_CSSNAMES_IDENTIFIER = 'cssmodule';

  const updateJSXClassName = (value, cssmodule) => {
    if (t.isStringLiteral(value)) {
      return value.replaceWith(
        { type: 'JSXExpressionContainer',
          expression: t.memberExpression(
            cssmodule,
            value.node,
            true
          )
        }
      );
    } else {
      console.log('TODO: updateJSXClassName');
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
        if (path.get('name').node.name !== 'className') {
          return;
        }

        if (!state.cssModuleId) {
          state.cssModuleId = path.scope.generateUidIdentifier(ROOT_CSSNAMES_IDENTIFIER);
        }

        updateJSXClassName(path.get('value'), state.cssModuleId)
      },

      Program: {
        exit(path, state) {
          if (state.cssModuleId) {
            const importOpts = {
              IMPORT_NAME: state.cssModuleId,
              SOURCE: t.stringLiteral(state.opts.cssmodule)
            }

            path.get('body')[0].insertBefore(
              state.opts.modules === "commonjs"
                ? buildRequire(importOpts)
                : buildImport(importOpts)
            );
          }
        }
      }
    }
  };
}

