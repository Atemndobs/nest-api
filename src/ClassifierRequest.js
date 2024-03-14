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
exports.__esModule = true;
var node_fetch_1 = require("node-fetch");
var ClassifierRequest = /** @class */ (function () {
    function ClassifierRequest() {
        this.url = 'http://172.17.0.1:8899/api/songs';
    }
    ClassifierRequest.prototype.sendClassificatioon = function (payload) {
        return this.updateSong(payload);
    };
    ClassifierRequest.prototype.preparePayload = function (payload) {
        return JSON.stringify({
            "data": {
                // "author": "Author",
                // "key": payload.key,
                // "bpm": payload.bpm,
                // "scale": payload.scale,
                // "energy": payload.energy,
                "analyzed": true,
                'status': 'analyzed',
                "danceability": payload.danceability,
                "happy": payload.mood_happy,
                "sad": payload.mood_sad,
                "relaxed": payload.mood_relaxed,
                "aggressiveness": payload.mood_aggressive
            }
        });
    };
    ClassifierRequest.prototype.postByFetch = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var myHeaders, raw, songStat, requestOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        myHeaders = new node_fetch_1.Headers();
                        myHeaders.append("sec-ch-ua", "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"99\", \"Google Chrome\";v=\"99\"");
                        myHeaders.append("accept", "application/json");
                        myHeaders.append("Referer", "http://localhost:2000/");
                        myHeaders.append("Content-Type", "application/json");
                        myHeaders.append("sec-ch-ua-mobile", "?0");
                        myHeaders.append("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36");
                        myHeaders.append("sec-ch-ua-platform", "\"Linux\"");
                        raw = this.preparePayload(payload);
                        songStat = null;
                        requestOptions = {
                            method: 'POST',
                            headers: myHeaders,
                            body: raw,
                            redirect: 'follow'
                        };
                        // @ts-ignore
                        return [4 /*yield*/, (0, node_fetch_1["default"])("http://localhost:8899/api/songs", requestOptions)
                            .then(function (response) {
                                console.log(response);
                                return response.text(); })
                            .then(function (result) {
                                // console.log(result)
                                return result;
                            })["catch"](function (error) { return console.log('error', error); })];
                    case 1:
                        // @ts-ignore
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ClassifierRequest.prototype.checkSong = function (file) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, node_fetch_1["default"])(file)
                        .then(function (response) {
                            return response.status;
                        })["catch"](function (e) {
                        console.log(e);
                    })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ClassifierRequest.prototype.updateSong = function (payload) {

        dd(['WE ARE HERE', payload]);

        return __awaiter(this, void 0, void 0, function () {
            var axios, data, id, config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        axios = require('axios');
                        data = this.preparePayload(payload);
                        id = payload.id;
                        config = {
                            method: 'put',
                            url: "http://localhost:8899/api/songs/".concat(id),
                            headers: {
                                'accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            data: data
                        };
                        return [4 /*yield*/, axios(config)
                            .then(function (response) {
                                return response.data;
                                console.log(JSON.stringify(response.data));
                            })["catch"](function (error) {
                            console.log(error);
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ClassifierRequest;
}());
exports["default"] = ClassifierRequest;
function dd(msg) {
    if (msg === void 0) { msg = null; }
    console.info({
        msg: msg
    });
    console.log('*+++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    return process.exit(0);
}

