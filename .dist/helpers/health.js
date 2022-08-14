"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("../utilities/log");
var health = function () {
    return {
        status: "Okay"
    };
};
(0, log_1.log)(health());
exports.default = health;
