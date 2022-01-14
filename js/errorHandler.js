// Copyright 2017 Sebastian Ouellette

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

// Animations used in javascript if they can't be used in css
let animations = {
    flashRed: [
        { borderColor: '#313339' },
        { borderColor: '#A00' },
        { borderColor: '#F00' },
        { borderColor: '#A00' },
        { borderColor: '#313339' },
    ],
    flashTextRed: [
        { color: '#B4B8BC' },
        { color: '#F00' },
        { color: '#B4B8BC' },
    ],
};

// Custom error messages
function errorHandler(err) {
    let code = err.code ? err.code : err;
    if (err.name == 'DiscordAPIError') discordApiErrors(code, err);
    else if (code.includes('TOKEN')) {
        customTokenErrors(code, err);
    } else customErrors(code, err);
}

// Discord api errors that aren't cought with discord.js
function discordApiErrors(code, err) {
    switch (err.message) {
        case 'Cannot send messages to this user':
            console.log(
                "%cThis user either has direct messages disabled in the server or you've been blocked by the user", "color: red;"
            );
            command(
                "I'm sorry but this user has you blocked or their direct messages are disabled!\n\nIf you wish to contact them through direct messages you'll have to ask them first."
            );
            break;
        default:
            console.log(`%c Error code: ${err.code}\n${err.message}`, "color: red;");
            break;
    }
}

function tokenError() {
    // Flash red if the token is incorrect
    Array.from(document.getElementsByClassName('tokenbox')).forEach((box) => {
        box.animate(animations.flashRed, 400);
        box.value = '';
    });
}

// Errors that are cought by discord.js and converted to custom errors
function customTokenErrors(code, err) {
    switch (code) {
        case 'TOKEN_INVALID':
            setLoadingPerc(-1, 'The token provided is invalid');
            console.log('%cInvalid Token', 'color: red;');
            break;
        case 'NO-TOKEN':
            setLoadingPerc(-1, 'No tokens found in the cache');
            console.log('%cThere is no token stored', 'color: red;');
            break;
        case 'SAME-TOKEN':
            setLoadingPerc(-1, 'The token is the same as the current one');
            console.log("%cThe token is the same so it won't be switched", 'color: red;');
            break;
        case 'EMPTY-TOKEN':
            setLoadingPerc(-1, 'The token provided is empty');
            console.log('%cThe token is empty', 'color: red;');
            break;
        case 'TOKEN-SHORT':
            setLoadingPerc(-1, 'The token is too short');
            console.log(
                "%cThe token is too short, make sure you're not using the client secret\nIf you're sure it's not then contact the devs with the part of your token that is shorter\n\nRandomly generated example of a token:\n" +
                    genFakeToken(), "color: red;"
            );
            break;
        case 'TOKEN-LONG':
            setLoadingPerc(-1, 'The token is too long');
            console.log(
                "%cThe token is too long\nIf you're sure it's not then contact the devs with the part of your token that is longer\n\nRandomly generated example of a token:\n" +
                    genFakeToken(), "color: red;"
            );
            break;
        case 'TOKEN-WHITESPACE':
            setLoadingPerc(-1, 'There are spaces or newlines in the token');
            console.log(
                '%cThe token cannot contain a space or a newline, make sure to paste the token correctly', 'color: red;'
            );
            break;
        case 'INVALID-TOKEN-CHARACTERS':
            setLoadingPerc(-1, 'There are invalid characters in the token');
            console.log(
                '%cThe token contains invalid characters, please make sure the token is correct', 'color: red;'
            );
            break;
        case 'INVALID-TOKEN-FORMAT':
            setLoadingPerc(-1, 'The format of the token is invalid');
            console.log(
                '%cThe token format is invalid\n\nRandomly generated example of a token:\n' +
                    genFakeToken(), 'color: red;'
            );
            break;
        default:
            setLoadingPerc(-1);
            console.log(`%cError code: ${err.code}\n${err}`, 'color: red;');
            break;
    }

    tokenError();
}

// Errors that are cought by discord.js and converted to custom errors
function customErrors(code, err) {
    switch (code) {
        case 'SHARDING_REQUIRED':
            setLoadingPerc(
                -1,
                "Sharding is required for your bot but it's not supported yet"
            );
            console.log(
                "%cSharding is required for your bot but it's not supported yet", "color: red;"
            );
            tokenError();
            break;
        case 'EMPTY-NAME':
            console.log('%cUsername is empty or contains invalid characters', 'color: red;');
            break;
        case 'SERVER_OFFLINE':
            console.log('%cGuild seems to be offline', 'color: red;');
            break;
        default:
            console.error(`Error code: ${err.code}\n${err}`);
            break;
    }
}

// This just generates a random token that I'm sure 99% won't work
function genFakeToken() {
    let characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let gen = (length) => {
        let result = '';
        var charLen = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charLen));
        }
        return result;
    };

    return `${gen(24)}.${gen(6)}.${gen(27)}`;
}
