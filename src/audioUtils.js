"use strict";
exports.__esModule = true;
exports.shortenAudio = exports.preprocess = exports.downsampleArray = void 0;
function preprocess(audioBuffer) {
    var mono = monomix(audioBuffer);
    // downmix to mono, and downsample to 16kHz sr for essentia tensorflow models
    return downsampleArray(mono, audioBuffer.sampleRate, 16000);
}
exports.preprocess = preprocess;
function monomix(buffer) {
    // downmix to mono
    var monoAudio;
    if (buffer.numberOfChannels > 1) {
        console.log('mixing down to mono...');
        var leftCh = buffer.getChannelData(0);
        var rightCh_1 = buffer.getChannelData(1);
        monoAudio = leftCh.map(function (sample, i) { return 0.5 * (sample + rightCh_1[i]); });
    }
    else {
        monoAudio = buffer.getChannelData(0);
    }
    return monoAudio;
}
function downsampleArray(audioIn, sampleRateIn, sampleRateOut) {
    if (sampleRateOut === sampleRateIn) {
        return audioIn;
    }
    var sampleRateRatio = sampleRateIn / sampleRateOut;
    var newLength = Math.round(audioIn.length / sampleRateRatio);
    var result = new Float32Array(newLength);
    var offsetResult = 0;
    var offsetAudioIn = 0;
    console.log("Downsampling to ".concat(sampleRateOut, " kHz..."));
    while (offsetResult < result.length) {
        var nextOffsetAudioIn = Math.round((offsetResult + 1) * sampleRateRatio);
        var accum = 0, count = 0;
        for (var i = offsetAudioIn; i < nextOffsetAudioIn && i < audioIn.length; i++) {
            accum += audioIn[i];
            count++;
        }
        result[offsetResult] = accum / count;
        offsetResult++;
        offsetAudioIn = nextOffsetAudioIn;
    }
    return result;
}
exports.downsampleArray = downsampleArray;
function shortenAudio(audioIn, keepRatio, trim) {
    if (keepRatio === void 0) { keepRatio = 0.5; }
    if (trim === void 0) { trim = false; }
    /*
        keepRatio applied after discarding start and end (if trim == true)
    */
    if (keepRatio < 0.15) {
        keepRatio = 0.15; // must keep at least 15% of the file
    }
    else if (keepRatio > 0.66) {
        keepRatio = 0.66; // will keep at most 2/3 of the file
    }
    if (trim) {
        var discardSamples = Math.floor(0.1 * audioIn.length); // discard 10% on beginning and end
        audioIn = audioIn.subarray(discardSamples, audioIn.length - discardSamples); // create new view of buffer without beginning and end
    }
    var ratioSampleLength = Math.ceil(audioIn.length * keepRatio);
    var patchSampleLength = 187 * 256; // cut into patchSize chunks so there's no weird jumps in audio
    var numPatchesToKeep = Math.ceil(ratioSampleLength / patchSampleLength);
    // space patchesToKeep evenly
    var skipSize = Math.floor((audioIn.length - ratioSampleLength) / (numPatchesToKeep - 1));
    var audioOut = [];
    var startIndex = 0;
    for (var i = 0; i < numPatchesToKeep; i++) {
        var endIndex = startIndex + patchSampleLength;
        var chunk = audioIn.slice(startIndex, endIndex);
        audioOut.push.apply(audioOut, chunk);
        startIndex = endIndex + skipSize; // discard even space
    }
    return Float32Array.from(audioOut);
}
exports.shortenAudio = shortenAudio;
