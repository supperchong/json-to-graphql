function  traverseJsonAst(innerSchemas,node,name){
  const type=node.type
	const graphqlType={
		type:upper(name),
		elements:[]
	}
	switch(type){
		case "ObjectExpression":{
			const properties=node.properties
			for(const property of properties){
				const key=getRaw(property.key)
				graphqlType.elements.push({
					key,
					value:getGraphqlType(innerSchemas,property.value,key),
					comments:getRaw(property.comments)
				})
			}
			break
		}
	}
	innerSchemas.push(graphqlType)
}
function upper(word){
	return word.replace(/^./,_=>_.toUpperCase())
}
function getRaw(node){
	if(!node){
		return null
	}
	if(Array.isArray(node)){
		return node.map(v=>getRaw(v))
	}
	return node.value||node.name
}
function getGraphqlType(innerSchemas,node,key){
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
			traverseJsonAst(innerSchemas,node,key)
			return upper(key)
		}
		case 'ArrayExpression':{
			traverseJsonAst(innerSchemas,node.elements[0],key)
			return '['+upper(key)+']'
		}
	}
}

function getInnerSchemas(jsonAst,RootType){
  const innerSchemas=[]
  traverseJsonAst(innerSchemas,jsonAst,RootType)
  return innerSchemas
}

function generateGraphqlSchema(jsonAst,RootType='Root'){

  const innerSchemas=getInnerSchemas(jsonAst,RootType)
  let schemas=[]
  for(const {type,elements} of innerSchemas){
		let item=''
		elements.reduce((prev,{key,comments,value})=>{
			let comment
      if(comments&&comments[0]){
        comment=comments[0]
      }
      if(comment){
        item+=`  #${comment}\n  ${key}: ${value}\n`
      }else{
        item+=`  ${key}: ${value}\n`
      }
      return prev+=item
		},'')
		schemas.push(`type ${type} {\n${item}}`)
  }
  return schemas.reverse().join('\n')
}
module.exports=generateGraphqlSchema