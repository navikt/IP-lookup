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
  },
  {
    method: 'GET',
    path: '/lookup/{ipaddress}',
    handler: iphandler.lookup
  },
  {
    method: 'GET',
    path: '/lookupname/{name}',
    handler: iphandler.lookupName
  },
  {
    method: 'POST',
    path:'/endpoint',
    handler:iphandler.addEndpoint
  },  
  {
    method: 'POST',
    path: '/upload',
    config: {

      payload: {
        maxBytes: 1000 * 1000 * 100, // 100 Mb
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data'
      },
      handler: iphandler.upload
    }
  }, {
    method: 'POST',
    path: '/reload',
    handler: iphandler.reload
  }
];
