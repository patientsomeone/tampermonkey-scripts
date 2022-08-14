"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncUtil = void 0;
var async = require("async");
var debug = require("debug");
var log_1 = require("../utilities/log");
var timeConversion_1 = require("../utilities/timeConversion");
var debPrefix = "utilities:asyncUtil";
var deAsyUtil = debug(debPrefix);
var deEaOfSer = debug("".concat(debPrefix, ":eachOfSeries"));
var AsyncUtil = /** @class */ (function () {
    function AsyncUtil() {
    }
    /**
     * eachOfSeries Aruguments:
     * iteratee: Array or Object to be iterated over
     * iterator: Function to be executed for each item of iteratee
     * -- individualItem: Current item being processed
     * -- key: Number or key currently being processed
     * -- triggerNext: Function which will trigger next item to be processed.
     * -- counterLog: Function to trigger status counter with message
     */
    AsyncUtil.eachOfSeries = function (iteratee, iterator) {
        var _this = this;
        var countData = this.initCounter(iteratee);
        var timeStart = Date.now();
        return new Promise(function (resolve, reject) {
            async.eachOfSeries(iteratee, function (individualItem, key, triggerNext) {
                var individualStart = Date.now();
                var triggerCounter = function (msg) {
                    // log(`${countData.trackedCount} / ${countData.totalCount}`);
                    _this.counter(" ".concat(msg || ""), countData.trackedCount, countData.totalCount, individualStart, timeStart);
                    deEaOfSer("EachOfSeries Status: ".concat(Math.ceil((countData.trackedCount / countData.totalCount) * 100), "% | COMPLETE | ").concat(countData.trackedCount, " / ").concat(countData.totalCount));
                };
                countData.trackedCount += 1;
                iterator(individualItem, key, triggerNext, triggerCounter);
            }, function (data) {
                deEaOfSer("Each of Series completion", data);
                if (!!data && data.hasOwnProperty("err") && data.err) {
                    deEaOfSer("Each of Series rejecting");
                    (0, log_1.log)(data.err);
                    reject();
                }
                else {
                    deEaOfSer("Each of Series resolving");
                    resolve(!!data && data.value);
                }
            });
        });
    };
    /**
     * eachOfLimit Aruguments:
     * iteratee: Array or Object to be iterated over
     * threads: Number of concurent threads, executions at a time
     * iterator: Function to be executed for each item of iteratee
     * -- individualItem: Current item being processed
     * -- key: Number or key currently being processed
     * -- triggerNext: Function which will trigger next item to be processed.
     * -- counterLog: Function to trigger status counter with message
     */
    AsyncUtil.eachOfLimit = function (iteratee, threads, iterator) {
        var _this = this;
        var countData = this.initCounter(iteratee);
        var timeStart = Date.now();
        return new Promise(function (resolve, reject) {
            async.eachOfLimit(iteratee, threads, function (individualItem, key, triggerNext) {
                deEaOfSer("trackedCount ".concat(countData.trackedCount));
                countData.trackedCount += 1;
                var individualStart = Date.now();
                var triggerCounter = function (msg) {
                    _this.counter("".concat(msg + " | " || ""), countData.trackedCount, countData.totalCount, individualStart, timeStart);
                };
                deEaOfSer("EachOfSeries Status: ".concat(Math.ceil((countData.trackedCount / countData.totalCount) * 100), "% | COMPLETE | ").concat(countData.trackedCount, " / ").concat(countData.totalCount));
                iterator(individualItem, key, triggerNext, triggerCounter);
            }, function (data) {
                deEaOfSer("Each of Limit completion", data);
                if (!!data && data.hasOwnProperty("err") && !!data.err) {
                    deEaOfSer("Each of Limit rejecting");
                    (0, log_1.log)(data.err);
                    reject();
                }
                else {
                    deEaOfSer("Each of Limit resolving");
                    resolve(!!data && data.value);
                }
            });
        });
    };
    AsyncUtil.counter = function (msg, key, total, individualStart, timeStart) {
        var debCounter = debug("".concat(debPrefix, ":counter:count"));
        var endTime = Date.now();
        this.average = (this.average + (endTime - individualStart)) / 2;
        (0, log_1.logLine)("".concat(msg));
        (0, log_1.logLine)("".concat(Math.round((key / total) * 100), "% COMPLETE"), 2);
        (0, log_1.logLine)("".concat(key, " / ").concat(total), 3);
        (0, log_1.logLine)("Total Time: ".concat((0, timeConversion_1.elapsed)(timeStart, endTime)), 2);
        (0, log_1.logLine)("Iteration Time: ".concat((0, timeConversion_1.elapsed)(individualStart, endTime)), 3);
        (0, log_1.logLine)("Estimated: ".concat((0, timeConversion_1.elapsed)(0, this.average * (total - Math.round(key)))), 3);
        // logLine(`${msg}${((key) / total)}% | COMPLETE | ${key} / ${total}`);
    };
    AsyncUtil.initCounter = function (iteratee) {
        var countProperties = {
            totalCount: 0,
            trackedCount: 0
        };
        var debCounter = debug("".concat(debPrefix, ":counter:init"));
        debCounter("Initializing Counter");
        debCounter(iteratee);
        if (typeof iteratee !== "object") {
            (0, log_1.logLine)("Counter Fail");
            (0, log_1.logLine)("Iteratee: ".concat(iteratee, " is not an object"));
            (0, log_1.logLine)("End Counter Fail");
        }
        else if (iteratee === null) {
            (0, log_1.logLine)("Counter Fail");
            (0, log_1.logLine)("Iteratee: ".concat(iteratee, " is null"));
            (0, log_1.logLine)("End Counter Fail");
        }
        else {
            countProperties.totalCount = Object.keys(iteratee).length;
        }
        return countProperties;
    };
    AsyncUtil.average = 0;
    return AsyncUtil;
}());
exports.AsyncUtil = AsyncUtil;
