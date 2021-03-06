import { Injectable } from '@nestjs/common';
import {processImportAudio, analyzeMp3} from './start'
import {ConvertService} from "./convert/convert.service";
import { Global } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import {PythonShell} from 'python-shell';
import axios from 'axios';
import * as url from "url";


@Injectable()
export class AppService {
  getHello(): string {
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
                           console.log('AFTRER CONVERT')
                           self.deleteMp3(originalFile)

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
          url: `http://127.0.0.1:8899/api/classify/song/?title=${track}`,
          headers: { }
      };
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
        return  PythonShell.run('./src/convert.py', options, function (err, res) {

            if (err) {
                console.log(err);
            }else {
                console.log(`succefully converted ${mp3File} to ${mp3}.wav`);
                let wavFile = `${mp3}.wav`
                wav = `./src/audio/${mp3}.wav`

                let originalFile = `./src/audio/${mp3File}`
                console.log('AFTRER CONVERT')
                self.deleteMp3(originalFile)
                console.log({wav})
            }

            return wav
        });

  }
    deleteMp3(file) {

        let rmFile =  fs.unlink(file, (err) => {
            if (err) throw err;
        });

        return rmFile
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
}

function dd(msg = null){
    console.info({
        msg : msg,
        location : 'You are Here now'
    })

    console.log('*+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    return  process.exit(0);
}