const { Kind, ParseState, ObjectKeyState } = require('./constants')
const MyError=require('./myError')
const {CommonCodes,getMsg}=require('./errorCode')
const {
    scanContinue,
    scanBeginLiteral,
    scanBeginObject,
    scanObjectKey,
    scanObjectValue,
    scanEndObject,
    scanBeginArray,
    scanArrayValue,
    scanEndArray,
    scanSkipSpace,
    scanSkipObjectComma,
    scanSingleQuotationKey,
    scanSingleQuotationKeyEnd,
    scanDoubleQuotesKey,
    scanDoubleQuotesKeyEnd,
    scanSingleQuotationValue,
    scanSingleQuotationValueEnd,
    scanDoubleQuotesValue,
    scanDoubleQuotesValueEnd,
    scanEmptyKey,
    scanEmptyKeyEnd,
    scanSingleCharEmptyKeyEnd,
    scanEnd,
    scanError,
    scanBeginComment,
    scanComment,
    scanEndComment
} = Kind
const { parseObjectKey, parseObjectValue, parseArrayValue } = ParseState
const { SingleQuotationKey, DoubleQuotesKey, EmptyKey } = ObjectKeyState

class Scan {
    constructor(origin) {
        this.origin=origin
        this.reset()
    }
    reset(){
        this.step = this.stateBeginValueOrEmpty
        this.endTop = false
        this.parseState = []
        this.err = null
        this.stateString = 'DefaultString'
        this.singleString=false
        this.stateBoolean = 'DefaultBoolean'
        this.stateNull = 'DefaultNull'
        this.stateObjectKey = null
        this.interruptState = null
    }
    getStateAt(i){
        const origin =this.origin
        let state
        if(!origin) throw new Error('origin string is empty')
        if(i>=0&&i<origin.length){
            for(let k=0;k<=i;k++){
                state=this.step(origin[k],origin[k+1],k)
            }
        }
        return state
    }
    pushParseState(p) {
        this.parseState.push(p)
    }
    popParseState() {
        this.parseState.pop()
        if (!this.parseState.length) {
            this.step = this.stateEndTop
            this.endTop = true
        } else {
            this.step = this.stateEndValue
        }
    }
    stateEndValue(c,n,i) {
        if(c==='/'){
            this.step=this.stateBeginComment
            this.interruptState=this.stateEndValue
            return scanBeginComment
        }
        if (!this.parseState.length) {
            this.step = this.stateEndTop
            this.endTop = true
            return this.stateEndTop(c,n,i)
        }
        if (isSpace(c)) {
            this.step = this.stateEndValue
            return scanSkipSpace
        }
        

        let ps = this.parseState[this.parseState.length - 1]
        switch (ps) {
        case parseObjectKey: {
            if (c === ':') {
                this.parseState[this.parseState.length - 1] = parseObjectValue
                this.step = this.stateBeginValue
                return scanObjectValue
            }else{
                throw new MyError({
                    code:2,
                    msg:getMsg(i,this.origin,2)
                })
            }
            
        }
        case parseObjectValue: {
            if (c === ',') {
                let nextNotSpaceValue=this.origin.slice(i+1).find(v=>!isSpace(v))
                if(nextNotSpaceValue==='}'){
                    return scanSkipObjectComma
                }
                this.parseState[this.parseState.length - 1] = parseObjectKey
                this.step = this.stateBeginObjectKey
                return scanObjectKey
            }
            if (c === '}') {
                this.popParseState()
                return scanEndObject
            }
            
            break
        }
        case parseArrayValue: {
            if (c === ',') {
                this.step = this.stateBeginValue
                return scanArrayValue
            }
            if (c === ']') {
                this.popParseState()
                return scanEndArray
            }
            break
        }
        }
        throw new MyError({
            code:2,
            msg:getMsg(i,this.origin,2)
        })
    }
    stateEndTop(c,n,i) {
        if(c==='/'){
            this.step=this.stateBeginComment
            this.interruptState=this.stateEndTop
            return scanBeginComment
        }
        if (!isSpace(c)) {
            throw new MyError({
                code:3,
                msg:getMsg(i,this.origin,3)
            })
        }
        return scanEnd
    }
    stateBeginValueOrEmpty(c) {
        if (isSpace(c)) {
            return scanSkipSpace
        }
        if(c==='/'){
            this.step=this.stateBeginComment
            this.interruptState=this.stateBeginValueOrEmpty
            return scanBeginComment
        }
        if (c === ']') {
            return this.stateEndValue(c)
        }
        return this.stateBeginValue(c)
    }
    stateBeginValue(c,n,i) {
        if (isSpace(c)) {
            return scanSkipSpace
        }
        if(c==='/'){
            this.step=this.stateBeginComment
            this.interruptState=this.stateBeginValue
            return scanBeginComment
        }
        switch (c) {
        case '{': {
            this.step = this.stateBeginObjectKey
            this.pushParseState(parseObjectKey)
            return scanBeginObject
        }
        case '[': {
            this.step = this.stateBeginValueOrEmpty
            this.pushParseState(parseArrayValue)
            return scanBeginArray
        }
        case '"': {
            this.step = this.stateInString
            return scanBeginLiteral
        }
        case '\'': {
            this.step = this.stateInString
            this.stateString = 'SingleString'
            this.singleString=true
            return scanSingleQuotationValue
        }
        case '-': {
            this.step = this.stateNeg
            return scanBeginLiteral
        }
        case '0': {
            this.step = this.state0
            return scanBeginLiteral
        }
        case 't': {
            this.step = this.stateT
            return scanBeginLiteral
        }
        case 'f': {
            this.step = this.stateF
            return scanBeginLiteral
        }
        case 'n': {
            this.step = this.stateN
            return scanBeginLiteral
        }
        }
        if (/[1-9]/.test(c)) {
            this.step = this.state1
            return scanBeginLiteral
        }
        throw new MyError({
            code:2,
            msg:getMsg(i,this.origin,2)
        })
        // throw new Error(`error value at "${this.origin.slice(Math.max(i-20,0),i+1).join('').replace(/\s/g,'')}"`)
    }
    stateBeginObjectKey(c,n,i) {
        if (isSpace(c)) {
            return scanSkipSpace
        }
        if(c==='/'){
            this.step=this.stateBeginComment
            this.interruptState=this.stateBeginObjectKey
            return scanBeginComment
        }
        if (c === '}') {
            this.parseState[this.parseState.length - 1] = parseObjectValue
            return this.stateEndValue(c)
        }
        switch (c) {
        case '"': {
            this.step = this.stateInString
            this.stateObjectKey = DoubleQuotesKey
            return scanDoubleQuotesKey
        }
        case '\'': {
            this.step = this.stateInString
            this.stateObjectKey = SingleQuotationKey
            return scanSingleQuotationKey
        }
        default: {
            if (/[a-zA-Z_]/.test(c)) {
                if (!n||!/[a-zA-Z0-9_]/.test(n)) {
                    this.step = this.stateEndValue
                    this.stateObjectKey = null
                    return scanSingleCharEmptyKeyEnd
                }
                this.step = this.stateInString
                this.stateObjectKey = EmptyKey
                return scanEmptyKey
            }
            throw new MyError({
                code:1,
                msg:getMsg(i,this.origin,1)
            })
            
        }
        }
    }
    stateBeginComment(c,n,i){
        if(c==='/'){
            this.step=this.stateComment
            return scanBeginComment
        }else{
            throw new MyError({
                code:4,
                msg:getMsg(i,this.origin,4)
            })
        }
    }
    stateComment(c,n,i){
        if(c==='\n'){
            this.step=this.interruptState
            this.interruptState=null
            return scanEndComment
        }
        return scanComment
    }
    // stateBeginStringOrEmpty(c) {
    //     if (isSpace(c)) {
    //         return scanSkipSpace
    //     }
    //     if (c === '}') {
    //         this.parseState[this.parseState.length - 1] = parseObjectValue
    //         return this.stateEndValue(c)
    //     }
    //     return this.stateBeginString(c)
    // }
    // stateBeginString(c) {
    //     if (isSpace(c)) {
    //         return scanSkipSpace
    //     }
    //     if (c === '"') {
    //         this.step = this.stateInString
    //         return scanBeginLiteral
    //     }
    //     if (c == '\'') {
    //         this.step = this.stateInString
    //         this.stateString = 'SingleString'
    //         this.singleString=true
    //         return scanSingleQuotationValue
    //     }
    // }
    stateInString(c, n,i) {
        switch (this.stateString) {
        case 'DefaultString': {
            switch(this.stateObjectKey){
            case DoubleQuotesKey:{
                if (c === '"') {
                    this.step = this.stateEndValue
                    this.stateObjectKey = null
                    return scanDoubleQuotesKeyEnd
                }
                break
            }
            case SingleQuotationKey:{
                if (c === '\'') {
                    this.step = this.stateEndValue
                    this.stateObjectKey = null
                    return scanSingleQuotationKeyEnd
                }
                break
            }
            case EmptyKey:{
                if (!n||!/[a-zA-Z0-9_]/.test(n)) {
                    this.step = this.stateEndValue
                    this.stateObjectKey = null
                    return scanEmptyKeyEnd
                }
                break
            }
            default:{
                if (c === '"') {
                    this.step = this.stateEndValue
                    // this.stateObjectKey = null
                    return scanDoubleQuotesValueEnd
                }
                break
            }
            }

            if (c === '\\') {
                this.stateString = 'StringEsc'
                return scanContinue
            }
            return scanContinue
        }
        case 'SingleString': {
            if (c === '\'') {
                this.step = this.stateEndValue
                this.stateString = 'DefaultString'
                this.singleString=false
                return scanSingleQuotationValueEnd
            }
            if (c === '\\') {
                this.stateString = 'StringEsc'
                
                return scanContinue
            }
            return scanContinue
        }
        case 'StringEsc': {
            if (['b', 'f', 'n', 'r', 't', '\\', '/', '"','\''].includes(c)) {
                if(this.singleString){
                    this.stateString='SingleString'
                }else{
                    this.stateString = 'DefaultString'
                }
                return scanContinue
            }
            if (c === 'u') {
                this.stateString = 'StringEscU'
                return scanContinue
            }
            break
        }
        case 'StringEscU': {
            if (/[0-9a-fA-F]/.test(c)) {
                this.stateString = 'StringEscU1'
                return scanContinue
            }
            break
        }
        case 'StringEscU1': {
            if (/[0-9a-fA-F]/.test(c)) {
                this.stateString = 'StringEscU2'
                return scanContinue
            }
            break
        }
        case 'StringEscU2': {
            if (/[0-9a-fA-F]/.test(c)) {
                this.stateString = 'StringEscU3'
                return scanContinue
            }
            break
        }
        case 'StringEscU3': {
            if (/[0-9a-fA-F]/.test(c)) {
                if(this.singleString){
                    this.stateString='SingleString'
                }else{
                    this.stateString = 'DefaultString'
                }
                return scanContinue
            }
            break
        }
        }
        throw new MyError({
            code:2,
            msg:getMsg(i,this.origin,2)
        })
    }
    stateNeg(c) {
        if (c === '0') {
            this.step = this.state0
            return scanContinue
        }
        if (/[1-9]/.test(c)) {
            this.step = this.state1
            return scanContinue
        }
    }
    state0(c,n,i) {
        if (c === '.') {
            this.step = this.state1
            return scanContinue
        }
        if (/[eE]/.test(c)) {
            this.step = this.stateE
            return scanContinue
        }
        return this.stateEndValue(c,n,i)
    }
    state1(c,n,i) {
        if (/\d/.test(c)) {
            this.step = this.state1
            return scanContinue
        }
        return this.state0(c,n,i)
    }
    stateE(c) {
        if (/\+|-/.test(c)) {
            this.step = this.stateESign
            return scanContinue
        }
        return this.stateESign(c)
    }
    stateESign(c) {
        if (/\d/.test(c)) {
            this.step = this.stateE0
            return scanContinue
        }
    }
    stateE0(c,n,i) {
        if (/\d/.test(c)) {
            return scanContinue
        }
        
        return this.stateEndValue(c,n,i)
    }
    stateT(c,n,i) {
        switch (this.stateBoolean) {
        case 'DefaultBoolean': {
            if (c === 'r') {
                this.stateBoolean = 'Tr'
                return scanContinue
            }
            break
        }
        case 'Tr': {
            if (c === 'u') {
                this.stateBoolean = 'Tru'
                return scanContinue
            }
            break
        }
        case 'Tru': {
            if (c === 'e') {
                this.stateBoolean = 'DefaultBoolean'
                this.step = this.stateEndValue
                return scanContinue
            }
        }
        }
        throw new MyError({
            code:2,
            msg:getMsg(i,this.origin,2)
        })
    }
    stateF(c,n,i) {
        switch (this.stateBoolean) {
        case 'DefaultBoolean': {
            if (c === 'a') {
                this.stateBoolean = 'Fa'
                return scanContinue
            }
            break
        }
        case 'Fa': {
            if (c === 'l') {
                this.stateBoolean = 'Fal'
                return scanContinue
            }
            break
        }
        case 'Fal': {
            if (c === 's') {
                this.stateBoolean = 'Fals'
                return scanContinue
            }
            break
        }
        case 'Fals': {
            if (c === 'e') {
                this.stateBoolean = 'DefaultBoolean'
                this.step = this.stateEndValue
                return scanContinue
            }
        }
        }
        throw new MyError({
            code:2,
            msg:getMsg(i,this.origin,2)
        })
        // throw new Error('in literal true (expecting \'false\')')
    }
    stateN(c,n,i) {
        switch (this.stateNull) {
        case 'DefaultNull': {
            if (c === 'u') {
                this.stateNull = 'nu'
                return scanContinue
            }
            break
        }
        case 'nu': {
            if (c === 'l') {
                this.stateNull = 'nul'
                return scanContinue
            }
            break
        }
        case 'nul': {
            if (c === 'l') {
                this.stateNull = 'DefaultNull'
                this.step = this.stateEndValue
                return scanContinue
            }
            break
        }
        }
        throw new MyError({
            code:2,
            msg:getMsg(i,this.origin,2)
        })
        // throw new Error('in literal null (expecting \'null\')')
    }
}
function isSpace(c) {
    return /\s/.test(c)
}
module.exports=Scan