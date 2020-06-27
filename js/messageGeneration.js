function findTimeDiff(m, previousMessage, count) {
    let bunch = false;
    let timebunch = false;
        
    if(previousMessage && previousMessage.author.id == m.author.id){
        bunch = true;
        
        if (Math.floor(previousMessage.createdTimestamp/1000/60/60/24) != Math.floor(m.createdTimestamp/1000/60/60/24)) {
            bunch = false;
            timebunch = true;
        }

    } else {
        bunch = false;
    }

    return [bunch, timebunch];
}

function generateMsgHTML(m, previousMessage, count = -1, fetchSize = undefined) {
    // Check if the messages should be grouped or not
    let result = [false, false];
    if (count == -1 || (count > 2 && count <= fetchSize)) {
        result = findTimeDiff(m, previousMessage);
    }
    
    // The bunched values
    let bunch = result[0];
    let timebunch = result[1];
    
    // Create the div for the dark background
    let darkBG = document.createElement('div');
    darkBG.classList.add('messageBlock');
    darkBG.id = m.id;
    
    // Create the messages
    let div;
    if (!bunch) {
        // Create message div
        div = document.createElement('div');
        div.classList.add('messageCont');
        div.classList.add(m.author.id);
        if (timebunch) {
            div.classList.add('timeSeparated');
        }

        // Inline message container
        // messageContainer = document.createElement("div");
        // messageContainer.classList.add(m.author.id);
        // messageContainer.classList.add('inlineMsgCont');
        // div.appendChild(messageContainer);
        
        // Create the dark background
        darkBG.classList.add('firstmsg');
        div.appendChild(darkBG);

        // Create user image
        let img = document.createElement('img');
        let userImg = m.author.avatar.startsWith('a_') ? m.author.displayAvatarURL().replace('.webp', '.gif') : m.author.displayAvatarURL();
        img.classList.add('messageImg');
        img.src = userImg.replace(/(size=)\d+?($| )/, '$164');
        img.height = '40';
        img.width = '40';
        darkBG.appendChild(img);
        
        // Create user's name
        let name = document.createElement('p');
        name.innerText = (m.member ? m.member.nickname : m.author.username) || m.author.username;
        name.classList.add('messageUsername');
        
        // Find the colour of their name
        if (m.member && m.member.roles._roles.size > 1) {
            let color;
            
            if (m.member.roles.hoist) {
                // If the user has a hoisted role, use that colour
                color = m.member.roles.hoist.hexColor;
            } else {
                // Otherwise just use the colour of their highest role
                color = m.member.roles.highest.hexColor;
                // If the colour is black, the role doesn't have a colour, and it should display white
                if (color == '#000000')
                    color = '#fff';
            }
            name.style.color = color;
        } else {
            name.style.color = '#fff'
        }

        darkBG.appendChild(name);

        // Create timestamp
        let timestamp = document.createElement('p');
        timestamp.innerText = m.createdAt.toLocaleString('en-US', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'});
        timestamp.classList.add("messageTimestamp");
        darkBG.appendChild(timestamp);
    } else {
        div = document.getElementsByClassName(m.author.id);
        div = div[div.length - 1];
        div.appendChild(darkBG);
    }
    
    // Prepend message text
    if (m.cleanContent.length) {
        // Render message text
        let text = document.createElement('p');
        text.classList.add('messageText');
        text.innerHTML = parseMessage(m.cleanContent, m, false);

        if(m.editedAt)
            text.innerHTML += '<time class="edited"> (edited)</time>';

        darkBG.appendChild(text);
    }
    
    // Append embeds
    m.embeds.forEach(embed => {
        if (embed.thumbnail && m.cleanContent.match(embed.thumbnail.url)) {
            let img = document.createElement("img");

            let newWidth = embed.thumbnail.width < 400 ? embed.thumbnail.width : 400;
            let newHeight = Math.floor(newWidth / embed.thumbnail.width * embed.thumbnail.height);

            img.src = `${embed.thumbnail.proxyURL}?width=${newWidth}&height=${newHeight}`;
            img.classList.add("previewImage");
            darkBG.appendChild(img);
        } else {
            showEmbed(embed, darkBG, m);
        }
    });
    return div;
}