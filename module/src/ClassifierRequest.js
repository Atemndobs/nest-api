import fetch, {Headers} from 'node-fetch'
global.fetch = fetch
global.Headers = fetch.Headers;



if( typeof window === 'undefined' ) {
    const Headers = (await import('node-fetch')).Headers
}

if (!globalThis.fetch) {
    globalThis.fetch = fetch
    globalThis.Headers = Headers
    globalThis.Request = Request
    globalThis.Response = Response
}
//         const fetch = require("node-fetch");
export default class ClassifierRequest {
    constructor() {
        this.url = 'http://172.17.0.1:8899/api/songs';
      //  this.payload = payload;
    }

    sendClassificatioon(payload) {
        this.postByFetch(payload)

    }

    getSong() {
        let file = './src/audio/Okmalumkoolkat_Lokshin_Gqom_Wave_2cd540db5c.mp3';
        let file2 = './src/audio/test.wav';
        let file3 = './src/audio/Okmalumkoolkat_-_Lokshin_Gqom_Wave.mp3';

        return [file, file2, file3];
    }

    preparePayload(payload){
        return JSON.stringify({
            "data": {
                "title": "Title",
                "author": "Author",
                "link": this.url,
                "source": this.url,
                "key": payload.key,
                "bpm": payload.bpm,
                "scale": payload.scale,
                "comment": "Comment",
                "danceability": payload.danceability,
                "happy": payload.mood_happy,
                "sad": payload.mood_sad,
                "relaxed": payload.mood_relaxed,
                "aggressiveness": payload.mood_aggressive,
                "energy": 0,
                "path": this.url
            }
        });
    }

    postClassification() {}

    postByFetch(payload) {

        var myHeaders = new Headers();

        myHeaders.append("sec-ch-ua", "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"99\", \"Google Chrome\";v=\"99\"");
        myHeaders.append("accept", "application/json");
        myHeaders.append("Referer", "http://localhost:2000/");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("sec-ch-ua-mobile", "?0");
        myHeaders.append("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36");
        myHeaders.append("sec-ch-ua-platform", "\"Linux\"");

        var raw = this.preparePayload(payload)


        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        console.log({
            requestOptions : requestOptions
        })

        fetch("http://localhost:8899/api/songs", requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
    }

    loadAudio = (url) => {
         const request = new XMLHttpRequest();
         request.open("GET", url);

         request.responseType = "arraybuffer";
         request.onload = function() {
             let undecodedAudio = request.response;
         };
         return request.send();
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


// export {sendClassificatioon, getSong}