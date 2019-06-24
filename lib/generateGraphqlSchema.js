const parseJson=require('./lib/parseJson')
const generateGraphqlSchema=require('./lib/graphql')
function generateGraphqlSchema(jsonString){
  const jsonAst=parseJson(jsonString)
  const out=generateGraphqlSchema(jsonAst)
  return out
}
module.exports=generateGraphqlSchema