interface defineNode {
  type: string,
  callee: {
    type: string,
    name: string
  },
  arguments: Array<object>
}

module.exports = class moduleType {

  /**
   * whether it is AMD define expression
   * typical AMD define express likes:
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
  isDefine(node: defineNode): boolean {
    if (!node) return false;

    let nodeCallee = node.callee;

    
    return  nodeCallee &&
      node.type === 'CallExpression' &&
      nodeCallee.type === 'Identifier' &&
      nodeCallee.name === 'define';
  }
}