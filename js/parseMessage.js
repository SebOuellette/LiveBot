let parseMessage = (text, msg, embed = false) => {
    // Remove html in the message
    let textContent = text.replace(/(<)([^>]+)(>)/gm, '&lt;$2&gt;');

    // General message parsing
    textContent = textContent.replace(/https?:\/\/[^ ]+(\.[^ ]+)+(\/[^ ]*)?/g, '<a href="$&" rel="noreferrer noopener" title="$&" target="_blank">$&</a>');

    // Add html tags for markup
    textContent = textContent.replace(/\*\*(.*?)\*\*/gm, '<strong>$1</strong>');
    textContent = textContent.replace(/__(.*?)__/gm, '<u>$1</u>');
    textContent = textContent.replace(/\*(.*?)\*/gm, '<i>$1</i>');
    textContent = textContent.replace(/```([^\n]+)\n(.*?)(?=```)```/gs, `<div class="codeBlock${embed ? " codeBlockEmbed" : ""} $1">$2</div>`);
    textContent = textContent.replace(/`(.*?)`/gm, '<span class="inlineCodeBlock">$1</span>');
    textContent = textContent.replace(/\|\|(.*?)\|\|/gm, '<span class="spoilerBlock" onclick="discoverSpoiler(this)">$1</span>');
    textContent = textContent.replace(/~~(.*?)~~/gm, '<del>$1</del>');

    // Parse Emojis
    textContent = textContent.replace(/:([_a-z0-9]+):/gi, (m, g1) => idToUni[g1.toLowerCase()] || m);
    textContent = textContent.replace(/(:|=|;)('?)-?([^ ])/gm, (a, b, c, d) => {
        let wink = b === ';' ? true : false;
        let cry = c ? true : false;

        let shortcut = shortcuts.find(s => s.face === d && s.wink === wink && s.cry === cry);
        if (shortcut) return idToUni[shortcut.id];
        return a;
    });

    // Match all emojis
    if (!textContent.replace(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g, "").length) {
        textContent = `<span class="bigEmoji">${textContent}</span>`
    }

    // Format pings
    textContent = formatPings(msg, textContent);

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