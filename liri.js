console.clear();

// Function to print out the available commands
// accepts an input to provide context for why the profram displays this
// TODO - add explanations
function printCommands(e) {
    //define commands object with nested objects containing relevant information
    // prepared this was to use console.table()

    let logString = "";

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
        logString = "I'm sorry Dave, you didn't tell me to do anything.";
        console.log(logString + " LIRI accepts the following commands:");
        logString += '\n' + printBreak();
    }
    // unidentified command
    else {
        logString = `I'm sorry Dave, I can't do ${e}.`;
        console.log(logString + " LIRI accepts the following commands:");
        logString += '\n' + printBreak();
    }

    // print the command object to the console as a table
    console.table(commands);

    console.log(logString);
    fs.appendFileSync("log.txt", logString);
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

    return (printString + '\n');
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

function logCommand(command, input, readFromFile) {
    let requestDateTime = moment();
    let logString = printBreak();
    logString += "+ " + requestDateTime.format("YYYY-MMM-DD HH:mm") + '\n';

    if (readFromFile) {
        logString += `+ Command: ${command}\n`
        logString += `+ File text: ${fs.readFileSync("random.txt", "utf8")}\n`
        logString += `+ Interpreted Command: ${command}\t Interpreted Input: ${input}:\n`
        logString += printBreak();
    }
    else {
        logString += `+ Command: ${command}\t\t\t Input: ${input}\n`
        logString += printBreak();
    }

    return logString;
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
    let responseToLog = "";

    // User has inputted exactly two arguments ( a command and an input)
    if (process.argv.length == 4) {
        input = process.argv[3]
    }
    // User has inputted multiple items for the input
    else if (process.argv.length > 4) {
        // call buildstring fuction to condense array of arguments into a string, after the "command"
        input = buildString();
    }
    else if (process.argv[2] === "do-what-it-says") { // user has inputted "do-what-it-says"
        // Use the fs.readFileSync to get the contents. Use the Sync method here as it is unlikely this
        // program will actually need to read files asynchronously. Future implementation might need 
        // re-work if this is required

        // Read the file and store to a UTF8 encoded string
        let savedInstructions = fs.readFileSync("random.txt", "utf8");

        // the file is written in the form <command>,<"input string">
        command = savedInstructions.split(",")[0];
        input = savedInstructions.split(",")[1];

        // Set these before using the data to reuse the if..else if..else logic

    }
    // User only inputted a command
    else {
        input = "";
    }

    if (process.argv[2] === "do-what-it-says") {
        fs.appendFileSync("log.txt", logCommand(command, input, true));
    }
    else {
        fs.appendFileSync("log.txt", logCommand(command, input, false));
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
            if (events === '\n{warn=Not found}\n') {
                responseToLog = `${printBreak()}+ I'm sorry Dave, I couldn't find any events for ${input}.\n${printBreak()}`;
                console.log(responseToLog);
            }
            else {

                responseToLog += `+ Hello Dave. I found ${events.length} events for ${input.toUpperCase()}:\n`;
                console.log(`Hello Dave. I found ${events.length} events for ${input.toUpperCase()}:\n`);
                responseToLog += `${printBreak()}`;

                let formattedDate = "";

                // iterate over the array of data reruned by the API
                for (i in events) {

                    // Date is stored as YYYY-MM-DDTHH:mm, which is a supported format by Moment.js
                    formattedDate = moment(events[i].datetime);

                    responseToLog += `+ CONCERT #${Number(i) + 1}\n`;
                    responseToLog += `+ Venue:     ${events[i].venue.name ? events[i].venue.name : "Not Given"}\n`;
                    responseToLog += `+ Location:  ${events[i].venue.city}, ${events[i].venue.country}\n`;
                    responseToLog += `+ Date:      ${formattedDate.format("MM/DD/YYYY")}\n`;
                    responseToLog += printBreak();
                }

                // Output the results  to the console.
                console.log(responseToLog);
            }
            fs.appendFile("log.txt", responseToLog, function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        }).catch(function (err) {
            console.error(err);
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
                responseToLog = `\n${printBreak()}I'm sorry Dave, I couldn't find any songs titled "${input}\n${printBreak()}".`
                console.log(responseToLog);
            }
            else { // found something

                responseToLog = `+ Hello Dave, here are the Spotify results for ${input.toUpperCase()}:\n`;

                // Iterate over the returned data
                for (let j = 0; j < data.tracks.items.length; j++) {

                    // Print a line to delimit over responses
                    responseToLog += printBreak();
                    responseToLog += `+ TRACK RESULT #${j + 1}:\n`; // Hit 1 to Hit n

                    // Iterate through the array of artists
                    for (let i = 0; i < data.tracks.items[j].artists.length; i++) {
                        responseToLog += `+ Artist ${i + 1}: ${data.tracks.items[j].artists[i].name}\n`;
                    }
                    responseToLog += "+ Track Name: " + data.tracks.items[j].name + '\n';
                    responseToLog += "+ URL: " + (data.tracks.items[j].preview_url === null ? "N/A" : data.tracks.items[j].preview_url) + '\n';
                    responseToLog += "+ Album name: " + data.tracks.items[j].album.name + '\n';
                }
                responseToLog += printBreak();
            }
            console.log(responseToLog);
            fs.appendFile("log.txt", responseToLog, function (err) {
                if (err) {
                    return console.log(err);
                }
            })
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
                responseToLog = `I'm sorry Dave, I couldn't find any movies with the title ${input}\n${printBreak()}`;
                console.log(responseToLog);
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
                responseToLog = `+ Hello Dave, I found the following information about the movie ${input.toUpperCase()}:\n`;
                responseToLog += printBreak();
                responseToLog += `+ Movie Title:             ${outputObj.title}\n`;
                responseToLog += `+ Year Produced:           ${outputObj.year}\n`;
                responseToLog += `+ IMDB Rating:             ${outputObj.IMDB}\n`;
                responseToLog += `+ Rotten Tomatoes Rating:  ${outputObj.rottenTomatoes}\n`;
                responseToLog += `+ Country of Production:   ${outputObj.producedWhere}\n`;
                responseToLog += `+ Spoken Language:         ${outputObj.spokenLanguage}\n`;
                responseToLog += `+ Plot:                    ${outputObj.plot}\n`;
                responseToLog += `+ Actors:                  ${outputObj.actors}\n`;
                responseToLog += printBreak();
            }
            console.log(responseToLog);
            fs.appendFile("log.txt", responseToLog, function (err) {
                if (err) {
                    return console.log(err);
                }
            });

        });
    } // End movie-this

    else {
        printCommands(command);
    }
}
else {

    let logString = logCommand("No input", "None", false);
    console.log(logString);
    
    fs.appendFileSync("log.txt",logString);
    printCommands('');
}