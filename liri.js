console.clear();

// Function to print out the available commands
// accepts an input to provide context for why the profram displays this
// TODO - add explanations
function printCommands(e) {
    //define commands object with nested objects containing relevant information
    // prepared this was to use console.table()

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

    // black string
    if (e === '') {
        console.log("I'm sorry Dave, you didn't tell me to do anything. LIRI accepts the following commands:");
    }
    // unidentified command
    else {
        console.log(`I'm sorry Dave, I can't do ${e}. LIRI accepts the following commands:`);
    }

    // print the command object to the console as a table
    console.table(commands);
}

// Function condenses all process.argv array elements past the command into a single string for searching
function buildString() {
    let output = "";

    for (let i = 3; i < process.argv.length; i++) {
        if (process.argv[i + 1]) { // not the last element in the array
            output += process.argv[i] + " ";
        }
        else { // last element in array
            output += process.argv[i];
        }
    }

    return output;
}

function printBreak() {
    let printString = '+';

    for (let i = 1; i < 115; i++) {
        printString += "-";
    }

    return printString;
}

function addLineBreaks(string) {
    let indentLength = 27;
    let maxLineLength = 114 - indentLength;
    let padding = "+";
    let output = "";

    for (let i = 1; i < indentLength; i++) {
        padding += " ";
    }

    if (string.length > maxLineLength) {
        let linesRemaining = string.length;
        let firstChar = 0;
        let formattingDone = false;

        while (!formattingDone) {

            if (linesRemaining > maxLineLength) {
                if (firstChar !== 0) {
                    output += padding;
                }
                output += string.substring(firstChar, (firstChar + maxLineLength - 1)) + "\n";
                linesRemaining -= maxLineLength;
                firstChar += maxLineLength - 1;
            }
            else {
                output += padding + string.substring(firstChar, firstChar + linesRemaining+1);
                formattingDone = true;
            }

        }

    }
    else {
        output = string;
    }
    return output;


}

// Global variable declarations
// Allow using keys withouth directly exposing them
require("dotenv").config();
// import API keys
var keys = require("./keys.js");

// File System package
var fs = require('fs');
// Moment package for times
var moment = require('moment');
// Spotify node API package
var Spotify = require('node-spotify-api');
// Set the API keys and Secret message to enable functionality
var spotify = new Spotify(keys.spotify);
// Grab the axios package...
var axios = require("axios");

// Check that the use has input something
if (process.argv[2]) {
    let command = process.argv[2];
    let input;

    // User has inputted exactly two arguments ( a command and an input)
    if (process.argv.length == 4) {
        input = process.argv[3]
    }
    // User has inputted multiple items for the input
    else if (process.argv.length > 4) {
        // call buildstring fuction to condense array of arguments into a string, after the "command"
        input = buildString();
    }
    // User only inputted a command
    else {
        input = "";
    }

    if (command === "concert-this") {
        // Set the default input to Maroon 5 if the user did not input a band or artist
        if (input === "") {
            input = "Maroon 5";
        }

        // build the URL for the axios AJAX request
        let url = "https://rest.bandsintown.com/artists/" + input + "/events?app_id=" + keys.bandCamp.code;

        // axios AJAx request
        axios.get(url).then(function (response) {
            let events = response.data;

            // No response for the given query 
            if (events.length == 0) {
                console.log(`I'm sorry Dave, I couldn't find any events for ${input}.`);
            }
            else {
                let printArr = [];
                let printObj = {
                    "name": "",
                    "location": "",
                    "date": ""
                };

                let formattedDate = "";

                // iterate over the array of data reruned by the API
                for (i in events) {

                    // Date is stored as YYYY-MM-DDTHH:mm, which is a supported format by Moment.js
                    formattedDate = moment(events[i].datetime);

                    // define object with properties of interest from the API response
                    printObj = {
                        "name": events[i].venue.name,
                        "location": events[i].venue.city + ", " + events[i].venue.country,
                        "date": formattedDate.format("MM/DD/YYYY")
                    };
                    // Append to the print array
                    printArr.push(printObj);
                }

                console.log(`Hello Dave. I found ${events.length} events for ${input}:`)
                // Output the results in tabular form to the console.
                console.table(printArr);
            }
        });
    }
    else if (command === "spotify-this-song") {
        if (input === "") {
            input = "The Sign";
        }

        spotify.search({
            type: 'track',
            query: input,
            limit: 20
        }, function (err, data) {
            if (err) {
                return console.log(err);
            }
            //console.log(data);

            if (data.tracks.items.length === 0) {
                console.log(`I'm sorry Dave, I couldn't find any songs titled "${input}".`);
            }
            else {


                console.log(`+++ Hello Dave, here are the Spotify results for ${input}:    +++`);

                for (let j = 0; j < data.tracks.items.length; j++) {

                    console.log(printBreak());
                    console.log(`+ Hit #${j + 1}:`);
                    for (let i = 0; i < data.tracks.items[j].artists.length; i++) {
                        console.log(`+ Artist ${i + 1}: ${data.tracks.items[j].artists[i].name}`);
                    }
                    console.log("+ Track Name: ", data.tracks.items[j].name);
                    console.log("+ URL: ", data.tracks.items[j].preview_url);
                    console.log("+ Album name: ", data.tracks.items[j].album.name);
                }
            }
        });
    }
    else if (command === "movie-this") {
        if (input === "") {
            input = "Mr. Nobody";
        }

        let url = `http://www.omdbapi.com/?apikey=${keys.omdb.code}&t=${input}&type=movie&plot=short&r=json`;

        axios.get(url).then(function (response) {

            if (response.data.Response !== "True") {
                console.log(`I'm sorry Dave, I couldn't find any movies with the title ${input}`);
            }
            else {

                let formattedPlot = addLineBreaks(response.data.Plot);
                let outputObj = {
                    "title": response.data.Title,
                    "year": response.data.Year,
                    "IMDB": response.data.imdbRating,
                    "rottenTomatoes": response.data.Ratings[1].Value,
                    "producedWhere": response.data.Country,
                    "spokenLanguage": response.data.Language,
                    "plot": formattedPlot,
                    "actors": response.data.Actors
                };

                console.log(`Hello Dave, I found the following information about the movie ${input}:`);
                console.log(printBreak());
                console.log(`+ Movie Title:             ${outputObj.title}`);
                console.log(`+ Year Produced:           ${outputObj.year}`);
                console.log(`+ IMDB Rating:             ${outputObj.imdbRating}`);
                console.log(`+ Rotten Tomatoes Rating:  ${outputObj.rottenTomatoes}`);
                console.log(`+ Country of Production:   ${outputObj.producedWhere}`);
                console.log(`+ Spoken Language:         ${outputObj.spokenLanguage}`);
                console.log(`+ Plot:                    ${outputObj.plot}`);
                console.log(`+ Actors:                  ${outputObj.actors}`);



            }
            /*
            * Title of the movie.
            * Year the movie came out.
            * IMDB Rating of the movie.
            * Rotten Tomatoes Rating of the movie.
            * Country where the movie was produced.
            * Language of the movie.
            * Plot of the movie.
            * Actors in the movie.
            */


        });
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