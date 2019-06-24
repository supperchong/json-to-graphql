# js-to-graphql-schema
## About
 `js-to-graphql-schema`可以将json或javascript对象转化成graphql schema,写这个库的起因是因为要将restful接口重构为graphql接口,`js-to-graphql-schema`可以根据返回的数据结构自动生成类型定义.
## feature
- support any available javascript object string
- support comment


## Demo
 ```js
{
  people: [
    {
      name: "xiaoli",//名字
      age: 21
    }
  ]
}
 ```
->
```graphql
type Root {
  people: [People]
}
type People {
  #名字
  name: String
  age: Int
}
```


## install
```sh
$ npm install js-to-graphql-schema
```
## Usage
```js
const generateGraphqlSchema=require('js-to-graphql-schema')
//available javascript object literal
const str=`
{
  people: [
    {
      name: "xiaoli",//名字
      age: 21
    }
  ]
}
`
const schema=generateGraphqlSchema(str)
console.log(schema)
```

 
