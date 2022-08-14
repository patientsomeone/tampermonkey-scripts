"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Json = void 0;
/* Import UTILITIES */
var dBug_1 = require("../utilities/dBug");
var fsUtils_1 = require("../utilities/fsUtils");
var deb = new dBug_1.dBug("helpers:file");
var Json = /** @class */ (function () {
    function Json(filePath, jsonTemplate, options) {
        var _this = this;
        this.get = function () {
            var debGet = deb.set("json");
            debGet((0, dBug_1.debLine)());
            debGet("Checking for file ".concat(_this.filePath));
            _this.workingData.filePath = _this.filePath;
            /* Check existance of intended file */
            return _this.file.check()
                .then(function (data) {
                /* Read file */
                debGet("File check succeeded");
                return _this.file.read.raw()
                    .then(function (readData) {
                    var jsonContents = JSON.parse(readData.data);
                    debGet("File contents read");
                    debGet(jsonContents);
                    return Promise.resolve(jsonContents);
                });
            }, function (err) {
                /* Create file */
                debGet("File Not located. AutoCreate set to ".concat(_this.options.autoCreate, ". | ").concat(_this.options.autoCreate ? "Creating file" : "Stopping"));
                _this.workingData.exists = false;
                if (!_this.options.autoCreate) {
                    debGet("File creation declined");
                    return Promise.reject(_this.workingData);
                }
                debGet("Attempting file creation");
                return _this.file.create.json(_this.jsonTemplate)
                    .then(function (result) {
                    debGet("File creation successful");
                    debGet(result);
                    _this.workingData.created = true;
                    _this.workingData.error = result.error;
                    _this.workingData.data = result.data;
                    return Promise.reject(_this.workingData);
                }, function (err) {
                    debGet("File creation failed");
                    debGet(err);
                    _this.workingData.data = err.data;
                    _this.workingData.error = err.error;
                    return Promise.reject(_this.workingData);
                });
            });
        };
        this.filePath = filePath;
        this.jsonTemplate = jsonTemplate;
        this.options = options;
        this.file = new fsUtils_1.FsUtils(this.filePath);
        this.workingData = {
            exists: false,
            created: false
        };
    }
    return Json;
}());
exports.Json = Json;
