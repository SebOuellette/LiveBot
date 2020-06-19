function isTyping(member, typers) {
    if (member.user.typingIn(selectedChan) && member.user != bot.user)
        typers.push(member.nickname ? member.nickname : member.displayName)
    return typers
}

function checkTyping() {
    let typers = []
    selectedChan.guild.members.forEach(member => { typers = isTyping(member, typers) })
    return typers
}

function typingStatus() {
    let indicator = document.getElementById('typingIndicator')
    if (!selectedChan) return;
    let users = checkTyping()
    let length = users.length;
    let text = "";
    for (user in users) {
        if (user != length - 1)
            text += users[user] + ", "
        else
            text += users[user]
    }
    let finalText = length > 4 ? `<strong><i>Several people are typing...<i><strong>` : `<strong>${text}</strong> ${length == 0 ? "" : length == 1 ? " is typing..." : " are typing..."}` 
    indicator.innerHTML == finalText ? undefined : indicator.innerHTML = finalText
}

setInterval(typingStatus, 1000)