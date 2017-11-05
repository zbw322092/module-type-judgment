module.exports = class moduleType {
  private isArray(param: any): boolean {
    return Object.prototype.toString.call(param) === "[object Array]"
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
  isDefine(node: any): boolean {
    if (!node) return false;

    let nodeCallee = node.callee;

    return nodeCallee &&
      node.type === 'CallExpression' &&
      nodeCallee.type === 'Identifier' &&
      nodeCallee.name === 'define';
  }

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


}



