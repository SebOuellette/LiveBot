async function setToken() {
    let client = new Discord.Client()
    try{
        await client.login(document.getElementById('tokenbox').value);
        client.destroy();
    
        let channels = document.getElementById('channel-elements');
        while (channels.firstChild) {
            channels.removeChild(channels.firstChild);
        }
    
        let guilds = document.getElementById('guild-list');
        while (guilds.firstChild) {
            guilds.removeChild(guilds.firstChild);
        }
    
        let messages = document.getElementById('message-list');
        while (messages.firstChild) {
            messages.removeChild(messages.firstChild);
        }
    
        div = document.createElement('div');
        div.id = 'guildIndicator';
        document.getElementById('guild-list').appendChild(div);
    
        bot.destroy();
        load(document.getElementById('tokenbox').value);
        document.getElementById('tokenbox').style.borderColor = '#484B51';
    }catch(err){
        document.getElementById('tokenbox').style.borderColor = '#f00';
    }
    document.getElementById('tokenbox').value = '';
  }