const { option } = require('commander')
const fs = require('fs')
const path = require('path')
const IOHelper = require('./io/IOHelper')

/**
 * @class
 * @param {object} options
 * @param {string[]} options.srcBianryFiles
 */
const BinaryMerger = function(options){


    /**
     * 
     * @param {string} outDir 
     */
    this.mergeTo = function(outDir){
        const mergeResult = {
            tables:[]
        }
        IOHelper.ensureDir(outDir)
        const dataOutPath = `${outDir}/configdata.bytes`
        const dataOutTempPath = `${outDir}/.__temp.bytes`
        const mergeInfoFilePath = `${outDir}/mergeinfo.json`
        
        if(fs.existsSync(dataOutTempPath)){
            fs.rmSync(dataOutTempPath)
        }

        var byteOffset = 0
        for(var f of options.srcBianryFiles){
            const filename=  path.basename(f,'.bytes')
            const fileData = fs.readFileSync(f)
            mergeResult.tables.push({
                name:filename,
                offset:byteOffset,
                size:fileData.byteLength,
            })
            fs.appendFileSync(dataOutTempPath,fileData)
            byteOffset += fileData.byteLength
        }
        if(fs.existsSync(dataOutPath)){
            fs.rmSync(dataOutPath)
        }
        fs.renameSync(dataOutTempPath,dataOutPath)
        fs.writeFileSync(mergeInfoFilePath, JSON.stringify(mergeResult))
    }
}

module.exports = BinaryMerger