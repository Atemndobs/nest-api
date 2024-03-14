"use strict";
exports.__esModule = true;
exports.extraxtFeatures = void 0;
// const { JSDOM } = jsDom;
// const dom =  new JSDOM(`
// <!DOCTYPE html>
//     <p>Hello world</p>
// `);
// if( 'undefined' === typeof dom.window){
//     importScripts('./lib/essentia.js-model.umd.js');
//     importScripts('./lib/essentia-wasm.module.js');
// }
var essentia_js_1 = require("essentia.js");
// using importScripts since it works on both Chrome and Firefox
// using modified version of ES6 essentia WASM, so that it can be loaded with importScripts
var extractor = new essentia_js_1.EssentiaModel.EssentiaTFInputExtractor(essentia_js_1.EssentiaWASM, 'musicnn', false);
function outputFeatures(f) {
    return {
        features: f
    };
}
function computeFeatures(audioData) {
    var featuresStart = Date.now();
    var features = extractor.computeFrameWise(audioData, 256);
    // console.log('computeFeatures: ', features.melSpectrum);
    console.info("Feature extraction took: ".concat(Date.now() - featuresStart));
    return features;
}
function extraxtFeatures(sound) {
    console.log("From FE worker: I've got audio!");
    var audio = new Float32Array(sound);
    var features = computeFeatures(audio);
    return outputFeatures(features);
}
exports.extraxtFeatures = extraxtFeatures;
function dd(msg) {
    if (msg === void 0) { msg = null; }
    console.info({
        msg: msg,
        location: 'You are Here now'
    });
    console.log('*+++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    return process.exit(0);
}
