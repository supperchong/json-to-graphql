
class MyError extends Error{
    constructor(options){
        super(options.msg)
        this.name='MyError'
        this.code=options.code
        Error.captureStackTrace(this,this.constructor)
    }
}
module.exports=MyError