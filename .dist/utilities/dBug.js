"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dBug = exports.debLine = void 0;
const debug = require("debug");
const debLine = (title) => {
    if (title) {
        return `~-~-~-~-~-~-~ ${title} ~-~-~-~-~-~-~`;
    }
    else {
        return "~-~-~-~-~-~-~ ~-~-~-~-~-~-~ ~-~-~-~-~-~-~";
    }
};
exports.debLine = debLine;
class dBug {
    /**
     * Generate debugger prefix
     *   RECOMMENDATION: Prefix as path
     *     folderName:fileName
     */
    constructor(prefix) {
        /**
         * Generate debugger with suffix
         *   RECOMMENDATION: suffix as method name
         *     {folderName:fileName:}methodName
         */
        this.set = (suffix) => {
            return debug(`${this.prefixedBugger}:${suffix}`);
        };
        this.call = () => {
            return debug(this.prefixedBugger);
        };
        this.prefixedBugger = prefix;
    }
}
exports.dBug = dBug;
const test = () => {
    const test = new dBug("test").set("test");
    test("This is a test");
};
// test();
