import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MusicModule } from './music/music.module';
import { ConvertService } from './convert/convert.service';

@Module({
  imports: [MusicModule],
  controllers: [AppController],
  providers: [AppService, ConvertService],
})
export class AppModule {}
