# IP-Lookup #
Simple ip lookup service. If you have a list of netmasks you can use the service to check if an ip address is in any of the ranges and return information about that range.

usage:
curl -x GET <yoursites url>/lookup/<ipaddress> eg
curl -x GET http://localhost:8080/lookup/127.0.0.1
returns:
{"success":true,"found":false,"iprange":false}

The list of netmasks is based on the file data/ipranges.json any additional attributes for each netmask is returned in the iprange property of the returned object.

mv:~/workspace (master) $ curl  http://localhost:8080/lookup/10.208.21.12
{"success":true,"found":true,"iprange":{"netmask":"10.208.21.0/255.255.255.0","name":"0136","type":"PUB"}}
## ipranges.json ##
Should be an array of iprange objects, the only required property is netmask, 
```json
[
    {
        "netmask": "10.200.0.0/255.255.254.0",
        "name": "Main Office",
        "type": "LAN"
    },
    {
        "netmask": "10.208.0.0/255.255.254.0",
        "name": "Tech. SUpport",
        "type": "WAN"
    }
]
```
### Netmask format ###
Netmasks can be give on the following forms:

```
'216.240.32.0/24'               // The preferred form.
'216.240.32.0/255.255.255.0'
'216.240.32.0', '255.255.255.0'
'216.240.32.0', 0xffffff00
'216.240.32.4'                  // A /32 block.
'216.240.32'                    // A /24 block.
'216.240'                       // A /16 block.
'140'                           // A /8 block.
'216.240.32/24'
'216.240/16'
```

## Excel import ## 

You can upload an excel sheet by posting to upload, at present you can not configure the import. It expects the spreadsheet be formatted as IP_Plan_YE.xls 
If you need to change the import format, you can edit the excelLoader.js in the module folder. excelLoader uses the excelReader module and can be configured like this:
## Excelreader ## 

reads an excel spreadsheet and emits the rows as objects. Takes an object with following options:
filename = Excel filename
sheetname= Name of spreadsheet to import from
rowConfig Hash with the emitted properties as key e.g.
```js
"col1":{
    cell:"B"
}
```
will emit an object with col1 with values from column B

You can also use value to emit a fixed value, or func which is a function that get the sheet and rownumber as parameters.
```js
//Fixed value
"constant":{
    value:"CONSTANT"
},
//Function 
"40CharColumn":{
    func:function(sheet,rownum){
        var cell = sheet["B" + rownum.toString()];
        var v = cell.v;
        if (v.length < 40)
                 return v;
        return v.substr(0, 37) + "...";
    }
}
```
You can also supply a filter that decide the row should be included in the output. 

```js
    filter: function(sheet, rownum) {
            var cell = sheet["A" + rownum.toString()];
            if (cell && cell.v == "x")
                return true;
            return false;
        }
```
The module emits each row as it get processed as well as an end event when the whole file is read. 

Emits "row" event for each row and "end" when the last row is read


