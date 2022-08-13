"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = exports.decrypt = void 0;
/* Import MODULES */
const atob = require("atob");
const btoa = require("btoa");
const dBug_1 = require("../utilities/dBug");
const debCrypt = new dBug_1.dBug("agents:oosConnect");
const decrypt = (value) => {
    // const debDecrypt = debCrypt.set("decrypt");
    // debDecrypt(`Decrypting value ${value}`);
    return atob(atob(value));
};
exports.decrypt = decrypt;
const encrypt = (value) => {
    // const debEncrypt = debCrypt.set("encrypt");
    // debEncrypt(`Encrypting value ${value}`);
    return btoa(btoa(value));
};
exports.encrypt = encrypt;
