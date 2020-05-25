// Selecting new guild
let guildSelect = (g, img) => {
    // Update the selected guild
    //document.getElementById('guildIndicator').style.display = 'block';
    try {
        oldimg.classList.remove('selectedGuild');
        oldimg.style.borderRadius = '50%';
    } catch (err){}
    img.classList.add('selectedGuild');

    guildPos = id => {
        return id == g.id;
    }

    // Store the selected channel to know what to highlight
    let selectedChannel;

    document.getElementById('guildIndicator').style.marginTop = `${img.offsetTop - 2}px`;
    document.getElementById('guildIndicator').style.display = "block";
    img.style.borderRadius = '25%';

    oldimg = img;

    // Update the message count
    try {
        clearInterval(memberLoop);
    } catch(err){}

    // Update the member count every 500 ms
    global.memberLoop = setInterval(() => {
        document.getElementById('members-count').innerText = g.memberCount;
    }, 500);

    document.getElementById('members-count').innerText = g.memberCount;

    // Clear the channels list
    let channelList = document.getElementById("channel-elements");
    while (channelList.firstChild) {
        channelList.removeChild(channelList.firstChild);
    }

    // Update guild profile name
    if (g.name.length <= 22) {
        document.getElementById('guildName').innerHTML = g.name;
    } else {
        document.getElementById('guildName').innerHTML = g.name.substring(0, 19)+'...';
    }

    // Update guild profile image
    if (g.iconURL != null) {
        document.getElementById('guildImg').src = g.iconURL;
    } else {
        document.getElementById('guildImg').src = 'resources/images/default.png';
    }

    // Create the member list
    addMemberList(g);

    let textPlaced = false;
    let voicePlaced = false;

    // Sort the channels and add them to the screen
    g.channels.sort((c1, c2) => c1.position - c2.position).forEach(c => {
        // Totally unsure of what this commented code does.... I'll keep it here till I find an issue this fixes lmao

        g.channels.forEach(c1 => {
            // If channel type is text
            if (((c1.type === 'text'  && textPlaced == false) || (c1.type === 'voice' && voicePlaced == true)) && c1.parent == null) {
                // Create new channel list element
                let div = document.createElement('div');
                div.classList.add('channel');
                div.classList.add(c1.type == 'text' ? 'text' : 'voice');
                document.getElementById('channel-elements').appendChild(div);

                //console.log(c);
                
                // Create the text for the channel
                let text = document.createElement('h5');
                let content;
                let svg = document.createElement('img');
                if (c1.type == 'text') {
                    svg.src = './resources/icons/textChannel.svg';
                } else {
                    svg.src = './resources/icons/voiceChannel.svg';
                }
                svg.classList.add('channelSVG');
                div.appendChild(svg);

                if (c1.name.length < 25) {
                    content = document.createTextNode(c1.name);
                } else {
                    content = document.createTextNode(`${c1.name.substring(0,25)}...`);
                }
                
                // Add the text to the div
                text.appendChild(content);

                // Check if the bot has permissions to view the channel
                if (!c1.permissionsFor(g.me).has("VIEW_CHANNEL")) {
                    text.style.textDecoration = 'line-through';
                    text.classList.add(`blocked${c1.type == 'text' ? 'Text' : 'Voice'}`);
                } else {
                    text.classList.add(`viewable${c1.type == 'text' ? 'Text' : 'Voice'}`);
                    if (c1.type == 'text') {
                        text.onclick = () => {
                            if (selectedChannel) {
                                selectedChannel.classList.remove("selectedChan");
                            }
                            selectedChannel = div;
                            console.log(selectedChannel);
                            div.classList.add("selectedChan");
                            channelSelect(c1, div);
                        };
                    }
                }

                text.id = `channel${c1.type == 'text' ? 'Text' : 'Voice'}x`;
                div.appendChild(text);
            }
        });

        textPlaced = true;
        voicePlaced = true;
        if (c.type === "category") {

            // Categories
            let div = document.createElement('div');
            div.id = 'category';
            document.getElementById('channel-elements').appendChild(div);

            // Category text
            let text = document.createElement('h5');
            let content;
            if (c.name.length < 25) {
                content = document.createTextNode(`${c.name.toLowerCase()}`);
            } else {
                content = document.createTextNode(`${c.name.substring(0,25).toLowerCase()}...`);
            }
            
            text.appendChild(content);
            text.classList.add('categoryText');
            div.appendChild(text);

            // Categorized text channels
            g.channels.filter(c1 => c1.parent == c && (c1.type === 'text' || c1.type === 'voice')) .sort((c1, c2) => c1.position - c2.position).forEach(c1 => {
                let div1 = document.createElement('div');
                div1.classList.add('channel');
                div1.classList.add(c1.type == "text" ? 'text' : 'voice');
                div.appendChild(div1);

                let text1 = document.createElement('h5');
                let content1;
                let svg = document.createElement('img');
                if (c1.type == 'text') {
                    svg.src = './resources/icons/textChannel.svg';
                } else {
                    svg.src = './resources/icons/voiceChannel.svg';
                }
                svg.classList.add('channelSVG');
                div1.appendChild(svg);

                if (c1.name.length < 25) {
                    content1 = document.createTextNode(c1.name);
                } else {
                    content1 = document.createTextNode(`${c1.name.substring(0,25)}...`);
                }
                text1.appendChild(content1);
                if (!c1.permissionsFor(g.me).has("VIEW_CHANNEL")) {
                    text1.style.textDecoration = 'line-through';
                    text1.classList.add(`blocked${c1.type == 'text' ? 'Text' : 'Voice'}`);
                } else {
                    text1.classList.add(`viewable${c1.type == 'text' ? 'Text' : 'Voice'}`);
                    if (c1.type == 'text') {
                        div1.onclick = () => {
                            if (selectedChannel) {
                                selectedChannel.classList.remove("selectedChan");
                            }
                            selectedChannel = div1;
                            div1.classList.add("selectedChan");
                            channelSelect(c1, div1);
                        };
                    }
                }
                text1.id = `channel${c1.type == 'text' ? 'Text' : 'Voice'}`;
                div1.appendChild(text1);
            });
        }
    });
}