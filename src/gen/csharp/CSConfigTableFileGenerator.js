
const TableMeta = require("../../sheet_parse/TableMeta")
const CSCodeBuilder = require("./CSCodeBuilder")
const CSTypes = require("./CSTypes")
const fs = require('fs')

/**
 * @class
 * @param {object} options
 * @param {TableMeta} options.tableMeta
 */
const CSConfigTableFileGenerator = function(options) {
    
    const codeBuilder = new CSCodeBuilder()
    const tableMeta = options.tableMeta;
    const keyCount = tableMeta.getKeys().length

    const beginClass = function() {
        const itemTypeName = tableMeta.getTableName()
        const cls = `${itemTypeName}Table`
        var keyTypeName
        if(keyCount == 0){

        }else if(keyCount == 1){
            var f = tableMeta.getKeyFields()[0]
            keyTypeName = CSTypes.getCSType(f.baseTypeName)
        }else{
            keyTypeName = `${cls}.Key`
        }

        if(keyTypeName){
            codeBuilder.beginClass(cls,false,`TableDict<${keyTypeName},${itemTypeName}>`)
        }else{
            codeBuilder.beginClass(cls,false,`Table<${itemTypeName}>`)
        }
        codeBuilder.writeNewLine()
    }

    const declareMethods = function() {
        if(keyCount == 0){
            return
        }
        const itemTypeName = tableMeta.getTableName() 
        codeBuilder.writeIndentLine(`protected override void OnItemLoaded(${itemTypeName} item){`);
        codeBuilder.indent()
        if(keyCount == 1){
            var f = tableMeta.getKeyFields()[0]
            codeBuilder.writeIndentLine(`AddKey(item.${f.name},this.count - 1);`);
        }else{
            codeBuilder.writeIndentLine("var k = new Key();");
            for(var f of tableMeta.getKeyFields()){
                codeBuilder.writeIndentLine(`k.${f.name} = item.${f.name};`);
            }
            codeBuilder.writeIndentLine("AddKey(k,this.count - 1);");
        }
        codeBuilder.unindent()
        codeBuilder.writeIndentLine("}");
    }

    const declareKeyStruct = function () {
        if(keyCount < 2){
            return
        }
        codeBuilder.beginStruct('Key')
        for(var f of tableMeta.getKeyFields()){
            var csType = CSTypes.getCSType(f.baseTypeName)
            codeBuilder.declareProperty(csType,f.name,true,true)
        }
        codeBuilder.endStruct()
    }

    this.generate = function() {
        codeBuilder.using('MS.Configs')
        codeBuilder.beginNamespace(tableMeta.getNamespace())
        beginClass()
        declareMethods()
        declareKeyStruct()
        codeBuilder.endClass()
        codeBuilder.endNamespace()
        return codeBuilder.toString()
    }

    this.generateToFile = function(filePath) {
        const text = this.generate()
        fs.writeFileSync(filePath,text)
    }

}

module.exports = CSConfigTableFileGenerator