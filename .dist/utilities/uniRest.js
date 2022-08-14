"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
/* Import UTILITIES */
var dBug_1 = require("./dBug");
var unirest = require("unirest");
var deb = new dBug_1.dBug("utilities:uniRest");
// export type unirestMethods = "get" | "post" | "patch" | "put" | "head"
/*-- TODO: Write CSV Baseline processor --*/
var Connection = /** @class */ (function () {
    function Connection(initialCookie) {
        var _this = this;
        this.cookie = {
            /**
             * Sets cookie
             */
            set: function (cookieData) {
                return new Promise(function (resolve, reject) {
                    var debSetCookie = deb.set("cookie:set");
                    debSetCookie((0, dBug_1.debLine)("Attempting to set provided cookies"));
                    debSetCookie(cookieData);
                    if (Object.keys(cookieData).length > 0) {
                        debSetCookie("Cookies identified. Processing...");
                        for (var key in cookieData) {
                            if (cookieData.hasOwnProperty(key)) {
                                _this.jar.add("".concat(key, "=").concat(cookieData[key].value), cookieData[key].path || "/");
                            }
                        }
                        debSetCookie((0, dBug_1.debLine)("JAR UPDATED:"));
                        debSetCookie(_this.cookie.get());
                        Promise.resolve();
                    }
                    else {
                        debSetCookie("NO COOKIES IDENTIFIED");
                        Promise.reject();
                    }
                });
            },
            /**
             * Returns readable cookie jar
             */
            get: function () {
                return _this.jar._jar;
            },
            /**
             * Returns Cookie for use in Unirest methods
             */
            use: function () {
                return _this.jar;
            }
        };
        this.request = function (config) {
            return new Promise(function (resolve, reject) {
                var debRequest = deb.set("request");
                var checkError = function (response) {
                    if (response.body.hasOwnProperty("errorCode") && response.body.errorCode !== "") {
                        debRequest("Error processed via");
                        debRequest(response.body.errorSummary);
                        return {
                            errorSummary: response.body.errorSummary || "None Provided",
                            errorCode: response.body.errorCode
                        };
                    }
                    else {
                        debRequest("An error occured processing request");
                        debRequest(response.error);
                        return response.error;
                    }
                };
                debRequest("Initiating request");
                unirest[config.method](config.url, config.headers)
                    // .headers(config.headers)
                    .auth(config.auth)
                    .jar(_this.cookie.use())
                    .end(function (response) {
                    debRequest("Response received");
                    debRequest(response);
                    if (response.body.hasOwnProperty("error") && response.body.errorCode !== "") {
                        reject(checkError(response));
                    }
                    else {
                        resolve(response);
                    }
                });
                // if (config.headers) {
                //     debRequest("Setting headers");
                //     debRequest(config.headers);
                //     request.headers(config.headers)
                // }
                // if (config.auth) {
                //     debRequest("Sending Auth");
                //     request.auth(config.auth)
                // }
                // request.jar(this.cookie.use())
                // request.end((response) => {
                //     debRequest("Response received");
                //     debRequest(response);
                //     resolve(response);
                // });
            });
            // return unirest[method](path)
            //         .this.cookie.use();
        };
        this.jar = unirest.jar();
        if (initialCookie) {
            this.cookie.set(initialCookie);
        }
    }
    return Connection;
}());
exports.Connection = Connection;
