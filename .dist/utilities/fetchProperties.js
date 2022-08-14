"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Properties = void 0;
/* UTILITIES */
var dBug_1 = require("../utilities/dBug");
var fsUtils_1 = require("../utilities/fsUtils");
var log_1 = require("../utilities/log");
var objecExtend_1 = require("../utilities/objecExtend");
var srcPath_1 = require("../utilities/srcPath");
var debg = new dBug_1.dBug("utilities:fetchProperties");
var Properties = /** @class */ (function () {
    function Properties(intendedProperties) {
        this.fetch = function () {
            var _this = this;
            var fs = new fsUtils_1.FsUtils((0, srcPath_1.srcPath)("properties.i.json"));
            var debFetch = debg.set("Properties:fetch");
            debFetch("Fetching Properties");
            return fs.read.properties(this.intendedProperties)
                .then(function (props) {
                debFetch("Properties Received");
                debFetch(props);
                _this.properties = (0, objecExtend_1.objectExtend)(_this.intendedProperties, props);
                debFetch("Properties Set");
                debFetch(_this.properties);
                return Promise.resolve(_this.properties);
            })
                .catch(function (err) {
                debFetch("Something went wrong");
                debFetch(err);
                return Promise.reject(err);
            });
        };
        this.properties = {};
        this.intendedProperties = intendedProperties;
    }
    return Properties;
}());
exports.Properties = Properties;
var test = function () {
    var testProps = new Properties({
        test: "tested",
        anotherTest: {
            successA: true,
            successB: true
        }
    });
    (0, log_1.log)(testProps.fetch);
};
// test();
