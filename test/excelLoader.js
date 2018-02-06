const fs = require('fs');
const _ = require('underscore');
let excelReader = require('../module/excelReader')({
    filename: 'data/IP-plan_NAV_YE.xls',
    sheetname: 'IP_Plan_YE',
    rowConfig: {
        fields: {
            "Site": {
                cell: "A"
            },
            "Mgmt": {
                cell: "G"
            },
            "LAN": {
                cell: "I"

            },
            "PUB": {
                cell: "J"
            },
            "Router": {
                cell: "S"
            },
            "subnet": {
                cell: "P"
            },

        },
        filter: function(sheet, rownum) {
            var cell = sheet["A" + rownum.toString()];
            var subnetCell = sheet["P" + rownum.toString()];
            if (cell && cell.v && cell.v.length == 4 && cell.v !== "Oslo" && subnetCell && subnetCell.v)
                return true;
            return false;
        }
    }
});
excelReader.on('row', function(o) {
    console.log('read ' + o.rowNum + " of " + o.totalRows.toString());
});
excelReader.on('end', function(result) {
    //Must do none functional crappy way.
    let r = [];
    _.map(result.rows, function(row) {
        if (row.LAN) {
            r.push({
                netmask: row.LAN + "/" + row.subnet,
                name: row.Site,
                type: "LAN"
            });
        }
        if(row.PUB){
             r.push({
                netmask: row.PUB + "/" + row.subnet,
                name: row.Site,
                type: "PUB"
            });
        }
        if(row.Mgmt){
             r.push({
                netmask: row.Mgmt + "/" + row.subnet,
                name: row.Site,
                type: "Switch"
            });
        }
        if(row.Mgmt){
             r.push({
                netmask: row.Mgmt + "/" + row.subnet,
                name: row.Site,
                type: "Switch"
            });
        }
        if(row.Router){
             r.push({
                netmask: row.Router.trim(),
                name: row.Site,
                type: "Router"
            });
        }
    });
    //fs.writeFileSync('data/ipranges.json', JSON.stringify(r, null, 4));

});
excelReader.read();
