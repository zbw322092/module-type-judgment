module.exports = /** @class */ (function () {
    function moduleType() {
    }
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
    moduleType.prototype.isDefine = function (node) {
        if (!node)
            return false;
        var nodeCallee = node.callee;
        return nodeCallee &&
            node.type === 'CallExpression' &&
            nodeCallee.type === 'Identifier' &&
            nodeCallee.name === 'define';
    };
    return moduleType;
}());
