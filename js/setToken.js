async function setToken(token) {
    let client = new Discord.Client();
    try{
        await client.login(token);
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
        bot.destroy();
        await unloadAllScripts();
        load(token);
        document.getElementById('tokenbox').style.borderColor = '#313339';
    } catch (err) {
        document.getElementById('tokenbox').style.borderColor = '#f00';

        // Check if they have the user settings panel open. If not, show the token popup
        
    }
    document.getElementById('tokenbox').value = '';
}

  // Save the token to localstorage
// Will be upgraded to database eventually
function saveToken(token) {
    localStorage.setItem('livebot-token', token);
    setToken(token);
}