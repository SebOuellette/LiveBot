// Copyright 2017 Sebastian Ouellette

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// Load a new token
let load = async (token) => {
    // Login to the bot profile
    global.bot = new Discord.Client({
        partials: [
            Discord.Partials.Channel, // get DM messages
        ],
        intents: [
            Discord.GatewayIntentBits.Guilds,
            Discord.GatewayIntentBits.GuildMessages,
            Discord.GatewayIntentBits.GuildMembers,
            Discord.GatewayIntentBits.GuildVoiceStates,
            Discord.GatewayIntentBits.MessageContent,
            Discord.GatewayIntentBits.GuildMessageTyping,
            Discord.GatewayIntentBits.GuildPresences,
            Discord.GatewayIntentBits.DirectMessageTyping,
            Discord.GatewayIntentBits.DirectMessages,
        ],
    });

    // Oh no, it appears as though I left this variable visible unintentionally.
    // If it's changed, you will be able to view all the servers and channels that the owner of the bot is not in.
    // Whatever you do, don't change it, or discord might try and make up rules and get you to stop using LiveBot :O
    // If you do change this, it's modifying LiveBot, which means it's not our fault since we shipped the program to Discord's standards.
    bot.hideUnallowed = true; // Should be true by default

    let error = [false, 'none'];
    error = validateToken(token);
    if (error[0]) {
        return error;
    }

    //hideSplashScreen(); // TESTING - DO NOT COMMIT
    
    bot.on('ready', async () => {
	console.log("ready");

        // Reset the timer on the presence thing (heartbeat)
        let presenceInterval = setInterval(() => {
            bot.user.setPresence(bot.user.presence);
        }, 180000); // runs every 3 minutes

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
            document.getElementById('userCardName').innerHTML =
                bot.user.username;
            document.getElementById(
                'userCardDiscrim'
            ).innerHTML = `#${bot.user.discriminator}`;
            document.getElementById(
                'userCardIcon'
            ).src = `${bot.user.displayAvatarURL({ size: 64 })}`;

            document.getElementById('userCardBot').innerHTML = `BOT`;
            document.getElementById('userCardBot').style.marginLeft = `8px`;

            // Create the guild indicator
            let guildIndicator = document.createElement('div');
            guildIndicator.id = 'guildIndicator';

            // Create a guild container
            let guildContainer = document.createElement('div');
            guildContainer.id = 'guildContainer';

            // Apply the guild indicator in the container
            guildContainer.appendChild(guildIndicator);

            // Apply the guild container to the guild list
            document.getElementById('guild-list').appendChild(guildContainer);

            // Loop through all the guilds and create the element for the icon
            await addGuilds();
        }

        setLoadingPerc(0.4);

        const botOwner = (await bot.application.fetch()).owner;

        // Check if the owner of the bot is a team
        if (botOwner instanceof Discord.Team) {
            let id = settings.tokenSettings.teamUser;
            if (id) {
                bot.owner = botOwner.members.find((x) => x.user.id == id).user;
                continueLoad();
            } else {
                buildTeamMemberCards(continueLoad);
            }
        } else {
            bot.owner = botOwner;
            continueLoad();
        }
    });

    bot.on('guildUnavailable', (g) => {
        if (g.available) return;
        console.error(`Guild ${g.name} went offline`);
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
    bot.on('typingStart', (typing) => {
        // reverts https://github.com/discordjs/discord.js/pull/6114/files
        // Caching a typing status
        if (!typing.channel._typing)
            typing.channel._typing = new Discord.Collection();
        if (!typing.user._typing)
            typing.user._typing = new Discord.Collection();

        if (typing.channel._typing.has(typing.user.id)) {
            const userTyping = typing.channel._typing.get(typing.user.id);

            userTyping.lastTimestamp = userTyping.startedTimestamp;
            userTyping.elapsedTime = Date.now() - userTyping.startedTimestamp;

            clearTimeout(userTyping.timeout);
            userTyping.timeout = setTimeout(() => {
                typing.channel._typing.delete(typing.user.id);
                typing.user._typing.delete(typing.channel.id);
            }, 10000);

            typing.user._typing.set(typing.channel.id, userTyping);
        } else {
            const since = new Date();
            const lastTimestamp = new Date();

            const userTyping = {
                channel: typing.channel,
                user: typing.user,
                since,
                lastTimestamp,
                elapsedTime: Date.now() - since,
                timeout: setTimeout(() => {
                    typing.channel._typing.delete(typing.user.id);
                }, 10000),
            };

            typing.channel._typing.set(typing.user.id, userTyping);
            typing.user._typing.set(typing.channel.id, userTyping);
        }

        if (typing.channel.id != selectedChan?.id) return;
        typingStatus();
    });

    // A message has been deleted
    bot.on('messageDelete', (m) => {
        // Return if it's not the selected channel
        if (m.channel != selectedChan) return;
        // Get the dom element from the message
        let message = document.getElementById(m.id);
        if (message) {
            let firstMessage = message.classList.contains('firstmsg');

            // Remove the message element
            removeMessage(message, firstMessage);
        }
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
        let message = document
            .getElementById(m.id)
            .querySelector('.messageText');
        message.innerHTML = `${parseMessage(
            m.cleanContent
        )} <time class='edited'>(edited)</time>`;
    });

    // New message recieved
    bot.on('messageCreate', (m) => {
        typingStatus(false, m);

        if (m.channel.type == Discord.ChannelType.DM) {
            m.author.received = true;

            // If the message was sent to the selected channel
            if (m.channel.id == selectedChan?.id) {
                // document.getElementById('message-list').removeChild(document.getElementById('message-list').firstChild);
                let previousMessage;
                fetchLast(previousMessage);

                return;
            }
        }
        // If there is a channel selected in the current guild
        else if (selectedGuild && m.guild.id == selectedGuild.id) {
            let channel = document.getElementById(m.channel.id);
            if (
                channel &&
                (!selectedChan ||
                    (selectedChan && selectedChan.id != m.channel.id))
            ) {
                channel.classList.add('newMsg');
            }
        }

        // If the message was sent to the selected channel
        if (selectedChan && m.channel.id == selectedChan.id) {
            // document.getElementById('message-list').removeChild(document.getElementById('message-list').firstChild);
            let previousMessage;
            fetchLast(previousMessage);
        }

        // Get last message in channel
        async function fetchLast(previousMessage) {
            await m.channel.messages.fetch({ limit: 2 }).then((msg) => {
                previousMessage = msg.toJSON()[1];
            });

            let scroll = false;
            if (
                document.getElementById('message-list').scrollHeight -
                    Math.floor(
                        document.getElementById('message-list').scrollTop
                    ) ==
                document.getElementById('message-list').clientHeight
            ) {
                scroll = true;
            }

            if (barry) {
                //bunch = false;
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
                document.getElementById('message-list').scrollTop =
                    document.getElementById('message-list').scrollHeight;
                scroll = false;
            }
        }
    });

    // Runs when a user joins a server
    bot.on('guildMemberAdd', (m) => {
        // Update the member count when a member joins
        if (selectedGuild && selectedGuild == m.guild) {
            document.getElementById('members-count').innerText =
                selectedGuild.memberCount;
        }
        updateUsers(false, m);
    });

    // Runs when a user leaves a server
    bot.on('guildMemberRemove', (m) => {
        // Update the member count when a member leaves
        if (selectedGuild && selectedGuild == m.guild) {
            document.getElementById('members-count').innerText =
                selectedGuild.memberCount;
        }
        updateUsers(false, m, true);
    });

    // Runs when unloaded
    bot.on('error', () => {
        // Remove the server list when connection lost
        while (document.getElementById('guild-list').firstChild) {
            document
                .getElementById('guild-list')
                .removeChild(document.getElementById('guild-list').firstChild);
        }
        // Unload and stop all the scripts
        unloadAllScripts();
        // Unload all the themes
        unloadThemes();
    });

    // Now that all the event listners have been setup, login to the bot. 
    await bot.login(token).catch((err) => {
        error = [true, err];
    })
    .then(() => {
        setLoadingPerc(0.15);
    });

    if (error[0]) {
        return error;
    }


    return error;
};

function removeMessage(message, firstMessage) {
    // Check if you need to delete just the message or the whole message block
    if (message.parentNode.children.length > 1) {
        if (firstMessage) {
            let embed = message.querySelector('.embed');
            let text = message.querySelector('.messageText');
            let nextElement = message.nextElementSibling;

            if (embed) message.removeChild(embed);
            if (text) message.removeChild(text);

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
    if (text.length) {
        document.getElementById('percentageText').innerText = text;
        if (num < 0) num = 0;
        document.getElementById('loadingComplete').style.width = `${
            num * 100
        }%`;
        return;
    }
    // Num possibilities
    switch (num) {
        case 0:
            document.getElementById('percentageText').innerText =
                'Fetching token';
            break;
        case 0.01:
            document.getElementById('percentageText').innerText =
                'Please enter your token';
            break;
        case 0.05:
            document.getElementById('percentageText').innerText =
                'Checking if the token is correct';
            break;
        case 0.1:
            document.getElementById('percentageText').innerText =
                'Refreshing the servers';
            break;
        case 0.15:
            document.getElementById('percentageText').innerText =
                'Logging into the bot';
            break;
        case 0.2:
            document.getElementById('percentageText').innerText =
                'Getting the bot ready';
            break;
        case 0.4:
            document.getElementById('percentageText').innerText =
                'Getting the owner of the bot';
            break;
        case 0.5:
            document.getElementById('percentageText').innerText =
                'Loading scripts';
            break;
        case 0.55:
            document.getElementById('percentageText').innerText =
                'Loading themes';
            break;
        case 0.6:
            document.getElementById('percentageText').innerText =
                'Setting up direct messages';
            break;
        case 0.8:
            document.getElementById('percentageText').innerText =
                'Loading servers';
            break;
        case 1:
            document.getElementById('percentageText').innerText = 'All done!';
            console.log('Finished loading');
            hideSplashScreen();
            break;
        default:
            document.getElementById('percentageText').innerText =
                'There was an error while logging in the bot';
            num = 0;
            break;
    }

    document.getElementById('loadingComplete').style.width = `${num * 100}%`;
}
