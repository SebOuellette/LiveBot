// Load a new token
function load(token) {

    // Login to the bot profile
    global.bot = new Discord.Client();
    bot.login(token);

    bot.on('ready', () => {
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
        document.getElementById('userCardIcon').src = `${bot.user.displayAvatarURL}`;

        if (bot.user.bot) {
            document.getElementById('userCardBot').innerHTML = `BOT`;
            document.getElementById('userCardBot').style.marginLeft = `8px`;
        } else {
            document.getElementById('userCardBot').innerHTML = `USER`;
            document.getElementById('userCardBot').style.marginLeft = `5px`;
        }

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
            img.id = `guild-icon`;
            img.classList.add(g.id);

            // Add the events for the guild icons
            img.onclick = () => {
                guildSelect(g, img);
                selectedGuild = g;
            };

            img.onmouseover = () => {
                img.style.borderRadius = '25%';
            };

            img.onmouseleave = () => {
                if (selectedGuild == g) {
                    img.style.borderRadius = '25%';
                } else {
                    img.style.borderRadius = '50%';
                }
            };

            // Add image to the list of guilds
            document.getElementById('guild-list').appendChild(img);
        });
    });

    // New message recieved
    bot.on('message', (m) => {
        // If there is a channel selected
        if (selectedChan) {
            // If the message was sent to the selected channel
            if (m.channel.id == selectedChan.id) {
                //document.getElementById('message-list').removeChild(document.getElementById('message-list').firstChild);
                let bunch;
                fetchLast();

                // Get last message in channel
                async function fetchLast() {
                    await m.channel.fetchMessages({ limit: 2 }).then(msg => {
                        if (msg.map(mseg => mseg)[1].author.id == m.author.id) {
                            bunch = true;
                        } else {
                            bunch = false;
                        }
                    });

                    let scroll = false;
                    if (document.getElementById('message-list').scrollHeight - Math.floor(document.getElementById('message-list').scrollTop) == document.getElementById('message-list').clientHeight) {
                        scroll = true;
                    }

                    if (barry) {
                        bunch = false;
                        barry = false;
                    }

                    let div;
                    if (!bunch) {
                        div = document.createElement('div');
                        div.id = 'messageCont';
                        div.classList.add(m.author.id);
                        document.getElementById('message-list').appendChild(div);

                        let img = document.createElement('img');
                        img.id = 'messageImg';
                        img.src = m.author.displayAvatarURL;
                        div.appendChild(img);

                        let name = document.createElement('p');
                        let username;

                        if (m.member.nickname != null) {
                            username = document.createTextNode(m.member.nickname);
                        } else {
                            username = document.createTextNode(m.author.username);
                        }
                        name.appendChild(username);
                        name.id = 'messageUsername';
                        try {
                            let color = m.member.roles.sort((r1, r2) => r1.position - r2.position).map(p => p.color).length;
                            let colors = m.member.roles.sort((r1, r2) => r1.position - r2.position).map(p => p.color);
                            while (colors[color - 1] == 0) {
                                color -= 1;
                            }
                            let zeros = '';
                            for (i = 0; i < (6 - colors[color - 1].toString(16).length); i++) {
                                zeros += '0';
                            }
                            name.style.color = `#${zeros + colors[color - 1].toString(16)}`;
                        } catch (err) {
                            name.style.color = '#fff';
                        }
                        div.appendChild(name);
                    } else {
                        div = document.getElementsByClassName(m.author.id);
                        div = div[div.length - 1]
                    }

                    // Create text elements
                    let text = document.createElement('p');
                    text.id = 'messageText';
                    text.innerHTML = parseMessage(m.cleanContent);

                    // Append the text to the message
                    div.appendChild(text);

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
}
