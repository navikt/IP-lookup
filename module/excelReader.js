'use strict';
var XLSX = require('xlsx');
var _ = require('underscore');
var sheetReg = /([A-Z]+)([0-9]+):([A-Z]+)([0-9]+)/;
var events = require('events');
var util = require('util');
/*
parseSheetRef finds the boundaries for the spreadsheet
*/
function parseSheetRef(sheetref) {
    var m;
    if ((m = sheetReg.exec(sheetref)) === null)
        return null;
    return {
        cols: {
            min: m[1],
            max: m[3]
        },
        rows: {
            min: Number.parseInt(m[2],10),
            max: Number.parseInt(m[4],10)
        }
    }
}
/*
Converts row to object, emits row event
*/
function rowToObject(sheet, rownum, rowConfig) {
    let o = {};
    let fields = rowConfig.fields;
    let keys = _.keys(fields);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (fields[key].cell) {
            //We have a straight cell reference
            var cell = sheet[fields[key].cell + rownum.toString()];
            o[key] = (cell && cell.v) ? cell.v : null;
        } else if (fields[key].value) {
            o[key] = fields[key].value;
        } else if (fields[key].func instanceof Function) {
            o[key] = fields[key].func(sheet, rownum);
        }

    }
    return o;
}
/*
Excelreader reads an excel spreadsheet and emits the rows as objects. Takes an object with following options:
filename = Excel filename
sheetname= Name of spreadsheet to import from
rowConfig Hash with the emitted properties as key e.g.
"col1":{
    cell:"B"
} 
will emit an object with col1 with values from column B
You can also use value to emit a fixed value, or func which is a function that get the sheet and rownumber as parameters.
"40CharColumn":{
    func:function(sheet,rownum){
        var v;
        var cell = sheet["B" + rownum.toString()];
        if (v.length < 40)
                 return v;
        return v.substr(0, 37) + "...";
    }
},
and an optional filter function to decide if the row should be included in the output. 
    filter: function(sheet, rownum) {
            var cell = sheet["A" + rownum.toString()];
            if (cell && cell.v == "x")
                return true;
            return false;
        }
emits "row" event for each row and "end" when the last row is read
*/
let ExcelReader = function(config) {
    var self = this;
    self.workbook = XLSX.readFile(config.filename);
    self.worksheet = self.workbook.Sheets[config.sheetname];
    self.rowConfig = config.rowConfig;
    var oo = self.worksheet['!ref'];
    self.sheetBounds = parseSheetRef(oo);
    var filterIsFunc = self.rowConfig.filter instanceof Function;
    self.rowCounter = 0;
    self.results = [];
    this.read = function read() {
        for (var i = self.sheetBounds.rows.min; i <= self.sheetBounds.rows.max; i++) {
            if ((filterIsFunc) && self.rowConfig.filter(self.worksheet, i) || !filterIsFunc) {
                var o = rowToObject(self.worksheet, i, self.rowConfig);
                this.emit('row',{
                   row:o,
                   rowNum:i,
                   totalRows:self.sheetBounds.rows.max
                });
                self.results.push(o);
                self.rowCounter++;
            }
        }
        self.emit('end', {
            rows: self.results,
            numRows: self.rowCounter
        });
    };
    return self;
};

util.inherits(ExcelReader, events.EventEmitter);
module.exports = function(config) {
    return new ExcelReader(config);
};