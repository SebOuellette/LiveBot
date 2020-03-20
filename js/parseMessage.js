let emojiRegex = /(>:\(|>:\-\(|>=\(|>=\-\(|:"\)|:\-"\)|="\)|=\-"\)|<\/3|<\\3|:\-\|:\-\/|=\-\|=\-\/|:'\(|:'\-\(|:,\(|:,\-\(|='\(|='\-\(|=,\(|=,\-\(|:\(|:\-\(|=\(|=\-\(|<3|♡|\]:\(|\]:\-\(|\]=\(|\]=\-\(|o:\)|O:\)|o:\-\)|O:\-\)|0:\)|0:\-\)|o=\)|O=\)|o=\-\)|O=\-\)|0=\)|0=\-\)|:'\)|:'\-\)|:,\)|:,\-\)|:'D|:'\-D|:,D|:,\-D|='\)|='\-\)|=,\)|=,\-\)|='D|='\-D|=,D|=,\-D|:\*|:\-\*|=\*|=\-\*|x\-\)|X\-\)|:\||:\-\||=\||=\-\||:o|:\-o|:O|:\-O|=o|=\-o|=O|=\-O|:@|:\-@|=@|=\-@|:D|:\-D|=D|=\-D|:\)|:\-\)|=\)|=\-\)|\]:\)|\]:\-\)|\]=\)|\]=\-\)|:,'\(|:,'\-\(|;\(|;\-\(|=,'\(|=,'\-\(|:P|:\-P|=P|=\-P|8\-\)|B\-\)|,:\(|,:\-\(|,=\(|,=\-\(|,:\)|,:\-\)|,=\)|,=\-\)|:s|:\-S|:z|:\-Z|:\$|:\-\$|=s|=\-S|=z|=\-Z|=\$|=\-\$|;\)|;\-\))/gm

let parseSend = (text) => {
    // Parse Emojis
    text = text.replace(emojiRegex, (a) => {

        let shortcut = shortcuts.find(s => s.face === a);
        if (shortcut) return idToUni[shortcut.id];
        return a;
    });

    return text;
}

let parseMessage = (text, embed = false) => {
    // Remove html in the message
    let textContent = text.replace(/(<)([^>]+)(>)/gm, '&lt;$2&gt;');

    // General message parsing
    textContent = textContent.replace(/ /g, ' NBSP_PLACEHOLDER ');
    textContent = textContent.replace(/https?:\/\/[^ ]+(\.[^ ]+)+(\/[^ ]*)?/g, '<a href="$&" rel="noreferrer noopener" title="$&" target="_blank">$&</a>');

    // Add html tags for markup
    textContent = textContent.replace(/\*\*(.*?)\*\*/gm, '<strong>$1</strong>');
    textContent = textContent.replace(/__(.*?)__/gm, '<u>$1</u>');
    textContent = textContent.replace(/\*(.*?)\*/gm, '<i>$1</i>');
    textContent = textContent.replace(/```(.*?)```/gs, `<div class="codeBlock${embed ? " codeBlockEmbed" : ""}">$1</div>`);
    textContent = textContent.replace(/`(.*?)`/gm, '<span class="inlineCodeBlock">$1</span>');
    textContent = textContent.replace(/\|\|(.*?)\|\|/gm, '<span class="spoilerBlock" onclick="discoverSpoiler(this)">$1</span>');

    // Parse custom emojis
    let nitro = /&lt;(a):.+?:(.+?)&gt;|&lt;:.+?:(.+?)&gt;/gm
    textContent = textContent.replace(nitro, (a, b, c, d) => {
        i++
        if (b == "a") {
            return `<img class="emoji" src="https://cdn.discordapp.com/emojis/${c}.gif?v=1"></img>`
        } else if (d !== undefined){
            return `<img class="emoji" src="https://cdn.discordapp.com/emojis/${d}.png?v=1"></img>`
        }
        return b
    });

    // Parse Emojis
    textContent = textContent.replace(/:([_a-z0-9]+):/gi, (m, g1) => idToUni[g1.toLowerCase()] || m);

    textContent = textContent.replace(emojiRegex, (a) => {
        let shortcut = shortcuts.find(s => s.face === a);
        if (shortcut) return idToUni[shortcut.id];
        return a;
    });

    // Match all emojis
    if (!textContent.replace(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g, "").length) {
        textContent = `<span class="bigEmoji">${textContent}</span>`
    }

    // Replace the placeholder with a real nbsp
    textContent = textContent.replace(/ NBSP_PLACEHOLDER /g, '&nbsp;');

    // Parse the emojis to SVGs
    textContent = twemoji.parse(textContent);


    return textContent;
};

let discoverSpoiler = spoiler => {
    spoiler.classList.toggle("discovered");
};