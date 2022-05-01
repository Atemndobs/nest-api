import { Injectable } from '@nestjs/common';
import {processImportAudio, analyzeMp3} from './start'
import {ConvertService} from "./convert/convert.service";
import { Global } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import {PythonShell} from 'python-shell';
import axios from 'axios';
import * as url from "url";
import {createParsedTrack} from "./MainProcess/core/createParsedTrack";

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Danm!';
    return 'Hello Danm!';
  }

    healthCheck(){
        Object.keys(require.cache).forEach(function(key) { delete require.cache[key] })
        return {status: 'Working !!'}
    }
 async getClassifier(track : string) : Promise <any> {
   return await this.getSongByTitle(track).then((res) => {

       let id = res.id
       let path = res.path
       let url = path

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
                   console.log({err})
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
               return {error : e.message}
           }
       }
       return res
   })
  }

    getSongByTitle(track) : Promise<any> {
      var config = {
          method: 'get',
          url: `http://127.0.0.1:8899/api/classify/song/?slug=${track}`,
          headers: { }
      };
      let self = this
      // @ts-ignore
      return axios(config)
          .then(function (response) {
               console.log(JSON.stringify(response.data));
              if (response.status != 200){
                  return {
                      error : response.data
                  }
              }
              return response.data
          })
          .catch(function (error) {
              console.log(error.message);
              return {error : error.message}
          });
  }

    convertAudio(mp3File, path)  {
        let mp3 = mp3File.slice(0, -4);
        let options ={
            args : ["--song", `${path}`, "--name", `${mp3File}`]
        }

        let wav ;
        let self = this

        return PythonShell.run('./src/convert.py', options, function (err, res) {

            if (err) {
                console.log({err});
            }else {
                console.log(`succefully converted ${mp3File} to ${mp3}.wav`);
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