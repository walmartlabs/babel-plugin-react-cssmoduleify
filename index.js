/**
 * Babel plugin to transform React className property values to CSS Module style
 * lookups
 */
export default function ({Plugin, parse, types: t}) {
  const optionsKey = 'react-cssmoduleify';
  let cssModuleId;

  function warn(...args) {
    console.warn(...args);
    console.warn(
      'Please report this at https://github.com/walmartreact/' +
      'babel-plugin-react-cssmoduleify/issues'
    );
  }

  function isValidOptions(options) {
    return typeof options === 'object' && options.path && options.cssmodule;
  }

  /**
   * Enforces plugin options to be defined and returns them.
   */
  function getPluginOptions(file) {
    if (!file.opts || !file.opts.extra) {
      return;
    }

    var pluginOptions = file.opts.extra[optionsKey];

    if (!isValidOptions(pluginOptions)) {
      throw new Error(
        'babel-plugin-react-css-modules requires that you specify extras["' +
        optionsKey + '"] in .babelrc ' + 'or in your Babel Node API call ' +
        'options with "path" and "cssmodule" keys.'
      );
    }
    return pluginOptions;
  }

  /**
  * Transform an AST Node representing a literal string property to an
  * appropriate CSS module-style memberExpression
  *
  * { className: 'hello'} => className: _styles['hello'] }
  * { className: 'hello world'} => className: _styles['hello'] + ' ' + _styles['world'] }
  */
  const mutateStringPropertyToCSSModule = (prop) => {
    const parts = prop.value.value.split(' ').map(v => {
      return t.memberExpression(
        cssModuleId,
        t.literal(v),
        true
      )
    });

    if (parts.length === 1) {
      prop.value = parts[0];
    } else {
      prop.value = parts.reduce((ast, cur, i) => {
        if (!ast) return cur;

        return t.binaryExpression(
          '+',
          t.binaryExpression('+', ast, t.literal(' ')),
          cur
        )
      })
    }
  };

  const isClassnamesIsh = (node) => {
    const reClassnames = /classnames/i;

    if (node.type !== 'CallExpression') {
      return false;
    }

    if (node.callee.type === 'Identifier') {
      return reClassnames.test(node.callee.name);
    }

    let thing = node.callee;

    // babel does this stuff
    if (node.callee.type === 'SequenceExpression') {
      if (node.callee.expressions.length !== 2) return false;
      if (node.callee.expressions[0].value !== 0) return false;

      thing = node.callee.expressions[1];
    }

    if (thing.type === 'Identifier') {
      return reClassnames.test(thing.name);
    } else if (thing.type === 'MemberExpression') {
      return reClassnames.test(thing.object.name);
    }
  };

  const convertStringKeysToComputedProperties = (node) => {
    node.properties.forEach(p => {
      // ensure we're idempotent
      if (
        p.key.type === 'MemberExpression' &&
        p.object === cssModuleId
      ) {
        return;
      }
      p.key = t.memberExpression(
        cssModuleId,
        t.literal(p.key.value),
        true
      );
      p.computed = true;
    });
    return node;
  };

  const mutateClassnamesCall = (node, scope) => {
    node.arguments = node.arguments.map(v => {
      if (v.type === 'Identifier') {
        let bindings;
        while (!(bindings = scope.bindings[v.name]) && scope.parent) {
          scope = scope.parent;
        }

        if (!bindings) {
          return t.memberExpression(
            cssModuleId,
            t.literal(v.name),
            true
          );
        }
        v = bindings.path.node;
        if (v.type === 'VariableDeclarator') {
          v = v.init;
        }
      }

      if (v.type === 'CallExpression') return v;

      if (
        v.type === 'Literal' ||
        v.type === 'BinaryExpression' ||
        v.type === 'ConditionalExpression'
      ) {
        return t.memberExpression(cssModuleId, v, true);
      }

      if (v.type === 'ObjectExpression') {
        return convertStringKeysToComputedProperties(v);
      }

      if (v.type === 'MemberExpression') {
        return v;
      }

      warn('WARNING(TODO): handle mutating classnames call for %s.', v.type);
      return v;
    });
  };

  const computedOrIdentifier = (node) =>
    t.logicalExpression(
      '||',
      t.memberExpression(cssModuleId, node, true),
      node
    );

  const _handleBinaryExpression = (node) => {
    if (node.value === '') return node;

    if (
      node.type === 'MemberExpression'
    ) {
      if (
        node.object.name === 'props' || (
          node.object.property &&
          node.object.property.name === 'props'
        )
      ) {
        return node;
      }

      return t.memberExpression(
        cssModuleId,
        node,
        true
      );
    }

    if (node.type === 'ConditionalExpression') {
      node.consequent = _handleBinaryExpression(node.consequent);
      node.alternate = _handleBinaryExpression(node.alternate);
      return node;
    }

    const parts = node.value.split(' ');
    if (parts.length === 1) {
      return t.memberExpression(
        cssModuleId,
        t.literal(parts[0]),
        true
      );
    }

    return parts.reduce((ast, n) => {
      if (n === '') {
        return ast;
      }

      if (!ast) {
        return typeof n === 'object' ? n
          : t.binaryExpression('+',
              t.memberExpression(
                cssModuleId,
                t.literal(n),
                true
              ),
              t.literal(' ')
            );
      }

      return t.binaryExpression(
        '+',
        t.binaryExpression('+', ast, t.literal(' ')),
        t.binaryExpression('+', t.literal(n), t.literal(' '))
      )
    }, null);
  }

  const handleBinaryExpressionProp = (prop, node, scope, file) => {
    if (prop.value.left.type === 'Literal' || prop.value.right.type === 'Literal') {
      const left = _handleBinaryExpression(prop.value.left);
      const right = _handleBinaryExpression(prop.value.right);
      prop.value.left = left;
      prop.value.right = right;
    }
    else {
      warn('Unhandled BinaryExpression property at %s#%s.', file.opts.filename, prop.loc.start.row);
    }

    return prop;

    if (prop.value.right.type !== 'Literal') {
      prop.value.right = t.memberExpression(
        cssModuleId,
        prop.value.right,
        true
      );
    }
    else {
      prop.value.right = handleProp({key: {name: 'className'}, value: prop.value.right}, node, scope, file).value;
    }
  }

  const handleProp = (prop, node, scope, file) => {
    if (prop.key.name !== 'className') return prop;

    if (prop.value.type === 'Identifier') {
      const binding = scope.bindings[prop.value.name];

      if (!binding) {
        prop.value = computedOrIdentifier(prop.value);
        return prop;
      }

      const {path} = binding;
      if (path.node.init.value) {
        mutateStringPropertyToCSSModule(prop);
      }
      else if (isClassnamesIsh(path.node.init)) {
        mutateClassnamesCall(path.node.init, scope);
      }

      return prop;
    }


    if (prop.value.value) {
      mutateStringPropertyToCSSModule(prop);
    }
    else if (isClassnamesIsh(prop.value)) {
      mutateClassnamesCall(prop.value, scope);
    }
    else if (prop.value.type === 'BinaryExpression') {
      return handleBinaryExpressionProp(prop, node, scope, file);
      return prop;
    }
    else if (prop.value.type === 'ConditionalExpression') {
      prop.value.consequent = handleProp(
        {key: {name: 'className'},
         value: prop.value.consequent
        }, node, scope, file).value;

      prop.value.alternate = handleProp(
        {key: {name: 'className'},
         value: prop.value.alternate
        }, node, scope, file).value;

      return prop;
    }
    else {
      if (
        prop.value.type === 'MemberExpression' ||
        prop.value.type === 'CallExpression' ||
        prop.value.type === 'Literal' && prop.value.value === ''
      ) {
        return prop;
      }

      warn(
        '\n\n' +
        '==================================================\n' +
        'WARNING: unhandled className in %s#%s.\n',
        file.opts.filename,
        node.loc.start.line
      );
    }

    return prop;
  };

  return new Plugin('css-moduleify-plugin', {
    visitor: {
      CallExpression(node, parent, scope, file) {
        if (!this.state.shouldTransform) return;

        if (
          !node.callee.property || (
            node.callee.property.name !== 'createElement' ||
            node.callee.object.name === 'document'
          )
        ) return;

        const {properties} = node.arguments[1];
        if (properties) {
          node.arguments[1].properties = properties.map(prop => handleProp(prop, node, scope, file));
          return;
        } else {
          // an ObjectSpreadProperty was used in the source
          if (
            node.arguments[1].type === 'CallExpression' &&
            node.arguments[1].callee.name.indexOf('extends') !== -1
          ) {
            node.arguments[1].arguments = node.arguments[1].arguments.map(prop => {
              if (prop.type === 'ObjectExpression') {
                prop.properties = prop.properties.map(prop => handleProp(prop, node, scope, file));
              }

              return prop;
            });
          }
        }
      },

      Program: {
        enter (node, parent, scope, file) {
          const opts = getPluginOptions(file);

          if (new RegExp(opts.path).test(file.opts.filename)) {
            // console.log('Program file', file.opts.filename);
            this.state.shouldTransform = true;
            cssModuleId = scope.generateUidIdentifier('cssmodule');
          }
        },

        exit(node, parent, scope, file) {
          if (this.state.shouldTransform !== true) return;

          const {cssmodule} = getPluginOptions(file);

          const cssRequire = t.variableDeclaration('var', [
            t.variableDeclarator(
              cssModuleId,
              t.callExpression(
                t.identifier('require'),
                [t.literal(process.cwd() + '/' + cssmodule)]
              )
            )
          ]);
          let insertIndex;
          node.body.find((n, i) => {
            const result = n.type === 'VariableDeclaration'
              && n.declarations[0].init.type === 'CallExpression'
              && n.declarations[0].init.callee.name === 'require';

            insertIndex = i;
            return result;
          });

          node.body.splice(insertIndex, 0, cssRequire);
        }
      }
    }
  });
}

