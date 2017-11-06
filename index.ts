module.exports = class moduleType {
  private isArray(param: any): boolean {
    return Object.prototype.toString.call(param) === "[object Array]"
  }

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
  isDefine(node: any): boolean {
    if (!node) return false;

    let nodeCallee = node.callee;

    return nodeCallee &&
      node.type === 'CallExpression' &&
      nodeCallee.type === 'Identifier' &&
      nodeCallee.name === 'define';
  }

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
  isRequire(node: any): boolean {
    if (!node) return false;

    let nodeCallee = node.callee;

    return nodeCallee &&
      node.type === 'CallExpression' &&
      nodeCallee.type === 'Identifier' &&
      nodeCallee.name === 'require';
  }

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
  isTopLevelRequire = (node: any): boolean => {
    if (
      !node ||
      node.type !== 'Program' ||
      !this.isArray(node.body) ||
      !node.body[0] ||
      !node.body[0].expression
    ) return false;

    return this.isRequire(node.body[0].expression);
  }

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
  isAMDRequire = (node: any): boolean => {
    return this.isRequire(node) &&
      this.isArray(node.arguments) &&
      node.arguments[0] &&
      node.arguments[0].type === 'ArrayExpression';
  }

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
  isAMDNamedForm = (node: any): boolean => {
    return this.isDefine &&
      this.isArray(node.arguments) &&
      node.arguments[0] &&
      node.arguments[0].type === 'Literal';
  }

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
  isAMDDependencyForm = (node: any): boolean => {
    return this.isDefine &&
      this.isArray(node.arguments) &&
      node.arguments[0] &&
      node.arguments[0].type === 'ArrayExpression';
  }

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
  isAMDFactoryForm = (node: any): boolean => {
    return this.isDefine &&
      this.isArray(node.arguments) &&
      node.arguments[0] &&
      node.arguments[0].type === 'FunctionExpression' &&
      this.isArray(node.arguments[0].params) &&
      node.arguments[0].params[0] &&
      node.arguments[0].params[0].type === 'Identifier' &&
      node.arguments[0].params[0].name === 'require';
  }

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
  isAMDNoDependencyForm = (node: any): boolean => {

    return this.isDefine(node) &&
      this.isArray(node.arguments) &&
      node.arguments[0].type === 'ObjectExpression';
  }

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
  isAMDCommonJSWrapperForm = (node: any): boolean => {
    if (
      !this.isDefine(node) ||
      !this.isArray(node.arguments) ||
      !node.arguments[0] ||
      node.arguments[0].type !== 'FunctionExpression' ||
      !this.isArray(node.arguments[0].params) ||
      node.arguments[0].params.length !== 3
    ) return false;

    let params = node.arguments[0].params;

    return params[0].type === 'Identifier' && params[0].name === 'require' &&
      params[1].type === 'Identifier' && params[1].name === 'exports' &&
      params[2].type === 'Identifier' && params[2].name === 'module';
  }

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
  isES6Import = (node: any): boolean => {
    if (!node) return false;

    switch (node.type) {
      case 'ImportDeclaration':
      case 'ImportDefaultSpecifier':
      case 'ImportSpecifier':
      case 'ImportNamespaceSpecifier':
        return true;
    }

    return false;
  }

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
  isES6Export = (node: any): boolean => {
    if (!node) return false;

    switch (node.type) {
      case 'ExportNamedDeclaration':
      case 'ExportSpecifier':
      case 'ExportDefaultDeclaration':
      case 'ExportAllDeclaration':
        return true;
    }

    return false;
  }
}



