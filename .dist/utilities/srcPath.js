"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.srcPath = void 0;
/* Import UTILITIES */
var dBug_1 = require("../utilities/dBug");
/* Import MODULES */
var path_1 = require("path");
var srcPath = function (additionalPath) {
    var deb = new dBug_1.dBug("utilties:srcPath").call();
    var currentPath = (0, path_1.normalize)("".concat(__dirname, "../../../").concat(additionalPath));
    deb("Base Path: ".concat((0, path_1.normalize)("".concat(__dirname, "../../../"))));
    deb("Current Path: ".concat(currentPath));
    return currentPath;
};
exports.srcPath = srcPath;
