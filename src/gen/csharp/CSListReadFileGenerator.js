
const CSCodeBuilder = require('./CSCodeBuilder')
const CSTypes = require('./CSTypes')
const fs = require('fs')
const IOHelper = require('../../io/IOHelper')

const getClassName = function(baseTypeName,listDim) {
    const csType = CSTypes.getCSType(baseTypeName)
    return `List${listDim}${csType}ReadExt`
}

const getReadOnlyListTypeName = function(baseTypeName,listDim) {
    var csTypeName = CSTypes.getCSType(baseTypeName)
    while(listDim > 0){
        listDim --
        csTypeName = `IReadOnlyList<${csTypeName}>`
    }
    return csTypeName
}

const getListTypeName = function(baseTypeName,listDim) {
    var csTypeName = CSTypes.getCSType(baseTypeName)
    while(listDim > 0){
        listDim --
        csTypeName = `List<${csTypeName}>`
    }
    return csTypeName
}

/**
 * 
 * @class
 * @param {string} typeName
 * @param {number} listDim
 */
const CSListReadFileGenerator = function(typeName,listDim) {
    
    const codeBuilder = new CSCodeBuilder()

    const namespace = 'MS.Configs.AutoGenerate'

    const declareUsing = function() {
        codeBuilder.using('System.IO')
        codeBuilder.using('System.Collections.Generic')
        codeBuilder.writeIndentLine()
    }

    const generateMethod = function() {
        const funcName = CSTypes.getListReadApi(typeName,listDim)
        const returnType = getReadOnlyListTypeName(typeName,listDim)
        const genericArguementTypeName = getListTypeName(typeName,listDim - 1)
        const elementReadApi = CSTypes.getListReadApi(typeName,listDim - 1)
        codeBuilder.writeIndentLine(`public static ${returnType} ${funcName} (this BinaryReader reader){`)
        codeBuilder.indent()
        codeBuilder.writeIndentLine("var count = (int)reader.ReadLEB128Unsigned();")
        codeBuilder.writeIndentLine(`var list = new List<${genericArguementTypeName}>(count);`);
        codeBuilder.writeIndentLine("for(var i = 0;i < count; i ++){");
        codeBuilder.indent()
        if(listDim - 1 == 0){
            codeBuilder.writeIndentLine(`list.Add(reader.${elementReadApi}());`);
        }else{
            codeBuilder.writeIndentLine(`"list.Add(reader.${elementReadApi}());`);
        }
        codeBuilder.unindent()
        codeBuilder.writeIndentLine("}");
        codeBuilder.writeIndentLine("return list;");
        codeBuilder.unindent()
        codeBuilder.writeIndentLine("}");
    }

    this.getClassName = function() {
        return getClassName(typeName,listDim)
    }

    this.generate = function() {
        declareUsing()
        codeBuilder.beginNamespace(namespace)
        codeBuilder.beginClass(getClassName(typeName,listDim),true)
        generateMethod()
        codeBuilder.endClass()
        codeBuilder.endNamespace()
        return codeBuilder.toString()
    }

    this.generateToDir = function(outDir) {
        var text = this.generate()
        outDir = outDir + '/' + namespace.replace(/\./g,'/')
        const path = outDir + '/' + getClassName(typeName,listDim) + ".cs"
        IOHelper.ensureDir(outDir)
        fs.writeFileSync(path,text)
    }
}

// const CSListReadFiles = {}


exports.CSListReadFileGenerator = CSListReadFileGenerator
