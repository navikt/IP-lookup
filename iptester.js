'use strict';
var Netmask = require('netmask').Netmask
const ipranges=[
    {
        netmask:"10.200.0.0/23",
        name:"0101"
    },
     {
        netmask:"10.212.56.0/22",
        name:"0100"
    }
    ];
let rangetree=new Map();
function putAddress(iprange){
    let curmap=rangetree;
    let block = new Netmask(iprange.netmask);
    let maskparts=block.mask.split('.');
    let baseparts=block.base.split('.');
    let intmask=maskparts.map(function(s){
        return parseInt(s,10);
    });
    let intbase = baseparts.map (function(s){
        return parseInt(s,10);
    });
    for(let i=0;i<maskparts.length-1;i++){
        if(intmask[i]===255){
            if(!curmap.has(intbase[i])){
                
                let temp=new Map();
                curmap.set(intbase[i],temp);
                curmap= temp;
            }
            else{
                curmap=curmap.get(intbase[i]);
            }
        }
    }
    curmap.set(-1,{iprange:iprange,block:block});
}
function lookupAddress(ipaddress){
    let parts=ipaddress.split('.').map(function(s){
        return parseInt(s,10);
    });
    let m=rangetree;
    for(let i = 0;i<parts.length;i++){
        if(m.has(parts[i])){
            m=m.get(parts[i]);
        }
        console.dir(m);
        if(m.has(-1)){
            let o=m.get(-1);
            let block=o.block;
            if(block.contains(ipaddress))
                return o.iprange; 
        }
    }
    return false;
}
for(let i=0;i<ipranges.length;i++){
        let iprange=ipranges[i];
        //
        let block = new Netmask(ipranges[i].netmask);
        console.dir(block);
        putAddress(iprange);
    }
console.dir(rangetree);    
console.log(lookupAddress('10.212.57.155'));