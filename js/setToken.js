async function setToken(token) {
    let client = new Discord.Client();
    let error = false;
    if(global.bot && bot.token == token) {errorHandler('SAME-TOKEN'); return 'SAME-TOKEN'}
    try {
        if(!token.replace(/ /, '').length){
            errorHandler('EMPTY-TOKEN');
            throw('EMPTY-TOKEN')
        }
        await client.login(token).catch(err => {
            errorHandler(err)
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
        if(guildContainer.parentElement){
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
        unloadThemes()
        load(token);
        document.getElementById('tokenbox').style.borderColor = '#313339';
        cachedGuilds = []
    } catch (err) {
        // Flash red if the token is incorrect
        let tokenBox = document.getElementById('tokenbox');
        tokenBox.animate(animations.flashRed);

        // Set the error to true so it doesn't save the token
        error = true
    }
    document.getElementById('tokenbox').value = '';
    // Return if there's been an error or not
    return error;
}

// Save the token to localstorage
// Will be upgraded to database eventually
async function saveToken(token) {
    let error = await setToken(token)
    if(!error){
        settings.token = token;
        localStorage.setItem('livebot-token', token);
    } else 
       console.warn(`The token won't be saved since there was an error`) 
}