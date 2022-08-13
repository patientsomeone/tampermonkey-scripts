"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadUrl = void 0;
const debug = require("debug");
const request_1 = require("request");
const dBug_1 = require("./dBug");
const fetchSecrets_1 = require("./fetchSecrets");
const srcPath_1 = require("./srcPath");
const urlConstructor_1 = require("./urlConstructor");
const log_1 = require("./log");
const deUrl = debug("url:get");
/*-- Define input file --*/
const input = (0, srcPath_1.srcPath)("./input.csv");
/*-- Define output file --*/
const output = (0, srcPath_1.srcPath)("./output.csv");
/*-- Define Column to check against --*/
const urlColumn = 4;
/*-- Define callback --*/
const eachCallback = (response) => {
    (0, log_1.log)(response);
};
/*-- TODO: Write CSV Baseline processor --*/
class LoadUrl {
    constructor(useToken) {
        this.deb = new dBug_1.dBug("utilities:urlLoader:LoadUrl");
        this.useToken = false;
        this.header = {
            reconstruct: (headerObject) => {
                const headersArray = [];
                for (const key in headerObject) {
                    if (headerObject.hasOwnProperty(key)) {
                        headersArray.push(`${key}=${headerObject[key]}`);
                    }
                }
                return Promise.resolve(headersArray);
            },
            check: (header) => {
                const debug = this.deb.set("cookie:checkHeader");
                // const headersObject: Headers = {};
                debug("Generating Headers Object");
                // header.map((data) => {
                //     debug(`Deconstructing Key: ${data.name}`);
                //     headersObject[data.name] = data.value;
                // });
                // for (const key in header) {
                //     headersObject[key] = header[key];
                // }
                debug("----- Header Object ------");
                debug(header);
                if (header.hasOwnProperty("Cookie")) {
                    return this.cookie.deconstruct(header.Cookie)
                        .then((reconstructedCookie) => {
                        header.Cookie = reconstructedCookie;
                        return Promise.resolve(header);
                    })
                        .then(this.header.reconstruct);
                }
                else {
                    header.Cookie = this.cookie.token;
                    return this.header.reconstruct(header);
                }
            }
        };
        this.secrets = void 0;
        this.cookie = {
            token: void 0,
            reconstruct: (deconstructedCookies) => {
                const debug = this.deb.set("cookie:reconstruct");
                const reconstructedCookie = [];
                debug("Reconstructing Cookies");
                for (const key in deconstructedCookies) {
                    if (deconstructedCookies.hasOwnProperty(key)) {
                        debug(`Reconstructing ${key}`);
                        reconstructedCookie.push(`${key}=${deconstructedCookies[key]}`);
                    }
                }
                return Promise.resolve(reconstructedCookie.join("; "));
            },
            deconstruct: (cookie) => {
                const debug = this.deb.set("cookie:deconstruct");
                const objectifiedCookie = {};
                debug("Processing Cookies");
                const cookieProcessing = cookie.split("; ").map((current) => {
                    const debug = this.deb.set("cookie:deconstruct:map");
                    const keyVal = current.split("=");
                    debug(`Processing Cookie: ${keyVal[0]}`);
                    objectifiedCookie[keyVal[0]] = keyVal[1];
                });
                if (objectifiedCookie.hasOwnProperty("Cookie")) {
                    objectifiedCookie.Cookie += this.cookie.token;
                    debug(`Added Token to existing Objectified Cookie ${objectifiedCookie.Cookie}`);
                }
                else {
                    objectifiedCookie.Cookie = this.cookie.token;
                    debug(`Added fresh Token to Objectified Cookie ${objectifiedCookie.Cookie}`);
                }
                return this.cookie.reconstruct(objectifiedCookie);
            },
            check: (options) => {
                const debug = this.deb.set("cookie:check");
                const hasHeaders = options.hasOwnProperty("headers");
                if (hasHeaders) {
                    debug("Merging Token Cookie with existing");
                    return this.header.check(options.headers)
                        .then((newOptions) => {
                        // options.headers = { Name: "Cookie", Value: newCookie };
                        return Promise.resolve(options);
                    });
                }
                else {
                    debug("Creating Token Cookie from Scratch");
                    options.headers = { Cookie: this.cookie.token };
                    return Promise.resolve(options);
                }
            },
            set: () => {
                const debug = this.deb.set("cookie:set");
                const defaultCookie = "---- INSERT TOKEN HERE ----";
                const secrets = new fetchSecrets_1.Secrets({ tokenCookie: defaultCookie });
                return secrets.fetch()
                    .then((secretData) => {
                    if (secretData.tokenCookie === defaultCookie) {
                        (0, log_1.logLine)("Incorrect or missing token. Please add your token to the created secrets.i.json file");
                        debug(secretData);
                        return Promise.reject("Invalid Access Token");
                    }
                    else {
                        this.cookie.token = secretData.tokenCookie;
                        return Promise.resolve();
                    }
                });
            },
            get: (options) => {
                const debug = this.deb.set("cookie:get");
                if (!this.cookie.token) {
                    return this.cookie.set()
                        .then(() => {
                        return this.cookie.check(options);
                    })
                        .catch((err) => {
                        return Promise.reject(err);
                    });
                }
                else {
                    return this.cookie.check(options);
                }
            },
            isNeeded: (options) => {
                const setOptions = options || {};
                if (this.useToken) {
                    return this.cookie.get(setOptions)
                        .catch((err) => {
                        return Promise.reject(err);
                    });
                }
                else {
                    return Promise.resolve(options);
                }
            }
        };
        // TODO: Add method for GET with Cookie from Properties
        this.get = (url, options) => __awaiter(this, void 0, void 0, function* () {
            const deb = this.deb.set("get");
            // const newOptions = this.generateOptions(url, options);
            try {
                const response = yield this.getUrl(url, options);
                deb(`Response Received:`);
                deb(response);
                return response;
            }
            catch (error) {
                deb(`Failed to receive response:`);
                deb(error);
                return {
                    error,
                    response: void 0,
                    body: void 0
                };
            }
        });
        this.getUrl = (url, options) => __awaiter(this, void 0, void 0, function* () {
            const deb = this.deb.set("getUrl");
            deb(`URL Promise beginning |  ${url}`);
            const theseOptions = yield this.cookie.isNeeded(options);
            const data = {
                error: void 0,
                response: void 0,
                body: void 0,
            };
            return new Promise((urlResolve, urlReject) => {
                deb(`URL Promise beginning |  ${url}`);
                // TODO Troubleshoot and remove as any
                (0, request_1.get)(url, theseOptions, (error, response, body) => {
                    data.error = error;
                    data.response = response;
                    data.body = body;
                    deb(`Loading URL ${url}`);
                    if (!!error) {
                        deb("ERROR ENCOUNTERED");
                        deb(data);
                        return urlReject(data);
                    }
                    else {
                        if (!body) {
                            deb("EMPTY RESPONSE");
                            deb(data);
                            return urlReject(data);
                        }
                        else {
                            deb("RESPONSE RECEIVED");
                            deb(data);
                            return urlResolve(data);
                        }
                    }
                });
            });
        });
        if (!!useToken) {
            this.useToken = true;
        }
    }
    static single(url) {
        const loader = new LoadUrl(false);
        return loader.get(url);
    }
}
exports.LoadUrl = LoadUrl;
const testSingle = () => {
    (0, log_1.logLine)(" Testing Single URL ");
    return LoadUrl.single("https://media-cf.assets-cdk.com/teams/repository/export/e39/f15e0949c100588110050568b5709/e39f15e0949c100588110050568b5709.js")
        .then((response) => {
        (0, log_1.log)(`Body Received: ${!!response.body}`);
    });
};
const testGet = (toTest) => {
    (0, log_1.logLine)("Testing Get Specific URL");
    const construct = new urlConstructor_1.UrlConstructor("dit");
    const loader = new LoadUrl(true);
    const partnerDataUrl = construct.getSpecific({ partnerPortal: ["partners"] }).partnerPortal.partners;
    const oosDataUrl = construct.getSpecific({ oos: ["orders"] }).oos.orders;
    if (toTest === "oos") {
        loader.get(oosDataUrl)
            .then(() => {
            (0, log_1.log)(`Partner Data URL Defined ${oosDataUrl}`);
        });
    }
    if (toTest === "partners") {
        loader.get(partnerDataUrl)
            .then(() => {
            (0, log_1.log)(`Partner Data URL Defined ${oosDataUrl}`);
        });
    }
};
// testSingle();
// testGet("oos");
// const request = require('request');
// const options = {
//     method: 'GET',
//     url: 'https://api-dit.sincrotools.com/partner-portal-api/api/v1/partners',
//     headers: {
//         Cookie: 'ID_TOKEN=eyJraWQiOiJ3bHQ1LUI0b3dPbDhBUS1HY1ZRMGZTZ2pwdlJRNUxWdXdBV3NRTlI1SGlRIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULlg2TXhHTTRiZzhPYU9MZnpVNzluVHdlV2ZuNnpVaF81U1hfdDA4WkJ2U0EiLCJpc3MiOiJodHRwczovL2xvZ2luLWRpdC5zaW5jcm90b29scy5jb20vb2F1dGgyL2RlZmF1bHQiLCJhdWQiOiJhcGk6Ly9kZWZhdWx0IiwiaWF0IjoxNjMxMjk5MzU3LCJleHAiOjE2MzEzMjgxNTcsImNpZCI6IjBvYWFtNGQ1V01NcmpmejRFMWQ1IiwidWlkIjoiMDB1ODR3aGc0NDJpbHBreTgxZDYiLCJzY3AiOlsib3BlbmlkIl0sInNpbmNyb0lkIjoiSm9zaHVhLlJvYmluc29uQHNpbmNyb2RpZ2l0YWwuY29tIiwic3ViIjoiSm9zaHVhLlJvYmluc29uQHNpbmNyb2RpZ2l0YWwuY29tIiwidXNlciI6Ikpvc2h1YS5Sb2JpbnNvbkBzaW5jcm9kaWdpdGFsLmNvbSJ9.F39QvwLhSt9BfO9wrW0sqTk1X8_mNvzA0-JrI_hHKXjkFRu8Y1TM2mrIvjQHtHQbqKnS2Cux5B1epv9gJjJGkPi4-gntOf7kzGa_V8TNcJBLtqIT-dCILD5U1YHjM58YcY7a2zXSar-pCIolkDtbZFFwa9QpqkbTCbn4UeDFBMW3kX8Miiohka5U3qZZYwTCch-VbXbSw7CplK_qrdwNEk8Cs-ohFwgfZ1exrrbqpshID_cwA4slArOqn4Ld_-zn9UPOrmVA49XB-Fx1en7mERefL2m58qpgop_jE6T4aVXy-Oj-QkM4OfRp0Ss2Iam3fFfFzw7rTiO5dofL3Avhcw; _bztag=ZWEwMTU2MmYzYTAyMTRiYTg0NzA4MjFjMTY5YWNkZGIyNThlMzYyNzk4MGM3NDZkZWZiZDUxMTI3NDkzZjAxOEAxNjMxMzAyMzc5MDQ5'
//     }
// };
// request(options, function (error, response, body) {
//     if (error) throw new Error(error);
//     console.log(body);
// });
