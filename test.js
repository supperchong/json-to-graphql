const parseJson=require('./lib/parseJson')
const generateGraphqlSchema=require('./lib/graphql')
const jsonAst=parseJson(` {
	people:[{
		name:'xiaoli',//名字
		age:21
	}]
}
`)

const out=generateGraphqlSchema(jsonAst)
console.log(out)