const shell = require('shelljs');
const fs = require('fs')

const IOHelper = {}


IOHelper.ensureDir = function(dir){
    if(fs.existsSync(dir)){
        return
    }
    shell.mkdir('-p', dir);
}


module.exports = IOHelper