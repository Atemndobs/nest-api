FROM node:16-alpine3.15

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add g++ make py3-pip python3
RUN npm install glob rimraf --force
RUN apk add ffmpeg
RUN pip install pydub

RUN npm install mkdirp@latest --force
RUN npm install -g @nestjs/cli --force
RUN npm install --force --unsafe-perm


COPY . .
RUN npm run build
# COPY ./src/images ./dist/images

#COPY ./dist ./dist
#COPY ./.env ./.env
#COPY ./.eslintrc.js ./.eslintrc.js
#COPY ./.prettierrc ./.prettierrc
#COPY ./.nest-cli.json ./.nest-cli.json
#COPY ./tsconfig.build.json ./tsconfig.build.json
#COPY ./tsconfig.json ./tsconfig.json
#COPY ./package-lock.json ./package-lock.json
#COPY ./package.json ./package.json

RUN npm install pm2 -g
# RUN pm2 start dist/main.js --name nest