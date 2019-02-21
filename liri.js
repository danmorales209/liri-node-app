console.clear();

function printCommands(e) {
    let commands = {
        "concert-this": {
            "argument": "Band or Artist Name",
            "instruction": "placeholder",
            "example": ">> node liri.js concert-this The Shins"
        },
        "spotify-this-song": {
            "argument": "Song Title",
            "instruction": "placeholder",
            "example": ">> node liri.js spotify-this-song Mr. Roboto"
        },
        "movie-this": {
            "argument": "Movie Title",
            "instruction": "placeholder",
            "example": ">> node liri.js movie-this Space Odyssey 2001"
        },
        "do-what-it-says": {
            "argument": "None",
            "instruction": "placeholder",
            "example": ">> node liri.js do-what-it-says"
        }
    };
    if (e === '') {
        console.log("I'm sorry Dave, you didn't tell me to do anything. LIRI accepts the following commands:");
    }
    else {
        console.log(`I'm sorry Dave, I can't do ${e}. LIRI accepts the following commands:`);
    }
    console.table(commands);
}

function buildString() {
    let output = "";

    for (let i = 3; i < process.argv.length; i++) {
        if (process.argv[i + 1]) {
            output += process.argv[i] + " ";
        }
        else {
            output += process.argv[i];
        }
    }

    return output;
}

require("dotenv").config();
var fs = require('fs');
var moment = require('moment');
var keys = require("./keys.js");
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
// Grab the axios package...
var axios = require("axios");


if (process.argv[2]) {
    let command = process.argv[2];
    let input;

    if (process.argv.length == 4) {
        input = process.argv[3]
    }
    else if (process.argv.length > 4) {
        input = buildString();
    }
    else {
        input = "";
    }

    if (command === "concert-this") {

        if (input === "") {
            input = "Maroon 5";
        }

        let url = "https://rest.bandsintown.com/artists/" + input + "/events?app_id=" + keys.bandCamp.code;

        axios.get(url).then(function (response) {
            let events = response.data;
            let printArr = [];
            let printObj = {
                "name" : "",
                "location": "",
                "date": ""
            };

            let formattedDate = "";

            for (i in events) {

                formattedDate = moment(events[i].datetime);
            
                printObj = {
                    "name": events[i].venue.name,
                    "location": events[i].venue.city + ", " + events[i].venue.country,
                    "date": formattedDate.format("MM/DD/YYYY")
                };

                printArr.push(printObj);
            }

            console.table(printArr);

        })

    }
    else if (command === "spotify-this-song") {
        // do something spotify related
    }
    else if (command === "movie-this") {
        // do something movie related
    }
    else if (command === "do-what-it-says") {
        // do something random
    }
    else {
        printCommands(command);
    }


}
else {
    printCommands('');
}