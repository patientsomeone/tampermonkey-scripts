"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gSheet = void 0;
var debug = require("debug");
var fs = require("fs");
var readline = require("readline");
var googleapis_1 = require("googleapis");
/*-- Utilities --*/
var asyncUtil_1 = require("./asyncUtil");
var log_1 = require("./log");
/*-- Define Column URL is located at --*/
var checkCol = 1;
/*-- DEBUGGERS --*/
// const log = debug("log:utilities:gSheet*");
var deRead = debug("utilities:gSheet:read");
var deWrite = debug("utilities:gSheet:write");
var deConn = debug("utilities:gSheet:connect");
var deAuth = debug("utilities:gSheet:authorize");
var deSani = debug("utilities:gSheet:write:sanitize");
var deWebId = debug("utilities:gSheet:getWebIdColumn");
var gSheet = /** @class */ (function () {
    function gSheet(spreadsheetID) {
        //"1ozp-PrkrCZSMOwM6YK1XUYHq6MZdoqEME2n0QonSQ6M"
        this.tokenPath = "./.i.token.json";
        this.spreadsheetID = spreadsheetID;
        /* this.sheet = new googleSpreadsheets(spreadsheetID);

        this.sheet.useServiceAccountAuth(creds, (error) => {
            if (!error) {
                logLine("Connected to Google Spreadsheet");
            } else {
                logLine("UNABLE TO CONNECT TO SPREADSHEET");

                deConn("'.'.'.'.' BEGIN ERROR ENCOUNTERED '.'.'.'.'");
                deConn(error);
                deConn("'.'.'.'.'. END ERROR ENCOUNTERED '.'.'.'.'");
            }
        }) */
    }
    /**
     * WorksheetID derived from worksheet tab number, starting at 1.
     */
    gSheet.prototype.read = function (range, lineCallback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            (0, log_1.logLine)("gSheet READ BEGIN");
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
            var parser = _this.sheet.spreadsheets.values.get({
                spreadsheetId: _this.spreadsheetID,
                range: range
            }, function (err, data) {
                if (err) {
                    deRead("Error encountered", err);
                }
                asyncUtil_1.AsyncUtil.eachOfLimit(data, 5, function (line, key, triggerNext, counterLog) {
                    var trimRow = sanitizeArray(line);
                    var currentKey = (typeof key === "number" ? key : parseInt(key, 10));
                    _this.totalRows += 1;
                    _this.trimmedData.push(trimRow);
                    deRead("Current Row", trimRow);
                    _this.rowCallback(trimRow, currentKey)
                        .then(triggerNext);
                })
                    .then(function () {
                    resolve({ value: _this.trimmedData });
                });
            });
            return parser;
        });
    };
    gSheet.writeRow = function (parameters) {
        return new Promise(function (resolve, reject) {
            (0, log_1.logLine)("gSheet WRITE BEGIN");
            deWrite("Parameters given: ", parameters);
            gSheet.sanitizeData(parameters.data)
                .then(function (sanitized) {
                deWrite("Sanitized data: ", sanitized);
                (0, log_1.logLine)("gSheet WRITE COMPLETE");
                resolve();
            });
        });
    };
    // public stream(data: gSheetRow): Promise<string> {
    //     return new Promise((resolve, reject) => {
    //         logLine("gSheet WRITE BEGIN");
    //         deWrite("Data given: ", data);
    //         gSheet.sanitizeData(data)
    //         .then((sanitized) => {
    //                 deWrite("Sanitized data: ", data);
    //                 this.writeStream.write(sanitized + "\n");
    //                 resolve(this.output);
    //             })
    //     });
    // }
    gSheet.prototype.getData = function () {
        return this.trimmedData;
    };
    /**
     * Process each item of a given row
     * row: Row to be processed
     * eachExecution: Array of functions to be executed
     *  * Functions will be executed against each column of provided row in order
     */
    gSheet.processRow = function (row, eachExecution) {
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
    gSheet.getWebIdColumn = function (headerRow) {
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
    gSheet.prototype.connect = function () {
        var _this = this;
        (0, log_1.logLine)("Attempting to establish connection");
        return new Promise(function (resolve, reject) {
            deConn("Reading ./credentials.json");
            fs.readFile("./credentials.json", "utf-8", function (error, content) {
                if (error) {
                    deConn("Error loading client secret file:", error);
                    reject();
                }
                else {
                    deConn("File conents loaded, authorizing");
                    _this.authorize(JSON.parse(content))
                        .then(function (token) {
                        deConn("Authorization Success, Connection established");
                        _this.sheet = googleapis_1.google.sheets({
                            version: "v4",
                            auth: _this.token
                        });
                        (0, log_1.logLine)("Google APIs Connection Established");
                        resolve();
                    });
                }
                ;
            });
        });
    };
    ;
    gSheet.prototype.authorize = function (credentials) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            deAuth("Attempting to authorize");
            var client_secret = credentials.installed;
            var client_id = credentials.installed;
            var redirect_uris = credentials.installed;
            var oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            deAuth("Checking for previous token");
            /* Check for stored token */
            fs.readFile(_this.tokenPath, function (error, token) {
                if (error) {
                    deAuth("Token not located. Creating Token");
                    return _this.getNewToken(oAuth2Client);
                }
                else if (typeof token === "string") {
                    deAuth("Token located. Setting Credentials");
                    oAuth2Client.setCredentials(JSON.parse(token));
                    _this.token = oAuth2Client;
                    resolve(_this.token);
                }
            });
        });
    };
    ;
    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     */
    gSheet.prototype.getNewToken = function (oAuth2Client) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            deAuth("Attempting to establish new token");
            var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
            var authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
            });
            deAuth("Attempting to establish new token");
            (0, log_1.logLine)("Authorize this app by visiting this url: ".concat(authUrl));
            (0, log_1.log)(authUrl);
            var rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            deAuth("Requesting Access");
            rl.question('Enter the code from that page here: ', function (code) {
                rl.close();
                oAuth2Client.getToken(code, function (error, token) {
                    deAuth("Generating Token");
                    if (error) {
                        deConn("Error generating token", error);
                        reject(error);
                    }
                    else {
                        deAuth("Token generation successful");
                        oAuth2Client.setCredentials(token);
                        // Store the token to disk for later program executions
                        deAuth("Caching token");
                        fs.writeFile(_this.tokenPath, JSON.stringify(token), function (error) {
                            if (error) {
                                deConn("Error caching token", error);
                                reject(error);
                            }
                            ;
                            (0, log_1.log)('Token stored to', _this.tokenPath);
                        });
                        _this.token = oAuth2Client;
                        resolve(_this.token);
                    }
                    ;
                });
            });
        });
    };
    ;
    gSheet.sanitizeData = function (data) {
        return new Promise(function (resolve, reject) {
            var tempData = [];
            function sanitizeRow(row) {
                deSani(row);
                return row.map(function (currentString) {
                    var wrapper = ["\"", "\""];
                    var temporaryString = currentString && currentString.trim();
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
            deSani("--------------- END SANITIZE DATA ---------------");
            for (var i = data.length - 1; i >= 0; i -= 1) {
                deSani("Sanitizing row ".concat(i), data[i]);
                tempData.unshift(sanitizeRow(data[i]).join(","));
            }
            resolve(tempData.join("\n"));
        });
    };
    return gSheet;
}());
exports.gSheet = gSheet;
/* Parse.begin(input, (currentRow) => {
    deBase("Executing row", currentRow);
}).then(
    deBase("Trimmed Data:", Parse.getData())
); */
