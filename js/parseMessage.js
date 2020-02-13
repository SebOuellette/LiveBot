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
    
    // Replace the placeholder with a real nbsp
    textContent = textContent.replace(/ NBSP_PLACEHOLDER /g, '&nbsp;');

    // Parse the emojis to SVGs
    textContent = twemoji.parse(textContent);

    return textContent;
};

let discoverSpoiler = spoiler => {
    spoiler.classList.toggle("discovered");
};