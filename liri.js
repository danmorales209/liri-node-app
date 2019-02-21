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
                    "name" : "",
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
                
                // Output the results in tabular form to the console.
                console.table(printArr);
            }
        });
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