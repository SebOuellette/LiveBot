let parseSend = (text) => {
    // The regex used for the emojis
    let emojiRegex = /:\(|>:-\(|>=\(|>=-\(|:"\)|:-"\)|="\)|=-"\)|<\/3|<3|<3|♡|:-\/|=-\/|:'\(|:'-\(|:,\(|:,-\(|='\(|='-\(|=,\(|=,-\(|:\(|:-\(|=\(|=-\(|]:\(|]:-\(|]=\(|]=-\(|o:\)|O:\)|o:-\)|O:-\)|0:\)|0:-\)|o=\)|O=\)|o=-\)|O=-\)|0=\)|0=-\)|:'\)|:'-\)|:,\)|:,-\)|:'D|:'-D|:,D|:,-D|='\)|='-\)|=,\)|=,-\)|='D|='-D|=,D|=,-D|:\*|:-\*|=\*|=-\*|x-\)|X-\)|:o|:-o|:O|:-O|=o|=-o|=O|=-O|:@|:-@|=@|=-@|:D|:-D|=D|=-D|:\)|:-\)|=\)|=-\)|]:\)|]:-\)|]=\)|]=-\)|:,'\(|:,'-\(|;\(|;-\(|=,'\(|=,'-\(|:P|:-P|=P|=-P|8-\)|B-\)|,:\(|,:-\(|,=\(|,=-\(|,:\)|,:-\)|,=\)|,=-\)|:s|:-S|:z|:-Z|:\$|:-\$|=s|=-S|=z|=-Z|=\$|=-\$|;\)|;-\)|:\||=\|/gm; 
    
    // Replace all the shortcuts with actual emojis
    text = text.replace(emojiRegex, (a) => {

        let shortcut = shortcuts.find(s => s.face === a);
        if (shortcut) return idToUni[shortcut.id];
        return a;
    });

    text = text.replace(/:(.*):/gm, (a, b) => {

        let shortcut = idToUni[b];
        if (shortcut) return shortcut;
        return a;
    });

    return text;
}

let parseMessage = (text, msg = null, embed = false, ping = false, embededLink) => {
    let textContent = text;

    // Remove html <, > and & in the message
    textContent = parseHTML(textContent);

    // General message parsing
    // Format pings
    if (msg)
        parsePings(msg, textContent, embededLink, ping, embed);
    // Match links
    textContent = parseLinks(textContent);
    // Add html tags for markup
    textContent = parseStyling(textContent, embed);
    // Match all emojis
    textContent = parseUnicodeEmojis(textContent);
    // Render custom emojis
    textContent = parseCustomEmojis(textContent);
    // Parse the emojis to SVGs
    textContent = twemoji.parse(textContent);

    return textContent;
};

function discoverSpoiler(spoiler) {
    spoiler.classList.toggle("discovered");
};

// Ping formatting
function formatPings(msg, text, dms) {
    let textContent = text;
    let keys = [];

    // Get all the mentions from users, roles and channels
    if (msg.mentions.users) msg.mentions.users.keyArray().forEach(id => keys.push([id, 'user']));
    if (msg.mentions.roles) msg.mentions.roles.keyArray().forEach(id => keys.push([id, 'role']));
    if (msg.mentions.channels) msg.mentions.channels.keyArray().forEach(id => keys.push([id, 'channel']));

    // Replace the ping with a span container
    keys.forEach(ping => {
        let id = ping[0];
        let type = ping[1];

        let name = '';
        let color = 0;
        if(type == 'user'){
            let user = dms ? bot.users.cache.get(id) : msg.guild.members.cache.get(id);
            name = user ? user.displayName ? user.displayName : user.username : id;
        }
        else if (type == 'role' && !dms){
            let role = msg.guild.roles.cache.get(id);
            name = role ? role.name : id;
            color = role.color ? role.color.toString(16) : 0
            color = color ? '#' + '0'.repeat(6 - color.length) + color : 0
        }
        else if (type == 'channel' && !dms){
            let channel = msg.guild.channels.cache.get(id);
            name = channel ? channel.name : 'deleted-channel';
        } else {
            name = id;
        }
        
        name = name.replace(/(\[|\]|\(|\)|\\)/gm, a => '\\' + a).replace(/\*/gm, '\\\*')
        let pingRegex = new RegExp(`(?:(<|>)?@!?(${name}))`, 'g');
        let channelRegex = new RegExp(`(?:(<|>)?#(${name}))`, 'g');
        textContent = textContent.replace(pingRegex, (a, b, c) => b == '<' || b == '>' ? a : `<span class="ping" ${id}" ${color ? `style="color: ${color}"` : ''}>@${c.replace(/\*/gm, '&#42')}</span>`)
        if(!dms){
            textContent = textContent.replace(channelRegex, (a, b, c) => b == '<' || b == '>' ? a : `<span class="ping ${id}">#${c.replace(/\*/gm, '&#42')}</span>`);
        }

    });
    return textContent;
}

function formatEmbedPings(msg, text, dms) {
    let textContent = text;
    // console.log(text)
    let keys = [];

    // Replace user/role pings
    text.replace(/&lt;@(!?[0-9]+)&gt;/gm, (a, id) => keys.push(id));

    // Replace channel pings
    text.replace(/&lt;#(\d+)&gt;/gm, (a, id) => keys.push(id));

    // Replace the ping with a span container
    keys.forEach(id => {
        let name = '';
        let chanName = '';
        let color = 0;

        let user = dms ? bot.users.cache.get(id.replace(/!/, "")) : msg.guild.members.cache.get(id.replace(/!/, ""));
        name = user ? user.displayName ? user.displayName : user.username : id;
        
        if(name == id && !dms){
            let role = msg.guild.roles.cache.get(id);
            name = role ? role.name : id;
            color = role ? role.color ? role.color.toString(16) : 0 : 0
            color = color ? '#' + '0'.repeat(6 - color.length) + color : 0
        }
        let channel;
        if(!dms)
            channel = msg.guild.channels.cache.get(id);
        chanName = channel ? channel.name : 'deleted-channel';

        let pingRegex = new RegExp(`(?:(<|>)?&lt;@!?(${id})&gt;)`, 'g');
        let channelRegex = new RegExp(`&lt;#${id}&gt;`, 'g');
        
        textContent = textContent.replace(pingRegex, (a, b, c) => b == '<' || b == '>' ? a :  `<span class="ping" ${id}" ${color ? `style="color: ${color}"` : ''}>${name.startsWith('!') ? `&lt;@${c}&gt;` : '@'+name}</span>`)
        if(!dms)
            textContent = textContent.replace(channelRegex, chanName == 'deleted-channel' ? '#deleted-channel' : `<span class="ping ${id}">\#${chanName}</span>`);
    });

    return textContent;
}