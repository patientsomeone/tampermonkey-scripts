"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
/* Import UTILITIES */
const dBug_1 = require("./dBug");
const unirest = require("unirest");
const deb = new dBug_1.dBug("utilities:uniRest");
// export type unirestMethods = "get" | "post" | "patch" | "put" | "head"
/*-- TODO: Write CSV Baseline processor --*/
class Connection {
    constructor(initialCookie) {
        this.cookie = {
            /**
             * Sets cookie
             */
            set: (cookieData) => {
                return new Promise((resolve, reject) => {
                    const debSetCookie = deb.set("cookie:set");
                    debSetCookie((0, dBug_1.debLine)("Attempting to set provided cookies"));
                    debSetCookie(cookieData);
                    if (Object.keys(cookieData).length > 0) {
                        debSetCookie("Cookies identified. Processing...");
                        for (const key in cookieData) {
                            if (cookieData.hasOwnProperty(key)) {
                                this.jar.add(`${key}=${cookieData[key].value}`, cookieData[key].path || "/");
                            }
                        }
                        debSetCookie((0, dBug_1.debLine)("JAR UPDATED:"));
                        debSetCookie(this.cookie.get());
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
            get: () => {
                return this.jar._jar;
            },
            /**
             * Returns Cookie for use in Unirest methods
             */
            use: () => {
                return this.jar;
            }
        };
        this.request = (config) => {
            return new Promise((resolve, reject) => {
                const debRequest = deb.set("request");
                const checkError = (response) => {
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
                    .jar(this.cookie.use())
                    .end((response) => {
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
}
exports.Connection = Connection;
