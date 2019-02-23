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

    // blank string
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

// Function to print set length characters for break between console results
function printBreak() {
    let printString = '+';

    for (let i = 1; i < 115; i++) {
        printString += "-";
    }

    return printString;
}

// Format line breaks for OMDB plot response
function addLineBreaks(string) {
    const indentLength = 27; // length of the indent
    const maxLineLength = 114 - indentLength; // number of spaces left to print

    // Build the padding string to ensure formatting
    let padding = "+";
    let output = "";

    for (let i = 1; i < indentLength; i++) {
        padding += " ";
    }

    // Check to see if user input will fit in the alloted space
    if (string.length > maxLineLength) { // Will not fit in a single line
        // Counter to track remoaning space
        let charRemainingInLine = maxLineLength;
        let outArray = [];
        // Get an array of the inputs
        let stringArray = string.split(" ");

        // Iterate ove the stringArray
        for (let i = 0; i < stringArray.length; i++) {

            // Check that printing the next line won't exceed the remaining space
            if ((charRemainingInLine - stringArray[i].length) > 0) { // enough space to insert the word
                outArray.push(stringArray[i]); // push to the output array
                // update the space remaining tracker. the "+1" accounts for whitespace when printing
                charRemainingInLine -= (stringArray[i].length + 1);
            }
            else { // the next word will exceed the alloted space
                charRemainingInLine = maxLineLength - (stringArray[i].length + 1); // reset and update the characters
                outArray.push('\n' + padding + stringArray[i]); // add newline and padding to the next word
            }

            // assign output the formatted string
            output = outArray.join(" ");

        }

    }
    else { // String will fit
        output = string;
    }

    // Return the string
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

    // command "concert-this" logic
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
    } // End concert-this

    // Command "spotify-this-song" Logic
    else if (command === "spotify-this-song") {
        // Assign default argument if the user does not specify
        if (input === "") {
            input = "The Sign";
        }

        // Spotify search, 
        spotify.search({
            type: 'track',
            query: input,
            limit: 20
        }, function (err, data) {
            // Attempt to catch and display errors
            if (err) {
                return console.log(err);
            }

            if (data.tracks.items.length === 0) { // No data from query
                console.log(`I'm sorry Dave, I couldn't find any songs titled "${input}".`);
            }
            else { // found something
                console.log(`+++ Hello Dave, here are the Spotify results for ${input}:    +++`);

                // Content not so neatly organized to use console.table due to potential 
                //  mulitple artists.

                // Iterate over the returned data
                for (let j = 0; j < data.tracks.items.length; j++) {

                    // Print a line to delimit over responses
                    console.log(printBreak());
                    console.log(`+ Hit #${j + 1}:`); // Hit 1 to Hit n

                    // Iterate through the array of artists
                    for (let i = 0; i < data.tracks.items[j].artists.length; i++) {
                        console.log(`+ Artist ${i + 1}: ${data.tracks.items[j].artists[i].name}`);
                    }
                    console.log("+ Track Name: ", data.tracks.items[j].name);
                    console.log("+ URL: ", data.tracks.items[j].preview_url);
                    console.log("+ Album name: ", data.tracks.items[j].album.name);
                }
            }
        });
    } // End Spotify-this-song

    // Command "movie-this" logic
    else if (command === "movie-this") {
        // Default query if the user does not add input
        if (input === "") {
            input = "Mr. Nobody";
        }

        // GET url request for OMDB API (seach by movie title)
        let url = `http://www.omdbapi.com/?apikey=${keys.omdb.code}&t=${input}&type=movie&plot=short&r=json`;
        // axios get request, and the function resultsing from the promise
        axios.get(url).then(function (response) {

            // Check for data from API
            if (response.data.Response !== "True") { // no data found from the API
                console.log(`I'm sorry Dave, I couldn't find any movies with the title ${input}`);
            }
            else { // results found

                // Call the addLineBreaks to format the short plot entry
                let formattedPlot = addLineBreaks(response.data.Plot);

                // extract the information of interest
                let outputObj = {
                    "title": response.data.Title,
                    "year": response.data.Year,
                    "IMDB": response.data.Ratings[0].Value,
                    "rottenTomatoes": response.data.Ratings[1].Value,
                    "producedWhere": response.data.Country,
                    "spokenLanguage": response.data.Language,
                    "plot": formattedPlot,
                    "actors": response.data.Actors
                };

                // Print the information of interest, with some formatting
                console.log(`Hello Dave, I found the following information about the movie ${input}:`);
                console.log(printBreak());
                console.log(`+ Movie Title:             ${outputObj.title}`);
                console.log(`+ Year Produced:           ${outputObj.year}`);
                console.log(`+ IMDB Rating:             ${outputObj.IMDB}`);
                console.log(`+ Rotten Tomatoes Rating:  ${outputObj.rottenTomatoes}`);
                console.log(`+ Country of Production:   ${outputObj.producedWhere}`);
                console.log(`+ Spoken Language:         ${outputObj.spokenLanguage}`);
                console.log(`+ Plot:                    ${outputObj.plot}`);
                console.log(`+ Actors:                  ${outputObj.actors}`);
                console.log(printBreak());
            }
        });
    } // End movie-this

    //
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