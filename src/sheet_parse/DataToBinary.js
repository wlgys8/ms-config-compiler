
const TableMeta = require('./TableMeta')
const ConfigTypes = require('./ConfigTypes')
const fs = require('fs')
const DynamicBuffer = require('./DynamicBuffer')
const IOHelper = require('../io/IOHelper')



/**
 * @class
 * @param {object} options
 * @param {TableMeta} options.tableMeta
 * @param {string[][]} options.datas
 * @param {number} options.rowOffset
 * @param {number} options.columnOffset
 */
const DataToBinary = function(options){
    const tableMeta = options.tableMeta
    const datas = options.datas;
    const rowOffset = options.rowOffset;
    const columnOffset = options.columnOffset
    // const buildItemIndex = tableMeta.shouldGenerateItemBinaryOffsets()

    const buf = new DynamicBuffer()

    // const itemsOffsetInBinary = []
    
    var actualItemCount = 0
    var parsingRow = 0;
    var parsingColumn = 0;

    const skipBytes = function(cnt){
        buf.moveIndex(cnt)
    }

    const writeVersion = function(){
        buf.writeUInt8(tableMeta.getVersion())
    }

    const writeItemCount = function(){
        buf.writeUInt16(actualItemCount)
    }

    /**
     * 
     * @param {string} baseTypeName 
     * @param {string} rawValue 
     * @param {number} listDim 
     * @param {number} currentListDepth 
     */
    const writeField = function(baseTypeName,rawValue,listDim,currentListDepth){
        if(currentListDepth < listDim){
            const splitChar = tableMeta.getSplitChars()[currentListDepth]
            const subStrs = rawValue.split(splitChar)
            buf.writeLEB128(subStrs.length)
            // buf.writeUInt8(subStrs.length)
            for(var subStr of subStrs){
                writeField(baseTypeName,subStr,listDim,currentListDepth + 1)
            }
        }else{
            // console.log('write',baseTypeName,rawValue,listDim,currentListDepth)
            ConfigTypes.parseAndWrite(rawValue,baseTypeName,buf)
        }
    }


    /**
     * 
     * @param {unknown[]} rowDatas 
     */
    const writeItem = function(rowDatas){
        var index = columnOffset;
        if(index >= rowDatas.length){
            return true
        }
        var firstNotIgnoreField = true;
        for(var field of tableMeta.getFields()){
            parsingColumn = index
            if(!field.ignore){
                var data = rowDatas[index].trim()
                if(!firstNotIgnoreField){
                    firstNotIgnoreField = false
                    if(!data){
                        return true
                    }
                }
                writeField(field.baseTypeName,data,field.listDim,0)
            }
            index ++
        }
    }

    const writeDatas = function(){
        try {
            for(var i = rowOffset; i < datas.length; i ++){
                parsingRow = i
                var end = writeItem(datas[i])
                if(end){
                    break
                }
                actualItemCount ++
            }           
        } catch (error) {
            console.error(`parsing failed at column = ${parsingColumn},row = ${parsingRow},data = ${datas[parsingRow][parsingColumn]}`)
            throw error
        }
    }


    // const writeItemBinaryOffsets = function(){
    //     for(var v of itemsOffsetInBinary){
    //         buf.writeLEB128(v)
    //     }
    // }

    /**
     * 
     * @param {string} filePath 
     * @return {number}
     */
    this.serializeToFile = function(filePath){
        writeVersion()
        var headerPosOfItemCOunt = buf.getPosition()
        skipBytes(2) // 记录了数据项的数量

        writeDatas()

        buf.savePosition()
        buf.moveTo(headerPosOfItemCOunt)
        writeItemCount()
        buf.revertPosition()

        // if(buildItemIndex){
        //     var byteOffsetOfItemIndexStart = buf.getPosition()
        //     buf.savePosition();
        //     buf.moveTo(headerPosOfItemIndex)
        //     buf.writeUInt16(byteOffsetOfItemIndexStart)
        //     buf.revertPosition();
        //     writeItemBinaryOffsets()
        // }
        var outBuf = buf.getBuffer()
        fs.writeFileSync(filePath,outBuf)
        return outBuf.byteLength
    }

    /**
     * 
     * @param {string} outDir 
     * @returns {DataBinaryGenerateResult}
     */
    this.generate = function(outDir){
        outDir = tableMeta.getPreferOutputDir(outDir)
        IOHelper.ensureDir(outDir)
        const path = outDir + "/" + tableMeta.getTableName() + ".bytes"
        const fileByteSize = this.serializeToFile(path)
        return {
            path:path,
            byteSize:fileByteSize,
            tableName : tableMeta.getTableName()
        }
    }
}

/**
 * @typedef DataBinaryGenerateResult
 * @property {string} path 生成路径
 * @property {number} byteSize 数据文件大小
 * @property {string} tableName 表名
 */

module.exports = DataToBinary