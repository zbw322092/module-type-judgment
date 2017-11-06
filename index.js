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
        /**
         * whether it is AMD named form. This method only check whether it has AMD name.
         *
         * example:
         * define('a',['jquery'], function($){})
         * AST:
         * {
            "type":"CallExpression",
            "callee":{
              "type":"Identifier",
              "name":"define"
            },
            "arguments":[
              {
                "type": "Literal",
                "value": "a",
                "raw": "'a'"
              },
              Object{...},
              Object{...}
            ]
          }
         */
        this.isAMDNamedForm = function (node) {
            return _this.isDefine &&
                _this.isArray(node.arguments) &&
                node.arguments[0] &&
                node.arguments[0].type === 'Literal';
        };
        /**
         * whether it is AMD dependency form. This method only check whether it has AMD dependencies array.
         *
         * example:
         * define(['jquery'] , function ($) {});
         * AST:
         *{
            "type":"CallExpression",
            "callee":{
              "type":"Identifier",
              "name":"define"
            },
            "arguments":[
              {
                "type": "ArrayExpression",
                "elements": [
                  {
                    "type": "Literal",
                    "value": "jquery",
                    "raw": "'jquery'"
                  }
                ]
              },
              Object{...}
            ]
          }
         */
        this.isAMDDependencyForm = function (node) {
            return _this.isDefine &&
                _this.isArray(node.arguments) &&
                node.arguments[0] &&
                node.arguments[0].type === 'ArrayExpression';
        };
        /**
         * whether it is AMD factory form. This method only check whether it has a function with
         * 'require' parameter, it does not check the content within function body.
         *
         * example:
         * define(function (require) {});
         * AST:
         * {
            "type":"CallExpression",
              "callee":{
              "type":"Identifier",
              "name":"define"
            },
            "arguments":[
              {
                "type": "FunctionExpression",
                "id": null,
                "params": [
                  {
                    "type": "Identifier",
                    "name": "require"
                  }
                ],
                "body": {
                  "type": "BlockStatement",
                  "body": [
      
                  ]
                },
                "generator": false,
                "expression": false,
                "async": false
              }
            ]
          }
         */
        this.isAMDFactoryForm = function (node) {
            return _this.isDefine &&
                _this.isArray(node.arguments) &&
                node.arguments[0] &&
                node.arguments[0].type === 'FunctionExpression' &&
                _this.isArray(node.arguments[0].params) &&
                node.arguments[0].params[0] &&
                node.arguments[0].params[0].type === 'Identifier' &&
                node.arguments[0].params[0].name === 'require';
        };
        /**
         * whether it is AMD no dependency form.
         *
         * example:
         * define({
            color: "black",
            size: "unisize"
           });
      
           AST:
          {
            "type":"CallExpression",
            "callee":{
              "type":"Identifier",
              "name":"define"
            },
            "arguments":[
              {
                "type": "ObjectExpression",
                "properties": [
      
                ]
              }
            ]
          }
         */
        this.isAMDNoDependencyForm = function (node) {
            return _this.isDefine(node) &&
                _this.isArray(node.arguments) &&
                node.arguments[0].type === 'ObjectExpression';
        };
        /**
         * whether it is AMD with simplified CommonJS wrapper.
         *
         * example:
         * define(function(require, exports, module) {});
         * AST:
         * {
            "type":"CallExpression",
            "callee":{
              "type":"Identifier",
              "name":"define"
            },
            "arguments":[
              {
                "type": "FunctionExpression",
                "id": null,
                "params": [
                  {
                    "type": "Identifier",
                    "name": "require"
                  },
                  {
                    "type": "Identifier",
                    "name": "exports"
                  },
                  {
                    "type": "Identifier",
                    "name": "module"
                  }
                ],
                "body": {
                  "type": "BlockStatement",
                  "body": [
      
                  ]
                },
                "generator": false,
                "expression": false,
                "async": false
              }
            ]
          }
         */
        this.isAMDCommonJSWrapperForm = function (node) {
            if (!_this.isDefine(node) ||
                !_this.isArray(node.arguments) ||
                !node.arguments[0] ||
                node.arguments[0].type !== 'FunctionExpression' ||
                !_this.isArray(node.arguments[0].params) ||
                node.arguments[0].params.length !== 3)
                return false;
            var params = node.arguments[0].params;
            return params[0].type === 'Identifier' && params[0].name === 'require' &&
                params[1].type === 'Identifier' && params[1].name === 'exports' &&
                params[2].type === 'Identifier' && params[2].name === 'module';
        };
        /**
         * whether it is ES6 import expression.
         * Reference:
         * https://github.com/estree/estree/blob/master/es2015.md#imports
         *
         * example 1:
         * import a from "module-name";
         * AST:
         * {
            "type":"ImportDeclaration",
            "specifiers":[
                {
                  "type": "ImportDefaultSpecifier",
                  "local": {
                    "type": "Identifier",
                    "name": "a"
                  }
                }
              ],
            "source":{
              "type":"Literal",
              "value":"./a",
              "raw":"'./a'"
            }
          }
      
          example 2:
          import {a} from "module-name";
          AST:
          {
            "type": "ImportDeclaration",
              "specifiers": [
                {
                  "type": "ImportSpecifier",
                  "local": {
                    "type": "Identifier",
                    "name": "a"
                  },
                  "imported": {
                    "type": "Identifier",
                    "name": "a"
                  }
                }
              ],
            "source": {
              "type": "Literal",
              "value": "module-name",
              "raw": "\"module-name\""
            }
          }
      
          example 3:
          import * as name from "module-name";
          AST:
          {
            "type": "ImportDeclaration",
            "specifiers": [
                {
                  "type": "ImportNamespaceSpecifier",
                  "local": {
                    "type": "Identifier",
                    "name": "name"
                  }
                }
              ],
            "source": {
              "type": "Literal",
              "value": "module-name",
              "raw": "\"module-name\""
            }
          }
         */
        this.isES6Import = function (node) {
            if (!node)
                return false;
            switch (node.type) {
                case 'ImportDeclaration':
                case 'ImportDefaultSpecifier':
                case 'ImportSpecifier':
                case 'ImportNamespaceSpecifier':
                    return true;
            }
            return false;
        };
        /**
         * whether it is ES6 export expression.
         * Reference:
         * https://github.com/estree/estree/blob/master/es2015.md#exports
         *
         * example:
         * export { a };
         * AST:
         * {
            "type": "ExportNamedDeclaration",
            "declaration": null,
            "specifiers": [
              {
                "type": "ExportSpecifier",
                "exported": {
                  "type": "Identifier",
                  "name": "a"
                },
                "local": {
                  "type": "Identifier",
                  "name": "a"
                }
              }
            ],
            "source": null
          }
         */
        this.isES6Export = function (node) {
            if (!node)
                return false;
            switch (node.type) {
                case 'ExportNamedDeclaration':
                case 'ExportSpecifier':
                case 'ExportDefaultDeclaration':
                case 'ExportAllDeclaration':
                    return true;
            }
            return false;
        };
        /**
         * whether it is commonJS exports expression.
         *
         * example:
         * module.exports.foo = function() {};
         * AST:
         * {
              "type":"AssignmentExpression",
              "operator":"=",
              "left":{
                "type":"MemberExpression",
                "computed":false,
                "object":{
                  "type":"MemberExpression",
                  "computed":false,
                  "object":{
                    "type":"Identifier",
                    "name":"module"
                  },
                  "property":{
                    "type":"Identifier",
                    "name":"exports"
                  }
                },
                "property":{
                  "type":"Identifier",
                  "name":"foo"
                }
            },
            "right":Object{...}
          }
         */
        this.isExports = function (node) {
            if (!node || node.type !== 'AssignmentExpression' || !node.left)
                return false;
            // we just care about the left part of AST object.
            var nodeLeft = node.left;
            function isExportsIdentifier(obj) {
                return obj && obj.type === 'Identifier' && obj.name === 'exports';
            }
            function isModuleIdentifier(obj) {
                return obj && obj.type === 'Identifier' && obj.name === 'module';
            }
            // eg. module.exports.foo
            function isModuleExportsAttach() {
                if (!nodeLeft.object ||
                    !nodeLeft.property ||
                    !nodeLeft.object.object ||
                    !nodeLeft.object.property)
                    return false;
                return nodeLeft.type === 'MemberExpression' &&
                    nodeLeft.object.type === 'MemberExpression' &&
                    isExportsIdentifier(nodeLeft.object.property) &&
                    isModuleIdentifier(nodeLeft.object.object);
            }
            // eg. module.exports
            function isModuleExportsAssign() {
                return nodeLeft.object &&
                    nodeLeft.property &&
                    nodeLeft.type === 'MemberExpression' &&
                    isExportsIdentifier(nodeLeft.property) &&
                    isModuleIdentifier(nodeLeft.object);
            }
            // eg. exports = {}
            function isExportsAssign() {
                return isExportsIdentifier(nodeLeft);
            }
            // eg. exports.foo
            function isExportsAttach() {
                return node.type === 'MemberExpression' &&
                    isExportsIdentifier(nodeLeft.object);
            }
            return isModuleExportsAttach() ||
                isModuleExportsAssign() ||
                isExportsAssign() ||
                isExportsAttach();
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
