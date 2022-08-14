"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeArguments = void 0;
var asyncUtil_1 = require("./asyncUtil");
var executeArguments = function (argumentMap, passedArguments) {
    var currentArguments = (passedArguments || process.argv);
    asyncUtil_1.AsyncUtil.eachOfSeries(currentArguments, function (argument, triggerNext, callback, counterLog) {
        if (typeof argument === "string") {
            if (argumentMap.hasOwnProperty(argument)) {
                counterLog(argument);
                argumentMap[argument]();
            }
        }
        callback();
    });
};
exports.executeArguments = executeArguments;
