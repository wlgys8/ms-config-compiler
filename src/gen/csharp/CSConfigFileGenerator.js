
const TableMeta = require("../../sheet_parse/TableMeta")
const CSCodeBuilder = require("./CSCodeBuilder")
const CSTypes = require("./CSTypes")
const fs = require('fs')

/**
 * @typedef {import("../../sheet_parse/tablemeta").FieldMeta} FieldMeta
 */


 /**
  * @param {FieldMeta} field
  */
const getDeclareTypeName = function(field) {
    var csTypeName = CSTypes.getCSType(field.baseTypeName)
    var listDim = field.listDim
    if(listDim > 0){
        listDim --
        csTypeName = `IReadOnlyList<${csTypeName}>`;
    }
    return csTypeName
}

/**
 * @class
 * @param {object} options
 * @param {TableMeta} options.tableMeta
 */
const CSConfigFileGenerator = function(options) {
    
    const tableMeta = options.tableMeta

    const codeBuilder = new CSCodeBuilder();

    const declareUsing = function() {
        codeBuilder.using('System.IO')
        codeBuilder.using('System.Collections.Generic')
        codeBuilder.using('MS.Configs')
        codeBuilder.using('MS.Configs.AutoGenerate')
    }

    /**
     * @param {FieldMeta} field 
     */
    const declareField = function (field) {
        if(field.ignore){
            return
        }
        const csTypeName = getDeclareTypeName(field)
        codeBuilder.declareReadOnlyProperty(csTypeName,field.name)
    }

    const declareFields = function() {
        for(var f of tableMeta.getFields()){
            declareField(f)
        }
    }

    /**
     * @param {FieldMeta} field 
     */
    const deserializeField = function(field) {
        if(field.ignore){
            return
        }
        var readApi
        if(field.listDim == 0){
            readApi = CSTypes.getReadApi(field.baseTypeName)
        }else{
            readApi = CSTypes.getListReadApi(field.baseTypeName,field.listDim)
        }
        codeBuilder.writeIndentLine(`this.${field.name} = reader.${readApi}();`)
    }

    const declareOnDeserialize = function() {
        codeBuilder.writeIndentLine('public void OnDeserialize(BinaryReader reader){')
        codeBuilder.indent()
        for(var f of tableMeta.getFields()){
            deserializeField(f)
        }
        codeBuilder.unindent()
        codeBuilder.writeIndentLine("}")
    }

    const overrideToString = function(){
        codeBuilder.writeIndentLine("public override string ToString(){")
        codeBuilder.indent();
        
        codeBuilder.writeIndentLine("var builder = new System.Text.StringBuilder();")

        for(var f of tableMeta.getFields()){
            if(f.ignore){
                continue
            }
            codeBuilder.writeIndentLine(`builder.Append("${f.name} = " + this.${f.name} + ",");`)
        }
        codeBuilder.writeIndentLine("return builder.ToString();");
        codeBuilder.unindent();
        codeBuilder.writeIndentLine("}")
    }


    this.generate = function() {
        declareUsing()
        codeBuilder.beginNamespace(tableMeta.getNamespace())
        codeBuilder.beginClass(tableMeta.getTableName(),false,['IDeserializer'])
        declareFields()
        declareOnDeserialize()
        overrideToString()
        codeBuilder.endClass()
        codeBuilder.endNamespace()
        return codeBuilder.toString()
    }
    
    this.generateToFile = function (filePath) {
        var text = this.generate()
        fs.writeFileSync(filePath,text)
    }

}

module.exports = CSConfigFileGenerator