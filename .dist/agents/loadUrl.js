"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = require("../utilities/log");
const urlLoader_1 = require("../utilities/urlLoader");
urlLoader_1.LoadUrl.single(url)
    .then((urlData) => {
    (0, log_1.log)(urlData);
})
    .catch(() => {
});
// Additional Line
