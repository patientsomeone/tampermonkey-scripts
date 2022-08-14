"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dBug = exports.debLine = void 0;
var debug = require("debug");
var debLine = function (title) {
    if (title) {
        return "~-~-~-~-~-~-~ ".concat(title, " ~-~-~-~-~-~-~");
    }
    else {
        return "~-~-~-~-~-~-~ ~-~-~-~-~-~-~ ~-~-~-~-~-~-~";
    }
};
exports.debLine = debLine;
var dBug = /** @class */ (function () {
    /**
     * Generate debugger prefix
     *   RECOMMENDATION: Prefix as path
     *     folderName:fileName
     */
    function dBug(prefix) {
        var _this = this;
        /**
         * Generate debugger with suffix
         *   RECOMMENDATION: suffix as method name
         *     {folderName:fileName:}methodName
         */
        this.set = function (suffix) {
            return debug("".concat(_this.prefixedBugger, ":").concat(suffix));
        };
        this.call = function () {
            return debug(_this.prefixedBugger);
        };
        this.prefixedBugger = prefix;
    }
    return dBug;
}());
exports.dBug = dBug;
var test = function () {
    var test = new dBug("test").set("test");
    test("This is a test");
};
// test();
