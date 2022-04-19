import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import {MusicService} from "./music.service";
import fs from "fs";
import http from "http";
import {createParsedTrack} from "../MainProcess/core/createParsedTrack";
import axios from "axios";


@Controller('music')
export class MusicController {
    constructor(
        private readonly musicService: MusicService,
    ) {}

    @Get()
    getAll() : any {
        return [{
            id : 'Track 1'
        }]
    }

    @Get('delete')
    deleteAll() : object {
        this.musicService.clearAudioDir()

        return {
            status : 'Deleted !'
        };
    }


    @Get('update')
    updateTrack(@Query() query) {
        let url = 'http://mage.tech:8899/api/songs/'+ query.id

        let self = this

        let res =  new Promise(
            (resolve, reject) => {
                console.log("=====findAllBank=====")

                axios.get(url).then((res) => {

                    let path = res.data.data.path
                    let id = res.data.data.id
                    let file_path = './src/audio/' + res.data.data.title
                    const file = fs.createWriteStream(file_path);

                    const request =  http.get(path, function(response) {
                        response.pipe(file);
                        // after download completed close filestream
                        file.on("finish", () => {
                            file.close();
                            let parsedTrack =  createParsedTrack(file_path).then((song) => {
                                console.log(song)
                                let track =  self.musicService.updateSongProperties(song, id)

                                console.log("=====RESOLVE findAllBank=====")
                                resolve(track)
                                return track
                            })

                            console.log("Download Completed");
                            return parsedTrack
                        });

                        return {path}

                    });

                    console.log('RESTUM ')
                    return request
                }).catch((err) => {
                    console.log(err.message)
                })})
        return {
            id : query.id,
            status : 'updated'
        }
    }

    @Get('image')
    getImage(@Query() query){
        console.log(query)

        let file_path = './src/images/' + query.title

/*
        let image = fs.readFile(file_path, function (err, content) {
            return buffer
        })
*/

    //   let path = fs.readFileSync(file_path)
        return fs.createReadStream(file_path)
    }


    dd(msg = null){
        console.info({
            msg : msg,
        })

        console.log('*+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
        return  process.exit(0);
    }
}
