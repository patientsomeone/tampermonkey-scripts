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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadUrl = void 0;
var debug = require("debug");
var request_1 = require("request");
var dBug_1 = require("./dBug");
var fetchSecrets_1 = require("./fetchSecrets");
var srcPath_1 = require("./srcPath");
var urlConstructor_1 = require("./urlConstructor");
var log_1 = require("./log");
var deUrl = debug("url:get");
/*-- Define input file --*/
var input = (0, srcPath_1.srcPath)("./input.csv");
/*-- Define output file --*/
var output = (0, srcPath_1.srcPath)("./output.csv");
/*-- Define Column to check against --*/
var urlColumn = 4;
/*-- Define callback --*/
var eachCallback = function (response) {
    (0, log_1.log)(response);
};
/*-- TODO: Write CSV Baseline processor --*/
var LoadUrl = /** @class */ (function () {
    function LoadUrl(useToken) {
        var _this = this;
        this.deb = new dBug_1.dBug("utilities:urlLoader:LoadUrl");
        this.useToken = false;
        this.header = {
            reconstruct: function (headerObject) {
                var headersArray = [];
                for (var key in headerObject) {
                    if (headerObject.hasOwnProperty(key)) {
                        headersArray.push("".concat(key, "=").concat(headerObject[key]));
                    }
                }
                return Promise.resolve(headersArray);
            },
            check: function (header) {
                var debug = _this.deb.set("cookie:checkHeader");
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
                    return _this.cookie.deconstruct(header.Cookie)
                        .then(function (reconstructedCookie) {
                        header.Cookie = reconstructedCookie;
                        return Promise.resolve(header);
                    })
                        .then(_this.header.reconstruct);
                }
                else {
                    header.Cookie = _this.cookie.token;
                    return _this.header.reconstruct(header);
                }
            }
        };
        this.secrets = void 0;
        this.cookie = {
            token: void 0,
            reconstruct: function (deconstructedCookies) {
                var debug = _this.deb.set("cookie:reconstruct");
                var reconstructedCookie = [];
                debug("Reconstructing Cookies");
                for (var key in deconstructedCookies) {
                    if (deconstructedCookies.hasOwnProperty(key)) {
                        debug("Reconstructing ".concat(key));
                        reconstructedCookie.push("".concat(key, "=").concat(deconstructedCookies[key]));
                    }
                }
                return Promise.resolve(reconstructedCookie.join("; "));
            },
            deconstruct: function (cookie) {
                var debug = _this.deb.set("cookie:deconstruct");
                var objectifiedCookie = {};
                debug("Processing Cookies");
                var cookieProcessing = cookie.split("; ").map(function (current) {
                    var debug = _this.deb.set("cookie:deconstruct:map");
                    var keyVal = current.split("=");
                    debug("Processing Cookie: ".concat(keyVal[0]));
                    objectifiedCookie[keyVal[0]] = keyVal[1];
                });
                if (objectifiedCookie.hasOwnProperty("Cookie")) {
                    objectifiedCookie.Cookie += _this.cookie.token;
                    debug("Added Token to existing Objectified Cookie ".concat(objectifiedCookie.Cookie));
                }
                else {
                    objectifiedCookie.Cookie = _this.cookie.token;
                    debug("Added fresh Token to Objectified Cookie ".concat(objectifiedCookie.Cookie));
                }
                return _this.cookie.reconstruct(objectifiedCookie);
            },
            check: function (options) {
                var debug = _this.deb.set("cookie:check");
                var hasHeaders = options.hasOwnProperty("headers");
                if (hasHeaders) {
                    debug("Merging Token Cookie with existing");
                    return _this.header.check(options.headers)
                        .then(function (newOptions) {
                        // options.headers = { Name: "Cookie", Value: newCookie };
                        return Promise.resolve(options);
                    });
                }
                else {
                    debug("Creating Token Cookie from Scratch");
                    options.headers = { Cookie: _this.cookie.token };
                    return Promise.resolve(options);
                }
            },
            set: function () {
                var debug = _this.deb.set("cookie:set");
                var defaultCookie = "---- INSERT TOKEN HERE ----";
                var secrets = new fetchSecrets_1.Secrets({ tokenCookie: defaultCookie });
                return secrets.fetch()
                    .then(function (secretData) {
                    if (secretData.tokenCookie === defaultCookie) {
                        (0, log_1.logLine)("Incorrect or missing token. Please add your token to the created secrets.i.json file");
                        debug(secretData);
                        return Promise.reject("Invalid Access Token");
                    }
                    else {
                        _this.cookie.token = secretData.tokenCookie;
                        return Promise.resolve();
                    }
                });
            },
            get: function (options) {
                var debug = _this.deb.set("cookie:get");
                if (!_this.cookie.token) {
                    return _this.cookie.set()
                        .then(function () {
                        return _this.cookie.check(options);
                    })
                        .catch(function (err) {
                        return Promise.reject(err);
                    });
                }
                else {
                    return _this.cookie.check(options);
                }
            },
            isNeeded: function (options) {
                var setOptions = options || {};
                if (_this.useToken) {
                    return _this.cookie.get(setOptions)
                        .catch(function (err) {
                        return Promise.reject(err);
                    });
                }
                else {
                    return Promise.resolve(options);
                }
            }
        };
        // TODO: Add method for GET with Cookie from Properties
        this.get = function (url, options) { return __awaiter(_this, void 0, void 0, function () {
            var deb, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deb = this.deb.set("get");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getUrl(url, options)];
                    case 2:
                        response = _a.sent();
                        deb("Response Received:");
                        deb(response);
                        return [2 /*return*/, response];
                    case 3:
                        error_1 = _a.sent();
                        deb("Failed to receive response:");
                        deb(error_1);
                        return [2 /*return*/, {
                                error: error_1,
                                response: void 0,
                                body: void 0
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.getUrl = function (url, options) { return __awaiter(_this, void 0, void 0, function () {
            var deb, theseOptions, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deb = this.deb.set("getUrl");
                        deb("URL Promise beginning |  ".concat(url));
                        return [4 /*yield*/, this.cookie.isNeeded(options)];
                    case 1:
                        theseOptions = _a.sent();
                        data = {
                            error: void 0,
                            response: void 0,
                            body: void 0,
                        };
                        return [2 /*return*/, new Promise(function (urlResolve, urlReject) {
                                deb("URL Promise beginning |  ".concat(url));
                                // TODO Troubleshoot and remove as any
                                (0, request_1.get)(url, theseOptions, function (error, response, body) {
                                    data.error = error;
                                    data.response = response;
                                    data.body = body;
                                    deb("Loading URL ".concat(url));
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
                            })];
                }
            });
        }); };
        if (!!useToken) {
            this.useToken = true;
        }
    }
    LoadUrl.single = function (url) {
        var loader = new LoadUrl(false);
        return loader.get(url);
    };
    return LoadUrl;
}());
exports.LoadUrl = LoadUrl;
var testSingle = function () {
    (0, log_1.logLine)(" Testing Single URL ");
    return LoadUrl.single("https://media-cf.assets-cdk.com/teams/repository/export/e39/f15e0949c100588110050568b5709/e39f15e0949c100588110050568b5709.js")
        .then(function (response) {
        (0, log_1.log)("Body Received: ".concat(!!response.body));
    });
};
var testGet = function (toTest) {
    (0, log_1.logLine)("Testing Get Specific URL");
    var construct = new urlConstructor_1.UrlConstructor("dit");
    var loader = new LoadUrl(true);
    var partnerDataUrl = construct.getSpecific({ partnerPortal: ["partners"] }).partnerPortal.partners;
    var oosDataUrl = construct.getSpecific({ oos: ["orders"] }).oos.orders;
    if (toTest === "oos") {
        loader.get(oosDataUrl)
            .then(function () {
            (0, log_1.log)("Partner Data URL Defined ".concat(oosDataUrl));
        });
    }
    if (toTest === "partners") {
        loader.get(partnerDataUrl)
            .then(function () {
            (0, log_1.log)("Partner Data URL Defined ".concat(oosDataUrl));
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
