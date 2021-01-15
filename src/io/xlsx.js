const XLSX = require('xlsx');

/**
 * @class
 */
const XlsxParser = function(){

    this.parse = function(filePath){
        const w = XLSX.readFile(filePath,{raw:true})
        const firstSheetName = w.SheetNames[0]
        const sheet = w.Sheets[firstSheetName]
        /* loop through every cell manually */
        var range = XLSX.utils.decode_range(sheet['!ref']); // get the range
        const sheetTable = []
        for(var R = range.s.r; R <= range.e.r; ++R) {
            const row = []
            sheetTable.push(row)
            for(var C = range.s.c; C <= range.e.c; ++C) {
                /* find the cell object */
                var cellref = XLSX.utils.encode_cell({c:C, r:R}); // construct A1 reference for cell
                if(!sheet[cellref]){
                    row.push('')
                }else{
                    var cell = sheet[cellref];
                    row.push(String(cell.v))
                }
            }
        }
        var datas = sheetTable
        return datas
   
    }
}
module.exports = XlsxParser