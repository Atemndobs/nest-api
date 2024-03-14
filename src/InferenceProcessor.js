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
exports.inferenceProcessor = exports.outputPredictions = void 0;
var jsDom = require("jsdom");
var essentia_js_1 = require("essentia.js");
var tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-backend-wasm");
var JSDOM = jsDom.JSDOM;
var dom = new JSDOM("\n<!DOCTYPE html>\n    <p>Hello world</p>\n");
if ('undefined' === typeof dom.window) {
    importScripts('./lib/tf.min.3.5.0.js');
    importScripts('./lib/essentia.js-model.umd.js');
}
var pred = {};
var model;
var modelName = "";
var modelLoaded = false;
var modelReady = true;
var modelTagOrder = {
    'mood_happy': [true, false],
    'mood_sad': [false, true],
    'mood_relaxed': [false, true],
    'mood_aggressive': [true, false],
    'danceability': [true, false]
};
function initModel(name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new essentia_js_1.EssentiaModel.TensorflowMusiCNN(tf, getModelURL(name))];
                case 1:
                    model = _a.sent();
                    loadModel(name).then(function (isLoaded) {
                        /*        console.log({
                                    loadmodel : name,
                                    isLoaded : isLoaded,
                                    url : getModelURL(name)
                                })*/
                        if (isLoaded) {
                            modelLoaded = true;
                            // perform dry run to warm them up
                            warmUp(name);
                        }
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function getModelURL(name) {
    // let file = fs.readFileSync(`./src/models/${name}-musicnn-msd-2/model.json`, 'utf8')
    //    let file_path = pathToFileURL(`./src/models/${name}-musicnn-msd-2/model.json`)
    //'file:///home/atem/sites/curator/nested/src/models/mood_happy-musicnn-msd-2/model.json'
    // http://mage.tech:8899/storage/models/danceability-musicnn-msd-2/model.json
    //   let essentai_path = `https://mtg.github.io/essentia.js/examples/demos/mood-classifiers/models/${name}-musicnn-msd-2/model.json`
    var essentai_path = "http://mage.tech:8899/storage/models/".concat(name, "-musicnn-msd-2/model.json");
    return essentai_path;
}
function loadModel(name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, model.initialize()];
                case 1:
                    _a.sent();
                    // warm-up: perform dry run to prepare WebGL shader operations
                    console.info("Model ".concat(name, " has been loaded!"));
                    return [2 /*return*/, true];
            }
        });
    });
}
function warmUp(name) {
    var fakeFeatures = {
        melSpectrum: getZeroMatrix(187, 96),
        frameSize: 187,
        melBandsSize: 96,
        patchSize: 187
    };
    var fakeStart = Date.now();
    model.predict(fakeFeatures, false).then(function () {
        console.info("".concat(name, ": Warm up inference took: ").concat(Date.now() - fakeStart));
        modelReady = true;
        if (modelLoaded && modelReady)
            console.log("".concat(name, " loaded and ready."));
    });
}
function initTensorflowWASM(name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (tf.getBackend() != 'wasm') {
                tf.setBackend('wasm');
                tf.ready().then(function () {
                    console.info('tfjs WASM backend successfully initialized!');
                    initModel(name);
                })["catch"](function () {
                    console.error("tfjs WASM could NOT be initialized, defaulting to ".concat(tf.getBackend()));
                    return false;
                });
            }
            return [2 /*return*/];
        });
    });
}
/*export async function outputPredictions(p = null) {
    console.log({OUTPUT_PRED___: pred})


    if (Object.keys(pred).length != 0){
        const res = await p ?? pred
        return {
            predictions: res
        };
    }

}*/
function outputPredictions() {
    //  console.log({OUTPUT_PRED___: pred})
    return {
        predictions: pred
    };
}
exports.outputPredictions = outputPredictions;
function twoValuesAverage(arrayOfArrays) {
    var firstValues = [];
    var secondValues = [];
    arrayOfArrays.forEach(function (v) {
        firstValues.push(v[0]);
        secondValues.push(v[1]);
    });
    var firstValuesAvg = firstValues.reduce(function (acc, val) { return acc + val; }) / firstValues.length;
    var secondValuesAvg = secondValues.reduce(function (acc, val) { return acc + val; }) / secondValues.length;
    return [firstValuesAvg, secondValuesAvg];
}
function modelPredict(features, name) {
    return __awaiter(this, void 0, void 0, function () {
        var inferenceStart_1, newModel_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!modelReady) return [3 /*break*/, 4];
                    inferenceStart_1 = Date.now();
                    return [4 /*yield*/, new essentia_js_1.EssentiaModel.TensorflowMusiCNN(tf, getModelURL(name))];
                case 1:
                    newModel_1 = _a.sent();
                    return [4 /*yield*/, newModel_1.initialize()
                        /*        console.log({
                                    modelReady: modelReady,
                                    modelLoaded : modelLoaded,
                                    modelName : name
                                })*/
                    ];
                case 2:
                    _a.sent();
                    /*        console.log({
                                modelReady: modelReady,
                                modelLoaded : modelLoaded,
                                modelName : name
                            })*/
                    return [4 /*yield*/, newModel_1.predict(features, true).then(function (predictions) {
                            /*            console.log({
                                            modelName : name,
                                            modelTagOrder_0 : modelTagOrder[name][0],
                                            modelTagOrder_1 : modelTagOrder[name][1]
                                        })*/
                            var summarizedPredictions = twoValuesAverage(predictions);
                            // format predictions, grab only positive one
                            var results = summarizedPredictions.filter(function (_, i) { return modelTagOrder[name][i]; })[0];
                            console.info("".concat(name, ": Inference took: ").concat(Date.now() - inferenceStart_1));
                            pred = { modelName: name, prediction: results };
                            newModel_1.dispose();
                        })];
                case 3:
                    /*        console.log({
                                modelReady: modelReady,
                                modelLoaded : modelLoaded,
                                modelName : name
                            })*/
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getZeroMatrix(x, y) {
    var matrix = new Array(x);
    for (var f = 0; f < x; f++) {
        matrix[f] = new Array(y).fill(0);
    }
    return matrix;
}
function inferenceProcessor(data) {
    return __awaiter(this, void 0, void 0, function () {
        var infered, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!data.name) return [3 /*break*/, 2];
                    modelName = data.name;
                    return [4 /*yield*/, initTensorflowWASM(data.name)];
                case 1:
                    infered = _a.sent();
                    return [2 /*return*/, infered];
                case 2:
                    if (!data.features) return [3 /*break*/, 4];
                    console.log("From inference worker: I've got features!");
                    return [4 /*yield*/, modelPredict(data.features.features, data.features.name)];
                case 3:
                    res = _a.sent();
                    data = null;
                    return [2 /*return*/, res];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.inferenceProcessor = inferenceProcessor;
function dd(msg) {
    if (msg === void 0) { msg = null; }
    console.info({
        msg: msg,
        location: 'You are Here now'
    });
    console.log('*+++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    return process.exit(0);
}
