'use strict';
const expect = require("chai").expect;
const server = require('../server');
const request = require("request");
const Netmask = require('netmask').Netmask;
const fs = require('fs');

function readFile() {
    const iprangesStr = fs.readFileSync('./data/ipranges.json');
    let ipranges = JSON.parse(iprangesStr);
    return ipranges;
}
let allranges;
describe('server', function() {
    before(function() {
        server.start();
        allranges = readFile();
    });
    describe("#Lookup", function() {
        it("Should have a hit", function(done) {
            request("http://mvollset-nav-ip-lookup-5633908:8080/lookup/10.202.10.12",
                function(error, response, body) {
                    let result = JSON.parse(body);
                    expect(result.success).to.equal(true);
                    expect(result.iprange.name).to.equal("0617");
                    expect(error).to.equal(null);
                    expect(response.statusCode).to.equal(200);
                    done();
                });
        });
        it("Should have several hits", function(done) {
            for (let i = 0; i<allranges.length; i++) {
                let range = allranges[i];
                if (range) {
                    let block = new Netmask(range.netmask);

                    request("http://mvollset-nav-ip-lookup-5633908:8080/lookup/" + block.last,
                        function(error, response, body) {
                            let result = JSON.parse(body);
                            expect(result.success).to.equal(true);
                            expect(result.iprange.name).to.equal(range.name);
                            expect(error).to.equal(null);
                            expect(response.statusCode).to.equal(200);

                        });
                    request("http://mvollset-nav-ip-lookup-5633908:8080/lookup/" + block.first,
                        function(error, response, body) {
                            let result = JSON.parse(body);
                            expect(result.success).to.equal(true);
                            expect(result.iprange.name).to.equal(range.name);
                            expect(error).to.equal(null);
                            expect(response.statusCode).to.equal(200);

                        });
                }
                else{
                    console.log("########################################");
                    console.log(i);
                    console.dir(range);
                    
                }
            }

            done();
        });
    });
    after(function() {
        server.stop();
    });
});
