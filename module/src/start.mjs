import { preprocess, shortenAudio } from './audioUtils.js';
import ClassifierRequest from './ClassifierRequest.js'
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as wav from 'node-wav';
import * as esLib from 'essentia.js';
import * as jsDom from 'jsdom'
import { StreamAudioContext as AudioContext, encoder } from 'web-audio-engine';
import { Worker } from "worker_threads";

import {extraxtFeatures} from './Extraction.js'
import {inferenceProcessor, outputPredictions} from './InferenceProcessor.js'

import {EssentiaWASM, EssentiaModel, Essentia, EssentiaExtractor} from 'essentia.js'
import ffmpeg from 'fluent-ffmpeg'


import * as NodeLame from 'node-lame'
const Lame = NodeLame.Lame;

import Mp32Wav from 'mp3-to-wav'

const audioCtx = new AudioContext()
const { JSDOM } = jsDom;
import * as decode from 'audio-decode'
const KEEP_PERCENTAGE = 0.15; // keep only 15% of audio file

// let essentia = null;
const essentia = new Essentia(EssentiaWASM);
let essentiaAnalysis;
let featureExtractionWorker = null;
let inferenceWorkers = {};
const modelNames = ['mood_happy' , 'mood_sad', 'mood_relaxed', 'mood_aggressive', 'danceability'];
let inferenceResultPromises = [];

process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
});

const dom =  new JSDOM(`
<!DOCTYPE html>
    <p>Hello world</p>
    <div id="file-drop-area"><span>Drop file here or click to upload</span></div>
    <audio id="audio-file" src="./src/Okmalumkoolkat_-_Lokshin_Gqom_Wave.mp3"></audio>
    <button id="file-send" type="submit">Send Fild</button>
    <input id="add-file" type="file"></input>
`);

let finshedPredictions = {}

let wavesurfer;

processImportAudio()

function processImportAudio() {
    let request = new ClassifierRequest()
    var sound = process.argv[2]
    importFile(sound)
}

function wavConvert(audio) {
    let track = '/home/atem/sites/curator/classify/src/Okmalumkoolkat_-_Lokshin_Gqom_Wave.mp3';//your path to source file
    let file = '/home/atem/sites/curator/classify/src/audio/audioFile.mp3'
    let output = '/home/atem/sites/curator/classify/src/audio/audioFile.wav';
    let outputDir = '/home/atem/sites/curator/classify/src/audio/'
}

 createInferenceWorkers();

async function importFile(file){
    let url1 = 'http://127.0.0.1:5500/src/audio/test.wav';
    let url = 'http://127.0.0.1:5500/src/audio/Okmalumkoolkat_Lokshin_Gqom_Wave_2cd540db5c.mp3'

    await fetch(file)
        .then((response) => {
            return response.blob();
        })
        .then((blob) => {
            blob.arrayBuffer().then((ab) => {

                decodeFile(ab);
            })
        }).catch((err) => {
            console.log(err)
        });
}

 function decodeFile(arrayBuffer) {

    let wavFile = '/home/atem/sites/curator/classify/src/audio/test.wav';
    let buffer = fs.readFileSync('audio/test.wav');
    let audio = wav.decode(buffer);

    let mp3File  = '/home/atem/sites/curator/classify/src/audio/Okmalumkoolkat_Lokshin_Gqom_Wave_2cd540db5c.mp3'
    let mp3Audio = fs.readFileSync(mp3File);

    audioCtx.resume().then(() => {

         audioCtx.decodeAudioData(arrayBuffer).then(async function handleDecodedAudio(audioBuffer) {
/*            console.log({
                audioBuffer : {
                    length : audioBuffer.length,
                    duration : audioBuffer.duration,
                    numberOfChannels : audioBuffer.numberOfChannels,
                    sampleRate : audioBuffer.sampleRate
                }
            })*/
            console.info("Done decoding audio!");

            const prepocessedAudio = preprocess(audioBuffer);
            await audioCtx.suspend();

            if (essentia) {
                essentiaAnalysis = computeKeyBPM(prepocessedAudio);
                finshedPredictions.bpm = essentiaAnalysis.bpm
                finshedPredictions.key = essentiaAnalysis.keyData.key
                finshedPredictions.scale = essentiaAnalysis.keyData.scale
            }

            // reduce amount of audio to analyse
           let audioData = shortenAudio(prepocessedAudio, KEEP_PERCENTAGE, true); // <-- TRIMMED start/end

           let features =  extraxtFeatures(prepocessedAudio)
           // createFeatureExtractionWorker(features);
            modelNames.forEach((n) => {
                // send features off to each of the models
                features.name = n
                let  inference = inferenceProcessor({features})

                inference.then((res) => {
                    let preds =outputPredictions().predictions ;

                    inferenceResultPromises.push(new Promise((res) => {
                        res({ [n]: preds });
                    }));

                    collectPredictions();
                  //  console.log(`${n} predictions: `, preds);
                })

            });
            audioData = null;
        })
    })
}

function computeKeyBPM (audioSignal) {

    let vectorSignal = essentia.arrayToVector(audioSignal);

/*    console.log({
        ptsr : vectorSignal.$$.ptr,
        count : vectorSignal.$$.count.value,
        ptrName : vectorSignal.$$.ptrType.name,
      //  ptrType : vectorSignal.$$.ptrType,
       // vectorSignal : vectorSignal.$$,
    })*/

   // let keyextract = new EssentiaExtractor(EssentiaWASM).KeyExtractor
   // const keyData = essentia.KeyExtractor(vectorSignal, true, 4096, 4096, 12, 3500, 60, 25, 0.2, 'bgate', 16000, 0.0001, 440, 'cosine', 'hann');

    const bpm = essentia.PercivalBpmEstimator(vectorSignal, 1024, 2048, 128, 128, 210, 50, 16000).bpm;
    
    // const bpm = essentia.RhythmExtractor(vectorSignal, 1024, 1024, 256, 0.1, 208, 40, 1024, 16000, [], 0.24, true, true).bpm;
    // const bpm = essentia.RhythmExtractor2013(vectorSignal, 208, 'multifeature', 40).bpm;

    return {
        keyData: { key: 'D', scale: 'minor', strength: 0.9044381976127625 },
        bpm: bpm
    };
}

function createFeatureExtractionWorker(features) {
    // featureExtractionWorker = new Worker('./featureExtraction.js');
    // featureExtractionWorker.terminate();
    modelNames.forEach((n) => {
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

function collectPredictions() {

    const allPredictions = {};
    let finishedResults = {}
    
    if (inferenceResultPromises.length == modelNames.length ) {

        Promise.all(inferenceResultPromises, allPredictions).then((predictions) => {

            Object.assign(allPredictions, ...predictions);
            finishedResults = {...allPredictions, ...finshedPredictions};

            let mood_happy = allPredictions.mood_happy.prediction

            finshedPredictions = {
                mood_happy: allPredictions.mood_happy.prediction,
                mood_sad : allPredictions.mood_sad.prediction,
                mood_relaxed : allPredictions.mood_relaxed.prediction,
                mood_aggressive : allPredictions.mood_relaxed.prediction,
                danceability : allPredictions.danceability.prediction,
                ...finshedPredictions
            };
            sendClssificationResults()

            inferenceResultPromises = [] // clear array
        })
    }

}

function sendClssificationResults() {
    console.log({
        before_request : finshedPredictions,
    })

    let request = new ClassifierRequest()

    request.sendClassificatioon(finshedPredictions)
}

function dd(msg = null){
    console.info({
        msg : msg,
        location : 'You are Here now'
    })

    console.log('*+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    return  process.exit(0);
}

/*dom.window.onload = () => {
    createInferenceWorkers();
    const essentia = new Essentia(EssentiaWASM);
    console.log("essentia.js version: ", essentia.version);
};*/
