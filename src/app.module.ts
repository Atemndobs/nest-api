import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MusicModule } from './music/music.module';
import { ConvertService } from './convert/convert.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    MusicModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '.', 'images'),
      // exclude: ['/api*'],
    })
  ],
  controllers: [AppController],
  providers: [AppService, ConvertService],
})
export class AppModule {}
