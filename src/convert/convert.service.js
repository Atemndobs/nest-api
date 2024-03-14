"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ConvertService = void 0;
var common_1 = require("@nestjs/common");
var ConvertService = /** @class */ (function () {
    function ConvertService() {
    }
    ConvertService.prototype.toWav = function (audioFileData, targetFormat) {
        try {
            targetFormat = targetFormat.toLowerCase();
            var reader_1 = new FileReader();
            return new Promise(function (resolve) {
                reader_1.onload = function (event) {
                    var contentType = 'audio/' + targetFormat;
                    // @ts-ignore
                    var data = event.target.result.split(',');
                    var b64Data = data[1];
                    var blob = getBlobFromBase64Data(b64Data, contentType);
                    // @ts-ignore
                    var blobUrl = URL.createObjectURL(blob);
                    var convertedAudio = {
                        name: audioFileData.name.substring(0, audioFileData.name.lastIndexOf(".")),
                        format: targetFormat,
                        data: blobUrl
                    };
                    // console.log("convertedImage: ", convertedImage);
                    resolve(convertedAudio);
                };
                reader_1.readAsDataURL(audioFileData);
            });
        }
        catch (e) {
            console.log("Error occurred while converting : ", e);
        }
    };
    ConvertService.prototype.getBlobFromBase64Data = function (b64Data, contentType, sliceSize) {
        if (sliceSize === void 0) { sliceSize = 512; }
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    };
    ConvertService = __decorate([
        (0, common_1.Injectable)()
    ], ConvertService);
    return ConvertService;
}());
exports.ConvertService = ConvertService;
function getBlobFromBase64Data(b64Data, contentType) {
    throw new Error('Function not implemented.');
}
