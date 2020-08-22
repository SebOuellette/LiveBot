async function setToken(token) {
    let client = new Discord.Client();
    let error = [false, 'none'];
    if (global.bot && bot.token == token) { return [true, 'SAME-TOKEN'] }
    try {
        setLoadingPerc(0.05);
        error = await validateToken(token)
        if (error[0]){
            throw (error[1])
        }
        await client.login(token).catch(err => {
            throw (err)
        });
        client.destroy();
        
        setLoadingPerc(0.1); // Refreshing the everything
        // Clear the list of channels
        let channels = document.getElementById('channel-elements');
        while (channels.firstChild) {
            channels.removeChild(channels.firstChild);
        }

        // Delete the list of the guilds
        let guildContainer = document.getElementById('guildContainer');
        if (guildContainer && guildContainer.parentElement) {
            guildContainer.parentElement.removeChild(guildContainer);
        }

        // Clear the message list
        let messages = document.getElementById('message-list');
        while (messages.firstChild) {
            messages.removeChild(messages.firstChild);
        }

        // Clear the member list
        let memberList = document.getElementById('memberBar');
        memberList.innerHTML = '';

        // Stop the current bot, unload scritps, and then load into the new token
        if (global.bot !== undefined) {
            bot.destroy();
        }
        await unloadAllScripts();
        await unloadThemes();
        load(token);
        cachedGuilds = []
    } catch (err) {

        // Set the error to true so it doesn't save the token
        error[0] = true;
        error[1] = err;
    }
    // Return if there's been an error or not

    return error;
}

async function saveToken(token) {
    let error = [false, 'none'];
    if (global.bot === undefined)
        error = await load(token);
    else
        error = await setToken(token);

    if (!error[0]) {
        // Set the default token
        settings.defaultToken = token;
        return error;
    } else {
        console.warn(`The token won't be saved since there was an error`)
        return error;
    }
    
}

async function validateToken(token = ''){
    if(token.length == 0)
        return [true, 'EMPTY-TOKEN']

    if(token.replace('.', '').length < 58)
        return [true, 'TOKEN-SHORT'];

    if(token.replace('.', '').length > 58)
        return [true, 'TOKEN-LONG'];

    let invalidChars = [' ', '\t', '\r', '\n']
    if(token.split('').filter(c => invalidChars.includes(c)).length > 0)
        return [true, 'TOKEN-WHITESPACE'];

    if(token.replace(/\w|-|_|\./gm, '').length > 0)
        return [true, 'INVALID-TOKEN-CHARACTERS'];

    let tA = token.split('.');
    if (tA.length < 3 || tA.length > 3)
        return [true, 'INVALID-TOKEN-FORMAT'];
    tA[0] = tA[0].length; tA[1] = tA[1].length; tA[2] = tA[2].length;
    if(tA[0] < 24 || tA[0] > 24 || tA[1] < 6 || tA[1] > 6 || tA[2] < 27 || tA[2] > 27)
        return [true, 'INVALID-TOKEN-FORMAT'];

    return [false, 'none']
}