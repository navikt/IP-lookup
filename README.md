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
Should be an array of iprange objects, the only requires property is netmask, 
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

