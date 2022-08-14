"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectExtend = void 0;
/* Import UTILITIES */
var dBug_1 = require("./dBug");
var log_1 = require("./log");
var debg = new dBug_1.dBug("utilities:objectExtend");
/** First listed argument is default */
var objectExtend = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var deb = debg.set("utilities:objectExtend");
    var defArg = args[0];
    var extended = {};
    /* Loop through each argument passed */
    for (var i = 0; i < args.length; i += 1) {
        /* First listed argument is default */
        if (i === 0) {
            defArg = args[i];
            /* Additional args are to be merged */
        }
        else {
            var thisArg = args[i];
            /* Loop through all items in objects */
            for (var key in thisArg) {
                if (thisArg.hasOwnProperty(key)) {
                    /* If an Array is passed */
                    if (Array.isArray(thisArg[key])) {
                        deb("Array Identified");
                        deb(thisArg[key]);
                        thisArg[key].isArray = true;
                    }
                    /* If an object is passed */
                    if (typeof thisArg[key] === "object") {
                        deb("Object Identified");
                        deb(thisArg[key]);
                        /* If default object has sub-object */
                        if (defArg.hasOwnProperty(key)) {
                            /* Extend from Default */
                            extended[key] = (0, exports.objectExtend)(defArg[key], thisArg[key]);
                        }
                        else {
                            /* Create new parameter */
                            extended[key] = thisArg[key];
                        }
                    }
                    else {
                        extended[key] = thisArg[key];
                    }
                }
            }
        }
        /* Add default values for any missed values*/
        for (var key in defArg) {
            if (defArg.hasOwnProperty(key) && !extended.hasOwnProperty(key)) {
                extended[key] = defArg[key];
            }
        }
        if (extended.hasOwnProperty("isArray") && !!extended.isArray) {
            var newArray = [];
            deb("Converting Array");
            deb(extended);
            for (var key in extended) {
                if (extended.hasOwnProperty(key) && key !== "isArray") {
                    deb("Processing ".concat(key, ": ").concat(extended[key]));
                    newArray.push(extended[key]);
                }
            }
            deb("Array Converted");
            deb(newArray);
            extended = newArray;
        }
    }
    return extended;
};
exports.objectExtend = objectExtend;
var test = function () {
    var defObj = {
        testString: "Default",
        testObj: {
            unChanged: "Default",
            changed: "Default"
        },
        testArray: ["Default1", "Default2"]
    };
    var ovrObj = {
        testString: "Overridden",
        testObj: {
            unChanged: "Default",
            changed: "Overridden"
        },
        testArray: ["Overridden1", "Overridden2"]
    };
    (0, log_1.log)((0, exports.objectExtend)(defObj, ovrObj));
};
// test();
