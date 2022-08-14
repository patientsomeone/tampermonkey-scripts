"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchManifest = void 0;
var dBug_1 = require("../utilities/dBug");
var fsUtils_1 = require("../utilities/fsUtils");
var objecExtend_1 = require("../utilities/objecExtend");
var srcPath_1 = require("../utilities/srcPath");
var debManifest = new dBug_1.dBug("helpers:jsonManifest:fetchManifest");
var propsFile = (0, srcPath_1.srcPath)("properties.i.json");
var defaultProps = {
    helpers: {
        manifest: {
            updated: "./manifest.i.json",
            pulled: "./manifest_pulled.i.json"
        }
    }
};
var fetchManifest = function () {
    var properties = {
        updated: "",
        pulled: ""
    };
    var fsUpdated = new fsUtils_1.FsUtils(properties.updated);
    var fsPulled = new fsUtils_1.FsUtils(properties.pulled);
    var fetchProperties = function () {
        var deb = debManifest.set("fetchProperties");
        var fs = new fsUtils_1.FsUtils(propsFile);
        return fs.read.properties(defaultProps)
            .then(function (props) {
            deb("Manifest Properties Received");
            deb(props);
            for (var key in props.helpers.manifest) {
                if (props.helpers.manifest.hasOwnProperty(key)) {
                    deb("Setting Manifest Properties for ".concat(key));
                    deb(props.helpers.manifest[key]);
                    properties[key] = props.helpers.manifest[key];
                }
            }
        })
            .then(function () {
            deb("Manifest Properties Updated");
            deb(properties);
        });
    };
    var mergeManifest = function () {
        var deb = debManifest.set("mergeManifest");
        var workingManifest = {};
        var fetchUpdated = function () {
            deb("Checking for manifest at ".concat(properties.updated));
            return fsUpdated.check()
                .then(function () {
                return fsUpdated.read.raw()
                    .then(function (result) {
                    deb("Updated Manifest obtained");
                    deb(result);
                    var manifestData = JSON.parse(result.data);
                    deb("Updated Manifest parsed");
                    deb(manifestData);
                    return Promise.resolve(manifestData);
                });
            })
                .catch(function () {
                deb("Updated Manifest Not Located");
                return Promise.resolve({});
            });
        };
        var fetchPulled = function () {
            deb("Checking for manifest at ".concat(properties.pulled));
            return fsPulled.check()
                .then(function () {
                return fsPulled.read.raw()
                    .then(function (result) {
                    deb("Pulled Manifest obtained");
                    deb(result);
                    var manifestData = JSON.parse(result.data);
                    deb("Pulled Manifest parsed");
                    deb(manifestData);
                    return Promise.resolve(manifestData);
                });
            })
                .catch(function () {
                deb("Pulled Manifest Not Located");
                var emptyManfest = {};
                return Promise.resolve({});
            });
        };
        return fetchUpdated()
            .then(function (manifest) {
            deb("Current manifest");
            deb(manifest);
            var currentManifest = manifest;
            return fetchPulled()
                .then(function (manifest) {
                deb("Pulled manifest");
                deb(manifest);
                workingManifest = (0, objecExtend_1.objectExtend)(currentManifest, manifest);
                deb("Extended Manifest");
                deb(workingManifest);
                return Promise.resolve(workingManifest);
            });
        });
    };
    var updateManifest = function (manifestData) {
        var deb = debManifest.set("fetchManifest:updateManifest");
        return fsUpdated.create.json(manifestData)
            .then(function () {
            return Promise.resolve(manifestData);
        })
            .catch(function (err) {
            deb("something went wrong");
            deb(err);
            return Promise.reject(err);
        });
    };
    var deb = debManifest.call();
    deb("BEGINNING MANIFEST FETCH");
    return fetchProperties()
        .then(function () {
        fsUpdated = new fsUtils_1.FsUtils((0, srcPath_1.srcPath)(properties.updated));
        fsPulled = new fsUtils_1.FsUtils((0, srcPath_1.srcPath)(properties.pulled));
        return Promise.resolve();
    })
        .then(mergeManifest)
        .then(function (manifest) {
        deb("Manifest Merge Complete");
        deb(manifest);
        return updateManifest(manifest);
    });
};
exports.fetchManifest = fetchManifest;
