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
            console.error('There is no token stored');
            settings.functions.openSettings('User');
            break;
        case('SAME-TOKEN'):
            console.error('The token is the same so it won\'t be switched');
            break;
        case('EMPTY-TOKEN'):
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
        case('DiscordAPIError: Cannot send messages to this user'):
            console.error('The user has either blocked you or has ')
            break;
        default:
            console.error(`Error code: ${err.code}\n${err}`);
            break;
    }
}