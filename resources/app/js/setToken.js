async function setToken(token) {
    let client = new Discord.Client();
    let error = [false, 'none'];
    if(global.bot && bot.token == token) {errorHandler('SAME-TOKEN'); return 'SAME-TOKEN'}
    try {
        if(!token.replace(/ /, '').length)
            throw('EMPTY-TOKEN')
        await client.login(token).catch(err => {
            throw (err)
        });
        client.destroy();

        // Clear the list of channels
        let channels = document.getElementById('channel-elements');
        while (channels.firstChild) {
            channels.removeChild(channels.firstChild);
        }

        // Delete the list of the guilds
        let guildContainer = document.getElementById('guildContainer');
        if(guildContainer && guildContainer.parentElement){
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
        if(global.bot !== undefined){
            bot.destroy();
        }
        await unloadAllScripts();
        await unloadThemes()
        load(token);
        document.getElementById('tokenbox').style.borderColor = '#313339';
        cachedGuilds = []
    } catch (err) {
        // Flash red if the token is incorrect
        let tokenBox = document.getElementById('tokenbox');
        tokenBox.animate(animations.flashRed);

        // Set the error to true so it doesn't save the token
        error[0] = true
        error[1] = err
    }
    document.getElementById('tokenbox').value = '';
    // Return if there's been an error or not
    return error;
}

// Save the token to localstorage
// Will be upgraded to database eventually
async function saveToken(token) {
    let error = await setToken(token)
    if(!error[0]){
        settings.token = token;
        localStorage.setItem('livebot-token', token);
    } else {
        errorHandler(error[1])
        console.warn(`The token won't be saved since there was an error`) 
    }
}