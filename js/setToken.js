async function setToken(token) {
    let client = new Discord.Client();
    let error = false;
    try {
        await client.login(token).catch(err => {
            loginErrors(token ? err : 'EMPTY-TOKEN')
            throw (err)
        });
        client.destroy();

        // Clear the list of channels
        let channels = document.getElementById('channel-elements');
        while (channels.firstChild) {
            channels.removeChild(channels.firstChild);
        }

        // Clear the list of the guilds
        let guilds = document.getElementById('guild-list');
        while (guilds.firstChild) {
            guilds.removeChild(guilds.firstChild);
        }

        // Clear the message list
        let messages = document.getElementById('message-list');
        while (messages.firstChild) {
            messages.removeChild(messages.firstChild);
        }

        // Create the guild indicator
        div = document.createElement('div');
        div.id = 'guildIndicator';
        document.getElementById('guild-list').appendChild(div);

        // Stop the current bot, unload scritps, and then load into the new token
        if(global.bot !== undefined){
            bot.destroy();
        }
        await unloadAllScripts();
        load(token);
        document.getElementById('tokenbox').style.borderColor = '#313339';
    } catch (err) {
        // Check if they have the user settings panel open. If not, show the token popup
        document.getElementById('tokenbox').style.borderColor = '#f00';
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