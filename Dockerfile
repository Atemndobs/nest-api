FROM node:16-alpine3.15

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add g++ make py3-pip python3
RUN npm install glob rimraf --force
RUN apk add ffmpeg
RUN pip install pydub

RUN npm install mkdirp@latest
RUN npm install -g @nestjs/cli


COPY . .


RUN npm install
RUN npm run build