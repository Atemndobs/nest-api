import { Injectable } from '@nestjs/common';
import * as fs from 'fs'

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

}
