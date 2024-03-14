"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.analyzeMp3 = exports.processImportAudio = void 0;
var audioUtils_1 = require("./audioUtils");
var ClassifierRequest_1 = require("./ClassifierRequest");
var node_fetch_1 = require("node-fetch");
var fs = require("fs");
var wav = require("node-wav");
var jsDom = require("jsdom");
var web_audio_engine_1 = require("web-audio-engine");
var Extraction_1 = require("./Extraction");
var InferenceProcessor_1 = require("./InferenceProcessor");
var essentia_js_1 = require("essentia.js");
var audioCtx = new web_audio_engine_1.StreamAudioContext();
var context = new web_audio_engine_1.RenderingAudioContext();
var JSDOM = jsDom.JSDOM;
var KEEP_PERCENTAGE = 0.15; // keep only 15% of audio file
// let essentia = null;
var essentia = new essentia_js_1.Essentia(essentia_js_1.EssentiaWASM);
//let essentiaAnalysis;
var featureExtractionWorker = null;
var inferenceWorkers = {};
var modelNames = ['mood_happy', 'mood_sad', 'mood_relaxed', 'mood_aggressive', 'danceability'];
var inferenceResultPromises = [];
process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
});
var finshedPredictions = {};
var wavesurfer;
function processImportAudio(url, id) {
    return __awaiter(this, void 0, void 0, function () {
        var sound, traclUrl, res, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sound = process.argv[2];
                    finshedPredictions.id = id;
                    traclUrl = sound;
                    if (!(sound == 'undefined' || sound == null)) return [3 /*break*/, 2];
                    traclUrl = url;
                    console.log({ traclUrl: traclUrl });
                    return [4 /*yield*/, importFile(traclUrl)];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res];
                case 2:
                    if (!(sound !== null)) return [3 /*break*/, 4];
                    console.log({ traclUrl: traclUrl });
                    return [4 /*yield*/, importFile(traclUrl)];
                case 3:
                    res = _a.sent();
                    return [2 /*return*/, res];
                case 4: return [2 /*return*/, {
                        Error: sound + 'cannot be analyzed'
                    }];
            }
        });
    });
}
exports.processImportAudio = processImportAudio;
createInferenceWorkers();
function importFile(file) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // @ts-ignore
                return [4 /*yield*/, (0, node_fetch_1["default"])(file)
                        .then(function (response) {
                        if (response.status == 200) {
                            return response.blob();
                        }
                    })
                        .then(function (blob) {
                        // @ts-ignore
                        blob.arrayBuffer().then(function (ab) {
                            return decodeFile(ab);
                        });
                    })["catch"](function (err) {
                        console.log({ 'FILE_NOT_FOUND': err });
                        return ({ 'FILE_NOT_FOUND': err });
                    })];
                case 1:
                    // @ts-ignore
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function analyzeMp3(file, id) {
    return __awaiter(this, void 0, void 0, function () {
        var arrayBuffer, res, emptyDir, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    finshedPredictions.id = id;
                    arrayBuffer = fs.readFileSync(file);
                    console.log({ file: file });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, decodeArrayBuffer(arrayBuffer)];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, clearAudioFile(file)];
                case 3:
                    emptyDir = _a.sent();
                    emptyDir;
                    return [2 /*return*/, res];
                case 4:
                    e_1 = _a.sent();
                    return [2 /*return*/, JSON.stringify(e_1)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.analyzeMp3 = analyzeMp3;
function clearAudioFile(file) {
    return __awaiter(this, void 0, void 0, function () {
        var rmFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.unlink(file, function (err) {
                        if (err)
                            throw err;
                    })];
                case 1:
                    rmFile = _a.sent();
                    return [2 /*return*/, rmFile];
            }
        });
    });
}
function decodeArrayBuffer(arrayBuffer) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, audioCtx.decodeAudioData(arrayBuffer).then(function handleDecodedAudio(audioBuffer) {
                        return __awaiter(this, void 0, void 0, function () {
                            var prepocessedAudio, essentiaAnalysis, audioData, features;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        // console.log({
                                        //     audioBuffer : {
                                        //         length : audioBuffer.length,
                                        //         duration : audioBuffer.duration,
                                        //         numberOfChannels : audioBuffer.numberOfChannels,
                                        //         sampleRate : audioBuffer.sampleRate
                                        //     }
                                        // })
                                        console.info("Done decoding audio!");
                                        prepocessedAudio = (0, audioUtils_1.preprocess)(audioBuffer);
                                        return [4 /*yield*/, audioCtx.suspend()];
                                    case 1:
                                        _a.sent();
                                        if (!essentia) return [3 /*break*/, 3];
                                        return [4 /*yield*/, computeKeyBPM(arrayBuffer)];
                                    case 2:
                                        essentiaAnalysis = _a.sent();
                                        // @ts-ignore
                                        finshedPredictions.bpm = essentiaAnalysis.bpm;
                                        // @ts-ignore
                                        finshedPredictions.key = essentiaAnalysis.keyData.key;
                                        // @ts-ignore
                                        finshedPredictions.scale = essentiaAnalysis.keyData.scale;
                                        finshedPredictions.energy = essentiaAnalysis.energy;
                                        _a.label = 3;
                                    case 3:
                                        audioData = (0, audioUtils_1.shortenAudio)(prepocessedAudio, KEEP_PERCENTAGE, true);
                                        return [4 /*yield*/, (0, Extraction_1.extraxtFeatures)(audioData)];
                                    case 4:
                                        features = _a.sent();
                                        modelNames.forEach(function (n) {
                                            // send features off to each of the models
                                            // @ts-ignore
                                            features.name = n;
                                            var inference = (0, InferenceProcessor_1.inferenceProcessor)({ features: features });
                                            inference.then(function (res) {
                                                var preds = (0, InferenceProcessor_1.outputPredictions)().predictions;
                                                inferenceResultPromises.push(new Promise(function (res) {
                                                    var _a;
                                                    res((_a = {}, _a[n] = preds, _a));
                                                }));
                                                (0, InferenceProcessor_1.outputPredictions)().predictions = null;
                                                return collectPredictions();
                                            });
                                        });
                                        audioData = null;
                                        return [2 /*return*/];
                                }
                            });
                        });
                    })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res];
            }
        });
    });
}
function checkFileType(traclUrl) {
    var lastThree = traclUrl.substr(traclUrl.length - 3);
    if (lastThree !== 'wav') {
        var msg = {
            Error: 'Wrong file format',
            message: 'Only .wav files can be analyzed'
        };
        console.log(msg);
        return msg;
    }
    return true;
}
function decodeFile(arrayBuffer) {
    return __awaiter(this, void 0, void 0, function () {
        var e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, audioCtx.resume().then(function () {
                            return decodeArrayBuffer(arrayBuffer);
                        })];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    e_2 = _a.sent();
                    return [2 /*return*/, JSON.stringify(e_2)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function computeKeyBPM(arrayBuffer) {
    return __awaiter(this, void 0, void 0, function () {
        var audio, vectorSignal, keyData, bpm, energy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    audio = wav.decode(arrayBuffer);
                    vectorSignal = essentia.arrayToVector(audio.channelData[0]);
                    return [4 /*yield*/, essentia.KeyExtractor(vectorSignal, true, 4096, 4096, 12, 3500, 60, 25, 0.2, 'bgate', 16000, 0.0001, 440, 'cosine', 'hann')];
                case 1:
                    keyData = _a.sent();
                    return [4 /*yield*/, essentia.PercivalBpmEstimator(vectorSignal, 1024, 2048, 128, 128, 210, 50, 16000).bpm];
                case 2:
                    bpm = _a.sent();
                    return [4 /*yield*/, essentia.Energy(vectorSignal).energy];
                case 3:
                    energy = _a.sent();
                    console.log({ bpm: bpm, keyData: keyData, energy: energy });
                    return [2 /*return*/, {
                            keyData: keyData,
                            bpm: bpm,
                            energy: energy
                        }];
            }
        });
    });
}
function createFeatureExtractionWorker(features) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, modelNames.forEach(function (n) {
                        // send features off to each of the models
                        features.name = n;
                        return (0, InferenceProcessor_1.inferenceProcessor)({ features: features });
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function createInferenceWorkers() {
    modelNames.forEach(function (n) {
        return (0, InferenceProcessor_1.inferenceProcessor)({
            name: n
        });
    });
}
function collectPredictions() {
    return __awaiter(this, void 0, void 0, function () {
        var allPredictions, finishedResults;
        var _this = this;
        return __generator(this, function (_a) {
            allPredictions = {};
            finishedResults = {};
            if (inferenceResultPromises.length == modelNames.length) {
                // @ts-ignore
                Promise.all(inferenceResultPromises, allPredictions).then(function (predictions) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                Object.assign.apply(Object, __spreadArray([allPredictions], predictions, false));
                                finishedResults = __assign(__assign({}, allPredictions), finshedPredictions);
                                // @ts-ignore
                                finshedPredictions = __assign({ 
                                    // @ts-ignore
                                    mood_happy: allPredictions.mood_happy.prediction, 
                                    // @ts-ignore
                                    mood_sad: allPredictions.mood_sad.prediction, 
                                    // @ts-ignore
                                    mood_relaxed: allPredictions.mood_relaxed.prediction, 
                                    // @ts-ignore
                                    mood_aggressive: allPredictions.mood_aggressive.prediction, 
                                    // @ts-ignore
                                    danceability: allPredictions.danceability.prediction }, finshedPredictions);
                                return [4 /*yield*/, sendClssificationResults()];
                            case 1:
                                _a.sent();
                                inferenceResultPromises = []; // clear array
                                finshedPredictions = [];
                                return [2 /*return*/, 'Complete !!'];
                        }
                    });
                }); });
            }
            return [2 /*return*/];
        });
    });
}
function sendClssificationResults() {
    return __awaiter(this, void 0, void 0, function () {
        var request, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log({
                        before_request: finshedPredictions
                    });
                    request = new ClassifierRequest_1["default"]();
                    request.sendClassificatioon(finshedPredictions);
                    return [4 /*yield*/, finshedPredictions];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res];
            }
        });
    });
}
function dd(msg) {
    if (msg === void 0) { msg = null; }
    console.info({
        msg: msg,
        location: 'You are Here now'
    });
    console.log('*+++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    return process.exit(0);
}
