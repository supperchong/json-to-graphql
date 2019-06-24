const parseJson=require('./parseJson')
const generateGraphqlSchema=require('./graphql')
module.exports=function(jsonString){
  const jsonAst=parseJson(jsonString)
  const out=generateGraphqlSchema(jsonAst)
  return out
}