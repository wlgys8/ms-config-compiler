const CSConfigFileGenerator = require('./CSConfigFileGenerator')
const {CSListReadFileGenerator} = require('./CSListReadFileGenerator')
const TableMeta = require('../../sheet_parse/tablemeta')
const fs = require('fs')
const path = require('path')
const CSConfigTableFileGenerator = require('./CSConfigTableFileGenerator')
const IOHelper = require('../../io/IOHelper')

/**
 * @class
 * @param {object} options
 * @param {TableMeta} options.tableMeta
 */
const CSGenerator = function(options) {
    
    const tableMeta = options.tableMeta

    const generateListReadExtsFiles = function(outDir) {
        for(var field of tableMeta.getFields()){
            if(field.ignore){
                continue
            }
            if(field.listDim > 0){
                const listReadGen = new CSListReadFileGenerator(field.baseTypeName,field.listDim)
                listReadGen.generateToDir(outDir)
            }
        }
    }

    /**
     * 
     */
    this.generate = function(outDir) {
        const tableName = tableMeta.getTableName()
        const dirWithNamespace = tableMeta.getPreferOutputDir(outDir)
        const pathWithNamespace = dirWithNamespace + '/' + tableName

        IOHelper.ensureDir(dirWithNamespace)
        //generate table item file
        const configFileGen = new CSConfigFileGenerator({
            tableMeta:tableMeta
        })

        configFileGen.generateToFile(`${pathWithNamespace}.cs`)

        //generate table file
        new CSConfigTableFileGenerator({
            tableMeta:tableMeta
        }).generateToFile(`${pathWithNamespace}Table.cs`)

        //generate list read extension
        generateListReadExtsFiles(outDir)
    }
}


module.exports = CSGenerator