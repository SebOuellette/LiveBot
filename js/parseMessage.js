let parseMessage = (text) => {
    // Remove html in the message
    let textContent = text.replace(/(<)([^>]+)(>)/gm, '&lt;$2&gt;');

    // Add html tags for markup
    textContent = textContent.replace(/\*\*(.*?)\*\*/gm, '<strong>$1</strong>');
    textContent = textContent.replace(/__(.*?)__/gm, '<u>$1</u>');
    textContent = textContent.replace(/\*(.*?)\*/gm, '<i>$1</i>');
    textContent = textContent.replace(/```(.*?)```/gs, '<div class="codeBlock">$1</div>');
    textContent = textContent.replace(/`(.*?)`/gm, '<span class="inlineCodeBlock">$1</span>');

    return textContent;
};