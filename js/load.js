// This part isn't needed, I don't know why it's here...
// const { remote } = require("electron");

// Load a new token
let load = token => {
    // Login to the bot profile
    global.bot = new Discord.Client({});
    bot.login(token).catch(err => {
        loginErrors(token ? err : 'EMPTY-TOKEN')
    }).then(settings.token = token);

    bot.on('ready', () => {

        // Load and start all the scripts
        loadAllScripts();

        // Log the status of the bot
        console.log(`Logged in as ${bot.user.tag}`);

        // Update the user card
        document.getElementById('userCardName').innerHTML = bot.user.username;
        document.getElementById('userCardDiscrim').innerHTML = `#${bot.user.discriminator}`;
        document.getElementById('userCardIcon').src = `${bot.user.displayAvatarURL().replace(/(size=)\d+?($| )/, '$164')}`;

        if (bot.user.bot) {
            document.getElementById('userCardBot').innerHTML = `BOT`;
            document.getElementById('userCardBot').style.marginLeft = `8px`;
        } else {
            document.getElementById('userCardBot').innerHTML = `USER`;
            document.getElementById('userCardBot').style.marginLeft = `5px`;
        }
        
        // Create the guild indicator
        let guildIndicator = document.createElement('div');
        guildIndicator.id = 'guildIndicator';
        document.getElementById('guild-list').appendChild(guildIndicator);

        // Loop through all the guilds and create the element for the icon
        addGuilds();
    });

    bot.on('guildCreate', (e) => {
        addGuilds();
    })

    bot.on('guildDelete', (g) => {
        removeGuild(g);
    })  

    // A user has started typing
    bot.on('typingStart', (e) => {
        if(e != selectedChan) return;
        typingStatus();
    })    

    // A message has been deleted
    bot.on('messageDelete', (m) => {
        // Return if it's not the selected channel
        if(m.channel != selectedChan) return;
        // Get the dom element from the message
        let message = document.getElementById(m.id);
        let firstMessage = message.classList.contains('firstmsg');

        // Remove the message element
        removeMessage(message, firstMessage);
    });

    // Multiple messages have been deleted
    bot.on('messageDeleteBulk', (msgs) => {
        // Return if it's not the selected channel
        if(msgs.first().channel != selectedChan) return;
        for(let m of msgs){
            let message = document.getElementById(m[1].id);
            let firstMessage = message.classList.contains('firstmsg');

            // Remove the message element
            removeMessage(message, firstMessage);
        }
    });

    // A message has been updated
    bot.on('messageUpdate', (oldM, m) => {
        // Return if it's not the selected channel or if the message wasn't edited
        if(m.channel != selectedChan || !m.editedAt) return;
        // Get the dom element from the message
        let message = document.getElementById(m.id).querySelector('.messageText');
        message.innerHTML = `${parseMessage(m.cleanContent)} <time class='edited'>(edited)</time>`;
    });


    // New message recieved
    bot.on('message', (m) => {
        // If there is a channel selected
        if (selectedGuild && m.guild.id == selectedGuild.id) {

            let channel = document.getElementById(m.channel.id);
            if (channel && (!selectedChan || (selectedChan && selectedChan.id != m.channel.id))) {
                channel.classList.add("newMsg");
            }

            // If the message was sent to the selected channel
            if (selectedChan && m.channel.id == selectedChan.id) {
                //document.getElementById('message-list').removeChild(document.getElementById('message-list').firstChild);
                let previousMessage;
                fetchLast();

                // Get last message in channel
                async function fetchLast() {
                    await m.channel.messages.fetch({ limit: 2 }).then(msg => {
                        previousMessage = msg.map(mseg => mseg)[1];
                    });

                    let scroll = false;
                    if (document.getElementById('message-list').scrollHeight - Math.floor(document.getElementById('message-list').scrollTop) == document.getElementById('message-list').clientHeight) {
                        scroll = true;
                    }

                    if (barry) {
                        bunch = false;
                        barry = false;
                    }

                    // Generate and add the message
                    let message = generateMsgHTML(m, previousMessage);
                    document.getElementById('message-list').appendChild(message);

                    // Auto scroll with the message
                    // Some debug stuff \/
                    // console.log("Client height: " + document.getElementById('message-list').clientHeight);
                    // console.log("Message list top: " + document.getElementById('message-list').scrollTop);
                    // console.log("Message list scrolled: " + document.getElementById('message-list').scrollHeight);
                    // console.log("Total Height: " + (document.getElementById('message-list').scrollHeight - Math.floor(document.getElementById('message-list').scrollTop)));
                    if (scroll == true) {
                        document.getElementById('message-list').scrollTop = document.getElementById('message-list').scrollHeight;
                        scroll = false;
                    }
                }
            }
        }
    });

    // Runs when unloaded
    bot.on('error', () => {
        // Remove the server list when connection lost
        while (document.getElementById('guild-list').firstChild) {
            document.getElementById('guild-list').removeChild(document.getElementById('guild-list').firstChild);
        }
        unloadAllScripts();
    });
};


function removeMessage(message, firstMessage) {
    // Check if you need to delete just the message or the whole message block
    if (message.parentNode.children.length > 1) {
        if (firstMessage) {
            let embed = message.querySelector('.embed');
            let text = message.querySelector('.messageText');
            let nextElement = message.nextElementSibling;
            
            if (embed)
                message.removeChild(embed);
            if (text)
                message.removeChild(text);

            message.innerHTML += nextElement.innerHTML;
            message.id = nextElement.id;

            message.parentElement.removeChild(nextElement);
        } else {
            message.parentElement.removeChild(message);
        }
    } else {
        document.getElementById('message-list').removeChild(message.parentNode);
    }
}