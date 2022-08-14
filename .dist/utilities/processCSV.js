"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSV = void 0;
var parseCsv = require("csv-parse");
var debug = require("debug");
var fastCsv = require("fast-csv");
var fs = require("fs");
var asyncUtil_1 = require("./asyncUtil");
var log_1 = require("./log");
/*-- Define Column URL is located at --*/
var checkCol = 1;
/*-- DEBUGGERS --*/
// const log = debug("log:utilities:csv*");
var deRead = debug("utilities:csv:read");
var deWrite = debug("utilities:csv:write");
var deSani = debug("utilities:csv:write:sanitize");
var deWebId = debug("utilities:csv:getWebIdColumn");
var CSV = /** @class */ (function () {
    function CSV(outputFile) {
        this.writeStream = fs.createWriteStream(outputFile);
        this.output = outputFile;
    }
    CSV.readStream = function (inputFile, lineCallback) {
        return new Promise(function (resolve, reject) {
            deRead("CSV STREAM BEGIN");
            var sanitizeArray = function (arr) {
                return arr.map(function (currentString) {
                    return String.prototype.trim.apply(currentString);
                });
            };
            var currentRow = 0;
            var rowCallback = function (currentLine, rowIteration) {
                if (typeof lineCallback === "function") {
                    deRead("Executing line callback");
                    return lineCallback(currentLine, rowIteration);
                }
                else {
                    deRead("No line callback provided, continuing");
                    return Promise.resolve();
                }
            };
            var stream = fs.createReadStream(inputFile);
            var csvStream = fastCsv()
                .on("data", function (data) {
                stream.pause();
                var trimRow = sanitizeArray(data);
                deRead("Current Row", trimRow);
                rowCallback(trimRow, currentRow)
                    .then(function () {
                    deRead("ROW COMPLETE");
                    deRead(trimRow);
                    stream.resume();
                });
                currentRow += 1;
            })
                .on("end", function () {
                resolve();
            });
            stream.pipe(csvStream);
        });
    };
    CSV.read = function (inputFile, lineCallback, restrictCount) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            deRead("CSV READ BEGIN");
            _this.trimmedData = [];
            _this.totalRows = 0;
            _this.rowCallback = function (currentLine, rowIteration) {
                if (typeof lineCallback === "function") {
                    deRead("Executing line callback");
                    return lineCallback(currentLine, rowIteration);
                }
                else {
                    deRead("No line callback provided, continuing");
                    return Promise.resolve();
                }
            };
            var sanitizeArray = function (arr) {
                return arr.map(function (currentString) {
                    return String.prototype.trim.apply(currentString);
                });
            };
            var parser = parseCsv({ delimiter: "," }, function (err, data) {
                if (err) {
                    deRead("Error encountered", err);
                }
                asyncUtil_1.AsyncUtil.eachOfLimit(data, restrictCount || 3, function (line, key, triggerNext, counterLog) {
                    var trimRow = sanitizeArray(line);
                    var currentKey = (typeof key === "number" ? key : parseInt(key, 10));
                    _this.totalRows += 1;
                    _this.trimmedData.push(trimRow);
                    deRead("Current Row", trimRow);
                    counterLog("Processesing CSV");
                    _this.rowCallback(trimRow, currentKey)
                        .then(triggerNext);
                })
                    .then(function () {
                    resolve({ value: _this.trimmedData });
                });
            });
            fs.createReadStream(inputFile).pipe(parser);
        });
    };
    CSV.write = function (parameters) {
        return new Promise(function (resolve, reject) {
            deWrite("CSV WRITE BEGIN");
            deWrite("Parameters given: ", parameters);
            CSV.sanitizeData(parameters.data)
                .then(function (sanitized) {
                fs.createWriteStream(parameters.outputFile, { flags: "a+" }).write(sanitized);
                deWrite("CSV WRITE COMPLETE");
                resolve(parameters.outputFile);
            });
        });
    };
    CSV.getData = function () {
        return this.trimmedData;
    };
    /**
     * Process each item of a given row
     * row: Row to be processed
     * eachExecution: Array of functions to be executed
     *  * Functions will be executed against each column of provided row in order
     */
    CSV.processRow = function (row, eachExecution) {
        var executeRow = function (cell, key) {
            if (typeof eachExecution[key] === "function") {
                return eachExecution[key](cell, key);
            }
            else {
                (0, log_1.log)("No function provided for column ".concat(key));
                Promise.reject("Provided function is not a function...");
            }
        };
        var execute = function () {
            return asyncUtil_1.AsyncUtil.eachOfLimit(row, 3, function (cell, key, callback) {
                executeRow(cell, key)
                    .then(callback);
            });
        };
        var reject = function () {
            return Promise.reject("Provided Row and Function arrays do not match length.");
        };
        if (row.length === eachExecution.length) {
            return execute();
        }
        else {
            return reject();
        }
    };
    CSV.getWebIdColumn = function (headerRow) {
        var checkCell = function (input) {
            var valueChecks = ["webid", "web id", "web-id"];
            deWebId("Checking column header: ".concat(input.toLowerCase()));
            for (var i = valueChecks.length - 1; i >= 0; i -= 1) {
                deWebId("Comparing: ".concat(input.toLowerCase(), " && ").concat(valueChecks[i], ". i = ").concat(i));
                if (input.toLowerCase() === valueChecks[i]) {
                    deWebId("Returned true");
                    return true;
                }
            }
            deWebId("Returned false");
            return false;
        };
        var funcArray = [];
        var webIdColumn = {
            value: 0,
            headersDefined: false
        };
        var eachFunction = function (currentCell, columnNumber) {
            return new Promise(function (resolve) {
                if (checkCell(currentCell)) {
                    deWebId("WebID Located in ".concat(columnNumber, ", ").concat(currentCell, "; resolving"));
                    webIdColumn.value = columnNumber;
                    webIdColumn.headersDefined = true;
                    resolve({ value: columnNumber });
                }
                resolve();
            });
        };
        deWebId("Provided header row: ".concat(headerRow));
        for (var i = headerRow.length - 1; i >= 0; i -= 1) {
            funcArray.push(eachFunction);
        }
        return this.processRow(headerRow, funcArray)
            .then(function (data) {
            deWebId("processRow data:", data);
            return webIdColumn;
        });
    };
    CSV.sanitizeData = function (data) {
        return new Promise(function (resolve, reject) {
            var tempData = [];
            function sanitizeRow(row) {
                deSani("Sanitizing Row");
                deSani(row);
                deSani("Row is Array: ".concat(Array.isArray(row)));
                return row.map(function (currentString) {
                    var wrapper = ["\"", "\""];
                    deSani("".concat(currentString, " is null: ").concat(currentString === null));
                    if (typeof currentString === "undefined") {
                        currentString = "err_undefined";
                    }
                    else if (currentString === null) {
                        currentString = "err_null";
                    }
                    else if (typeof currentString !== "string") {
                        currentString = currentString.toString();
                    }
                    var temporaryString = !!currentString && currentString.trim();
                    if (temporaryString && temporaryString.indexOf("\"") >= 0) {
                        temporaryString = temporaryString.split("'").join("\\'");
                        temporaryString = temporaryString.split("\"").join("'");
                    }
                    else if (!temporaryString) {
                        deSani("Current String is not sanitizable");
                        deSani(temporaryString);
                        temporaryString = "";
                    }
                    return wrapper.join(temporaryString);
                });
            }
            deSani("Attempting to sanitize");
            deSani(data);
            // deSani("--------------- END SANITIZE DATA ---------------")
            for (var i = data.length - 1; i >= 0; i -= 1) {
                deSani("Sanitizing row ".concat(i), data[i]);
                tempData.unshift(sanitizeRow(data[i]).join(","));
            }
            resolve(tempData.join("\n"));
        });
    };
    CSV.prototype.stream = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            deWrite(" ------- CSV WRITE BEGIN ------- ");
            deWrite("Data given: ", data);
            deWrite("Sanitizing data ", data);
            CSV.sanitizeData(data)
                .then(function (sanitized) {
                deWrite("Sanitized data: ", data);
                _this.writeStream.write(sanitized + "\n");
                resolve(_this.output);
            });
        });
    };
    return CSV;
}());
exports.CSV = CSV;
/* Parse.begin(input, (currentRow) => {
    deBase("Executing row", currentRow);
}).then(
    deBase("Trimmed Data:", Parse.getData())
); */
