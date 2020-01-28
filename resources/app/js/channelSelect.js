function channelSelect(c, name) {
    let messages = document.getElementById("message-list");
    while (messages.firstChild) {
        messages.removeChild(messages.firstChild);
    }
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

    selectedChan = c;
    selectedChanDiv = name;
    console.log(selectedChanDiv.style.color);
    name.style.color = '#eee';
    messageCreate();

    async function messageCreate() {
        let count=0;
        await c.fetchMessages({limit: 50})
            .then(msg => {
                msg.map(mseg => mseg).reverse().forEach(m => {
                    let bunch;
                    count+=1;
                    if (count > 2 && count <= 50) {
                        if(msg.map(mesg => mesg).reverse()[count-2].author.id == m.author.id){
                            bunch = true;
            
                        } else {
                            bunch = false;
                        }
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
                        img.height = '40';
                        img.width = '40';
                        div.appendChild(img);
            
                        let name = document.createElement('p');
                        let username = document.createTextNode(m.author.username);
                        name.appendChild(username);
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
                        div.appendChild(name);
                    } else {
                        div = document.getElementsByClassName(m.author.id);
                        div = div[div.length - 1];
                    }
                    
                    if (m.cleanContent.length) {
                        // Render message text
                        let text = document.createElement('p');
                        text.classList.add('messageText');
                        text.innerHTML = parseMessage(m.cleanContent);

                        div.appendChild(text);
                    }

                    m.embeds.forEach((embed) => {
                        showEmbed(embed, div);
                    })
                });
            }
        );
        messages.scrollTop = messages.scrollHeight;
    }
}
