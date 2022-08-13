"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectExtend = void 0;
/* Import UTILITIES */
const dBug_1 = require("./dBug");
const log_1 = require("./log");
const debg = new dBug_1.dBug("utilities:objectExtend");
/** First listed argument is default */
const objectExtend = (...args) => {
    const deb = debg.set("utilities:objectExtend");
    let defArg = args[0];
    let extended = {};
    /* Loop through each argument passed */
    for (let i = 0; i < args.length; i += 1) {
        /* First listed argument is default */
        if (i === 0) {
            defArg = args[i];
            /* Additional args are to be merged */
        }
        else {
            const thisArg = args[i];
            /* Loop through all items in objects */
            for (const key in thisArg) {
                if (thisArg.hasOwnProperty(key)) {
                    /* If an Array is passed */
                    if (Array.isArray(thisArg[key])) {
                        deb(`Array Identified`);
                        deb(thisArg[key]);
                        thisArg[key].isArray = true;
                    }
                    /* If an object is passed */
                    if (typeof thisArg[key] === "object") {
                        deb(`Object Identified`);
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
        for (const key in defArg) {
            if (defArg.hasOwnProperty(key) && !extended.hasOwnProperty(key)) {
                extended[key] = defArg[key];
            }
        }
        if (extended.hasOwnProperty("isArray") && !!extended.isArray) {
            const newArray = [];
            deb(`Converting Array`);
            deb(extended);
            for (const key in extended) {
                if (extended.hasOwnProperty(key) && key !== "isArray") {
                    deb(`Processing ${key}: ${extended[key]}`);
                    newArray.push(extended[key]);
                }
            }
            deb(`Array Converted`);
            deb(newArray);
            extended = newArray;
        }
    }
    return extended;
};
exports.objectExtend = objectExtend;
const test = () => {
    const defObj = {
        testString: "Default",
        testObj: {
            unChanged: "Default",
            changed: "Default"
        },
        testArray: ["Default1", "Default2"]
    };
    const ovrObj = {
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
