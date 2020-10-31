// Custom error messages
function errorHandler(err){
    let code = err.code ? err.code : err;
    if(err.name == 'DiscordAPIError')
        discordApiErrors(code, err)
    else if (code.includes('TOKEN')){
        customTokenErrors(code, err)
    }
    else
        customErrors(code, err)
}

// Discord api errors that aren't cought with discord.js
function discordApiErrors(code, err){
    switch(err.message){
        case('Cannot send messages to this user'):
            console.error(`This user either has direct messages disabled in the server or you've been blocked by the user`);
            command("I'm sorry but this user has you blocked or their direct messages are disabled!\n\nIf you wish to contact them through direct messages you'll have to ask them first.")
            break;
        default:
            console.error(`Error code: ${err.code}\n${err.message}`);
            break;
    }
}

function tokenError(){
    // Flash red if the token is incorrect
    Array.from(document.getElementsByClassName('tokenbox')).forEach(box => {
        box.animate(animations.flashRed, 400);
        box.value = '';
    });
}

// Errors that are cought by discord.js and converted to custom errors
function customTokenErrors(code, err){
    switch(code){
        case('TOKEN_INVALID'):
            setLoadingPerc(-1, 'The token provided is invalid')
            console.error('Invalid Token');
            break;
        case('NO-TOKEN'):
            setLoadingPerc(-1, 'No tokens found in the cache')
            console.error('There is no token stored');
            break;
        case('SAME-TOKEN'):
            setLoadingPerc(-1, 'The token is the same as the current one')
            console.error('The token is the same so it won\'t be switched');
            break;
        case('EMPTY-TOKEN'):
            setLoadingPerc(-1, 'The token provided is empty')
            console.error('The token is empty');
            break;
        case('TOKEN-SHORT'):
            setLoadingPerc(-1, 'The token is too short')
            console.error('The token is too short, make sure you\'re not using the client secret\nIf you\'re sure it\'s not then contact the devs with the part of your token that is shorter\n\nRandomly generated example of a token:\n' + genFakeToken());
            break;
        case('TOKEN-LONG'):
            setLoadingPerc(-1, 'The token is too long')
            console.error('The token is too long\nIf you\'re sure it\'s not then contact the devs with the part of your token that is longer\n\nRandomly generated example of a token:\n' + genFakeToken());
            break;
        case('TOKEN-WHITESPACE'):
            setLoadingPerc(-1, 'There are spaces or newlines in the token')
            console.error('The token cannot contain a space or a newline, make sure to paste the token correctly');
            break;
        case('INVALID-TOKEN-CHARACTERS'):
            setLoadingPerc(-1, 'There are invalid characters in the token')
            console.error('The token contains invalid characters, please make sure the token is correct');
            break;
        case('INVALID-TOKEN-FORMAT'):
            setLoadingPerc(-1, 'The format of the token is invalid')
            console.error('The token format is invalid\n\nRandomly generated example of a token:\n' + genFakeToken());
            break;
        default:
            setLoadingPerc(-1)
            console.error(`Error code: ${err.code}\n${err}`);
            break;
    }

    tokenError();
}

// Errors that are cought by discord.js and converted to custom errors
function customErrors(code, err){
    switch(code){
        case('SHARDING_REQUIRED'):
            setLoadingPerc(-1, 'Sharding is required for your bot but it\'s not supported yet')
            console.error('Sharding is required for your bot but it\'s not supported yet');
            tokenError();
            break;
        case('EMPTY-NAME'):
            console.error('Username is empty or contains invalid characters');
            break;
        case('SERVER_OFFLINE'):
            console.error('Guild seems to be offline');
            break;
        default:
            console.error(`Error code: ${err.code}\n${err}`);
            break;
    }
}

// This just generates a random token that I'm sure 99% won't work
function genFakeToken(){
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
    let gen = (length) => {
        let result = ''
        var charLen = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charLen));
        }
        return result;
    }

    return `${gen(24)}.${gen(6)}.${gen(27)}`
}