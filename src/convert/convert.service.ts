import { Injectable } from '@nestjs/common';

@Injectable()
export class ConvertService {

    toWav(audioFileData, targetFormat) {
        try {
            targetFormat = targetFormat.toLowerCase();
            let reader = new FileReader();
            return new Promise(resolve => {
                reader.onload = function (event) {
                    let contentType = 'audio/'+targetFormat;
                    // @ts-ignore
                    let data = event.target.result.split(',');
                    let b64Data = data[1];
                    let blob = getBlobFromBase64Data(b64Data, contentType);
                    // @ts-ignore
                    let blobUrl = URL.createObjectURL(blob);

                    let convertedAudio = {
                        name: audioFileData.name.substring(0, audioFileData.name.lastIndexOf(".")),
                        format: targetFormat,
                        data: blobUrl
                    }
                    // console.log("convertedImage: ", convertedImage);
                    resolve(convertedAudio);
                }
                reader.readAsDataURL(audioFileData);
            });

        } catch (e) {
            console.log("Error occurred while converting : ", e);
        }
    }

    getBlobFromBase64Data(b64Data, contentType, sliceSize=512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }
}
function getBlobFromBase64Data(b64Data: any, contentType: string) {
    throw new Error('Function not implemented.');
}

