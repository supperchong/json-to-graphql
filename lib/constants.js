const Kind = [
    'scanContinue',
    'scanBeginLiteral',
    'scanBeginObject',
    'scanObjectKey',
    'scanObjectValue',
    'scanEndObject',
    'scanBeginArray',
    'scanArrayValue',
    'scanEndArray',
    'scanSkipSpace',
    'scanSkipObjectComma',
    'scanSingleQuotationKey',
    'scanSingleQuotationKeyEnd',
    'scanDoubleQuotesKey',
    'scanDoubleQuotesKeyEnd',
    'scanSingleQuotationValue',
    'scanSingleQuotationValueEnd',
    'scanDoubleQuotesValue',
    'scanDoubleQuotesValueEnd',
    'scanEmptyKey',
    'scanEmptyKeyEnd',
    'scanSingleCharEmptyKeyEnd',
    'scanEnd',
    'scanError',
    'scanBeginComment',
    'scanComment',
    'scanEndComment'
]
const ParseState = ['parseObjectKey', 'parseObjectValue', 'parseArrayValue']
const ObjectKeyState = ['SingleQuotationKey', 'DoubleQuotesKey', 'EmptyKey']
Kind.forEach((key, index) => {
    Kind[key] = index
})
ParseState.forEach((key, index) => {
    ParseState[key] = index
})
ObjectKeyState.forEach((key, index) => {
    ObjectKeyState[key] = index
})
exports.Kind=Kind
exports.ParseState=ParseState
exports.ObjectKeyState=ObjectKeyState