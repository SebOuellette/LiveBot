
// Load a new token
let load = token => {
    // Login to the bot profile
    global.bot = new Discord.Client();
    bot.login(token);

    bot.on('ready', () => {
        
        // Load and start all the scripts
        loadAllScripts();

        // Log the status of the bot
        try {
            console.log(`Logged in as ${bot.user.tag}`);
        } catch (err) {
            console.log('Invalid Token');
            return;
        }

        // Update the user card
        document.getElementById('userCardName').innerHTML = bot.user.username;
        document.getElementById('userCardDiscrim').innerHTML = `#${bot.user.discriminator}`;
        document.getElementById('userCardIcon').src = `${bot.user.displayAvatarURL.replace(/(size=)\d+?($| )/, '$164')}`;

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
        bot.guilds.forEach(g => {
            let img;
            // If there is no icon url for the server, create the letter icon
            if (g.iconURL === null) {
                img = document.createElement('div');

                img.style.backgroundColor = '#2F3136';
                img.style.marginBottom = '4px';

                let abrev = document.createElement('p');
                abrev.id = 'guildAbrev';
                abrev.appendChild(document.createTextNode(g.nameAcronym));
                img.appendChild(abrev);
            } else {
                // The guild has an icon, create the image
                img = document.createElement('img');

                let ico;
                ico = g.iconURL;
                img.src = ico;

                img.alt = g.name;
                img.height = '40';
                img.width = '40';
            }

            // Styling for both image and letter icons
            img.style.height = '40px';
            img.style.width = '40px';
            img.classList.add("guild-icon");
            img.id = g.id;

            // Add the events for the guild icons
            img.onclick = () => {
                guildSelect(g, img);
                selectedGuild = g;
            };
            
            // Add image to the list of guilds
            document.getElementById('guild-list').appendChild(img);
        });
    });

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
                    await m.channel.fetchMessages({ limit: 2 }).then(msg => {
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