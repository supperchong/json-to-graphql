const { parse } = require("recast");
function parseJson(jsonString){
  const ast=parse(`let a=${jsonString}`)
  const jsonAst=getJsonAst(ast)
  return jsonAst
}
function getJsonAst(ast){
	return ast.program.body[0].declarations[0].init
}
module.exports=parseJson