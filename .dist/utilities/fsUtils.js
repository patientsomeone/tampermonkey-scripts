"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FsUtils = void 0;
var dBug_1 = require("../utilities/dBug");
var log_1 = require("../utilities/log");
var objecExtend_1 = require("../utilities/objecExtend");
/* Import MODULES */
var fs = require("fs");
var JSONStream = require("JSONStream");
var deb = new dBug_1.dBug("utilities:fsUtils");
var FsUtils = /** @class */ (function () {
    function FsUtils(filePath) {
        var _this = this;
        /**
         * Reads file defined in filePath, returns data in utf-8
         * @param filePath Path to file to be read
         */
        this.read = {
            raw: function () {
                return new Promise(function (resolve, reject) {
                    var debRead = deb.set("read:raw");
                    debRead((0, dBug_1.debLine)("CURRENT WORKING DATA"));
                    debRead(_this.workingData);
                    fs.readFile(_this.workingData.filePath, "utf-8", function (error, data) {
                        if (!error) {
                            debRead((0, dBug_1.debLine)("FILE READ SUCCESS"));
                            _this.workingData.data = data;
                            _this.workingData.error = error;
                            resolve(_this.workingData);
                        }
                        else {
                            debRead((0, dBug_1.debLine)("FILE READ ERROR"));
                            _this.workingData.data = data;
                            _this.workingData.error = error;
                            reject(_this.workingData);
                        }
                    });
                });
            },
            properties: function (defaultProperties) {
                var deb = _this.deb.set("read:properties");
                return _this.check()
                    .then(_this.read.raw)
                    .catch(function (error) {
                    deb("No Properties file located. Creating");
                    return _this.create.json(defaultProperties)
                        .then(function () {
                        return Promise.resolve(defaultProperties);
                    });
                })
                    .then(function (result) {
                    deb("Properties File available");
                    deb("File Results");
                    deb(result);
                    // @ts-ignore
                    var data = JSON.parse(result.data);
                    deb("Data Parsed");
                    deb(data);
                    var newData = (0, objecExtend_1.objectExtend)(defaultProperties, data);
                    _this.create.json(newData);
                    return Promise.resolve(newData);
                });
            },
            jsonStream: function (iterator) {
                return new Promise(function (resolve, reject) {
                    var debRead = deb.set("read:jsonStream");
                    debRead((0, dBug_1.debLine)("CURRENT WORKING DATA"));
                    debRead(_this.workingData);
                    var readStream = fs.createReadStream(_this.workingData.filePath);
                    var parser = JSONStream.parse();
                    readStream.pipe(parser);
                    parser.on("data", iterator);
                    // parser.on("data", (data) => {
                    //     log(`key: ${data.key}`);
                    //     log(`value: ${data.value}`);
                    // });
                    parser.on("end", function () {
                        Promise.resolve();
                    });
                    fs.readFile(_this.workingData.filePath, "utf-8", function (error, data) {
                        if (!error) {
                            debRead((0, dBug_1.debLine)("FILE READ SUCCESS"));
                            _this.workingData.data = data;
                            _this.workingData.error = error;
                            resolve(_this.workingData);
                        }
                        else {
                            debRead((0, dBug_1.debLine)("FILE READ ERROR"));
                            _this.workingData.data = data;
                            _this.workingData.error = error;
                            reject(_this.workingData);
                        }
                    });
                });
            }
        };
        // public stream = (onChunk: (chunk: any) => void) => {
        //     return new Promise((resolve, reject) => {
        //         const debStream = deb.set("stream");
        //         const stream = fs.createReadStream(this.workingData.filePath, "utf-8");
        //         stream.on("ready", (data) => {
        //             debStream("Stream open. Processesing...");
        //             debStream(data);
        //         });
        //         stream.on("data", (chunk) => {
        //             debStream(chunk);
        //             if (typeof onChunk === "function") {
        //                 onChunk(chunk);
        //             }
        //         });
        //         stream.on("end", (data) => {
        //             debStream(data);
        //             resolve();
        //         });
        //         return
        //     })
        // }
        this.create = {
            json: function (input) {
                var debCreate = deb.set("create:json");
                debCreate((0, dBug_1.debLine)("CURRENT WORKING DATA"));
                debCreate(_this.workingData);
                return new Promise(function (resolve, reject) {
                    var json = JSON.stringify(input);
                    _this.workingData.data = json;
                    debCreate("Attempting to create JSON File at ".concat(_this.workingData.filePath));
                    debCreate(json);
                    fs.writeFile(_this.workingData.filePath, json, "utf-8", function (error) {
                        if (!error) {
                            _this.workingData.error = error;
                            debCreate("File write complete");
                            resolve(_this.workingData);
                        }
                        else {
                            _this.workingData.error = error;
                            debCreate((0, dBug_1.debLine)("WRITE ERROR ENCOUNTERED"));
                            debCreate(error);
                            reject(_this.workingData);
                        }
                    });
                });
            },
            raw: function (input) {
                var debCreate = deb.set("create:raw");
                debCreate((0, dBug_1.debLine)("CURRENT WORKING DATA"));
                debCreate(_this.workingData);
                return new Promise(function (resolve, reject) {
                    _this.workingData.data = input;
                    debCreate("Attempting to create JSON File at ".concat(_this.workingData.filePath));
                    debCreate(input);
                    fs.writeFile(_this.workingData.filePath, input, "utf-8", function (error) {
                        if (!error) {
                            _this.workingData.error = error;
                            debCreate("File write complete");
                            resolve(_this.workingData);
                        }
                        else {
                            _this.workingData.error = error;
                            debCreate((0, dBug_1.debLine)("WRITE ERROR ENCOUNTERED"));
                            debCreate(error);
                            reject(_this.workingData);
                        }
                    });
                });
            }
        };
        this.writeStream = {
            json: function (input) {
                var debCreate = deb.set("create:json");
                debCreate((0, dBug_1.debLine)("CURRENT WORKING DATA"));
                debCreate(_this.workingData);
                return new Promise(function (resolve, reject) {
                    var json = JSON.stringify(input);
                    _this.workingData.data = json;
                    _this.wStream = fs.createWriteStream(_this.workingData.filePath);
                    debCreate("Attempting to create JSON File at ".concat(_this.workingData.filePath));
                    debCreate(json);
                    _this.wStream.write(json, "utf-8", function (error) {
                        if (!error) {
                            _this.workingData.error = error;
                            debCreate("File write complete");
                            resolve(_this.workingData);
                        }
                        else {
                            _this.workingData.error = error;
                            debCreate((0, dBug_1.debLine)("WRITE ERROR ENCOUNTERED"));
                            debCreate(error);
                            reject(_this.workingData);
                        }
                    });
                });
            }
        };
        this.check = function () {
            return new Promise(function (resolve, reject) {
                var debCheck = deb.set("checkFile");
                debCheck((0, dBug_1.debLine)("CURRENT WORKING DATA"));
                debCheck(_this.workingData);
                fs.access(_this.workingData.filePath, fs.constants.F_OK, function (error) {
                    if (!error) {
                        debCheck("".concat(_this.workingData.filePath, " exists."));
                        _this.workingData.error = error;
                        resolve(_this.workingData);
                    }
                    else {
                        (0, log_1.logLine)("".concat(_this.workingData.filePath, " does not exist."));
                        _this.workingData.error = error;
                        reject(_this.workingData);
                    }
                });
            });
        };
        this.delete = function () {
            return new Promise(function (resolve, reject) {
                fs.unlink(_this.workingData.filePath, function (err) {
                    if (!err) {
                        resolve("success");
                    }
                    else {
                        reject(err);
                    }
                });
            });
        };
        this.workingData = {
            filePath: filePath,
            error: null,
            data: null
        };
        this.deb = new dBug_1.dBug("utilities:fsUtils");
    }
    return FsUtils;
}());
exports.FsUtils = FsUtils;
