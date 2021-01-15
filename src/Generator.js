const { schedulingPolicy } = require('cluster')
const fs = require('fs')
const BinaryMerger = require('./BinaryMerger')
const CSGenerator = require('./gen/csharp/CSGenerator')
const XlsxParser = require('./io/xlsx')
const DataToBinary = require('./sheet_parse/DataToBinary')
const TableMeta = require('./sheet_parse/TableMeta')


/**
 * @typedef {import("./sheet_parse/DataToBinary").DataBinaryGenerateResult} DataBinaryGenerateResult
 */

/**
 * @typedef SingleTableGenerateResult
 * @property {DataBinaryGenerateResult} binaryResult
 */

/**
 * @class
 * @param {object} options
 * @param {string} [options.srcDir="./"]
 * @param {string} [options.codeOutDir="./out/codes/"]
 * @param {string} [options.dataOutDir="./out/datas/"]
 * @param {boolean} [options.mergeDatas=false] 是否将所有表的数据合并为一个二进制文件
 * @param {boolean} [options.keepSeparateDatas=false] 当合并数据文件时，是否依旧保留单独的数据文件
 */
const Generator = function(options){

    var srcDir = "./"
    var codeOutDir = "./out/codes/"
    var dataOutDir = "./out/datas/"

    if(options.srcDir){
        srcDir = options.srcDir
    }
    if(options.codeOutDir){
        codeOutDir = options.codeOutDir
    }
    if(options.dataOutDir){
        dataOutDir = options.dataOutDir
    }

    const parseXlsx = function(path){
        return new XlsxParser().parse(path)
    }

    /**
     * 
     * @param {string} filePath
     * @returns {SingleTableGenerateResult} 
     */
    const generateFromFile = function(filePath){
        if(filePath.endsWith('.xlsx')){
            const sheets = parseXlsx(filePath)
            const tableMeta = new TableMeta(sheets)
            const csGenerate = new CSGenerator({
                tableMeta:tableMeta
            })
            const binaryGenerate = new DataToBinary({
                tableMeta: tableMeta,
                datas:sheets,
                rowOffset:3,
                columnOffset:tableMeta.getContentStartColumn(),
            })
            //生成代码文件
            csGenerate.generate(codeOutDir)
            //生成数据文件
            const binaryGenResult = binaryGenerate.generate(dataOutDir)

            return {
                binaryResult:binaryGenResult
            }
        }else{
            console.warn('unsupport file:' + filePath)
        }
    }

    this.generate = function(){
        const files = fs.readdirSync(srcDir)
        const singleFileResults = []
        const binaryFilePaths = []
        for(var fileName of files){
            if(fileName.startsWith(".") || fileName.startsWith('~')){
                //ignore hidden file
                continue
            }
            const filePath = srcDir + '/' + fileName
            const result = generateFromFile(filePath)
            singleFileResults.push(result)
            binaryFilePaths.push(result.binaryResult.path)
        }
        if(options.mergeDatas){
            const merger = new BinaryMerger({
                srcBianryFiles:binaryFilePaths
            })
            merger.mergeTo(dataOutDir)

            if(!options.keepSeparateDatas){
                for(var f of binaryFilePaths){
                    fs.rmSync(f)
                }
            }
        }
    }
}

module.exports = Generator