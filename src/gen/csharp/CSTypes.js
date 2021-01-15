
const fs = require('fs')

const CSTypes = {}


/**
 * @typedef TypeDefine
 * @property {string} configTypeName
 * @property {string} readApi
 * @property {string} csType
 */


 /**
  * @type {Map<string,TypeDefine>}
  */
 const _typeDefinesMap = new Map()

/**
 * @type {TypeDefine[]}
 */
const _typeDefines = [
    {
        configTypeName:"UInt8",
        csType:"byte",
        readApi:"ReadByte",
    },
    {
        configTypeName:"UInt16",
        csType:"ushort",
        readApi:"ReadUInt16",
    },
    {
        configTypeName:"UInt32",
        csType:"uint",
        readApi:"ReadUInt32",
    },
    {
        configTypeName:"UInt64",
        csType:"ulong",
        readApi:"ReadUInt64",
    },
    {
        configTypeName:"Int8",
        csType:"sbyte",
        readApi:"ReadSByte",
    },
    {
        configTypeName:"Int16",
        csType:"short",
        readApi:"ReadInt16",
    },
    {
        configTypeName:"Int32",
        csType:"int",
        readApi:"ReadInt32",
    },
    {
        configTypeName:"Int64",
        csType:"long",
        readApi:"ReadInt64",
    },
    {
        configTypeName:"String",
        csType:"string",
        readApi:"ReadStringExt",
    },
    {
        configTypeName:"Single",
        csType:"float",
        readApi:"ReadSingle",
    },
    {
        configTypeName:"Double",
        csType:"double",
        readApi:"ReadDouble",
    },
    {
        configTypeName:"Bool",
        csType:"bool",
        readApi:"ReadBoolean",
    },
    {
        configTypeName:"Vector2",
        csType:"UnityEngine.Vector2",
        readApi:"ReadVector2",
    },
    {
        configTypeName:"Vector3",
        csType:"UnityEngine.Vector3",
        readApi:"ReadVector3",
    },
    {
        configTypeName:"Rect",
        csType:"UnityEngine.Rect",
        readApi:"ReadRect",
    },
    {
        configTypeName:"RectOffset",
        csType:"UnityEngine.RectOffset",
        readApi:"ReadRectOffset",
    },
    {
        configTypeName:"Color",
        csType:"UnityEngine.Color",
        readApi:"ReadColor",
    },
]

for(var d of _typeDefines){
    _typeDefinesMap.set(d.configTypeName,d)
}

const assertTypeDefine = function(typeName){
    const def = _typeDefinesMap.get(typeName)
    if(!def){
        throw new Error('unknown typeName:'+typeName)
    }
    return def
}

CSTypes.getReadApi = function(typeName) {
    return assertTypeDefine(typeName).readApi
}

CSTypes.getCSType = function(typeName) {
    return assertTypeDefine(typeName).csType
}

CSTypes.getListReadApi = function(baseTypeName,listDim) {
    if(!listDim){
        return CSTypes.getReadApi(baseTypeName)
    }else{
        var csTypeName = CSTypes.getCSType(baseTypeName)
        return `ReadList${listDim}${csTypeName}`;
    }
}


/**
 * 利用外部的json文件，扩展类型支持
 * @param {string} typeDefinedJsonFile 
 */
CSTypes.registerFromJSONFile = function(typeDefinedJsonFile){
    const text = fs.readFileSync(typeDefinedJsonFile,'utf-8')
    const typeDefineExts = JSON.parse(text)
    for(var d of typeDefineExts){
        _typeDefinesMap.set(d.configTypeName,d)
    }
}


module.exports = CSTypes