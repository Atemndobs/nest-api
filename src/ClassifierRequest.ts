import fetch, {Headers} from 'node-fetch'
import axios from "axios";

export default class ClassifierRequest {
    url: string
    constructor() {
        this.url = 'http://172.17.0.1:8899/api/songs';
    }

    sendClassificatioon(payload) {
        return this.updateSong(payload)
    }

    preparePayload(payload){
        return JSON.stringify({
            "data": {
              //  "author": "Author",
                "key": payload.key,
                "bpm": payload.bpm,
                "scale": payload.scale,
                "energy": payload.energy,
                "analyzed": true,
                'status' : 'analyzed',
                "danceability": payload.danceability,
                "happy": payload.mood_happy,
                "sad": payload.mood_sad,
                "relaxed": payload.mood_relaxed,
                "aggressiveness": payload.mood_aggressive
            }
        });
    }

   async postByFetch(payload) {

        var myHeaders = new Headers();

        myHeaders.append("sec-ch-ua", "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"99\", \"Google Chrome\";v=\"99\"");
        myHeaders.append("accept", "application/json");
        myHeaders.append("Referer", "http://localhost:2000/");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("sec-ch-ua-mobile", "?0");
        myHeaders.append("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36");
        myHeaders.append("sec-ch-ua-platform", "\"Linux\"");

        var raw = this.preparePayload(payload)

        var songStat = null;

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        // @ts-ignore
       await fetch("http://localhost:8899/api/songs", requestOptions)
            .then(response => response.text())
            .then((result) => {
                // console.log(result)
                return result
            })
            .catch(error => console.log('error', error));
    }
    
    async  checkSong(file){
        await fetch(file)
            .then((response) => {
                return  response.status
            })
            .catch((e) => {
                console.log(e)
            })
    }

    async updateSong(payload) {
        var axios = require('axios');
        var data = this.preparePayload(payload)
        var id = payload.id

        var config = {
            method: 'put',
            url: `http://localhost:8899/api/songs/${id}`,
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data : data
        };

        await axios(config)
            .then(function (response) {
                return response.data
                console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
                console.log(error);
            });
    }

}


 function dd(msg = null){
     console.info({
         msg : msg,
     })
     console.log('*+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
     return  process.exit(0);
 }