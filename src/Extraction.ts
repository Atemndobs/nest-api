import * as jsDom from 'jsdom'
// const { JSDOM } = jsDom;
// const dom =  new JSDOM(`
// <!DOCTYPE html>
//     <p>Hello world</p>
// `);

// if( 'undefined' === typeof dom.window){
//     importScripts('./lib/essentia.js-model.umd.js');
//     importScripts('./lib/essentia-wasm.module.js');
// }

import {EssentiaWASM, EssentiaModel } from 'essentia.js'
import { Worker } from 'worker_threads'

// using importScripts since it works on both Chrome and Firefox
// using modified version of ES6 essentia WASM, so that it can be loaded with importScripts

const extractor = new EssentiaModel.EssentiaTFInputExtractor(EssentiaWASM, 'musicnn', false);


function outputFeatures(f) {
    return {
        features: f
    }
}

function computeFeatures(audioData) {
    const featuresStart = Date.now();
    
    const features = extractor.computeFrameWise(audioData, 256);
    // console.log('computeFeatures: ', features.melSpectrum);

    console.info(`Feature extraction took: ${Date.now() - featuresStart}`);

    return features;
}

export function extraxtFeatures(sound){
    console.log("From FE worker: I've got audio!");
    const audio = new Float32Array(sound);
    const features = computeFeatures(audio);
   return  outputFeatures(features);
}


function dd(msg = null){
    console.info({
        msg : msg,
        location : 'You are Here now'
    })

    console.log('*+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    return  process.exit(0);
}