'use strict';
const fs = require("fs");
const v = fs.readFileSync('tt.json');
const _ = require('underscore');
const json = JSON.parse(v);
let fields = json.projects[0].issuetypes[0].fields;
var map = {};
const keys = _.keys(fields);
for (let i=0;i<keys.length;i++) {
    let key = keys[i];
    let field = fields[key];
    if (field) {
        if (field.schema && field.schema.customId) {
            map[field.name] = key;
        }
        else
            map[key] = key;
    }
}
fs.writeFileSync('map.formatted.json', JSON.stringify(map, null, 4));
