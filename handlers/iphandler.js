'use strict';
const fs = require("fs");
const Netmask = require('netmask').Netmask;

let rangetree=new Map();
function readFile(){
    const iprangesStr = fs.readFileSync('./data/ipranges.json');
    let ipranges = JSON.parse(iprangesStr);
    for(let i = 0;i<ipranges.length;i++){
        putAddress(ipranges[i]);
    }
}
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
        if(m.has(-1)){
            let o=m.get(-1);
            let block=o.block;
            try{
            if(block.contains(ipaddress))
                return o.iprange; 
            }
            catch(err){
                return false;
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
module.exports.lookup = function(request,reply){
    const ipaddress=request.params.ipaddress;
    var r=lookupAddress(ipaddress);
    request.log(["debug"],r);
    reply({success:true,found:(r!==false),iprange:r});
};
module.exports.upload = function(request,reply){
    let data = request.payload;
    if(data.file){
              
    }
};
module.exports.reload = function(request,reply){
    readFile();
    request.log(["info"],"IP ranges reloaded");
}