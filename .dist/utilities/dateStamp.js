"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceStamp = exports.dateStamp = void 0;
/* Utilities */
var log_1 = require("../utilities/log");
var dateStamp = function () {
    (0, log_1.log)("Generating Date Stamp");
    var today = new Date();
    var day = (function () {
        var currentDay = today.getDate();
        if (currentDay < 10) {
            return "0" + currentDay.toString();
        }
        else {
            return currentDay;
        }
    })();
    var month = (function () {
        var currentMonth = today.getMonth() + 1;
        if (currentMonth < 10) {
            return "0" + currentMonth.toString();
        }
        else {
            return currentMonth;
        }
    })();
    ;
    var year = today.getFullYear();
    return ("".concat(year.toString().slice(2, 4), ".").concat(month, ".").concat(day));
};
exports.dateStamp = dateStamp;
/**
 * Replaces **dateStamp** in any string with dateStamp
 * @param contents
 */
var replaceStamp = function (contents) {
    (0, log_1.log)("Replacing Date Stamp");
    var date = (0, exports.dateStamp)();
    return contents.split("**dateStamp**").join(date);
};
exports.replaceStamp = replaceStamp;
