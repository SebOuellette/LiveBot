let parseSend = (text) => {
    // The regex used for the emojis
    let emojiRegex = /:\(|>:-\(|>=\(|>=-\(|:"\)|:-"\)|="\)|=-"\)|<\/3|<3|<3|♡|:-\/|=-\/|:'\(|:'-\(|:,\(|:,-\(|='\(|='-\(|=,\(|=,-\(|:\(|:-\(|=\(|=-\(|]:\(|]:-\(|]=\(|]=-\(|o:\)|O:\)|o:-\)|O:-\)|0:\)|0:-\)|o=\)|O=\)|o=-\)|O=-\)|0=\)|0=-\)|:'\)|:'-\)|:,\)|:,-\)|:'D|:'-D|:,D|:,-D|='\)|='-\)|=,\)|=,-\)|='D|='-D|=,D|=,-D|:\*|:-\*|=\*|=-\*|x-\)|X-\)|:o|:-o|:O|:-O|=o|=-o|=O|=-O|:@|:-@|=@|=-@|:D|:-D|=D|=-D|:\)|:-\)|=\)|=-\)|]:\)|]:-\)|]=\)|]=-\)|:,'\(|:,'-\(|;\(|;-\(|=,'\(|=,'-\(|:P|:-P|=P|=-P|8-\)|B-\)|,:\(|,:-\(|,=\(|,=-\(|,:\)|,:-\)|,=\)|,=-\)|:s|:-S|:z|:-Z|:\$|:-\$|=s|=-S|=z|=-Z|=\$|=-\$|;\)|;-\)|:\||=\|/gm; 
    
    // Replace all the shortcuts with actual emojis
    text = text.replace(emojiRegex, (a) => {

        let shortcut = shortcuts.find(s => s.face === a);
        if (shortcut) return idToUni[shortcut.id];
        return a;
    });

    return text;
}

let parseMessage = (text, msg = null, embed = false) => {
    // Remove html in the message
    let textContent = text.replace(/(<)([^>]+)(>)/gm, '&lt;$2&gt;');

    // General message parsing
    textContent = textContent.replace(/https?:\/\/.+?(\/(.+?(\?.+?((?= )|$)))|(?= )|$)/mg, '<a href="$&" rel="noreferrer noopener" title="$&" target="_blank">$&</a>');

    // Add html tags for markup
    textContent = textContent.replace(/\*\*(.*?)\*\*/gm, '<strong>$1</strong>');
    textContent = textContent.replace(/__(.*?)__/gm, '<u>$1</u>');
    textContent = textContent.replace(/\*(.*?)\*/gm, '<i>$1</i>');
    textContent = textContent.replace(/```([^\n]+)\n(.*?)(?=```)```/gs, `<div class="codeBlock${embed ? " codeBlockEmbed" : ""} $1">$2</div>`);
    textContent = textContent.replace(/`(.*?)`/gm, '<span class="inlineCodeBlock">$1</span>');
    textContent = textContent.replace(/\|\|(.*?)\|\|/gm, '<span class="spoilerBlock" onclick="discoverSpoiler(this)">$1</span>');
    textContent = textContent.replace(/~~(.*?)~~/gm, '<del>$1</del>');

    // Match all emojis
    if (!textContent.replace(/((\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])| |(&lt;a?:!?.+?:[0-9]{18}?&gt;))/g, "").length) {
        textContent = `<span class="bigEmoji">${textContent}</span>`;
    }

    // Render custom emojis
    let customEmoji = /&lt;(a)?:!?(.+?):([0-9]{18}?)&gt;/gm
    textContent = textContent.replace(customEmoji, (a, b, c, d) => {
        if (d !== undefined) {
            return `<img class="emoji" draggable="false" alt=":${c}:" src="https://cdn.discordapp.com/emojis/${d}.${b=='a'?'gif':'png'}?v=1"></img>`;
        }
        return b;
    });

    // Format pings
    if (msg) {
        textContent = formatPings(msg, textContent);
    }

    // Parse the emojis to SVGs
    textContent = twemoji.parse(textContent);
    return textContent;
};

function discoverSpoiler(spoiler) {
    spoiler.classList.toggle("discovered");
};

// Ping formatting
function formatPings(msg, text) {
    let textContent = text;
    let keys = [];
    if (msg.mentions) {
        keys = msg.mentions.users.keyArray()
    } else {
        return textContent;
    }

    // Replace the ping with a span container
    keys.forEach(id => {
        let member = msg.guild.members.get(id);
        let name = member ? member.displayName : bot.users.get(id).username;

        let regex = new RegExp(`@${name}`, 'g');
        textContent = textContent.replace(regex, `<span id="${id}-ping" class="ping">@${name}</span>`);
    });

    return textContent;
}