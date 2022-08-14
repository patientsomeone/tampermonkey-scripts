"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("../utilities/log");
var urlLoader_1 = require("../utilities/urlLoader");
urlLoader_1.LoadUrl.single(url)
    .then(function (urlData) {
    (0, log_1.log)(urlData);
})
    .catch(function () {
});
// Additional Line
