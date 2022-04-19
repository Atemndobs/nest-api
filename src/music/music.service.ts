import { Injectable } from '@nestjs/common';
import * as fs from 'fs'
import axios from "axios";

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
            author : file.artist ?? file.extractedTitle,
            image  : file.albumArt,
            comment : file.fileName

        };
        let url =  "http://localhost:8899/api/songs/"+id

        return axios.put(url, {data}).then((res) => {

        }).catch((err) => {
            console.log(err.message)
        })
    }

}
