import * as http from "http";
const createServer = http.createServer;
import * as url from "url";
import axios from "axios";
import chalk from "chalk";
import config from './config.js'

import {processImportAudio} from './start.mjs'

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET'
};

/// ?search=php&location=dusseldorf

const decodeParams = searchParams => Array
    .from(searchParams.keys())
    .reduce((acc, key) => ({...acc, [key]: searchParams.get(key)}), {});

const server = createServer((req, res) => {
    const requestURL = url.parse(req.url);


    // {search: 'php, 'location: dusseldorf}
    const decodedParams = decodeParams(new  URLSearchParams(requestURL.search));

    const {search = 'php', location = 'dusseldorf', country = 'de'} = decodedParams;

    const staticURL = `http://mage.tech:5500/src/audio/${search}`;

    console.log(chalk.green(search));


    if (req.method === 'GET'){

        try {
           return  processImportAudio(staticURL)
        }catch (e) {
            console.log(e)
        }
    }


});


function analyzeTrack(track) {

}
function getStuff(staticURL) {

    //   const searchURL = `${config.BASE_URL}/${country.toLowerCase()}/search/1?app_id=${config.API_ID}&app_key=${config.API_KEY}&results_per_page=20&what=${search}$where=${location}`;

    // const staticURL = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=f2a5ddf6&app_key=ff8cda3fe673b86f9365a7573bf46834&results_per_page=20&what=${search}&where=${location}`;

}

const PORT = '7000';
server.listen
(PORT, () => {
    console.log(chalk.yellow('Server Listening on port: '+PORT));
    console.log('http://localhost:7000?search=')
});


function dd(msg = null){
    console.info({
        msg : msg,
        location : 'You are Here now'
    })

    console.log('*+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    return  process.exit(0);
}