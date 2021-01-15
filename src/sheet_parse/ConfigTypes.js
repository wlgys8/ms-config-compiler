
const DynamicBuffer = require('./DynamicBuffer')
const path = require('path')
const ConfigTypes = {}


/**
 * @callback WriteFunc
 * @param {any} value
 * @param {DynamicBuffer} buffer
 */

 /**
  * @callback ParseFunc
  * @param {string} rawValue
  * @returns {any} 
  */

/**
 * @typedef TypeDefine
 * @property {string} configTypeName
 * @property {WriteFunc} writeFunc
 * @property {ParseFunc} parseFunc
 */


 /**
  * @type {Map<string,TypeDefine>}
  */
const _typeDefines = new Map()

 /**
  * 
  * @param {TypeDefine} typeDefine 
  */
ConfigTypes.register = function(typeDefine){
    _typeDefines.set(typeDefine.configTypeName, typeDefine)
}

const assertTypeDefine = function(typeName){
    var typeDef = _typeDefines.get(typeName)
    if(!typeDef){
        throw new Error('unknown type:' + typeName)
    }
    return typeDef
}

/**
 * 
 * @param {string} rawValue 
 * @param {string} typeName 
 * @param {DynamicBuffer} buffer 
 */
ConfigTypes.parseAndWrite = function(rawValue,typeName,buffer){
    var typeDef = assertTypeDefine(typeName)
    var value = typeDef.parseFunc(rawValue)
    typeDef.writeFunc(value,buffer)
}


/**
 *  
 * @param {string} strValue 
 */
const parseToFloatList = function(strValue){
    const subStrs = strValue.split('|')
    const result = []
    for(var s of subStrs){
        result.push(parseFloat(s))
    }
    return result
}

/**
 *  
 * @param {string} strValue 
 */
const parseToIntList = function(strValue){
    const subStrs = strValue.split('|')
    const result = []
    for(var s of subStrs){
        result.push(parseInt(s))
    }
    return result
}

/**
 * @type {TypeDefine[]}
 */
const typeDeclares = [
    {
        configTypeName:"UInt8",
        parseFunc:(rawValue)=>{
            return parseInt(rawValue)
        },
        writeFunc:(value,buffer)=>{
            buffer.writeUInt8(value)
        },
    },
    {
        configTypeName:"UInt16",
        parseFunc:(rawValue)=>{
            return parseInt(rawValue)
        },
        writeFunc:(value,buffer)=>{
            buffer.writeUInt16(value)
        },  
    },
    {
        configTypeName:"UInt32",
        parseFunc:(rawValue)=>{
            return parseInt(rawValue)
        },
        writeFunc:(value,buffer)=>{
            buffer.writeUInt32(value)
        },         
    },
    {
        configTypeName:"UInt64",
        parseFunc:(rawValue)=>{
            return BigInt(rawValue)
        },
        writeFunc:(value,buffer)=>{
            buffer.writeUInt64(value)
        },  
    },

    {
        configTypeName:"Int8",
        parseFunc:(rawValue)=>{
            return parseInt(rawValue)
        },
        writeFunc:(value,buffer)=>{
            buffer.writeInt8(value)
        },
    },
    {
        configTypeName:"Int16",
        parseFunc:(rawValue)=>{
            return parseInt(rawValue)
        },
        writeFunc:(value,buffer)=>{
            buffer.writeInt16(value)
        },  
    },
    {
        configTypeName:"Int32",
        parseFunc:(rawValue)=>{
            return parseInt(rawValue)
        },
        writeFunc:(value,buffer)=>{
            buffer.writeInt32(value)
        },         
    },
    {
        configTypeName:"Int64",
        parseFunc:(rawValue)=>{
            return BigInt(rawValue)
        },
        writeFunc:(value,buffer)=>{
            buffer.writeInt64(value)
        },  
    },

    {
        configTypeName:"String",
        parseFunc:(rawValue)=>{
            return rawValue
        },
        writeFunc:(value,buffer)=>{
            if(!value){
                value = ''
            }
            buffer.writeString(value,'utf-8')
        },
    },
    {
        configTypeName:"Single",
        parseFunc:(rawValue)=>{
            return parseFloat(rawValue)
        },
        writeFunc:(value,buffer)=>{
            buffer.writeSingle(value)
        },
    },
    {
        configTypeName:"Double",
        parseFunc:(rawValue)=>{
            return parseFloat(rawValue)
        },
        writeFunc:(value,buffer)=>{
            buffer.writeDouble(value)
        },
    },
    {
        configTypeName:"Bool",
        parseFunc:(rawValue)=>{
            return rawValue == 'true' || rawValue == 1
        },
        writeFunc:(value,buffer)=>{
            buffer.writeBool(value)
        },
    },
    {
        configTypeName:"Vector2",
        parseFunc:(rawValue)=>{
            return parseToFloatList(rawValue)
        },
        writeFunc:(value,buffer)=>{
            buffer.writeSingle(value[0])
            buffer.writeSingle(value[1])
        },
    },
    {
        configTypeName:"Vector3",
        parseFunc:(rawValue)=>{
            return parseToFloatList(rawValue)
        },
        writeFunc:(value,buffer)=>{
            if(value.length != 3){
                throw new Error('the format of Vector3 must be x|y|z')
            }
            buffer.writeSingle(value[0])
            buffer.writeSingle(value[1])
            buffer.writeSingle(value[2])
        },
    },
    {
        configTypeName:"Rect",
        parseFunc:(rawValue)=>{
            return parseToFloatList(rawValue)
        },
        writeFunc:(value,buffer)=>{
            buffer.writeSingle(value[0])
            buffer.writeSingle(value[1])
            buffer.writeSingle(value[2])
            buffer.writeSingle(value[3])
        },
    },
    {
        configTypeName:"RectOffset",
        parseFunc:(rawValue)=>{
            return parseToIntList(rawValue)
        },
        writeFunc:(value,buffer)=>{
            buffer.writeInt32(value[0])
            buffer.writeInt32(value[1])
            buffer.writeInt32(value[2])
            buffer.writeInt32(value[3])
        },
    },
    {
        configTypeName:"Color",
        parseFunc:(rawValue)=>{
            if(!rawValue){
                return [1,1,1,1]
            }
            return parseToFloatList(rawValue)
        },
        writeFunc:(value,buffer)=>{
            if(value.length != 4){
                throw new Error(`failed to parse ${value} to Color`)
            }
            buffer.writeUInt8(Math.floor(value[0] * 255))
            buffer.writeUInt8(Math.floor(value[1] * 255))
            buffer.writeUInt8(Math.floor(value[2] * 255))
            buffer.writeUInt8(Math.floor(value[3] * 255))
        },
    }
]

for(var def of typeDeclares){
    ConfigTypes.register(def)
}


ConfigTypes.registerFromExternalJSFile = function(jsFile){
    jsFile = path.resolve(jsFile)
    const registerFunc = require(jsFile)
    if(typeof(registerFunc) != 'function'){
        throw new Error('the external jsfile must return a function')
    }
    registerFunc(ConfigTypes)
}


module.exports = ConfigTypes