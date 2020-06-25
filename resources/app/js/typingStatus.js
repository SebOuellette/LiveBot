function isTyping(member, typers) {
    if (member.user.typingIn(selectedChan) && member.user != bot.user)
        typers.push(member.nickname ? member.nickname : member.displayName);
    return typers;
}

function checkTyping() {
    let typers = [];
    selectedChan.guild.members.cache.forEach(member => { typers = isTyping(member, typers) });
    return typers;
}

function typingStatus() {
    if (!selectedChan) return;

    let indicator = document.getElementById('typingIndicator');
    indicator.innerHTML = '';
    let users = checkTyping();
    let length = users.length;
    let text = "";

    if (length) {
        document.getElementById('typingDots').classList.add('enabled');
    } else {
        document.getElementById('typingDots').classList.remove('enabled');
    }

    for (user in users) {
        if (user != length - 1)
            text += users[user] + ", ";
        else
            text += users[user];
    }

    let boldText = length > 4 ? `Several people are typing...` : `${text}`;
    let endText = `${length == 0 ? "" : length == 1 ? " is typing..." : " are typing..."}`

    // Create the element for the bold text
    let boldTextElement = document.createElement('span');
    boldTextElement.innerText = boldText;
    boldTextElement.classList.add('bold');
    indicator.appendChild(boldTextElement);

    indicator.innerHTML += endText;
}

setInterval(typingStatus, 1000);