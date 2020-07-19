// This part isn't needed, I don't know why it's here...
// const { remote } = require("electron");

// Load a new token
let load = token => {
    // Login to the bot profile
    global.bot = new Discord.Client({});
    if(!token.replace(/ /, '').length){
        errorHandler('EMPTY-TOKEN');
        return
    }
    bot.login(token).catch(err => {
        errorHandler(err)
    }).then(settings.token = token);

    bot.on('ready', () => {

        // Load and start all the scripts
        loadAllScripts();

        // Load all the themes
        loadThemes()

        // Log the status of the bot
        console.log(`Logged in as ${bot.user.tag}`);

        // Set all users to closed dms just so the code works for the future
        updateUsers(true)

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
        guildIndicator = document.createElement('div');
        guildIndicator.id = 'guildIndicator';

        // Create a guild container
        guildContainer = document.createElement('div')
        guildContainer.id = 'guildContainer';

        // Apply the guild indicator in the container
        guildContainer.appendChild(guildIndicator);

        // Apply the guild container to the guild list
        document.getElementById('guild-list').appendChild(guildContainer);

        // Loop through all the guilds and create the element for the icon
        addGuilds();
    });

    bot.on('guildUnavailable', (g) => {
        if(g.available) return;
        console.error(`Guild ${g.name} went offline`)
        removeGuild(g);
    })

    bot.on('guildCreate', (g) => {
        updateUsers(true);
        addGuilds();
    })

    bot.on('guildDelete', (g) => {
        updateUsers(true);
        removeGuild(g);
    })  

    // A user has started typing
    bot.on('typingStart', (c) => {
        if(c != selectedChan) return;
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
        if(m.channel ? m.channel : m.dmChannel != selectedChan || !m.editedAt) return;
        // Get the dom element from the message
        let message = document.getElementById(m.id).querySelector('.messageText');
        message.innerHTML = `${parseMessage(m.cleanContent)} <time class='edited'>(edited)</time>`;
    });


    // New message recieved
    bot.on('message', (m) => {
        (m.channel.type == 'dm')
            m.author.received = true;
        if (selectedChan && selectedChan.type == 'dm') {

            // If the message was sent to the selected channel
            if (selectedChan && m.channel.id == selectedChan.id) {
                //document.getElementById('message-list').removeChild(document.getElementById('message-list').firstChild);
                let previousMessage;
                fetchLast(previousMessage);
            }
        }
        // If there is a channel selected
        else if (selectedGuild && m.guild.id == selectedGuild.id) {

            let channel = document.getElementById(m.channel.id);
            if (channel && (!selectedChan || (selectedChan && selectedChan.id != m.channel.id))) {
                channel.classList.add("newMsg");
            }

            // If the message was sent to the selected channel
            if (selectedChan && m.channel.id == selectedChan.id) {
                //document.getElementById('message-list').removeChild(document.getElementById('message-list').firstChild);
                let previousMessage;
                fetchLast(previousMessage);
            }
        }

        // Get last message in channel
        async function fetchLast(previousMessage) {
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
    });

    // Runs when a user joins a server
    bot.on('guildmemberAdd', m => {
        updateUsers(false, m);
    })

    // Runs when a user leaves a server
    bot.on('guildmemberRemove', m => {
        updateUsers(false, m, true);
    })

    // Runs when unloaded
    bot.on('error', () => {
        // Remove the server list when connection lost
        while (document.getElementById('guild-list').firstChild) {
            document.getElementById('guild-list').removeChild(document.getElementById('guild-list').firstChild);
        }
        // Unload and stop all the scripts
        unloadAllScripts();
        // Unload all the themes
        unloadThemes()
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