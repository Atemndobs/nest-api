import { preprocess, shortenAudio, downsampleArray } from './audioUtils';
import ClassifierRequest from './ClassifierRequest'
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as wav from 'node-wav';
import * as esLib from 'essentia.js';
import * as jsDom from 'jsdom'
import { StreamAudioContext as AudioContext, encoder, RenderingAudioContext, OfflineAudioContext } from 'web-audio-engine';
import * as wae from 'web-audio-engine';
import * as mp3decoder from 'audio-decode'
//import { AudioContext , AudioBuffer} from 'web-audio-api';
import { Worker } from "worker_threads";

import {extraxtFeatures} from './Extraction'
import {inferenceProcessor, outputPredictions} from './InferenceProcessor'

import {EssentiaWASM, EssentiaModel, Essentia, EssentiaExtractor} from 'essentia.js'
import ffmpeg from 'fluent-ffmpeg'


import * as NodeLame from 'node-lame'
// const Lame = NodeLame.Lame;

import Mp32Wav from 'mp3-to-wav'
import path from 'path'


const audioCtx = new AudioContext()
const context = new RenderingAudioContext()



const { JSDOM } = jsDom;

const KEEP_PERCENTAGE = 0.15; // keep only 15% of audio file

// let essentia = null;
const essentia = new Essentia(EssentiaWASM);
//let essentiaAnalysis;
let featureExtractionWorker = null;
let inferenceWorkers = {};
const modelNames = ['mood_happy' , 'mood_sad', 'mood_relaxed', 'mood_aggressive', 'danceability'];
let inferenceResultPromises = [];

process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
});

let finshedPredictions : any = {}

let wavesurfer;

export async function processImportAudio(url, id) {
    var sound = process.argv[2]

    finshedPredictions.id = id

    let traclUrl = sound
    if (sound == 'undefined' || sound == null){
        traclUrl = url
        console.log({traclUrl: traclUrl})
        let res = await importFile(traclUrl)
       return  res
    }

    if (sound !== null){
        console.log({traclUrl: traclUrl})
      //  checkFileType(sound)
        let res = await importFile(traclUrl)
        return  res
    }

    return {
        Error : sound + 'cannot be analyzed'
    }
}

createInferenceWorkers();

async function importFile(file){
    // @ts-ignore
    await fetch(file)
        .then((response) => {
          if (response.status == 200 ){
              return response.blob();
          }
        })
        .then((blob) => {
            // @ts-ignore
            blob.arrayBuffer().then((ab) => {
               return  decodeFile(ab);
            })
        })
        .catch((err) => {
            console.log({'FILE_NOT_FOUND' : err})
            return ({'FILE_NOT_FOUND' : err})
        });
}

export async function analyzeMp3(file, id) {
    finshedPredictions.id = id
    let arrayBuffer = fs.readFileSync(file)
    console.log({file})

    try {
        let res =  await decodeArrayBuffer(arrayBuffer)
        let emptyDir = await clearAudioFile(file)
        emptyDir

        return res
    }catch (e) {
        return JSON.stringify(e)
    }
}

async function clearAudioFile(file) {
    let rmFile = await  fs.unlink(file, (err) => {
        if (err) throw err;
    });
    return rmFile
}

async function decodeArrayBuffer(arrayBuffer) {
   let res = await audioCtx.decodeAudioData(arrayBuffer).then(async function handleDecodedAudio(audioBuffer) {

        // console.log({
        //     audioBuffer : {
        //         length : audioBuffer.length,
        //         duration : audioBuffer.duration,
        //         numberOfChannels : audioBuffer.numberOfChannels,
        //         sampleRate : audioBuffer.sampleRate
        //     }
        // })

        console.info("Done decoding audio!");

        const prepocessedAudio = preprocess(audioBuffer);
        await audioCtx.suspend();

        if (essentia) {
            let essentiaAnalysis = await computeKeyBPM(arrayBuffer);
            // @ts-ignore
            finshedPredictions.bpm = essentiaAnalysis.bpm
            // @ts-ignore
            finshedPredictions.key = essentiaAnalysis.keyData.key
            // @ts-ignore
            finshedPredictions.scale = essentiaAnalysis.keyData.scale
            finshedPredictions.energy = essentiaAnalysis.energy
        }

        // reduce amount of audio to analyse
        let audioData = shortenAudio(prepocessedAudio, KEEP_PERCENTAGE, true); // <-- TRIMMED start/end

        let features =  await extraxtFeatures(audioData)
       modelNames.forEach((n) => {
            // send features off to each of the models
            // @ts-ignore
            features.name = n
            let  inference = inferenceProcessor({features})

            inference.then((res) => {
                let preds = outputPredictions().predictions ;

                inferenceResultPromises.push(new Promise((res) => {
                    res({ [n]: preds });
                }));

                outputPredictions().predictions = null
                return collectPredictions();
            })

        });
       audioData = null;
    })

    return res;
}

function checkFileType(traclUrl) {

    var lastThree = traclUrl.substr(traclUrl.length - 3)

    if (lastThree !== 'wav'){
        let   msg = {
            Error : 'Wrong file format',
            message : 'Only .wav files can be analyzed'
        }
        console.log(msg)
        return msg;
    }

    return true;
}

 async function decodeFile(arrayBuffer) {
    try {
        return await audioCtx.resume().then(() => {
           return  decodeArrayBuffer(arrayBuffer)
        })
    }catch (e) {
        return JSON.stringify(e)
    }
}

async function computeKeyBPM (arrayBuffer) {
    let audio = wav.decode(arrayBuffer);
    let vectorSignal = essentia.arrayToVector(audio.channelData[0]);

/*    console.log({
        ptsr : vectorSignal.$$.ptr,
        count : vectorSignal.$$.count.value,
        ptrName : vectorSignal.$$.ptrType.name,
      //  ptrType : vectorSignal.$$.ptrType,
       // vectorSignal : vectorSignal.$$,
    })*/
    
    const keyData = await essentia.KeyExtractor(vectorSignal, true, 4096, 4096, 12, 3500, 60, 25, 0.2, 'bgate', 16000, 0.0001, 440, 'cosine', 'hann');
    const bpm = await essentia.PercivalBpmEstimator(vectorSignal, 1024, 2048, 128, 128, 210, 50, 16000).bpm;
    const energy = await essentia.Energy(vectorSignal).energy
    
    console.log({bpm, keyData, energy})
    return {
        keyData: keyData,
        bpm: bpm,
        energy : energy
    };
}

async function createFeatureExtractionWorker(features) {
   await modelNames.forEach((n) => {
        // send features off to each of the models
        features.name = n
        return inferenceProcessor({features})
    });

}

function createInferenceWorkers() {
    modelNames.forEach((n) => {
       return inferenceProcessor({
            name: n
        })
    });
}

async function collectPredictions() {

    const allPredictions = {};
    let finishedResults = {}
    
    if (inferenceResultPromises.length == modelNames.length ) {

        // @ts-ignore
        Promise.all(inferenceResultPromises, allPredictions).then(async (predictions) => {

            Object.assign(allPredictions, ...predictions);
            finishedResults = {...allPredictions, ...finshedPredictions};


            // @ts-ignore
            finshedPredictions = {
                // @ts-ignore
                mood_happy: allPredictions.mood_happy.prediction,
                // @ts-ignore
                mood_sad: allPredictions.mood_sad.prediction,
                // @ts-ignore
                mood_relaxed: allPredictions.mood_relaxed.prediction,
                // @ts-ignore
                mood_aggressive: allPredictions.mood_aggressive.prediction,
                // @ts-ignore
                danceability: allPredictions.danceability.prediction,
                ...finshedPredictions
            };
            await sendClssificationResults()
            inferenceResultPromises = [] // clear array

            finshedPredictions = []
            return 'Complete !!';
        })
    }

}

async function sendClssificationResults() {
    console.log({
        before_request : finshedPredictions,
    })

    let request = new ClassifierRequest()
    request.sendClassificatioon(finshedPredictions)
    let res = await finshedPredictions;
   return  res
}

function dd(msg = null){
    console.info({
        msg : msg,
        location : 'You are Here now'
    })

    console.log('*+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    return  process.exit(0);
}