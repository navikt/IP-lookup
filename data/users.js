'use strict';
const config = require("../config/config");
const users = config.users;
module.exports.validateFunction = function(token, callback) {
    console.log("Yihaa");
    for (let i in users) {
        if (users[i].token === token) {
            callback(null, true, {
                user: users[i].uid,
                scope: users[i].scope
            });
            return;
        }
    }
    callback(null,false,{});
};

    