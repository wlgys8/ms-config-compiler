

module.exports = function(types){
    types.register({
        configTypeName:"SystemLanguage",
        parseFunc:(rawValue)=>{
            parseInt(rawValue)
        },
        writeFunc:(value,buffer)=>{
            buffer.writeUInt8(value)
        },
    })
}