import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import Mp32Wav from 'mp3-to-wav'
import * as stream from "stream";


@Controller('song')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
     return this.appService.healthCheck();
  }

  @Get(':track')
  async getAnalyseTrack(@Param('track') track : string) : Promise<any> {
      let audio = track
      let prediction

      try {
       let response = await  this.appService.getClassifier(track).then(res => {
             prediction = res

           if (prediction.error){
               prediction.status = "error"
           }else {
               prediction.status = 'in progres ...';
               prediction.estimated_duration_msecs = 120000
           }
         })

      }catch (e) {
          console.log(e)
          return {error : e.message}
      }

      prediction.track = track
      return await prediction;
  }


    dd(msg = null){
        console.info({
            msg : msg,
        })

        console.log('*+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
        return  process.exit(0);
    }

}
