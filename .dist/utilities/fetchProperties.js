"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Properties = void 0;
/* UTILITIES */
const dBug_1 = require("../utilities/dBug");
const fsUtils_1 = require("../utilities/fsUtils");
const log_1 = require("../utilities/log");
const objecExtend_1 = require("../utilities/objecExtend");
const srcPath_1 = require("../utilities/srcPath");
const debg = new dBug_1.dBug("utilities:fetchProperties");
class Properties {
    constructor(intendedProperties) {
        this.fetch = function () {
            const fs = new fsUtils_1.FsUtils((0, srcPath_1.srcPath)("properties.i.json"));
            const debFetch = debg.set("Properties:fetch");
            debFetch("Fetching Properties");
            return fs.read.properties(this.intendedProperties)
                .then((props) => {
                debFetch("Properties Received");
                debFetch(props);
                this.properties = (0, objecExtend_1.objectExtend)(this.intendedProperties, props);
                debFetch("Properties Set");
                debFetch(this.properties);
                return Promise.resolve(this.properties);
            })
                .catch((err) => {
                debFetch("Something went wrong");
                debFetch(err);
                return Promise.reject(err);
            });
        };
        this.properties = {};
        this.intendedProperties = intendedProperties;
    }
}
exports.Properties = Properties;
const test = () => {
    const testProps = new Properties({
        test: "tested",
        anotherTest: {
            successA: true,
            successB: true
        }
    });
    (0, log_1.log)(testProps.fetch);
};
// test();
