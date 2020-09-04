function parseHTML(text) {
    text = text.replace(/<|>|&/gm, (s) => s == "<" ? '&lt;' : s == '>' ? '&gt;' : '&amp');
    return text;
}

function parsePings(msg, text, embededLink, ping, embed) {
    // Format pings in embeds
    if (ping || !embed){
        let dms = selectedChan.type == 'dm';
        text = formatEmbedPings(msg, text, dms);
        text = formatPings(msg, text, dms);
    }
    // Format links in embeds
    if(embededLink){
        text = text.replace(/(?:\[(?:<(?:[\w\W]+?>([\w\.!@#$%^&*\-\/"=\[\];]+?)<(?:[\w\W\/]+?)>)|([\w\.!@#$%^&*\-\/"=<>\]\[; ]+?))\]\((?:<a href="([\w:\/.<=\-]+?)".+\)|([\w.:\/_"=\-<> ]+?)\)))/gm, (a, b, c, d, e) => {
            return `<a title="${b ? b : c}" href="${d ? d : e}">${b ? b : c}</a>`
        });
    }

    return text;
}

function parseLinks(text) {
    text = text.replace(/https?:\/\/((?:\w|.)+?)(?=\/|(?= )|[>)}\]:; ]|$)(?:[\w\.!@#$%^&*\-\/]+?)*(?:\?.*?(?=[>)}\]:; ]|$))?/mg, (a, b, c) => {
        // Add '/' to the end if it's not already there
        a.endsWith('/') ? undefined : a += '/';
        // Return the html for the link
        return `<a href="${a}" rel="noreferrer noopener" title="${a}" target="_blank">${a}</a>`;
    });
    return text;
}

function parseStyling(text, embed) {
    let code = false;
    // Check for major codeblock
    text = text.replace(/(?<!\\)\`\`\`([^\n]+)\n?(.*?)(?:\n)?(?=\`\`\`)\`\`\`/gs, (a, b, c) => {
        code = true;
        c = c.length ? c : b
        console.log(b)
        return `<div class="codeBlock${embed ? " codeBlockEmbed" : ""} ${b}">${c}</div>`;
    });
    // Check for inline codeblock
    text = text.replace(/(?<!\\)`(.*?)`/gm, (a, b) => {
        if (code) return a;
        code = true;
        return `<span class="inlineCodeBlock">${b}</span>`;
    });

    if (code == false) {
        // General styling
        text = text.replace(/(?<!\\)\*\*\*(.+?)(?<!\\)\*\*\*/gm, '<strong><i>$1<i></strong>');
        text = text.replace(/(?<!\\)\*\*(.+?)(?<!\\)\*\*/gm, '<strong>$1</strong>');
        text = text.replace(/(?<!\\)__(.+?)(?<!\\)__/gm, '<u>$1</u>');
        text = text.replace(/(?<!\\)_(.+?)(?<!\\)_/gm, '<i>$1</i>');
        text = text.replace(/(?<!\\)\*(.+?)(?<!\\)\*/gm, '<i>$1</i>');
        text = text.replace(/(?<!\\)\|\|(.+?)\|\|(?<!\\)/gm, '<span class="spoilerBlock" onclick="discoverSpoiler(this)">$1</span>');
        text = text.replace(/(?<!\\)\~(.+?)(?<!\\)\~/gm, '<del>$1</del>');
    }

    return text;
}

function parseUnicodeEmojis(text) {
    if (!text.replace(/((\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])| |(&lt;a?:!?.+?:[0-9]{18}?&gt;))/g, "").length) {
        text = `<span class="bigEmoji">${text}</span>`;
    }
    return text;
}

function parseCustomEmojis(text) { 
    text = text.replace(/&lt;(a)?:!?(.+?):([0-9]{18}?)&gt;/gm, (a, b, c, d) => {
        if (d !== undefined)
            return `<img class="emoji" draggable="false" alt=":${c}:" src="https://cdn.discordapp.com/emojis/${d}.${b=='a'?'gif':'png'}?v=1"></img>`;
        return b;
    });
    return text
}