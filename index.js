module.exports = /** @class */ (function () {
    function moduleType() {
        var _this = this;
        /**
         * whether it is the module which has require expression at the top of it.
         *
         * example:
         * module a:
         * require('a');
           let a = 123;
           ...
           
           the above 'module a' has top level require expression
      
           AST:
            {
              "type":"Program",
                "body":[
                  {
                    "type": "ExpressionStatement",
                    "expression": {
                      "type": "CallExpression",
                      "callee": {
                        "type": "Identifier",
                        "name": "require"
                      },
                      "arguments": [
                        {
                          "type": "Literal",
                          "value": "a",
                          "raw": "'a'"
                        }
                      ]
                    }
                  },
                  Object{...}
                ],
                "sourceType":"script"
            }
         */
        this.isTopLevelRequire = function (node) {
            if (!node ||
                node.type !== 'Program' ||
                !_this.isArray(node.body) ||
                !node.body[0] ||
                !node.body[0].expression)
                return false;
            return _this.isRequire(node.body[0].expression);
        };
        /**
         * whether it is AMD require expression
         *
         * example:
         * require(['foo'], function(foo) {});
         * AST:
         * {
            "type": "CallExpression",
            "callee": {
              "type": "Identifier",
              "name": "require"
            },
            "arguments": [
              {
                "type": "ArrayExpression",
                "elements": [
                  {
                    "type": "Literal",
                    "value": "foo",
                    "raw": "'foo'"
                  }
                ]
              },
              Object{...}
            ]
          }
         */
        this.isAMDRequire = function (node) {
            return _this.isRequire(node) &&
                _this.isArray(node.arguments) &&
                node.arguments[0] &&
                node.arguments[0].type === 'ArrayExpression';
        };
    }
    moduleType.prototype.isArray = function (param) {
        return Object.prototype.toString.call(param) === "[object Array]";
    };
    /**
     * whether it is AMD define call
     * example:
     * define();
       AST node likes:
        "type": "CallExpression",
        "callee": {
          "type": "Identifier",
          "name": "define"
        }
     */
    moduleType.prototype.isDefine = function (node) {
        if (!node)
            return false;
        var nodeCallee = node.callee;
        return nodeCallee &&
            node.type === 'CallExpression' &&
            nodeCallee.type === 'Identifier' &&
            nodeCallee.name === 'define';
    };
    /**
     * whether it is commonjs require call
     *
     * example:
     * require();
     * AST:
     *
     * {
          "type": "CallExpression",
          "callee": {
            "type": "Identifier",
            "name": "require"
          }
        }
     */
    moduleType.prototype.isRequire = function (node) {
        if (!node)
            return false;
        var nodeCallee = node.callee;
        return nodeCallee &&
            node.type === 'CallExpression' &&
            nodeCallee.type === 'Identifier' &&
            nodeCallee.name === 'require';
    };
    return moduleType;
}());
