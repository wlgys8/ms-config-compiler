

/**
 * @class
 */
const CSCodeBuilder = function(){

    var _indent = 0

    var _strings = []

    const NewLineSymbol = '\n'

    this.indent = function() {
        _indent ++
    }

    this.unindent = function() {
        _indent --
    }

    this.writeIndent = function(){
        _strings.push(" ".repeat(_indent * 4));
    }
    this.writeNewLine = function(){
        _strings.push(NewLineSymbol)
    }

    this.write = function(text){
        _strings.push(text)
    }

    this.writeIndentLine = function(text){
        this.writeIndent()
        this.write(text)
        this.writeNewLine()
    }

    this.using = function(ns){
        this.writeIndentLine(`using ${ns};`)
    }

    this.beginNamespace = function(ns){
        this.writeIndentLine(`namespace ${ns} {`)
        _indent ++
    }

    this.endNamespace = function(){
        _indent --
        this.writeIndentLine("}")
    }

    this.declareProperty = function(typeName,propertyName,canGet,canSet){
        this.writeIndentLine(`public ${typeName} ${propertyName} {`)
        _indent ++
        this.writeIndent()
        if(!canGet){
            this.write('private ')
        }
        this.write('get;')
        if(!canSet){
            this.write('private ')
        }
        this.write('set;')
        this.writeNewLine()
        _indent --
        this.writeIndentLine('}')
    }

    this.declareReadOnlyProperty = function(typeName,propertyName){
        this.declareProperty(typeName,propertyName,true,false)
    }

    /**
     * 
     * @param {string} cls 
     * @param {string} isStatic 
     * @param {string[]} interfaces 
     */
    this.beginClass = function(cls,isStatic,interfaces){
        if(typeof(interfaces) == 'string'){
            interfaces = [interfaces]
        }
        this.writeIndent()
        var staticSymbol = isStatic?"static ":""
        this.write(`public ${staticSymbol}class ${cls}`)
        if(interfaces && interfaces.length > 0){
            this.write(" : ")
            for(var i = 0; i < interfaces.length; i ++){
                this.write(interfaces[i])
                if(i < interfaces.length - 1){
                    this.write(",")
                }
            }
        }
        this.write("{")
        this.writeNewLine()
        _indent ++
    }

    this.endClass = function(){
        _indent --
        this.writeIndentLine("}")
    }

    this.beginStruct = function(name){
        this.writeIndentLine(`public  struct ${name} {`)
        _indent ++
    }

    this.endStruct = function(){
        _indent --
        this.writeIndentLine("}")
    }

    this.toString = function(){
        return _strings.join('')
    }
}



module.exports = CSCodeBuilder