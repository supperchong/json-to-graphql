// const { parse } = require("@humanwhocodes/momoa");
// const convertJsToJson=require('./lib/index')
const { parse, print } = require("recast");

const some_json_string=`
{
	"code": null,//asdasd
	"msg": "success",
	"datas": [
		{
			"year": true,
			"yearlyIncoming": 110,
			"netProfit": 200, //asd
			"exportSum": 300,
			"top5Companies": [
				{
					"company_id": 1,
					"name": "武汉立得空间有限公司",
					"yearlyIncoming": null
				}
			]
		}
	]
}
`

const ast=parse(`let a=${some_json_string}`)
const types=[]
function  traverseJsonAst(node,name){
	const type=node.type
	const graphqlType={
		type:upper(name),
		value:[]
	}
	switch(type){
		case "ObjectExpression":{
			const properties=node.properties
			for(const property of properties){
				const key=getRaw(property.key)
				graphqlType.value.push({
					key,
					value:getGraphqlType(property.value,key),
					comments:getRaw(property.comments)
				})
			}
			break
		}
	}
	types.push(graphqlType)

}

function getJsonAst(ast){
	return ast.program.body[0].declarations[0].init
}
function getRaw(node){
	if(!node){
		return null
	}
	if(Array.isArray(node)){
		return node.map(v=>getRaw(v))
	}
	return node.value
}
function upper(word){
	return word.replace(/^./,_=>_.toUpperCase())
}
function getGraphqlType(node,key){
	switch(node.type){
		case 'Literal':{
			const originType=typeof getRaw(node)
			switch(originType){
				case 'number':{
					if(Number.isInteger){
						return 'Int'
					}else{
						return 'Float'
					}
				}
				case 'boolean':{
					return 'Boolean'
				}
				case 'object':{
					return 'Any'
				}
				case 'string':{
					return 'String'
				}
			}
		}
		case 'ObjectExpression':{
			traverseJsonAst(node,key)
			return upper(key)
		}
		case 'ArrayExpression':{
			traverseJsonAst(node.elements[0],key)
			return '['+upper(key)+']'
		}
	}
}

traverseJsonAst(getJsonAst(ast),'Root')
function generateGraphqlSchema(){
	let schema=''
	//Todo
	// for(const {type,} of types){

	// }
}
