"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logLine = exports.err = exports.log = void 0;
var debug = require("debug");
var dBug_1 = require("../utilities/dBug");
exports.log = debug("logger*");
exports.err = debug("---ERROR*");
var deb = new dBug_1.dBug("log");
/**
 * Pad text to a certain number of characters for uniform outputs
 * @param msg Message to be padded
 * @param indent Number of times to indent (by 5 "spaces");
 */
var padMsg = function (msg, indent, newLineChar, isErr) {
    var db = deb.set("padMsg");
    var indentCount = 5;
    var messageLength = 130;
    var workingMsg = msg;
    var pad = function (toInsert, eqOnly) {
        var pad = [];
        db("Adding padding ".concat(toInsert));
        for (var i = toInsert - 1; i >= 0; i -= 1) {
            if (!eqOnly && i > indentCount) {
                pad.push(" ");
            }
            else {
                pad.push("=");
            }
        }
        return pad.join("");
    };
    var getIndent = function () {
        var toInd = (indent * indentCount);
        messageLength -= toInd;
        return pad(toInd, true) + " " + (toInd === indentCount ? workingMsg.toUpperCase() : workingMsg);
    };
    var applyJoin = "";
    var getNewLine = function (data, newLineChar, initialIndent) {
        var nDb = deb.set("padMsg:getNewLine");
        var splitLines = [];
        var currentData = (data || workingMsg).toString();
        var strArr = (function () {
            var splitChecks = {
                " ": {
                    reapply: false
                },
                "|": {
                    reapply: false
                },
                "/": {
                    reapply: true
                }
            };
            nDb("Processing Log ".concat(currentData));
            nDb("    data: ".concat(data));
            nDb("    workingMsg: ".concat(workingMsg));
            if (newLineChar && currentData.indexOf(newLineChar) > 0) {
                return currentData.split(newLineChar);
            }
            else {
                for (var key in splitChecks) {
                    if (currentData.indexOf(key) >= 0) {
                        if (splitChecks[key].reapply) {
                            applyJoin = key;
                        }
                        return currentData.split(key);
                    }
                }
                return [currentData];
            }
        })();
        var updateIndent = function () {
            var newIndent = (splitLines.length > 1 ? ((initialIndent || indent) + 1) : (initialIndent || indent));
            // messageLength -= newIndent * indentCount;
            return newIndent;
        };
        var newOnChar = function (currentItem) {
            if (currentItem.length < (messageLength - updateIndent() * indentCount)) {
                splitLines.push(pad(updateIndent() * indentCount, true) + " " + currentItem /*  + pad(messageLength - currentItem.length) */);
            }
            else {
                splitLines = getNewLine(currentItem, false, updateIndent() + 1).concat(splitLines);
            }
        };
        var currentLine = pad(updateIndent() * indentCount, true);
        var newOnLength = function (currentItem) {
            db("Processing New on Length");
            db("Input: ".concat(currentItem));
            if ((currentItem.length + currentLine.length) < (messageLength - (updateIndent() * indentCount) - 4)) {
                db("Adding to current Line");
                if (currentLine.slice(-1) !== " " && currentLine.slice(-1) !== "/" && currentLine.slice(-1) !== "\\") {
                    db("Current Line does not end in space, adding space");
                    currentLine += " ";
                }
                currentLine += currentItem.trim() + applyJoin;
                db("Current Line: ".concat(currentLine));
            }
            else if ((currentItem.length + currentLine.length) >= (messageLength - updateIndent() * indentCount)) {
                db("Too Long, breaking down");
                // splitLines.push(currentLine + pad(messageLength - currentLine.length));
                db("Current Split Lines: ".concat(splitLines.join(" **&&** ")));
                splitLines = (getNewLine(currentItem, false, updateIndent() + 1)).concat(splitLines);
                applyJoin = "";
                db("Broke down lines to ".concat(splitLines.join("")));
            }
            else {
                splitLines.push(currentLine /*  + pad(messageLength - updateIndent() * indentCount) */);
                currentLine = pad(messageLength - updateIndent() * indentCount) + " " + currentItem.trim();
            }
            // splitLines.push(currentItem);
        };
        for (var i = 0; i < strArr.length; i += 1) {
            if (!newLineChar) {
                newOnLength(strArr[i]);
                if (i === strArr.length - 1) {
                    splitLines.unshift(currentLine + " " /*  + pad(messageLength - (currentLine.length - (!initialIndent ? ((updateIndent() - 1) * indentCount) : indentCount * 2) )) */);
                }
            }
            else {
                newOnChar(strArr[i]);
            }
        }
        // splitLines.push(currentLine);
        return splitLines;
    };
    var output = function (msg) {
        if (!isErr) {
            (0, exports.log)(msg);
        }
        else {
            (0, exports.err)(msg);
        }
    };
    if (!newLineChar && msg.length <= messageLength) {
        output(getIndent() + " " /* + pad(messageLength - msg.length) */);
    }
    else {
        var multiLine = getNewLine(false, newLineChar);
        for (var i = 0; i < multiLine.length; i += 1) {
            output(multiLine[i]);
        }
    }
    // log(getIndent() + " " + pad(messageLength - msg.length));
};
/**
 * Create a log message with a line
 * @param msg Message to be logged
 * @param indent Number of times to indent (by 5 spaces)
 * @param newLineCharacter Character to trigger a new line
 */
var logLine = function (msg, indent, newLineCharacter, isErr) {
    var sanitizedMessage = msg || "";
    var toIndent = indent ? indent + 1 : 1;
    return padMsg(sanitizedMessage, toIndent, newLineCharacter, isErr);
};
exports.logLine = logLine;
var test = function () {
    (0, exports.logLine)("This is a test message");
    (0, exports.logLine)("This is a second test message", 2);
    (0, exports.logLine)("This is a third message");
    (0, exports.logLine)("FILE PATH: /USERS/SEA-ROBINSJP-M/DOCUMENTS/_GIT/PARTNER-TOOLKIT/OUTPUTS/TOOLKITPROCESSOR/20.04.13_SITESCRAPE_IDENTIFIEDVENDOR.CSV | PROCESSED: HOLDEN-ALANMAY | ELAPSED: 00:00:00:06:53 | 0% | COMPLETE | 1 / 5658 | ELAPSED: 00:00:00:06:53", 0, "|");
};
// test();
