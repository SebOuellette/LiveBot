function typingStatus() {
    if (!selectedChan) return;

    let indicator = document.getElementById('typingIndicator');
    indicator.innerHTML = '';
    let users = [];
    selectedChan._typing.forEach(e => users.push(selectedChan.members.get(e.user.id).displayName))
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
    if(selectedChan._typing.size)
        // Needs a set timer so it doesn't create 1000 timers at a time
        // The timings can be found in each users typing variable and checking by the smallest is the best bet
        setTimeout(typingStatus, 200)
}

// setInterval(typingStatus, 1000);