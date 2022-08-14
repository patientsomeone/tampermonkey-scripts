"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parse = void 0;
var async = require("async");
var parseCsv = require("csv-parse");
var debug = require("debug");
var fs = require("fs");
/*-- Define input file --*/
var input = "./input.csv";
/*-- Define output file --*/
var output = "./output.csv";
/*-- Define Regex to apply --*/
var exp = new RegExp("\(http\\:\)\(.*\)\(\\.com\|\\.net\|\\\\)", "g");
/*-- Define Column to check against --*/
var checkCol = 4;
var log = debug("log:csv:parse*");
var deCsv = debug("csv");
deCsv("Beginning CSV");
var Parse = /** @class */ (function () {
    function Parse() {
    }
    Parse.prototype.begin = function (inputFile) {
        var trimData = [];
        var totalLines = 0;
        var parser = parseCsv({ delimiter: "," }, function (err, data) {
            async.eachSeries(data, function (line, callback) {
                var trimRow = [];
                var lineLength = line.length;
                var rowMatch = false;
                var matchedData;
                totalLines++;
                for (var i = lineLength - 1; i >= 0; i -= 1) {
                    if (i === checkCol - 1) {
                        rowMatch = exp.test(line[i]);
                        if (rowMatch) {
                            matchedData = line[i].match(exp);
                            log("Row", totalLines, "Matched:", matchedData);
                        }
                        log("Row", totalLines, "| Expression match", rowMatch);
                    }
                    trimRow.unshift(line[i].trim());
                }
                log("trimRow", trimRow);
                if (rowMatch) {
                    trimData.push(trimRow);
                }
                callback();
            }, function () {
                log("=============================");
                log("[COMPLETE] trimData", trimData);
                return trimData;
            });
        });
        fs.createReadStream(inputFile).pipe(parser);
    };
    return Parse;
}());
exports.Parse = Parse;
log("Beginning");
