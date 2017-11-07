'use strict';
const iphandler = require("./handlers/iphandler.js");
module.exports = [{
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    request.log(["get"], "alive");
    reply({
      success: true,
      application: "iplookup-nav"
    });
  }
}, {
  method: 'GET',
  path: '/lookup/{ipaddress}',
  handler: iphandler.lookup
}];
