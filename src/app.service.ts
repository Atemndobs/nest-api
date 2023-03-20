import {Injectable, Logger} from '@nestjs/common';
import {analyzeMp3, processImportAudio} from './start'
import * as fs from 'fs';
import {PythonShell} from 'python-shell';
import axios from 'axios';
import {createParsedTrack} from "./MainProcess/core/createParsedTrack";
import {json} from "express";

require('dotenv').config();

@Injectable()
export class AppService {
    logger : Logger;
    constructor() {
        // @ts-ignore
        this.logger = new Logger('AppService');
    }
  getHello(): string {
    return 'Hello Danm!';
  }

    healthCheck(){
        Object.keys(require.cache).forEach(function(key) { delete require.cache[key] })
        return {status: 'Working !!'}
    }
 async getClassifier(track : string) : Promise <any> {
      //  let self = this
   return await this.getSongByTitle(track).then((res) => {
       // SONG_BASE_URL_PROD
       let base_url = process.env.SONG_BASE_URL
       let id = res.id
       let path = res.path
       let url = path
       let home = process.env.HOME
       let pwd = process.env.PWD
       this.logger.debug('BEFORE CONVERTING ===============================================')

       console.log({
           home, pwd
       })

       if (home == "/home/atem"){
           base_url = process.env.SONG_BASE_URL
       }
       if (home == "/root" && pwd == "/usr/src/app"){
           base_url = process.env.SONG_BASE_URL_DOCKER
       }

       this.logger.debug({
           base_url,
           id,
           path,
           url,
           home,
           pwd
       })
       console.log("BEFORE CONVERTING=====================================================================BEFORE CONVERTING")

       if (! this.checkFileType(track)){

           try {
               let newUrl = this.convertAudio(track, path)

               const self = this
               newUrl.on('message', function (message) {
                   if (message.toString().includes('wav')){
                       let checked_path =  message

                       if (fs.existsSync(checked_path)) {
                           let pred = analyzeMp3(checked_path, id)

                           let originalFile = `./src/audio/${track}`
                           self.deleteMp3(originalFile, id)

                           return pred;

                       }else {
                           return 'PROCESS FAILED'
                       }
                   }
               });
               newUrl.end(function (err,code,signal) {
                   self.logger.debug({err,})
                   console.log('The exit code was: ' + code);
                   console.log('The exit signal was: ' + signal);
                   console.log('finished');
               });
           }catch (e) {
               return {error : e.message}
           }

       }else {
           try {
               processImportAudio(url, id)
           }catch (e) {
               this.logger.error(e.message)
               return {error : e.message}
           }
       }
       return res
   })
  }

    getSongByTitle(track) : Promise<any> {
        let home = process.env.HOME
        let pwd = process.env.PWD
        let base_url = process.env.SONG_BASE_URL

        if (home == "/home/atem"){
            base_url = process.env.SONG_BASE_URL
        }
        if (home == "/root" && pwd == "/usr/src/app"){
            base_url = process.env.SONG_BASE_URL_DOCKER
        }
      var config = {
          method: 'get',
          url: `${base_url}/api/classify/song/?slug=${track}`,
          headers: { }
      };

      let self = this
      // @ts-ignore
      return axios(config)
          .then(function (response) {
               self.logger.log(JSON.stringify(response.data));
              if (response.status != 200){
                  self.logger.error(JSON.stringify(response.data));
                  return {
                      error : response.data
                  }
              }
              return response.data
          })
          .catch(function (error) {
              self.logger.error(JSON.stringify(error));
              return {error : error.message}
          });
  }

    convertAudio(mp3File, path)  {
        let mp3 = mp3File.slice(0, -4);
        let options ={
            args : ["--song", `${path}`, "--name", `${mp3File}`]
        }

        console.log('INSIDE  CONVERTING ================================INSIDE');
        this.logger.debug(JSON.stringify(options));

        let wav ;
        let self = this
        return PythonShell.run('./src/convert.py', options, function (err, res) {

            if (err) {
                self.logger.error(err);
            }else {
                self.logger.debug(`successfully converted ${mp3File} to ${mp3}.wav`);
                let wavFile = `${mp3}.wav`
                wav = `./src/audio/${mp3}.wav`

                let originalFile = `./src/audio/${mp3File}`
            }
            return wav
        })

  }

    async  deleteMp3(file, id) {

      let trackDetails = await createParsedTrack(file)
        this.updateSongProperties(trackDetails, id)
        console.log('BEFORE UPDATING SONG TO DB')
        console.log({trackDetails})

        let rmFile = await fs.unlink(file, (err) => {
            if (err) throw err;
        });

        return trackDetails
    }
  
    checkFileType(traclUrl) {
        var lastThree = traclUrl.substr(traclUrl.length - 3)
        if (lastThree !== 'wav'){
            let   msg = {
                Error : 'Wrong file format',
                message : 'Only .wav files can be analyzed'
            }
            console.log(msg)
            return false;
        }
        return true;
    }

    async clearAudioDir() : Promise <any> {
        let directory = './src/audio/'

        let rmDir  = await  fs.readdir(directory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                let file_path = './src/audio/' + file
                fs.unlink(file_path, (err) => {
                    if (err) throw err;
                });
            }
        });
        return rmDir
    }

    updateSongProperties( file : any, id : bigint) : any {
        let data = {
            author : file.artist ?? file.extractedArtist ?? file.extractedTitle ??file.defaultTitle,
            image  : file.albumArt,
            comment : file.extractedTitle

        };
        let url =  "http://localhost:8899/api/songs/"+id

        console.log('BEFORE POST')
        console.log(data)

      return axios.put(url, {data}).then((res) => {

      }).catch((err) => {
          console.log(err.message)
      })
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