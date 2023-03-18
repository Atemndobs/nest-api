import {Injectable, Logger} from '@nestjs/common';
import {analyzeMp3, processImportAudio} from './start'
import * as fs from 'fs';
import {PythonShell} from 'python-shell';
import axios from 'axios';
import {createParsedTrack} from "./MainProcess/core/createParsedTrack";

require('dotenv').config();

@Injectable()
export class AppService {
    logger = Logger;
    constructor() {
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
   return await this.getSongByTitle(track).then((res) => {
       // SONG_BASE_URL_PROD
       let base_url = process.env.SONG_BASE_URL
       let id = res.id
       let path = res.path
       let url = path
       let home = process.env.HOME
       let pwd = process.env.PWD
       this.logger.debug('BEFORE CONVERTING ===============================================')

       this.logger.debug({
           home, pwd
       })

       if (home == "/home/atem"){
           base_url = process.env.SONG_BASE_URL
       }
       if (home == "/root" && pwd == "/usr/src/app"){
           base_url = process.env.SONG_BASE_URL_DOCKER
       }

       this.logger.debug([base_url, id, path, url, home, pwd])
       this.logger.debug("BEFORE CONVERTING=====================================================================BEFORE CONVERTING")

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
                   this.logger.debug({err})
                   this.logger.debug('The exit code was: ' + code);
                   this.logger.debug('The exit signal was: ' + signal);
                   this.logger.debug('finished');
               });
           }catch (e) {
               return {error : e.message}
           }

       }else {
           try {
               processImportAudio(url, id)
           }catch (e) {
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
               this.logger.debug(JSON.stringify(response.data));
              if (response.status != 200){
                  return {
                      error : response.data
                  }
              }
              return response.data
          })
          .catch(function (error) {
              this.logger.debug(error.message);
              return {error : error.message}
          });
  }

    convertAudio(mp3File, path)  {
        let mp3 = mp3File.slice(0, -4);
        let options ={
            args : ["--song", `${path}`, "--name", `${mp3File}`]
        }

        this.logger.debug('INSIDE  CONVERTING ================================INSIDE');

        this.logger.debug({options})

        let wav ;
        let self = this
        return PythonShell.run('./src/convert.py', options, function (err, res) {

            if (err) {
                this.logger.debug({err});
            }else {
                this.logger.debug(`successfully converted ${mp3File} to ${mp3}.wav`);
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
        this.logger.debug('BEFORE UPDATING SONG TO DB')
        this.logger.debug({trackDetails})

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
            this.logger.debug(msg)
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

        this.logger.debug('BEFORE POST')
        this.logger.debug(data)

      return axios.put(url, {data}).then((res) => {

      }).catch((err) => {
          this.logger.debug(err.message)
      })
    }
}

function dd(msg = null){
    console.info({
        msg : msg,
        location : 'You are Here now'
    })

    this.logger.debug('*+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    return  process.exit(0);
}