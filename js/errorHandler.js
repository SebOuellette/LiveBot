// Custom error messages
function errorHandler(err){
    let code = err.code ? err.code : err;
    if(err.name == 'DiscordAPIError')
        discordApiErrors(code, err)
    else
        customErrors(code, err)
}

// Discord api errors that aren't catched with discord.js
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

// Errors that are catched by discord.js and converted to custom errors
function customErrors(code, err){
    switch(code){
        case('NO-TOKEN'):
            setLoadingPerc(-1);
            // Flash red if the token is incorrect
            Array.from(document.getElementsByClassName('tokenbox')).forEach(box => {
                console.log(box);
                box.animate(animations.flashRed, 400);
            });
            console.error('There is no token stored');
            break;
        case('SAME-TOKEN'):
            // Flash red if the token is incorrect
            Array.from(document.getElementsByClassName('tokenbox')).forEach(box => {
                console.log(box);
                box.animate(animations.flashRed, 400);
            });
            console.error('The token is the same so it won\'t be switched');
            break;
        case('EMPTY-TOKEN'):
            setLoadingPerc(-1);
            console.error('The token is empty');
            break;
        case('TOKEN_INVALID'):
            console.error('Invalid Token');
            break;
        case('SHARDING_REQUIRED'):
            console.error('Sharding is not a feature yet');
            break;
        case('EMPTY-NAME'):
            console.error('Username is empty or contains invalid characters')
            break;
        case('SERVER_OFFLINE'):
            console.error('Guild seems to be offline');
            break;
        default:
            console.error(`Error code: ${err.code}\n${err}`);
            break;
    }
}