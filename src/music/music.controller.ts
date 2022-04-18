import {Controller, Get} from '@nestjs/common';
import {MusicService} from "./music.service";

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
}
