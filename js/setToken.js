async function setToken(token) {
    let client = new Discord.Client();
    let error = [false, 'none'];
    if (global.bot && bot.token == token) { return [true, 'SAME-TOKEN'] }
    try {
        setLoadingPerc(0.05);
        if (!token.replace(/ /, '').length){
            setLoadingPerc(-1);
            throw ('EMPTY-TOKEN')
        }
        await client.login(token).catch(err => {
            setLoadingPerc(-1);
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

// Save the token to localstorage
// Will be upgraded to database eventually
async function saveToken(token) {
    let error = [false, 'none'];
    if (global.bot === undefined)
        error = await load(token);
    else
        error = await setToken(token);

    if (!error[0]) {
        settings.token = token;
        localStorage.setItem('livebot-token', token);
        return error;
    } else {
        console.warn(`The token won't be saved since there was an error`)
        return error;
    }
    
}