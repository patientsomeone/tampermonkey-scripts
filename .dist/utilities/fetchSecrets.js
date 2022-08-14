"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Secrets = void 0;
/* UTILITIES */
var dBug_1 = require("../utilities/dBug");
var fsUtils_1 = require("../utilities/fsUtils");
var log_1 = require("../utilities/log");
var objecExtend_1 = require("../utilities/objecExtend");
var srcPath_1 = require("../utilities/srcPath");
var debg = new dBug_1.dBug("utilities:fetchSecrets");
var Secrets = /** @class */ (function () {
    function Secrets(intendedSecrets) {
        var _this = this;
        this.fetch = function () {
            var fs = new fsUtils_1.FsUtils((0, srcPath_1.srcPath)("secrets.i.json"));
            var debFetch = debg.set("Secrets:fetch");
            debFetch("Fetching Secrets");
            return fs.read.properties(_this.intendedSecrets)
                .then(function (props) {
                debFetch("Secrets Received");
                debFetch(props);
                _this.secrets = (0, objecExtend_1.objectExtend)(_this.intendedSecrets, props);
                debFetch("Secrets Set");
                debFetch(_this.secrets);
                return Promise.resolve(_this.secrets);
            })
                .catch(function (err) {
                debFetch("Something went wrong");
                debFetch(err);
                return Promise.reject(err);
            });
        };
        this.secrets = {};
        this.intendedSecrets = intendedSecrets;
    }
    return Secrets;
}());
exports.Secrets = Secrets;
var test = function () {
    var testProps = new Secrets({
        test: "tested",
        anotherTest: {
            successA: true,
            successB: true
        }
    });
    (0, log_1.log)(testProps.fetch());
};
// test();
