const leb128 = require('leb128')


/**
 * @class
 */
const DynamicBuffer = function(){

    var rawBuf = Buffer.alloc(4)

    var pos = 0

    var posStack = []
    
    var ensureLeftspace
    ensureLeftspace = function(byteCount){
        if(rawBuf.byteLength - pos < byteCount){
            rawBuf = Buffer.concat([rawBuf,Buffer.alloc(rawBuf.byteLength)])
            ensureLeftspace(byteCount)
        }
    }

    this.savePosition = function(){
        posStack.push(pos)
    }

    this.revertPosition = function(){
        pos = posStack.pop()
    }

    this.writeUInt8 = function(value){
        ensureLeftspace(1)
        pos = rawBuf.writeUInt8(value,pos)
    }
    this.writeUInt16 = function(value){
        ensureLeftspace(2)
        pos = rawBuf.writeUInt16LE(value,pos)
    }
    this.writeUInt32 = function(value){
        ensureLeftspace(4)
        pos = rawBuf.writeUInt32LE(value,pos)
    }

    this.writeUInt64 = function(value){
        ensureLeftspace(8)
        pos = rawBuf.writeBigUInt64LE(value,pos)
    }

    this.writeInt8 = function(value){
        ensureLeftspace(1)
        pos = rawBuf.writeInt8(value,pos)
    }

    this.writeInt16 = function(value){
        ensureLeftspace(2)
        pos = rawBuf.writeInt16LE(value,pos)
    }
    this.writeInt32 = function(value){
        ensureLeftspace(4)
        pos = rawBuf.writeInt32LE(value,pos)
    }
    
    this.writeInt64 = function(value){
        ensureLeftspace(8)
        pos = rawBuf.writeBigInt64LE(value,pos)
    }

    this.writeSingle = function(value){
        ensureLeftspace(4)
        pos = rawBuf.writeFloatLE(value,pos)
    }

    this.writeDouble = function(value){
        ensureLeftspace(8)
        pos = rawBuf.writeDoubleLE(value,pos)
    }

    this.writeBool = function(value){
        var byteValue = value?1:0
        this.writeUInt8(byteValue)
    }

    /**
     * 
     * @param {Buffer} buf 
     * @param {BufferEncoding} encoding
     */
    this.writeString = function(string,encoding){
        const stringByteLength = Buffer.byteLength(string,encoding)
        this.writeLEB128(stringByteLength)
        ensureLeftspace(stringByteLength)
        pos = pos + rawBuf.write(string,pos,encoding)
    }


    this.writeLEB128 = function(value){
        const lebBuf = leb128.unsigned.encode(value)
        for(var i = 0;i < lebBuf.byteLength;i ++){
            this.writeUInt8(lebBuf.readUInt8(i))
        }
    }

    this.moveTo = function(position){
        pos = position
    }

    this.moveIndex = function(offset){
        pos += offset
    }

    this.getPosition = function(){
        return pos
    }

    this.getByteLength = function(){
        return rawBuf.byteLength;
    }

    this.getBuffer = function(){
        return rawBuf.subarray(0,pos)
    }
}

module.exports = DynamicBuffer