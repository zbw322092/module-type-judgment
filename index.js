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
                Object.prototype.toString.call(node.body) !== "[object Array]" ||
                !node.body[0] ||
                !node.body[0].expression)
                return false;
            return _this.isRequire(node.body[0].expression);
        };
    }
    /**
     * whether it is AMD define expression
     * example:
     * define(['jquery'] , function ($) {
        return function () {};
       });
       AST node likes:
        "expression":{
          "type":"CallExpression",
          "callee":{
            "type":"Identifier",
            "name":"define"
          },
          "arguments":Array[2]
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
     * whether it is commonjs require expression
     *
     * example:
     * require('a');
     * AST:
     *
     * {
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
