const CommonCodes={
    InvalidObjectKey:{
        code:1,
        msg:'invalid object key'
    },
    InvalidValue:{
        code:2,
        msg:'invalid value'
    },
    EndError:{
        code:3,
        msg:'error after top value'
    },
    InvalidComment:{
        code:4,
        msg:'invalid comment'
    }
}
let CodeMsg={}
Object.values(CommonCodes).forEach(({code,msg})=>{
    CodeMsg[code]=msg
})

function getMsg(i,origin,code){
    return `${CodeMsg[code]} at "${origin.slice(Math.max(i-20,0),i+1).join('').replace(/\s/g,'')}"`
}

exports.CommonCodes=CommonCodes
exports.getMsg=getMsg

