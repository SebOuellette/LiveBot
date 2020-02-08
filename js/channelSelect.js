function channelSelect(c, name) {
    let messages = document.getElementById("message-list");
    let fetchSize = 100;
    selectedChan = c;
    selectedChanDiv = name;
    name.style.color = '#eee';
    messageCreate();

    // Clear the messages
    while (messages.firstChild) {
        messages.removeChild(messages.firstChild);
    }

    // Set colour of message
    try {
        selectedChanDiv.style.color = '#606266';
        name.addEventListener('mouseover', () => {
            if (name.style.color != 'rgb(238, 238, 238)') {
                name.style.color = '#B4B8BC';
            }
        });
    
        name.addEventListener('mouseleave', () => {
            if (name.style.color != 'rgb(238, 238, 238)') {
                name.style.color = '#606266';
            }
        });
    } catch (err) {console.log(err)}

    // Create message
    async function messageCreate() {
        // Loop through messages
        let count=0;
        await c.fetchMessages({limit: fetchSize})
            .then(msg => {
                msg.map(mseg => mseg).reverse().forEach(m => {
                    let bunch;
                    count++;
                    if (count > 2 && count <= fetchSize) {
                        if(msg.map(mesg => mesg).reverse()[count-2].author.id == m.author.id){
                            bunch = true;
            
                        } else {
                            bunch = false;
                        }
                    }
                    
                    // Create the messages
                    let messageContainer;
                    if (!bunch) {
                        // Create message div
                        div = document.createElement('div');
                        div.id = 'messageCont';
                        document.getElementById('message-list').appendChild(div);

                        // Create user image
                        let img = document.createElement('img');
                        img.id = 'messageImg';
                        img.src = m.author.displayAvatarURL;
                        img.height = '40';
                        img.width = '40';
                        div.appendChild(img);

                        messageContainer = document.createElement("div");
                        messageContainer.classList.add(m.author.id);
                        messageContainer.classList.add('inlineMsgCont');
                        div.appendChild(messageContainer);
                        
                        // Create user's name
                        let name = document.createElement('p');
                        name.innerText = (m.member ? m.member.nickname : m.author.username) || m.author.username;
                        name.id = 'messageUsername';

                        try {
                            let color = m.member.roles.sort((r1, r2) => r1.position - r2.position).map(p => p.color).length;
                            let colors = m.member.roles.sort((r1, r2) => r1.position - r2.position).map(p => p.color);
                            while (colors[color-1] == 0) {
                                color -= 1;
                            }
                            let zeros = '';
                            for(i=0;i<(6-colors[color-1].toString(16).length);i++) {
                                zeros+='0';
                            }
                            name.style.color = `#${zeros+colors[color-1].toString(16)}`;
                        } catch (err) {
                            name.style.color = '#fff';
                        }
                        messageContainer.appendChild(name);

                        // Create timestamp
                        let timestamp = document.createElement('p');
                        timestamp.innerText = m.createdAt.toLocaleString('en-US', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'});
                        timestamp.classList.add("messageTimestamp");
                        messageContainer.appendChild(timestamp);
                    } else {
                        messageContainer = document.getElementsByClassName(m.author.id);
                        messageContainer = messageContainer[messageContainer.length - 1];
                    }
                    
                    // Prepend message text
                    if (m.cleanContent.length) {
                        // Render message text
                        let text = document.createElement('p');
                        text.classList.add('messageText');
                        text.id = m.id;
                        text.innerHTML = parseMessage(m.cleanContent);

                        messageContainer.appendChild(text);
                    }
                    
                    // Append embeds
                    m.embeds.forEach(embed => {
                        if (embed.thumbnail && embed.message.cleanContent.match(embed.thumbnail.url)) {
                            let img = document.createElement("img");

                            let newWidth = embed.thumbnail.width < 400 ? embed.thumbnail.width : 400;
                            let newHeight = Math.floor(newWidth / embed.thumbnail.width * embed.thumbnail.height);

                            img.src = `${embed.thumbnail.proxyURL}?width=${newWidth}&height=${newHeight}`;
                            img.classList.add("previewImage");
                            messageContainer.appendChild(img);
                        } else {
                            showEmbed(embed, messageContainer);
                        }
                    });
                });
            }
        );
        // Add the no load apology
        let shell = document.createElement("div");
        shell.classList.add("sorryNoLoad");
        let text = document.createElement("p");
        text.innerText = "Sorry! No messages beyond this point can be displayed.";
        shell.appendChild(text);
        document.getElementById("message-list").prepend(shell);

        messages.scrollTop = messages.scrollHeight;
    }
}
