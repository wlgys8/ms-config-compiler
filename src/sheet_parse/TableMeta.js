

/**
 * @typedef FieldMeta
 * @property {string} name
 * @property {string} baseTypeName
 * @property {number} [listDim=0]
 * @property {bool} ignore
 */



/**
 * 
 * @param {string} fieldName 
 * @param {string} fieldType 
 * @returns {FieldMeta}
 */
const parseFieldMeta = function(fieldName,fieldType){
    fieldName = fieldName.trim()
    fieldType = fieldType.trim()
    if(fieldName[0] == '#'){
        return {
            name : fieldName.substr(1),
            ignore:true
        }
    }
    var result = {
        name:fieldName,
        ignore:false,
        listDim:0
    }

    var regexp = new RegExp("^List([0-9]?)<(.*)>",'g')
    var match = regexp.exec(fieldType)
    if(match){
        if(match[1]){
            result.listDim = parseInt(match[1])
        }else{
            result.listDim = 1
        }
        if(match[2]){
            result.baseTypeName = match[2]
        }
    }else{
        result.baseTypeName = fieldType
    }
    return result
}

/**
 * @class
 * @param {unknown[]} datas
 */
const TableMeta = function(datas){

    if(datas.length < 3){
        throw new Error('the row count of sheet must >= 3,current is ' + datas.length)
    }

    const headers = {}

    /**
     * @type {FieldMeta[]}
     */
    const fields = []

    /**
     * @type {Map<string,FieldMeta>}
     */
    const fieldsMap = new Map()

    /**
     * @type {string[]}
     */
    var keys = []

    var contentOffset = 3

    // var buildItemIndex = false

    const readHeaders = function(){
        for(var i = 0; i < datas.length; i ++){
            var row = datas[i]
            if(row.length < 2){
                break
            }
            const key = row[0]
            const value = row[1]
            if(!key){
                break
            }
            headers[key] = value
        }

        if(headers['keys']){
            keys = headers['keys'].split('|')
        }
        if(headers['contentOffset']){
            contentOffset = parseInt(headers['contentOffset'])
        }
        // if(headers['buildItemIndex']){
        //     if(headers['buildItemIndex'].toLowerCase() == 'true'){
        //         buildItemIndex = true
        //     }
        // }
    }

    const readFields = function(){
        var fieldNames = datas[0]
        var fieldTypes = datas[1]
        var count = Math.min(fieldNames.length,fieldTypes.length)
        for(var i = contentOffset; i < count; i ++){
            var fieldName = fieldNames[i]
            var fieldType = fieldTypes[i]
            if(!fieldName){
                break
            }
            var field = parseFieldMeta(fieldName,fieldType)
            fields.push(field)
            fieldsMap.set(field.name,field)
        }
    }

    readHeaders()
    readFields()

    this.getVersion = function(){
        return 0
    }

    /**
     * @returns {string}
     */
    this.getNamespace = function(){
        return headers['namespace']
    }

    this.getTableName = function(){
        return headers['tableName']
    }

    this.getContentStartColumn = function(){
        return contentOffset
    }

    this.getKeys = function(){
        return keys
    }

    this.getField = function(name){
        return fieldsMap.get(name)
    }

    this.getFields = function(){
        return fields
    }

    this.getKeyFields = function() {
        var result = []
        for(var key of keys){
            result.push(this.getField(key))
        }
        return result
    }

    this.getSplitChars = function(){
        return ['|','&']
    }

    /**
     * 是否生成数据项在二进制文件中的偏移位置信息。
     */
    this.shouldGenerateItemBinaryOffsets = function(){
        return false
        // return buildItemIndex
    }


    this.getPreferOutputDir = function(prefixDir){
        const namespace = this.getNamespace()
        var dirWithNamespace = namespace.replace(/\./g,'/');
        if(prefixDir){
            dirWithNamespace = prefixDir + "/" + dirWithNamespace 
        }
        return dirWithNamespace
    }


}

module.exports = TableMeta


