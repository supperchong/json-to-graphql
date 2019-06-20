function delComment(src){
    var commentRegExp = /(\/\*([\s\S]*?)\*\/|('.*')|(".*")|\/\/(.*)$)/mg
    return src.replace(commentRegExp,commentReplace)
}
function commentReplace(match, multi, multiText, singlePrefix,double) {
    return singlePrefix || double||''
}
module.exports=delComment