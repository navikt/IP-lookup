const fs = require('fs');
const _ = require('underscore');
const Netmask = require('netmask').Netmask;
module.exports.readExcelFile = function(filename, callback) {
    let excelReader = require('./excelReader')({
        filename: filename,
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
    excelReader.on('end', function(result) {
        //Must do none functional crappy way.
        let r = [];
        let errors = [];
        _.map(result.rows, function(row) {
            if (row.LAN) {
                try {
                    let n = new Netmask(row.LAN);
                    r.push({
                        netmask: row.LAN + "/" + row.subnet,
                        name: row.Site,
                        type: "LAN"
                    });
                }
                catch (err) {
                    errors.push({
                        name: row.Site,
                        message: "Invalid LAN",
                        val: row.LAN
                    });
                }

            }
            if (row.PUB) {
                try {
                    let n = new Netmask(row.PUB);

                    r.push({
                        netmask: row.PUB + "/" + row.subnet,
                        name: row.Site,
                        type: "PUB"
                    });
                }
                catch (err) {
                    errors.push({
                        name: row.Site,
                        message: "Invalid LAN",
                        val: row.PUB
                    });
                }
            }
            if (row.Mgmt) {
                try {

                    let n = new Netmask(row.Mgmt);
                    r.push({
                        netmask: row.Mgmt + "/" + row.subnet,
                        name: row.Site,
                        type: "Switch"
                    });
                }
                catch (err) {
                    errors.push({
                        name: row.Site,
                        message: "Invalid Mgmt",
                        val: row.Mgmt
                    });
                }
            }
            if (row.Router) {
                try {
                    let n = new Netmask(row.Router);
                    r.push({
                        netmask: row.Router.trim(),
                        name: row.Site,
                        type: "Router"
                    });
                }
                catch (err) {
                    errors.push({
                        name: row.Site,
                        message: "Invalid Router",
                        val: row.Router
                    });
                }
            }
        });
        fs.writeFileSync('./data/ipranges.json', JSON.stringify(r, null, 4));
        callback(errors, result);
    });
    excelReader.read();
};