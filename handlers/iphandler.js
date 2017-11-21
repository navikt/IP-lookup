'use strict';
const fs = require("fs");
const Netmask = require('netmask').Netmask;
const tmp = require('tmp');
const excelLoader = require("../module/excelLoader");
let rangetree = new Map();

function readFile() {
    const iprangesStr = fs.readFileSync('./data/ipranges.json');
    let ipranges = JSON.parse(iprangesStr);
    for (let i = 0; i < ipranges.length; i++) {
        putAddress(ipranges[i]);
    }
}

function putAddress(iprange) {
    let curmap = rangetree;
    let block = new Netmask(iprange.netmask);
    let maskparts = block.mask.split('.');
    let baseparts = block.base.split('.');
    let intmask = maskparts.map(function(s) {
        return parseInt(s, 10);
    });
    let intbase = baseparts.map(function(s) {
        return parseInt(s, 10);
    });
    for (let i = 0; i < maskparts.length; i++) {
        if (intmask[i] === 255) {
            if (!curmap.has(intbase[i])) {

                let temp = new Map();
                curmap.set(intbase[i], temp);
                curmap = temp;
            }
            else {
                curmap = curmap.get(intbase[i]);
            }
        }
    }
    if (curmap.has(-1)) {
        let n = curmap.get(-1);
        n.push({ iprange: iprange, block: block });
        curmap.set(-1, n);
    }
    else
        curmap.set(-1, [{ iprange: iprange, block: block }]);
}

function lookupAddress(ipaddress) {
    let parts = ipaddress.split('.').map(function(s) {
        return parseInt(s, 10);
    });
    let m = rangetree;
    for (let i = 0; i < parts.length; i++) {
        if (m.has(parts[i])) {
            m = m.get(parts[i]);
        }
        if (m.has(-1)) {
            let o = m.get(-1);
            for (let k = 0; k < o.length; k++) {
                let block = o[k].block;
                try {
                    if (block.contains(ipaddress))
                        return o[k].iprange;
                }
                catch (err) {
                    return false;
                }
            }
        }
    }
    return false;
}
/*for(let i=0;i<ipranges.length;i++){
        let iprange=ipranges[i];
        //
        let block = new Netmask(ipranges[i].netmask);
        console.dir(block);
        putAddress(iprange);
}*/
readFile();
module.exports.lookup = function(request, reply) {
    const ipaddress = request.params.ipaddress;
    var r = lookupAddress(ipaddress);
    request.log(["debug"], r);
    reply({ success: true, found: (r !== false), iprange: r });
};
module.exports.upload = function(request, reply) {
    let data = request.payload;
    if (data.file) {
        let tmpobj = tmp.fileSync({ dir: './workfolder' });
        console.log('File: ', tmpobj.name);
        console.log('Filedescriptor: ', tmpobj.fd);
        let file = fs.createWriteStream(tmpobj.name);
        data.file.pipe(file);
        data.file.on('end', function(err) {
            if (err) {
                reply({ success: false, error: err });
            }
            else {
                excelLoader.readExcelFile(tmpobj.name, function(error, result) {
                    tmpobj.removeCallback();
                    reply({ success: true, errors: error });
                });
            }
        });

    }
};
module.exports.reload = function(request, reply) {
    readFile();
    request.log(["info"], "IP ranges reloaded");
};
