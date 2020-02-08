let parseMessage = (text, embed = false) => {
    // Remove html in the message
    let textContent = text.replace(/(<)([^>]+)(>)/gm, '&lt;$2&gt;');

    // Add html tags for markup
    textContent = textContent.replace(/\*\*(.*?)\*\*/gm, '<strong>$1</strong>');
    textContent = textContent.replace(/__(.*?)__/gm, '<u>$1</u>');
    textContent = textContent.replace(/\*(.*?)\*/gm, '<i>$1</i>');
    textContent = textContent.replace(/```(.*?)```/gs, `<div class="codeBlock${embed ? " codeBlockEmbed" : ""}">$1</div>`);
    textContent = textContent.replace(/`(.*?)`/gm, '<span class="inlineCodeBlock">$1</span>');
    textContent = textContent.replace(/\|\|(.*?)\|\|/gs, '<span class="spoilerBlock" onclick="discoverSpoiler(this)">$1</span>');

    return textContent;
};

let discoverSpoiler = spoiler => {
    spoiler.classList.toggle("discovered");
};