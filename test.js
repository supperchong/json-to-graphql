const { parse } = require("@humanwhocodes/momoa");
const convertJsToJson=require('./lib/index')
// const { parse, print } = require("recast");

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

const jsonAST=parse(convertJsToJson(some_json_string),{comments: true,tokens:true })

const types=[]
function getGraphqlType(obj){
  const type=obj.type
    switch(type){
      case 'Object':{

      }
      case 'String':{

      }
      case 'Number':{

      }
      case 'Null':{

			}
			case 'Boolean':{

			}
    }
}
getGraphqlType(jsonAST.body)