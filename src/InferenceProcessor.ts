import * as jsDom from 'jsdom'
import { Worker } from 'worker_threads'
import {EssentiaWASM, EssentiaModel, Essentia, EssentiaExtractor} from 'essentia.js'
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';
import * as fs from 'fs';
import path from 'path'

import { URL, pathToFileURL } from "url";

const { JSDOM } = jsDom;
const dom =  new JSDOM(`
<!DOCTYPE html>
    <p>Hello world</p>
`);

if( 'undefined' === typeof dom.window){
    importScripts('./lib/tf.min.3.5.0.js');
    importScripts('./lib/essentia.js-model.umd.js');
}

let pred = {}

let model;
let modelName = "";
let modelLoaded = false;
let modelReady = true;

const modelTagOrder = {
    'mood_happy': [true, false],
    'mood_sad': [false, true],
    'mood_relaxed': [false, true],
    'mood_aggressive': [true, false],
    'danceability': [true, false]
};

async function initModel(name) {

    model = await new EssentiaModel.TensorflowMusiCNN(tf, getModelURL(name));

    loadModel(name).then((isLoaded) => {
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
}

function getModelURL(name) {
    let essentai_path = `https://mtg.github.io/essentia.js/examples/demos/mood-classifiers/models/${name}-musicnn-msd-2/model.json`
   // let essentai_path = `http://nginx/storage/models/${name}-musicnn-msd-2/model.json`
    return essentai_path;
}

async function loadModel(name) {
    await model.initialize();
    // warm-up: perform dry run to prepare WebGL shader operations
    console.info(`Model ${name} has been loaded!`);
    return true;
}

function warmUp(name) {
    const fakeFeatures = {
        melSpectrum: getZeroMatrix(187, 96),
        frameSize: 187,
        melBandsSize: 96,
        patchSize: 187
    };

    const fakeStart = Date.now();

    model.predict(fakeFeatures, false).then(() => {
        console.info(`${name}: Warm up inference took: ${Date.now() - fakeStart}`);
        modelReady = true;
        if (modelLoaded && modelReady) console.log(`${name} loaded and ready.`);
    });
}

async function initTensorflowWASM(name) {
    if (tf.getBackend() != 'wasm') {
        tf.setBackend('wasm');
        tf.ready().then(() => {
            console.info('tfjs WASM backend successfully initialized!');
            initModel(name);
        }).catch(() => {
            console.error(`tfjs WASM could NOT be initialized, defaulting to ${tf.getBackend()}`);
            return false;
        });
    }
}

export function outputPredictions() {
     return {
        predictions: pred
    };

}


function twoValuesAverage (arrayOfArrays) {
    let firstValues = [];
    let secondValues = [];

    arrayOfArrays.forEach((v) => {
        firstValues.push(v[0]);
        secondValues.push(v[1]);
    });

    const firstValuesAvg = firstValues.reduce((acc, val) => acc + val) / firstValues.length;
    const secondValuesAvg = secondValues.reduce((acc, val) => acc + val) / secondValues.length;

    return [firstValuesAvg, secondValuesAvg];
}

async function modelPredict(features, name) {
    
    if (modelReady) {
        const inferenceStart = Date.now();
        const newModel = await new EssentiaModel.TensorflowMusiCNN(tf, getModelURL(name));

        await newModel.initialize()
        await newModel.predict(features, true).then((predictions) => {
            
            const summarizedPredictions = twoValuesAverage(predictions);
            // format predictions, grab only positive one
            const results = summarizedPredictions.filter((_, i) => modelTagOrder[name][i])[0];

            console.info(`${name}: Inference took: ${Date.now() - inferenceStart}`);

            pred = {modelName : name, prediction : results}

            newModel.dispose();

        });
    }
}


function getZeroMatrix(x, y) {
    let matrix = new Array(x);
    for (let f = 0; f < x; f++) {
        matrix[f] = new Array(y).fill(0);
    }
    return matrix;
}


export async function inferenceProcessor(data) {
    if (data.name) {
        modelName = data.name;
        let infered = await initTensorflowWASM(data.name);
        return infered;
    } else if (data.features) {

        console.log("From inference worker: I've got features!");
        // should/can this eventhandler run async functions
        let res = await modelPredict(data.features.features, data.features.name);
        data = null;
        return res;
    }
}


function dd(msg = null){
    console.info({
        msg : msg,
        location : 'You are Here now'
    })

    console.log('*+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    return  process.exit(0);
}
