// This part isn't needed, I don't know why it's here...
// const { remote } = require("electron");

// Load a new token
let load = async token => {
    // Login to the bot profile
    global.bot = new Discord.Client({});

    // Oh no, it appears as though I left this variable visible unintentionally. 
    // If it's changed, you will be able to view all the servers and channels that the owner of the bot is not in.
    // Whatever you do, don't change it, or discord might try and make up rules and get you to stop using LiveBot :O
    // If you do change this, it's modifying LiveBot, which means it's not our fault since we shipped the program to Discord's standards.
    bot.hideUnallowed = true; // Should be true by default

    let error = [false, 'none'];
    error = await validateToken(token)
    if (error[0]) {
        return error;
    }

    await bot.login(token).catch(err => {
        error = [true, err];
    }).then(() => {
        setLoadingPerc(0.15);
    });
    if (error[0]) {
        return error;
    }

    bot.on('ready', async() => {
        
        // Update the loading bar
        async function continueLoad() {
            // Load and start all the scripts
            setLoadingPerc(0.5);
            await loadAllScripts();

            // Load all the themes
            setLoadingPerc(0.55);
            await loadThemes();

            // Log the status of the bot
            console.log(`Logged in as ${bot.user.tag}`);
            console.log(`Owned by: ${bot.owner.tag}`);

            // Set all users to closed dms just so the code works for the future
            setLoadingPerc(0.6);
            await updateUsers(true);

            // Loading guilds and stuff
            setLoadingPerc(0.8);

            // Update the user card
            document.getElementById('userCardName').innerHTML = bot.user.username;
            document.getElementById('userCardDiscrim').innerHTML = `#${bot.user.discriminator}`;
            document.getElementById('userCardIcon').src = `${bot.user.displayAvatarURL().replace(/(size=)\d+?($| )/, '$164')}`;

            // Technically not needed anymore, but we'll keep it in case
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
            await addGuilds();
        }

        setLoadingPerc(0.4);
        let owner = (await bot.fetchApplication()).owner;

        // Check if the owner of the bot is a team
        if (owner.ownerID) {
            bot.team = owner.members.map(x => x);
            let id = settings.tokenSettings.teamUser
            if (id) {
                bot.owner = bot.team.filter(x => x.user.id == id)[0].user;
                continueLoad();
            } else {
                buildTeamMemberCards(continueLoad);
            }
        } else {
            bot.owner = owner;
            continueLoad();
        }
    });

    bot.on('guildUnavailable', (g) => {
        if (g.available) return;
        console.error(`Guild ${g.name} went offline`)
        removeGuild(g);
    });

    bot.on('guildCreate', (g) => {
        updateUsers(true);
        addGuilds();
    });

    bot.on('guildDelete', (g) => {
        updateUsers(true);
        removeGuild(g);
    });

    // A user has started typing
    bot.on('typingStart', (c) => {
        if (c != selectedChan) return;
        typingStatus();
    });

    // A message has been deleted
    bot.on('messageDelete', (m) => {
        // Return if it's not the selected channel
        if (m.channel != selectedChan) return;
        // Get the dom element from the message
        let message = document.getElementById(m.id);
        let firstMessage = message.classList.contains('firstmsg');

        // Remove the message element
        removeMessage(message, firstMessage);
    });

    // Multiple messages have been deleted
    bot.on('messageDeleteBulk', (msgs) => {
        // Return if it's not the selected channel
        if (msgs.first().channel != selectedChan) return;
        for (let m of msgs) {
            let message = document.getElementById(m[1].id);
            let firstMessage = message.classList.contains('firstmsg');

            // Remove the message element
            removeMessage(message, firstMessage);
        }
    });

    // A message has been updated
    bot.on('messageUpdate', (oldM, m) => {
        // Return if it's not the selected channel or if the message wasn't edited
        if (m.channel != selectedChan || oldM.content == m.content) return;
        // Get the dom element from the message
        let message = document.getElementById(m.id).querySelector('.messageText');
        message.innerHTML = `${parseMessage(m.cleanContent)} <time class='edited'>(edited)</time>`;
    });


    // New message recieved
    bot.on('message', m => {
        typingStatus(false, m);
        if (m.channel.type == 'dm')
            m.author.received = true;
        if (selectedChan && selectedChan.type == 'dm') {

            // If the message was sent to the selected channel
            if (selectedChan && m.channel.id == selectedChan.id) {
                //document.getElementById('message-list').removeChild(document.getElementById('message-list').firstChild);
                let previousMessage;
                fetchLast(previousMessage);
            }
            return;
        }
        // If there is a channel selected in the current guild
        else if (selectedGuild && m.guild.id == selectedGuild.id) {

            let channel = document.getElementById(m.channel.id);
            if (channel && (!selectedChan || (selectedChan && selectedChan.id != m.channel.id))) {
                channel.classList.add("newMsg");
            }
        }

        // If the message was sent to the selected channel
        if (selectedChan && m.channel.id == selectedChan.id) {
            //document.getElementById('message-list').removeChild(document.getElementById('message-list').firstChild);
            let previousMessage;
            fetchLast(previousMessage);
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
    bot.on('guildMemberAdd', m => {
        // Update the member count when a member joins
        if(selectedGuild && selectedGuild == m.guild){
            document.getElementById('members-count').innerText = selectedGuild.memberCount;
        }
        updateUsers(false, m);
    });

    // Runs when a user leaves a server
    bot.on('guildMemberRemove', m => {
        // Update the member count when a member leaves
        if(selectedGuild && selectedGuild == m.guild){
            document.getElementById('members-count').innerText = selectedGuild.memberCount;
        }
        updateUsers(false, m, true);
    });

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
    return error;
}

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

function setLoadingPerc(num, text = '') {
    if(text.length){
        document.getElementById('percentageText').innerText = text;
        if(num < 0)
            num = 0;
        document.getElementById('loadingComplete').style.width = `${num * 100}%`;
        return;
    }
    // Num possibilities
    switch (num) {
        case 0:
            document.getElementById('percentageText').innerText = "Fetching token";
            break;
        case 0.01:
            document.getElementById('percentageText').innerText = "Please enter your token";
            break;
        case 0.05:
            document.getElementById('percentageText').innerText = "Checking if the token is correct";
            break;
        case 0.1:
            document.getElementById('percentageText').innerText = "Refreshing the servers";
            break;
        case 0.15:
            document.getElementById('percentageText').innerText = "Logging into the bot";
            break;
        case 0.2:
            document.getElementById('percentageText').innerText = "Getting the bot ready";
            break;
        case 0.4:
            document.getElementById('percentageText').innerText = "Getting the owner of the bot";
            break;
        case 0.5:
            document.getElementById('percentageText').innerText = "Loading scripts";
            break;
        case 0.55:
            document.getElementById('percentageText').innerText = "Loading themes";
            break;
        case 0.6:
            document.getElementById('percentageText').innerText = "Setting up direct messages";
            break;
        case 0.8:
            document.getElementById('percentageText').innerText = "Loading servers";
            break;
        case 1:
            document.getElementById('percentageText').innerText = "All done!";
            console.log('LiveBot started')
            hideSplashScreen();
            break;
        default:
            document.getElementById('percentageText').innerText = "There was an error while logging in the bot";
            num = 0;
            break;
    }

    document.getElementById('loadingComplete').style.width = `${num * 100}%`;
}