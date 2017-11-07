'use strict';
const fs= require("fs");
const v=fs.readFileSync('tt.json');
const json=JSON.parse(v);
fs.writeFileSync('tt.formatted.json',JSON.stringify(json,null,4));
