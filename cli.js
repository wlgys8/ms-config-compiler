#!/usr/bin/env node

const Generator = require('./src/Generator')
const fs = require('fs')

const {program} = require('commander');
const ConfigTypes = require('./src/sheet_parse/ConfigTypes');
const CSTypes = require('./src/gen/csharp/CSTypes');
const IOHelper = require('./src/io/IOHelper');
program.version('0.0.1')

program.command('gen')
.requiredOption('-s,--src <srcDir>','src config files dir')
.requiredOption('-o,--code-out <codeOutDir>','code files output dir')
.requiredOption('-d,--data-out <dataOutDir>','data files out dir')
.option('-c,--options-file <extraOptionsFile>','extra options')
.option('-m,--merge','merge all data files into one bianry file')
.action((cmd)=>{
    const src = cmd.src
    const codeOutDir = cmd.codeOut
    const dataOutDir = cmd.dataOut
    const g = new Generator({
        srcDir:src,
        codeOutDir:codeOutDir,
        dataOutDir:dataOutDir,
        mergeDatas:cmd.merge,
    })

    const extraOptionFile = cmd.optionsFile
    if(extraOptionFile){
        const text = fs.readFileSync(extraOptionFile)
        /**
         * @type {ExtraOptions}
         */
        const extraOptions = JSON.parse(text)
        if(extraOptions.configTypeExts){
            ConfigTypes.registerFromExternalJSFile(extraOptions.configTypeExts)
        }
        if(extraOptions.csTypeExts){
            CSTypes.registerFromJSONFile(extraOptions.csTypeExts)
        }
    }

    g.generate()
});

program.command("helloworld")
.action(function(){
    var fromXlsx = __dirname + '/tests/srcfiles/Test.xlsx'
    var toXlsx = 'xlsx/TestConfig.xlsx'
    IOHelper.ensureDir('xlsx')
    fs.copyFileSync(fromXlsx,toXlsx);
    new Generator({
        srcDir:'xlsx',
        codeOutDir:'out/scripts',
        dataOutDir:'out/datas',
        mergeDatas:true,
    }).generate()

});

program.parse(process.argv)


/**
 * @typedef ExtraOptions
 * @property {string} configTypeExts
 * @property {string} csTypeExts
 */
