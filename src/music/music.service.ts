import { Injectable } from '@nestjs/common';
import * as fs from 'fs'
import axios from "axios";
import * as sckey from "soundcloud-key-fetch"
import * as SoundCloud from "soundcloud-scraper"

@Injectable()
export class MusicService {

    async clearAudioDir() {
        let directory = './src/audio'

        let deleteSongs

        let rmDir  = await  fs.readdir(directory, (err, files) => {
            if (err) throw err;

            deleteSongs = files;

            for (const file of files) {
                let file_path = './src/audio/' + file
                fs.unlink(file_path, (err) => {
                    if (err) throw err;
                });
            }
        });
        return deleteSongs
    }

    updateSongProperties( file : any, id : bigint) : any {
        let data = {
            author : file.artist ?? file.title ?? file.extractedArtist ?? file.extractedTitle ??file.defaultTitle,
            image  : file.albumArt ,
            comment : file.fileName

        };
        let url =  "http://localhost:8899/api/songs/"+id

        return axios.put(url, {data}).then((res) => {

        }).catch((err) => {
            console.log(err.message)
        })
    }

    async getSoundCloudSong() : Promise<any>{

        const key = await sckey.fetchKey();
        const test = await sckey.testKey(key);
        if (test) {
            return key
        }
    }

    scrapeSoundCloudSong(url = "https://soundcloud.com/tera-kora/bewareofmibumpa") {

        // qAMlSnK5vTFKGJJcub5ud5wWTnVPj1iy
        const client = new SoundCloud.Client('qAMlSnK5vTFKGJJcub5ud5wWTnVPj1iy');
        const fs = require("fs");

        let client_id='V7svIpMdrs2xmRhQStZz66WxBo0YqVqe'

        console.log(url)
        console.log("Downloading song from SoundCloud..." )
        client.getSongInfo(url)
            .then(async song => {
                const stream = await song.downloadProgressive();

                const writer = stream.pipe(fs.createWriteStream( `./src/audio/${song.title}.mp3`));
                writer.on("finish", () => {
                    console.log("Finished writing song!")
                    console.log(song.title)
                    process.exit(1);
                });
            })
            .catch(console.error);

        console.log("Downloading...done")
    }

    getSpotifyAuth() {
        // call python webbrowser to open spotify auth page
        // return token from callback
    }
}
