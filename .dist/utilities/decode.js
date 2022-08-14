"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = exports.decrypt = void 0;
/* Import MODULES */
var atob = require("atob");
var btoa = require("btoa");
var dBug_1 = require("../utilities/dBug");
var debCrypt = new dBug_1.dBug("agents:oosConnect");
var decrypt = function (value) {
    // const debDecrypt = debCrypt.set("decrypt");
    // debDecrypt(`Decrypting value ${value}`);
    return atob(atob(value));
};
exports.decrypt = decrypt;
var encrypt = function (value) {
    // const debEncrypt = debCrypt.set("encrypt");
    // debEncrypt(`Encrypting value ${value}`);
    return btoa(btoa(value));
};
exports.encrypt = encrypt;
